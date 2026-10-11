"use client";
import { useState } from "react";
import type { StructuredDilemma } from "@/types/api";

interface Props {
  structured: StructuredDilemma;
}

export function SituationUnderstanding({ structured }: Props) {
  const [showOriginal, setShowOriginal] = useState(false);
  const primaryConflict = structured.conflicts[0];

  // Derive "What matters most" in everyday terms
  const keyMatters = structured.constraints.length > 0
    ? structured.constraints.slice(0, 3)
    : structured.cues.evidence.length > 0
    ? structured.cues.evidence.slice(0, 3)
    : ["Minimizing harm to everyone involved", "Acting with honesty and integrity", "Protecting vulnerable parties"];

  return (
    <section className="card space-y-5 bg-white border border-slate-200/80 p-6 sm:p-7">
      <div className="space-y-1">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
          Section 1 · Understanding
        </span>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight sm:text-2xl">
          Here’s what we understand
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* What you are dealing with */}
        <div className="rounded-xl border border-slate-200/70 bg-slate-50/60 p-4 space-y-2">
          <div className="flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-lg bg-emerald-100 text-emerald-900 text-xs font-bold">
              1
            </span>
            <h3 className="text-sm font-bold text-slate-900">What you’re dealing with</h3>
          </div>
          <p className="text-xs leading-relaxed text-slate-700">
            {structured.summary || "You are faced with a challenging personal or professional decision with competing priorities."}
          </p>
        </div>

        {/* Why the decision is difficult */}
        <div className="rounded-xl border border-slate-200/70 bg-slate-50/60 p-4 space-y-2">
          <div className="flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-lg bg-amber-100 text-amber-900 text-xs font-bold">
              2
            </span>
            <h3 className="text-sm font-bold text-slate-900">Why the decision is difficult</h3>
          </div>
          <p className="text-xs leading-relaxed text-slate-700">
            {primaryConflict?.description ||
              "Every available choice comes with trade-offs between duties, outcomes, and potential fallout for yourself or others."}
          </p>
        </div>

        {/* What matters most */}
        <div className="rounded-xl border border-slate-200/70 bg-slate-50/60 p-4 space-y-2">
          <div className="flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-lg bg-blue-100 text-blue-900 text-xs font-bold">
              3
            </span>
            <h3 className="text-sm font-bold text-slate-900">What matters most here</h3>
          </div>
          <ul className="space-y-1 text-xs text-slate-700">
            {keyMatters.map((item, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="text-emerald-700 font-bold shrink-0">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Expandable original text */}
      <div className="border-t border-slate-100 pt-3">
        <button
          type="button"
          onClick={() => setShowOriginal(!showOriginal)}
          className="text-xs font-medium text-slate-500 hover:text-slate-800 transition flex items-center gap-1.5 cursor-pointer"
        >
          <span>{showOriginal ? "Hide your original description" : "View your original description"}</span>
          <svg
            className={`h-3.5 w-3.5 transition-transform ${showOriginal ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showOriginal && (
          <div className="mt-2.5 rounded-xl bg-slate-50 p-4 text-xs leading-relaxed text-slate-700 border border-slate-200/60 whitespace-pre-wrap font-sans">
            {structured.dilemma_text}
          </div>
        )}
      </div>
    </section>
  );
}
