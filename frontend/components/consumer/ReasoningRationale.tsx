"use client";
import { useState } from "react";
import type { DharmaEvaluation, Explanation, RetrievedEntry } from "@/types/api";

interface Props {
  explanation: Explanation;
  dharma: DharmaEvaluation | null;
}

const PRINCIPLE_TRANSLATIONS: Record<string, { plain: string; desc: string }> = {
  "nishkama karma": {
    plain: "Doing the right thing without fear of personal loss",
    desc: "Focus on fulfilling your responsibility with a clear conscience rather than acting only out of anxiety about personal fallout.",
  },
  kartavya: {
    plain: "Fulfilling your role-duty",
    desc: "Honor the professional or personal duties you committed to uphold in your position.",
  },
  "loka-samgraha": {
    plain: "Protecting the greater common good",
    desc: "When tensions arise, give special weight to actions that preserve public safety, truth, and community trust.",
  },
  ahimsa: {
    plain: "Minimizing harm to all parties",
    desc: "Seek the path that causes the least unnecessary collateral damage to innocent people.",
  },
  satya: {
    plain: "Honesty and transparent truth",
    desc: "A decision built on deceit or cover-ups usually leads to worse moral and practical complications.",
  },
  "dharma-sankata": {
    plain: "Resolving competing obligations",
    desc: "Acknowledging that when two responsibilities clash, you must thoughtfully prioritize the deeper moral duty.",
  },
  fairness: {
    plain: "Fairness and equal treatment",
    desc: "Ensure rules and burdens are applied fairly, especially for people who lack power to defend themselves.",
  },
  care: {
    plain: "Preserving trust and human relationships",
    desc: "Recognize that people are not just numbers, and seek empathetic solutions that keep lines of communication open.",
  },
};

export function ReasoningRationale({ explanation, dharma }: Props) {
  const [showDeepSources, setShowDeepSources] = useState(false);

  // Map principles into everyday English
  const principles = explanation.principles || [];
  const retrievedSources = dharma?.retrieved || [];

  function translatePrinciple(p: string) {
    const lower = p.toLowerCase();
    for (const [key, val] of Object.entries(PRINCIPLE_TRANSLATIONS)) {
      if (lower.includes(key)) {
        return { original: p, ...val };
      }
    }
    return {
      original: p,
      plain: p,
      desc: "An ethical principle that balances duties, outcomes, and fairness in this scenario.",
    };
  }

  return (
    <section className="card space-y-5 bg-white border border-slate-200/80 p-6 sm:p-7">
      <div className="space-y-1">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
          Section 6 · Grounding
        </span>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight sm:text-2xl">
          Why this might make sense
        </h2>
        <p className="text-xs text-slate-500">
          Ethical wisdom from both classical traditions and modern ethics frameworks guides this thinking:
        </p>
      </div>

      {/* Main plain-English reasoning */}
      <div className="grid gap-3.5 sm:grid-cols-2">
        {principles.slice(0, 4).map((p, idx) => {
          const t = translatePrinciple(p);
          return (
            <div
              key={idx}
              className="rounded-xl border border-slate-200/80 bg-slate-50/40 p-4 space-y-1.5"
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-bold text-slate-900">
                  {t.plain}
                </h3>
                {t.original !== t.plain && (
                  <span className="chip text-[10px] bg-slate-100 text-slate-600 font-medium">
                    {t.original}
                  </span>
                )}
              </div>
              <p className="text-xs leading-relaxed text-slate-600">
                {t.desc}
              </p>
            </div>
          );
        })}
      </div>

      {/* Expandable Citations and Philosophical Sources */}
      {retrievedSources.length > 0 && (
        <div className="border-t border-slate-100 pt-3">
          <button
            type="button"
            onClick={() => setShowDeepSources(!showDeepSources)}
            className="flex items-center gap-2 text-xs font-semibold text-emerald-800 hover:text-emerald-950 transition cursor-pointer"
          >
            <svg
              className={`h-4 w-4 transition-transform duration-200 ${showDeepSources ? "rotate-90 text-emerald-800" : "text-slate-400"}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span>
              {showDeepSources ? "Hide philosophical sources and citations" : "View philosophical sources and citations"}
            </span>
            <span className="text-[11px] text-slate-400 font-normal">
              ({retrievedSources.length} verified passages from Bhagavad Gita & Mahābhārata)
            </span>
          </button>

          {showDeepSources && (
            <div className="mt-4 space-y-3 rounded-xl bg-emerald-50/30 p-4 border border-emerald-100 animate-in fade-in duration-150">
              <p className="text-xs text-slate-600 leading-relaxed">
                DharmaNet checks its ethical reasoning against recorded textual passages. Every claim is grounded in these sources:
              </p>

              <div className="space-y-2">
                {retrievedSources.map((s) => (
                  <div
                    key={s.entry_id}
                    className="rounded-lg bg-white p-3 border border-slate-200/80 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-900">{s.concept}</span>
                      <span className="chip text-[10px] bg-emerald-100 text-emerald-900 font-semibold border border-emerald-200">
                        {s.citation}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Matched to your situation to provide grounded ethical perspective.
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
