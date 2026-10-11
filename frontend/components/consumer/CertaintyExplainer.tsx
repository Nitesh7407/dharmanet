"use client";
import { useState } from "react";
import type { Explanation, Sensitivity } from "@/types/api";

interface Props {
  sensitivity: Sensitivity;
  explanation: Explanation;
  isClearPreference: boolean;
}

export function CertaintyExplainer({ sensitivity, explanation, isClearPreference }: Props) {
  const [showTechnical, setShowTechnical] = useState(false);
  const label = sensitivity?.label || "Moderately Sensitive";

  function getPlainExplanation() {
    if (label === "Stable" && isClearPreference) {
      return {
        badge: "Steady Suggestion",
        badgeColor: "bg-emerald-100 text-emerald-900 border-emerald-300",
        heading: "This suggestion remains strong across different priorities.",
        body: "Even if you shift how much you care about immediate results versus long-term duties, the recommended path consistently leads. It is a well-rounded choice.",
      };
    }
    if (label === "Moderately Sensitive" || isClearPreference) {
      return {
        badge: "Priority Dependent",
        badgeColor: "bg-blue-100 text-blue-900 border-blue-300",
        heading: "The ranking is reasonably solid, but depends on your priorities.",
        body: "The suggested choice leads overall, but placing extra weight on specific values—such as protecting relationships or strictly following formal rules—could make an alternative choice more appealing to you.",
      };
    }
    return {
      badge: "Closely Balanced",
      badgeColor: "bg-amber-100 text-amber-900 border-amber-300",
      heading: "The options are relatively close. Your personal priorities will determine the best choice.",
      body: "Because several choices have comparable strengths and drawbacks, the analysis does not force a single answer. Clarifying missing details or reflecting on what matters most to you will help you decide.",
    };
  }

  const exp = getPlainExplanation();
  const couldChange = explanation.what_could_change || [];

  return (
    <section className="card space-y-5 bg-white border border-slate-200/80 p-6 sm:p-7">
      <div className="space-y-1">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
          Section 7 · Certainty & Sensitivity
        </span>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight sm:text-2xl">
          How certain is this analysis?
        </h2>
      </div>

      <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-5 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`chip text-xs font-bold border ${exp.badgeColor}`}>
            {exp.badge}
          </span>
          <span className="text-xs text-slate-500 font-medium">
            System Confidence Assessment
          </span>
        </div>

        <h3 className="text-base font-bold text-slate-900">
          {exp.heading}
        </h3>

        <p className="text-xs leading-relaxed text-slate-700">
          {exp.body}
        </p>

        {couldChange.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-200/60 space-y-1.5">
            <span className="text-xs font-bold text-slate-800 block">
              What could change this analysis?
            </span>
            <ul className="space-y-1 text-xs text-slate-600">
              {couldChange.slice(0, 2).map((item, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-slate-400 font-bold">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Expandable Technical Details */}
      <div className="border-t border-slate-100 pt-3">
        <button
          type="button"
          onClick={() => setShowTechnical(!showTechnical)}
          className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition cursor-pointer"
        >
          <svg
            className={`h-4 w-4 transition-transform duration-200 ${showTechnical ? "rotate-90 text-slate-700" : "text-slate-400"}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span>View analysis details (for researchers and developers)</span>
        </button>

        {showTechnical && (
          <div className="mt-3 rounded-xl bg-slate-50 p-4 border border-slate-200 text-xs text-slate-600 space-y-2 animate-in fade-in duration-150">
            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <span className="font-semibold text-slate-800">Stability label:</span> {sensitivity.label}
              </div>
              <div>
                <span className="font-semibold text-slate-800">Sensitivity samples:</span> {sensitivity.samples} Monte Carlo perturbations
              </div>
              <div>
                <span className="font-semibold text-slate-800">Weight stability:</span> {Math.round(sensitivity.weight_stability * 100)}% of weight shifts maintain top rank
              </div>
              <div>
                <span className="font-semibold text-slate-800">Score noise stability:</span> {Math.round(sensitivity.score_stability * 100)}% of noise trials maintain top rank
              </div>
            </div>
            {sensitivity.method_note && (
              <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-200/50">
                Method note: {sensitivity.method_note}
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
