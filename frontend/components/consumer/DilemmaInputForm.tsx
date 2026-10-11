"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api";

export interface PresetExample {
  id: string;
  label: string;
  role: string;
  domain: string;
  urgency: string;
  text: string;
}

export const EVERYDAY_PRESETS: PresetExample[] = [
  {
    id: "colleague-credit",
    label: "Colleague Taking Credit",
    role: "colleague / team member",
    domain: "workplace",
    urgency: "medium",
    text: "I found out that my colleague is taking credit for a major project feature I built alone. During our team demo, they presented it to leadership as their own idea. Should I confront them privately first, bring it up directly to our manager, or let it go to keep peace on the team?",
  },
  {
    id: "friend-exam",
    label: "Friend Cheating on Exam",
    role: "student & friend",
    domain: "education",
    urgency: "medium",
    text: "I saw my close friend and roommate cheating during our university final exam. The exam is graded on a strict competitive bell curve, so their false score lowers everyone else's marks. However, they are under severe family stress and will lose their financial aid scholarship if reported.",
  },
  {
    id: "safety-defect",
    label: "Workplace Safety Issue",
    role: "firmware engineer",
    domain: "workplace",
    urgency: "high",
    text: "I discovered that my company is hiding a safety issue in a product we sell to hospitals. Reporting it outside the company will protect patients, but management warns that an immediate recall could cause hundreds of my coworkers to lose their jobs, and I signed a strict non-disclosure agreement.",
  },
  {
    id: "elderly-driver",
    label: "Aging Parent Driving Safety",
    role: "adult son / daughter",
    domain: "family",
    urgency: "medium",
    text: "My elderly father is no longer safe to drive due to declining vision and slow reflexes, but he refuses to give up his car keys because driving represents his last remaining independence. My siblings want me to secretly disable the car engine so he can't drive.",
  },
];

interface Props {
  initialText?: string;
  initialRole?: string;
  initialDomain?: string;
}

