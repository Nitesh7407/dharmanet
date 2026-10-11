"use client";

import { useState, useEffect, useRef } from "react";
import type { StructuredAnswer, SourceReference } from "@/types/sage";
import { I18N_BUNDLES, SAGE_LANGUAGES } from "@/lib/sage_i18n";
import { api } from "@/lib/api";

interface Props {
  answer: StructuredAnswer;
  language: string;
  detectedLanguage?: string;
  sourcesFound?: boolean;
  model?: string;
}

export function SageResponseCard({
  answer,
  language,
  detectedLanguage,
  sourcesFound,
  model,
}: Props) {
  const [copied, setCopied] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [showDetailedAnalysis, setShowDetailedAnalysis] = useState(false);
  const [expandedSources, setExpandedSources] = useState<Record<string, boolean>>({});

  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  const bundle = I18N_BUNDLES[language] || I18N_BUNDLES.en;
  const sections = bundle.sections;

  // Cleanup speech synthesis & audio on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current = null;
      }
    };
  }, []);

  const toggleSource = (id: string) => {
    setExpandedSources((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Primary concise fields with fallbacks
  const shortAnswerText = answer.short_answer || answer.understanding;
  const whyText = answer.why || answer.ethical_analysis;
  const mbhText = answer.mahabharata_connection;
  const actionSteps =
    answer.what_you_can_do && answer.what_you_can_do.length > 0
      ? answer.what_you_can_do
      : answer.possible_solution
      ? answer.possible_solution
          .split("\n")
          .map((s) => s.replace(/^\d+[\.\)]\s*/, "").trim())
          .filter(Boolean)
      : [];

  const handleCopy = async () => {
    const textToCopy = [
      `=== ${bundle.shortAnswer} ===\n${shortAnswerText}\n`,
      `=== ${bundle.why} ===\n${whyText}\n`,
      `=== ${sections.mahabharataConnection} ===\n${mbhText}\n`,
      actionSteps.length > 0
        ? `=== ${bundle.whatYouCanDo} ===\n` +
          actionSteps.map((step, i) => `${i + 1}. ${step}`).join("\n") +
          "\n"
        : "",
      answer.source_evidence && answer.source_evidence.length > 0
        ? `=== ${sections.sourceEvidence} ===\n` +
          answer.source_evidence
            .map(
              (s, i) =>
                `[${i + 1}] ${s.citation}${s.sanskrit_term ? ` (${s.sanskrit_term})` : ""}: "${s.excerpt}"`
            )
            .join("\n") +
          "\n"
        : "",
      `\n-- DharmaNet Mahabharata AI Sage`,
    ]
      .filter(Boolean)
      .join("\n");

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleToggleSpeech = async () => {
    // If audio is currently playing, stop it
    if (isPlaying) {
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current = null;
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlaying(false);
      return;
    }

    // Prepare text to speak (concise primary guidance)
    const textToSpeak = [
      shortAnswerText,
      whyText,
      mbhText,
      ...actionSteps,
    ]
      .filter(Boolean)
      .join(". ");

    setIsGeneratingAudio(true);

    // 1. Try calling backend Sarvam AI audio endpoint
    try {
      const audioResp = await api.sageAudio(textToSpeak, language);
      if (audioResp.supported && audioResp.audio_base64) {
        const audio = new Audio(`data:audio/wav;base64,${audioResp.audio_base64}`);
        audioElementRef.current = audio;
        audio.onended = () => {
          setIsPlaying(false);
          audioElementRef.current = null;
        };
        audio.onerror = () => {
          setIsPlaying(false);
          audioElementRef.current = null;
        };
        await audio.play();
        setIsPlaying(true);
        setIsGeneratingAudio(false);
        return;
      }
    } catch {
      // Backend audio endpoint not configured or offline; fall back to Web Speech API
    }

    // 2. Browser Web Speech API fallback
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setIsGeneratingAudio(false);
      alert("Text-to-speech is not supported in your browser.");
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToSpeak);

    const langMeta = SAGE_LANGUAGES.find((l) => l.code === language);
    const targetLocale = langMeta ? langMeta.voice_locale : "en-US";
    utterance.lang = targetLocale;
    utterance.rate = 0.95;

    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find(
      (v) =>
        v.lang.toLowerCase() === targetLocale.toLowerCase() ||
        v.lang.toLowerCase().startsWith(language.toLowerCase())
    );
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    setIsGeneratingAudio(false);
    setIsPlaying(true);
    window.speechSynthesis.speak(utterance);
  };

  const langMeta = SAGE_LANGUAGES.find((l) => l.code === language);
  const langDisplay = langMeta ? `${langMeta.native_name} (${langMeta.name})` : language;

  return (
    <article className="rounded-2xl border border-slate-200/90 bg-white shadow-sm overflow-hidden text-slate-800 transition">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 bg-slate-50/80 px-5 py-3.5">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-800 text-xs font-bold text-white shadow-xs">
            ध
          </span>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              {bundle.pageTitle}
            </h3>
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <span className="inline-flex items-center gap-1 font-medium text-emerald-800">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600"></span>
                {langDisplay}
              </span>
              {detectedLanguage && detectedLanguage !== language && (
                <span>· detected {detectedLanguage}</span>
              )}
              {model && <span>· {model}</span>}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Audio TTS Button */}
          <button
            type="button"
            onClick={handleToggleSpeech}
            disabled={isGeneratingAudio}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition cursor-pointer border ${
              isPlaying
                ? "bg-amber-100 text-amber-900 border-amber-300 animate-pulse"
                : isGeneratingAudio
                ? "bg-slate-100 text-slate-500 border-slate-200 cursor-wait"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
            }`}
            title={isPlaying ? bundle.stopAudio : bundle.listen}
          >
            {isGeneratingAudio ? (
              <>
                <svg className="animate-spin h-3.5 w-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>Generating...</span>
              </>
            ) : isPlaying ? (
              <>
                <svg className="w-3.5 h-3.5 text-amber-700" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="6" y="6" width="12" height="12" rx="2" />
                </svg>
                <span>{bundle.stopAudio}</span>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                  />
                </svg>
                <span>{bundle.listen}</span>
              </>
            )}
          </button>

          {/* Copy Button */}
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-slate-700 border border-slate-200 hover:bg-slate-100 transition cursor-pointer"
            title={bundle.copyAnswer}
          >
            {copied ? (
              <>
                <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-emerald-700 font-semibold">{bundle.copied}</span>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                <span>{bundle.copyAnswer}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-5 sm:p-6 space-y-6">
        {/* ========================================================= */}
        {/* PHASE 6: CONCISE 4-PART PRIMARY GUIDANCE (80-150 words)    */}
        {/* ========================================================= */}
        <div className="space-y-4">
          {/* Part 1: Short Answer (Featured Highlight) */}
          <div className="rounded-xl border border-emerald-300/80 bg-gradient-to-br from-emerald-50/80 via-white to-emerald-50/40 p-4 sm:p-5 shadow-xs space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="grid h-5 w-5 place-items-center rounded-md bg-emerald-800 text-white text-[11px] font-bold">
                ✓
              </span>
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-950">
                {bundle.shortAnswer}
              </h4>
            </div>
            <p className="text-sm font-medium text-slate-900 leading-relaxed pl-7">
              {shortAnswerText}
            </p>
          </div>

          {/* Part 2: Why (Plain Language Considerations) */}
          <div className="rounded-xl border border-slate-200/90 bg-slate-50/50 p-4 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="grid h-5 w-5 place-items-center rounded-md bg-indigo-100 text-indigo-900 text-[11px] font-bold">
                ⚖
              </span>
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-950">
                {bundle.why}
              </h4>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed pl-7">
              {whyText}
            </p>
          </div>

          {/* Part 3: Mahabharata Connection (With Citation Badge) */}
          <div className="rounded-xl border border-amber-200/80 bg-amber-50/40 p-4 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="grid h-5 w-5 place-items-center rounded-md bg-amber-200 text-amber-900 text-[11px] font-bold">
                  🏛
                </span>
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-950">
                  {sections.mahabharataConnection}
                </h4>
              </div>
              {answer.source_evidence && answer.source_evidence.length > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100/90 px-2.5 py-0.5 text-[10px] font-semibold text-amber-900 border border-amber-300/80">
                  <span>{answer.source_evidence[0].citation}</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-700 leading-relaxed pl-7">
              {mbhText}
            </p>
          </div>

          {/* Part 4: What You Can Do (Action Steps) */}
          {actionSteps.length > 0 && (
            <div className="rounded-xl border border-emerald-200/90 bg-white p-4 space-y-2.5 shadow-xs">
              <div className="flex items-center gap-2">
                <span className="grid h-5 w-5 place-items-center rounded-md bg-emerald-700 text-white text-[11px] font-bold">
                  🎯
                </span>
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-950">
                  {bundle.whatYouCanDo}
                </h4>
              </div>
              <ul className="grid gap-2 pl-7">
                {actionSteps.map((step, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 rounded-lg bg-emerald-50/40 border border-emerald-100 p-2.5 text-xs text-slate-800"
                  >
                    <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-emerald-200/80 text-[10px] font-bold text-emerald-900">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* VERIFIED SOURCES & CITATIONS (Collapsible)                 */}
        {/* ========================================================= */}
        <section className="pt-2 border-t border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="grid h-5 w-5 place-items-center rounded-md bg-slate-200 text-slate-800 text-xs font-bold">
                📜
              </span>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                {sections.sourceEvidence}
              </h4>
            </div>
            {answer.source_evidence && answer.source_evidence.length > 0 ? (
              <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800">
                ✓ {answer.source_evidence.length} {bundle.sourcesVerifiedBadge}
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-600">
                {bundle.noSourcesNotice}
              </span>
            )}
          </div>

          {answer.source_evidence && answer.source_evidence.length > 0 ? (
            <div className="grid gap-2.5">
              {answer.source_evidence.map((source, idx) => {
                const isExpanded = !!expandedSources[source.entry_id || String(idx)];
                return (
                  <div
                    key={source.entry_id || idx}
                    className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 transition hover:bg-slate-50"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-slate-900">
                            {source.citation}
                          </span>
                          {source.sanskrit_term && (
                            <span className="rounded bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 text-[10px] font-medium text-emerald-800">
                              {source.sanskrit_term}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500">
                          {source.source}
                          {source.chapter ? ` · Chapter ${source.chapter}` : ""}
                          {source.verse ? ` · Verse ${source.verse}` : ""}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {source.relevance > 0 && (
                          <span className="text-[10px] font-mono text-slate-500 bg-white border border-slate-200 px-1.5 py-0.5 rounded">
                            {Math.round(source.relevance * 100)}% match
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => toggleSource(source.entry_id || String(idx))}
                          className="text-xs font-semibold text-emerald-800 hover:text-emerald-900 hover:underline cursor-pointer"
                        >
                          {isExpanded ? "Hide excerpt" : "Show excerpt"}
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="mt-2.5 pt-2.5 border-t border-slate-200/80 text-xs text-slate-600 space-y-2">
                        <blockquote className="border-l-2 border-emerald-600 pl-3 italic text-slate-700 bg-white/70 py-1 rounded-r">
                          "{source.excerpt}"
                        </blockquote>
                        <p>
                          <span className="font-semibold text-slate-800">Interpretation: </span>
                          {source.interpretation}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          Verified Reference ID: <code className="font-mono">{source.entry_id}</code>
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-3 text-xs text-slate-500 italic">
              {bundle.noSourcesNotice}. Ethical reasoning proceeds through universal dharmic principles.
            </div>
          )}
        </section>

        {/* ========================================================= */}
        {/* IN-DEPTH ANALYTICAL FRAMEWORK (Expandable Deep-Dive)       */}
        {/* ========================================================= */}
        <div className="pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setShowDetailedAnalysis(!showDetailedAnalysis)}
            className="w-full flex items-center justify-between rounded-xl bg-slate-100/70 hover:bg-slate-100 px-4 py-2.5 text-xs font-semibold text-slate-700 transition cursor-pointer border border-slate-200/80"
          >
            <span className="flex items-center gap-2">
              <span>🔍</span>
              <span>
                {showDetailedAnalysis
                  ? bundle.hideDetailedAnalysis
                  : bundle.detailedAnalysisToggle}
              </span>
            </span>
            <span className="text-slate-400 font-mono text-sm">
              {showDetailedAnalysis ? "▴" : "▾"}
            </span>
          </button>

          {showDetailedAnalysis && (
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/40 p-4 sm:p-5 space-y-5 animate-in fade-in duration-200">
              {/* Detailed Understanding */}
              <div className="space-y-1">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  {sections.understanding}
                </h5>
                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                  {answer.understanding}
                </p>
              </div>

              {/* Detailed Ethical Analysis */}
              <div className="space-y-1">
                <h5 className="text-xs font-bold uppercase tracking-wider text-indigo-900">
                  {sections.ethicalAnalysis}
                </h5>
                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                  {answer.ethical_analysis}
                </p>
              </div>

              {/* Detailed Counter / Alternative Perspective */}
              {answer.alternative_perspective && (
                <div className="space-y-1">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-purple-900">
                    {sections.alternativePerspective}
                  </h5>
                  <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                    {answer.alternative_perspective}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer Disclaimer */}
      <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-2.5 text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-2">
        <span>Grounded on verified classical texts. Human decision authority is preserved.</span>
        <span className="text-[10px] text-slate-400">DharmaNet Sage v2.0</span>
      </div>
    </article>
  );
}
