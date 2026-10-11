"use client";
import Link from "next/link";
import type { AnalysisResult } from "@/types/api";

interface Props {
  r: AnalysisResult;
  onScrollToSection: (sectionId: string) => void;
  onEditSituation: () => void;
}

export function SimpleSummaryHeader({ r, onScrollToSection, onEditSituation }: Props) {
  const rec = r.matrix.recommendation;
  const topAction = r.structured.actions.find((a) => a.id === rec.action_id);
  const primaryConflict = r.structured.conflicts[0];

  return (
    <section className="card bg-gradient-to-br from-white via-emerald-50/20 to-white border border-emerald-200/80 p-6 sm:p-8 shadow-sm">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-4 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="chip bg-emerald-100 text-emerald-900 font-semibold border border-emerald-200">
              Decision Analysis Complete
            </span>
            <span className="text-xs text-slate-500 font-medium">
              10-Second Summary
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {rec.clear_preference
              ? `Suggested Next Step: ${topAction?.label || "Balanced Path"}`
              : "Carefully Balanced Choices — Here Are Your Options"}
          </h1>

          {/* Quick Summary Grid */}
          <div className="grid gap-3 sm:grid-cols-2 pt-2">
            <div className="rounded-xl border border-slate-200/80 bg-white/90 p-3.5 space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Your Situation
              </span>
              <p className="text-xs leading-relaxed text-slate-700 font-medium">
                {r.structured.summary || r.structured.dilemma_text.slice(0, 140) + "..."}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200/80 bg-white/90 p-3.5 space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                The Core Conflict
              </span>
              <p className="text-xs leading-relaxed text-slate-700 font-medium">
                {primaryConflict ? primaryConflict.title : "Balancing duties, consequences, and personal impact"}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200/80 bg-white/90 p-3.5 space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Options Identified
              </span>
              <p className="text-xs leading-relaxed text-slate-700 font-medium">
                {r.structured.actions.length} paths explored (direct action, escalation, mediation, inquiry)
              </p>
            </div>

            <div className="rounded-xl border border-slate-200/80 bg-white/90 p-3.5 space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Guidance Status
              </span>
              <p className="text-xs leading-relaxed text-slate-700 font-medium">
                {rec.clear_preference ? (
                  <span className="text-emerald-800 font-semibold">
                    ✓ Clear leading option identified below
                  </span>
                ) : (
                  <span className="text-amber-800 font-semibold">
                    ⚖ Multiple choices closely tied; requires your values
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-row lg:flex-col gap-2.5 shrink-0 pt-2 lg:pt-0">
          <button
            type="button"
            onClick={() => onScrollToSection("recommended-step")}
            className="btn-primary text-xs font-bold py-2.5 px-4 shadow-sm"
          >
            See Recommendation ↓
          </button>

          <button
            type="button"
            onClick={onEditSituation}
            className="btn-secondary text-xs font-semibold py-2.5 px-4"
          >
            ← Edit Situation
          </button>

          <Link
            href="/"
            className="btn-ghost text-xs font-semibold py-2 px-3 text-center"
          >
            + New Decision
          </Link>
        </div>
      </div>
    </section>
  );
}