export function DilemmaInputForm({ initialText = "", initialRole = "", initialDomain = "" }: Props) {
  const router = useRouter();
  const [text, setText] = useState(initialText);
  const [role, setRole] = useState(initialRole);
  const [domain, setDomain] = useState(initialDomain);
  const [urgency, setUrgency] = useState("");
  const [culture, setCulture] = useState("");
  const [additional, setAdditional] = useState("");
  const [includeDharma, setIncludeDharma] = useState(true);

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [touched, setTouched] = useState(false);

  const trimmedLength = text.trim().length;
  const isTooShort = trimmedLength < 20;

  async function handleSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setTouched(true);
    if (isTooShort) return;

    setBusy(true);
    setErr("");
    try {
      const result = await api.create(
        text.trim(),
        {
          role: role.trim() || undefined,
          domain: domain.trim() || undefined,
          time_pressure: urgency || undefined,
          cultural_context: culture.trim() || undefined,
          additional: additional.trim() || undefined,
        },
        includeDharma
      );
      router.push(`/analysis/${result.id}`);
    } catch (error) {
      setErr(error instanceof Error ? error.message : "Something went wrong while analyzing your situation. Please try again.");
      setBusy(false);
    }
  }

  function handleSelectPreset(preset: PresetExample) {
    setText(preset.text);
    setRole(preset.role);
    setDomain(preset.domain);
    setUrgency(preset.urgency);
    setErr("");
    setTouched(false);
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8">
      {/* Header */}
      <div className="space-y-3 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 border border-emerald-200/80">
          <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
          Private & Confidential · Grounded Ethical Support
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          What decision are you struggling with?
        </h1>
        <p className="text-base text-slate-600 leading-relaxed sm:text-lg">
          Describe your situation in your own words. We’ll help you understand your options and their consequences.
        </p>
      </div>

      {/* Main Form Card */}
      <form onSubmit={handleSubmit} className="card space-y-6 bg-white p-6 sm:p-8 border border-slate-200/90 shadow-md">
        {/* Preset quick buttons */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Or try one of these common situations:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {EVERYDAY_PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelectPreset(p)}
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-900 cursor-pointer"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Text Area */}
        <div className="space-y-2">
          <label htmlFor="dilemma-input" className="block text-sm font-semibold text-slate-800">
            Your situation
          </label>
          <div className="relative">
            <textarea
              id="dilemma-input"
              rows={7}
              className="w-full rounded-2xl border border-slate-300 p-4 text-base leading-relaxed text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/15 disabled:bg-slate-50 disabled:text-slate-500 placeholder:text-slate-400"
              placeholder="For example: I found out that my colleague is taking credit for my work. Should I confront them or tell my manager?"
              value={text}
              maxLength={8000}
              disabled={busy}
              onChange={(e) => {
                setText(e.target.value);
                if (err) setErr("");
              }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>
              {touched && isTooShort ? (
                <span className="font-medium text-amber-600">
                  Please add a few more words ({trimmedLength}/20 characters minimum).
                </span>
              ) : (
                "Please describe the people involved and what makes the choice hard."
              )}
            </span>
            <span className="tabular-nums font-mono text-slate-400">
              {text.length} / 8000
            </span>
          </div>
        </div>

        {/* Collapsible Advanced Settings */}
        <div className="border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-emerald-700 transition cursor-pointer"
          >
            <svg
              className={`h-4 w-4 transition-transform duration-200 ${showAdvanced ? "rotate-90 text-emerald-700" : "text-slate-400"}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span>Advanced settings (optional)</span>
            {!showAdvanced && (
              <span className="text-[11px] text-slate-400 font-normal">
                — role, urgency, context
              </span>
            )}
          </button>

          {showAdvanced && (
            <div className="mt-4 space-y-4 rounded-xl bg-slate-50/70 p-4 border border-slate-200/70">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">Your role in this situation</label>
                  <input
                    type="text"
                    className="input bg-white"
                    placeholder="e.g. colleague, team lead, student, parent"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    disabled={busy}
                  />
                  <p className="mt-1 text-[11px] text-slate-500">Helps consider your duties and relationships.</p>
                </div>

                <div>
                  <label className="label">Area / Context</label>
                  <input
                    type="text"
                    className="input bg-white"
                    placeholder="e.g. workplace, family, healthcare, education"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    disabled={busy}
                  />
                  <p className="mt-1 text-[11px] text-slate-500">Auto-detected if left blank.</p>
                </div>

                <div>
                  <label className="label">How urgent is this decision?</label>
                  <select
                    className="input bg-white"
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value)}
                    disabled={busy}
                  >
                    <option value="">Normal deliberation</option>
                    <option value="low">Low urgency (weeks or months)</option>
                    <option value="medium">Medium urgency (days)</option>
                    <option value="high">High urgency (immediate action needed)</option>
                  </select>
                </div>

                <div>
                  <label className="label">Cultural or community context</label>
                  <input
                    type="text"
                    className="input bg-white"
                    placeholder="e.g. startup culture, multi-generational family"
                    value={culture}
                    onChange={(e) => setCulture(e.target.value)}
                    disabled={busy}
                  />
                </div>
              </div>

              <div>
                <label className="label">Any specific rules or constraints?</label>
                <input
                  type="text"
                  className="input bg-white"
                  placeholder="e.g. strict workplace NDA, formal policy, financial constraints"
                  value={additional}
                  onChange={(e) => setAdditional(e.target.value)}
                  disabled={busy}
                />
              </div>

              <div className="pt-2 border-t border-slate-200/50">
                <label className="flex items-start gap-2.5 text-xs font-semibold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-700 accent-emerald-700 focus:ring-emerald-600"
                    checked={includeDharma}
                    onChange={(e) => setIncludeDharma(e.target.checked)}
                    disabled={busy}
                  />
                  <div>
                    <span>Include culturally contextualized Dharma-inspired perspective (Bhagavad Gita & Mahābhārata)</span>
                    <p className="mt-0.5 text-[11px] font-normal text-slate-500">
                      Weighs duty, societal protection, and calm action without attachment to outcomes, with source citations.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Error notification */}
        {err && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold">Unable to process situation</p>
              <p className="mt-0.5 text-xs text-rose-700">{err}</p>
            </div>
            <button
              type="button"
              onClick={() => handleSubmit()}
              className="text-xs font-semibold text-rose-900 underline hover:no-underline shrink-0"
            >
              Try again
            </button>
          </div>
        )}

        {/* Action Button & Loading Indicator */}
        <div className="space-y-3 pt-2">
          <button
            type="submit"
            disabled={busy || isTooShort}
            className="w-full btn-primary py-3.5 text-base font-bold shadow-md shadow-emerald-900/10 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? (
              <span className="flex items-center justify-center gap-2.5">
                <svg className="h-5 w-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>Analyzing your situation and weighing options…</span>
              </span>
            ) : (
              <span>Help Me Decide →</span>
            )}
          </button>

          <p className="text-center text-xs text-slate-500">
            DharmaNet is confidential and private. Your choices and reasoning remain completely under your control.
          </p>
        </div>
      </form>
    </div>
  );
}
