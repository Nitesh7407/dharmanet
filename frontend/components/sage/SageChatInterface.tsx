"use client";

import { useState, useEffect, useRef } from "react";
import type {
  SupportedLang,
  StructuredAnswer,
  SageConsultResponse,
  SageMessageRecord,
} from "@/types/sage";
import {
  I18N_BUNDLES,
  ROTATING_LOADING_MESSAGES,
  SAGE_LANGUAGES,
} from "@/lib/sage_i18n";
import { LanguageSelector } from "@/components/sage/LanguageSelector";
import { SageResponseCard } from "@/components/sage/SageResponseCard";
import { api } from "@/lib/api";

interface ChatMessage {
  id: string;
  role: "user" | "sage";
  content: string;
  language?: string;
  detectedLanguage?: string;
  answer?: StructuredAnswer;
  sourcesFound?: boolean;
  model?: string;
  timestamp: string;
}

export function SageChatInterface() {
  const [sessionId, setSessionId] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLang>("auto");
  const [detectedLanguage, setDetectedLanguage] = useState<string>("en");
  const [loading, setLoading] = useState(false);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastDilemma, setLastDilemma] = useState<string>("");

  const endOfChatRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isSubmittingRef = useRef<boolean>(false);
  const recognitionRef = useRef<any>(null);

  // Active locale bundle for UI
  const activeLangCode = selectedLanguage === "auto" ? (detectedLanguage || "en") : selectedLanguage;
  const bundle = I18N_BUNDLES[activeLangCode] || I18N_BUNDLES.en;

  // Rotate loading status messages while channeling wisdom
  useEffect(() => {
    if (!loading) {
      setLoadingMsgIdx(0);
      return;
    }
    const msgs = ROTATING_LOADING_MESSAGES[activeLangCode] || ROTATING_LOADING_MESSAGES.en;
    const interval = setInterval(() => {
      setLoadingMsgIdx((prev) => (prev + 1) % msgs.length);
    }, 2200);
    return () => clearInterval(interval);
  }, [loading, activeLangCode]);

  // Speech-to-text microphone handler
  const toggleSpeechRecognition = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    if (typeof window === "undefined") return;

    const SpeechRec =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      alert(bundle.micNotSupported);
      return;
    }

    try {
      const rec = new SpeechRec();
      rec.continuous = false;
      rec.interimResults = true;

      const langMeta = SAGE_LANGUAGES.find((l) => l.code === activeLangCode);
      rec.lang = langMeta ? langMeta.voice_locale : "en-US";

      rec.onstart = () => setIsListening(true);
      rec.onresult = (e: any) => {
        const transcript = Array.from(e.results)
          .map((result: any) => result[0].transcript)
          .join("");
        if (transcript) {
          setInput(transcript);
        }
      };
      rec.onerror = () => setIsListening(false);
      rec.onend = () => setIsListening(false);

      recognitionRef.current = rec;
      rec.start();
    } catch (err) {
      console.error("Speech recognition error:", err);
      setIsListening(false);
    }
  };

  // Initialize or restore session
  useEffect(() => {
    let sid = "";
    if (typeof window !== "undefined") {
      sid = localStorage.getItem("dharmanet_sage_session_id") || "";
      if (!sid) {
        sid = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `sess_${Date.now()}`;
        localStorage.setItem("dharmanet_sage_session_id", sid);
      }
      setSessionId(sid);

      // Load existing history if available
      api.sageHistory(sid)
        .then((data: { messages: SageMessageRecord[] }) => {
          if (data && data.messages && data.messages.length > 0) {
            const mapped: ChatMessage[] = data.messages.map((m) => ({
              id: m.id,
              role: m.role,
              content: m.content,
              language: m.language,
              answer: m.answer_structure || undefined,
              sourcesFound: (m.sources && m.sources.length > 0),
              timestamp: new Date(m.created_at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
            }));
            setMessages(mapped);
          }
        })
        .catch(() => {
          // New session or no history
        });
    }
  }, []);

  // Auto scroll to latest response
  useEffect(() => {
    if (messages.length > 0 || loading) {
      endOfChatRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  const handleSubmit = async (dilemmaText?: string) => {
    const textToSubmit = (dilemmaText || input).trim();
    if (!textToSubmit || textToSubmit.length < 5) return;
    if (isSubmittingRef.current || loading) return;

    // Prevent duplicate synchronous triggering
    isSubmittingRef.current = true;
    setError(null);
    setLastDilemma(textToSubmit);
    setLoading(true);

    const userMsgId = `user_${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      role: "user",
      content: textToSubmit,
      language: selectedLanguage === "auto" ? undefined : selectedLanguage,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    // Avoid duplicate user message if retrying the same question
    setMessages((prev) => {
      const last = prev[prev.length - 1];
      if (last && last.role === "user" && last.content === textToSubmit) {
        return prev;
      }
      return [...prev, userMsg];
    });

    if (!dilemmaText) {
      setInput("");
    }

    try {
      const resp: SageConsultResponse = await api.sageConsult({
        dilemma: textToSubmit,
        target_language: selectedLanguage,
        session_id: sessionId || undefined,
      });

      if (resp.detected_language) {
        setDetectedLanguage(resp.detected_language);
      }

      const sageMsg: ChatMessage = {
        id: resp.message_id || `sage_${Date.now()}`,
        role: "sage",
        content: resp.answer.understanding,
        language: resp.selected_language,
        detectedLanguage: resp.detected_language,
        answer: resp.answer,
        sourcesFound: resp.sources_found,
        model: resp.model,
        timestamp: new Date(resp.created_at || Date.now()).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, sageMsg]);
    } catch (err: any) {
      console.error("Sage consultation failed:", err);
      const msg = err?.message || "Failed to reach the Mahabharata Sage. Please check your connection and try again.";
      setError(msg);
    } finally {
      setLoading(false);
      isSubmittingRef.current = false;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      if (!isSubmittingRef.current && !loading && input.trim().length >= 5) {
        handleSubmit();
      }
    }
  };

  const handleClearHistory = async () => {
    if (!confirm(bundle.clearConfirm)) return;

    try {
      if (sessionId) {
        await api.sageClearHistory(sessionId);
      }
    } catch {
      // Continue clearing local state
    }

    const newSid = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `sess_${Date.now()}`;
    if (typeof window !== "undefined") {
      localStorage.setItem("dharmanet_sage_session_id", newSid);
    }
    setSessionId(newSid);
    setMessages([]);
    setError(null);
  };

  const handleSelectSample = (sampleText: string) => {
    setInput(sampleText);
    textareaRef.current?.focus();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner and Controls */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="grid h-6 w-6 place-items-center rounded-lg bg-emerald-800 text-xs font-bold text-white shadow-xs">
                ध
              </span>
              <h2 className="text-lg font-bold tracking-tight text-slate-900">
                {bundle.pageTitle}
              </h2>
              <span className="rounded-full bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                {bundle.badge}
              </span>
            </div>
            <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
              {bundle.subtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {messages.length > 0 && (
              <button
                type="button"
                onClick={handleClearHistory}
                className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:text-red-700 hover:bg-red-50 border border-slate-200 transition cursor-pointer"
              >
                {bundle.clearChat}
              </button>
            )}
          </div>
        </div>

        {/* Language Selector Bar */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <LanguageSelector
            selectedLanguage={selectedLanguage}
            detectedLanguage={detectedLanguage}
            onSelectLanguage={(lang) => setSelectedLanguage(lang)}
            label={bundle.selectorLabel}
          />
        </div>
      </div>

      {/* Main Conversation Thread */}
      {messages.length === 0 ? (
        /* Empty State with Sample Dilemmas */
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-emerald-50 border border-emerald-200/80 text-xl font-bold text-emerald-800 shadow-xs">
              ⚖
            </div>
            <h3 className="text-base font-bold text-slate-900">
              {bundle.pageTitle}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Ask about any workplace, personal, leadership, or moral dilemma. The Sage cross-references 33+ verified episodes from the Mahabharata & Gita to offer balanced, non-dogmatic counsel.
            </p>
          </div>

          {/* Sample Dilemmas */}
          <div className="space-y-2.5">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {bundle.sampleHeading}
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {bundle.samples.map((sample, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelectSample(sample.text)}
                  className="card text-left p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30 transition group cursor-pointer space-y-2 flex flex-col justify-between"
                >
                  <div className="space-y-1">
                    <span className="font-semibold text-xs text-slate-900 group-hover:text-emerald-900 flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-600"></span>
                      {sample.title}
                    </span>
                    <p className="text-[11px] text-slate-600 line-clamp-3 leading-relaxed">
                      "{sample.text}"
                    </p>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-700 group-hover:underline self-end">
                    Use this dilemma →
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Message Thread */
        <div className="space-y-6">
          {messages.map((m) => (
            <div key={m.id} className="space-y-2">
              {m.role === "user" ? (
                /* User Message */
                <div className="flex justify-end">
                  <div className="max-w-2xl rounded-2xl rounded-tr-xs bg-slate-900 text-white px-5 py-3.5 shadow-sm space-y-1">
                    <p className="text-sm leading-relaxed whitespace-pre-line">
                      {m.content}
                    </p>
                    <div className="flex items-center justify-end gap-2 text-[10px] text-slate-400">
                      {m.language && <span>{m.language.toUpperCase()}</span>}
                      <span>{m.timestamp}</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Sage Structured Response */
                <div>
                  {m.answer ? (
                    <SageResponseCard
                      answer={m.answer}
                      language={m.language || "en"}
                      detectedLanguage={m.detectedLanguage}
                      sourcesFound={m.sourcesFound}
                      model={m.model}
                    />
                  ) : (
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-800">
                      {m.content}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Loading Indicator */}
          {loading && (
            <div className="rounded-2xl border border-emerald-200/90 bg-emerald-50/50 p-5 space-y-3 animate-pulse">
              <div className="flex items-center gap-3">
                <span className="grid h-6 w-6 place-items-center rounded-lg bg-emerald-800 text-xs font-bold text-white">
                  ध
                </span>
                <span className="text-xs font-bold text-emerald-900">
                  {(ROTATING_LOADING_MESSAGES[activeLangCode] || ROTATING_LOADING_MESSAGES.en)[loadingMsgIdx] || bundle.thinkingStatus}
                </span>
              </div>
              <div className="space-y-2 pl-9">
                <div className="h-3 bg-emerald-200/60 rounded w-3/4"></div>
                <div className="h-3 bg-emerald-200/40 rounded w-1/2"></div>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-red-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="font-bold text-red-700">Error:</span>
                <span>{error}</span>
              </div>
              {lastDilemma && (
                <button
                  type="button"
                  onClick={() => handleSubmit(lastDilemma)}
                  className="rounded-lg bg-red-600 text-white px-3 py-1 font-semibold hover:bg-red-700 transition cursor-pointer text-xs"
                >
                  {bundle.retry}
                </button>
              )}
            </div>
          )}

          <div ref={endOfChatRef} />
        </div>
      )}

      {/* Input Box Area */}
      <div className="sticky bottom-4 z-20">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!isSubmittingRef.current && !loading && input.trim().length >= 5) {
              handleSubmit();
            }
          }}
          className="rounded-2xl border border-slate-300 bg-white/95 backdrop-blur-md p-3 shadow-lg focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-600/20 transition"
        >
          <div className="space-y-2">
            <textarea
              ref={textareaRef}
              rows={3}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={bundle.inputPlaceholder}
              disabled={loading}
              className="w-full resize-none border-0 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0 leading-relaxed"
            />

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <button
                  type="button"
                  onClick={toggleSpeechRecognition}
                  disabled={loading}
                  title={isListening ? bundle.micListening : bundle.micStart}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition cursor-pointer ${
                    isListening
                      ? "bg-red-100 text-red-700 animate-pulse border border-red-300"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  <svg
                    className={`w-3.5 h-3.5 ${isListening ? "text-red-600 animate-bounce" : "text-slate-600"}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 02-3-3V5a3 3 0 116 0v6a3 3 0 02-3 3z"
                    />
                  </svg>
                  <span>{isListening ? bundle.micListening : bundle.micStart}</span>
                </button>
                <span>{input.length} characters</span>
                {input.length > 0 && input.length < 5 && (
                  <span className="text-amber-600 font-medium">({bundle.charCountNotice})</span>
                )}
                <span className="hidden sm:inline">· Press Enter to send, Shift+Enter for newline</span>
              </div>

              <button
                type="submit"
                disabled={loading || input.trim().length < 5}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-800 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span>Consulting...</span>
                  </>
                ) : (
                  <>
                    <span>{bundle.askButton}</span>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
