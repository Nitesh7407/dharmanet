"use client";
import type { Action, ActionComparison, Stakeholder } from "@/types/api";

interface Props {
  actions: Action[];
  comparisons: ActionComparison[];
  stakeholders: Stakeholder[];
  recommendedActionId?: string;
  isClearPreference?: boolean;
}

export function OptionsCardGrid({
  actions,
  comparisons,
  stakeholders,
  recommendedActionId,
  isClearPreference,
}: Props) {
  const compMap = new Map(comparisons.map((c) => [c.action_id, c]));
  const shMap = new Map(stakeholders.map((s) => [s.id, s.name]));

  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
          Section 3 · Your Choices
        </span>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight sm:text-2xl">
          Your options
        </h2>
        <p className="text-xs text-slate-500">
          Here are the different paths you could take, along with their key benefits, risks, and trade-offs:
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {actions.map((act, index) => {
          const comp = compMap.get(act.id);
          const isTop = act.id === recommendedActionId;

          // Benefits (What could go well)
          const benefits = comp?.strengths && comp.strengths.length > 0
            ? comp.strengths.slice(0, 3)
            : ["Provides an active way to address the situation"];

          // Risks (What could go wrong)
          const risks = comp?.risks && comp.risks.length > 0
            ? comp.risks.slice(0, 3)
            : comp?.weaknesses && comp.weaknesses.length > 0
            ? comp.weaknesses.slice(0, 3)
            : ["May introduce friction or unintended consequences"];

          // Stakeholders helped / harmed
          const helped = comp?.stakeholders_helped?.map((id) => shMap.get(id) || id) || [];
          const harmed = comp?.stakeholders_harmed?.map((id) => shMap.get(id) || id) || [];

          return (
            <div
              key={act.id}
              className={`rounded-2xl border p-5 sm:p-6 transition-all flex flex-col justify-between ${
                isTop && isClearPreference
                  ? "border-emerald-300 bg-white ring-2 ring-emerald-600/10 shadow-md"
                  : "border-slate-200/90 bg-white shadow-sm"
              }`}
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Option {index + 1}
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                      {act.label}
                    </h3>
                  </div>
                  {isTop && isClearPreference && (
                    <span className="chip bg-emerald-100 text-emerald-900 font-bold border border-emerald-300 text-xs shrink-0">
                      ★ Recommended Path
                    </span>
                  )}
                </div>

                {/* Explanation */}
                {act.description && (
                  <p className="text-xs leading-relaxed text-slate-600">
                    <strong className="text-slate-700">What this means: </strong>
                    {act.description}
                  </p>
                )}

                {/* Benefits */}
                <div className="rounded-xl bg-emerald-50/40 border border-emerald-100/80 p-3.5 space-y-2">
                  <h4 className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                    <svg className="h-4 w-4 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    What could go well
                  </h4>
                  <ul className="space-y-1 text-xs text-slate-700">
                    {benefits.map((b, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-emerald-600 font-bold">•</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Risks */}
                <div className="rounded-xl bg-rose-50/30 border border-rose-100/70 p-3.5 space-y-2">
                  <h4 className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                    <svg className="h-4 w-4 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    What could go wrong
                  </h4>
                  <ul className="space-y-1 text-xs text-slate-700">
                    {risks.map((r, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-rose-600 font-bold">•</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Who is affected */}
                {(helped.length > 0 || harmed.length > 0) && (
                  <div className="text-xs text-slate-600 space-y-1 pt-1">
                    <span className="font-semibold text-slate-700 block">Who is most affected:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {helped.map((h, i) => (
                        <span key={`h-${i}`} className="chip bg-slate-100 text-slate-700 text-[11px]">
                          Protects: {h}
                        </span>
                      ))}
                      {harmed.map((h, i) => (
                        <span key={`w-${i}`} className="chip bg-slate-100 text-slate-700 text-[11px]">
                          Challenges: {h}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* What to consider / Trade-offs */}
              {(comp?.short_term || comp?.long_term) && (
                <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 space-y-1">
                  <span className="font-semibold text-slate-700 block">What to consider:</span>
                  <p className="text-[11px] leading-relaxed text-slate-600">
                    {comp.short_term && <span><strong>In the short term: </strong>{comp.short_term}. </span>}
                    {comp.long_term && <span><strong>In the long term: </strong>{comp.long_term}.</span>}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
