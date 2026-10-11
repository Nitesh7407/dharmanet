"use client";
import type { Action, ActionComparison, Recommendation } from "@/types/api";

interface Props {
  recommendation: Recommendation;
  actions: Action[];
  comparisons: ActionComparison[];
  whyExplanation: string;
}

export function RecommendationCard({
  recommendation,
  actions,
  comparisons,
  whyExplanation,
}: Props) {
  const isClear = recommendation.clear_preference;
  const topAction = actions.find((a) => a.id === recommendation.action_id);
  const runnerUp = recommendation.runner_up_id
    ? actions.find((a) => a.id === recommendation.runner_up_id)
    : null;
  const comp = comparisons.find((c) => c.action_id === recommendation.action_id);

  // Extract 2-3 clean bullet points
  const points: string[] = [];
  if (recommendation.statement) {
    points.push(recommendation.statement);
  }
  if (comp?.strengths && comp.strengths.length > 0) {
    points.push(comp.strengths[0]);
  }
  if (whyExplanation) {
    const cleaned = whyExplanation.replace(recommendation.statement, "").trim();
    if (cleaned.length > 20) {
      const firstSentence = cleaned.split(". ")[0];
      if (firstSentence && !points.includes(firstSentence)) {
        points.push(firstSentence.endsWith(".") ? firstSentence : firstSentence + ".");
      }
    }
  }

  return (
    <section id="recommended-step" className="scroll-mt-20">
      <div className="space-y-1 mb-4">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
          Section 4 · Guidance
        </span>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight sm:text-2xl">
          A possible next step
        </h2>
      </div>

      {isClear ? (
        <div className="rounded-2xl border-2 border-emerald-500 bg-gradient-to-br from-emerald-50/50 via-white to-emerald-50/30 p-6 sm:p-8 shadow-md">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="chip bg-emerald-700 text-white font-bold text-xs">
              Suggested Approach
            </span>
            <span className="text-xs font-medium text-slate-500">
              Balanced across consequences, duties, fairness, and care
            </span>
          </div>

          <h3 className="text-2xl font-black text-slate-900 tracking-tight">
            {topAction?.label || "Recommended Action"}
          </h3>

          {topAction?.description && (
            <p className="mt-2 text-sm text-slate-700 leading-relaxed font-medium">
              {topAction.description}
            </p>
          )}

          <div className="mt-6 rounded-xl bg-white/90 border border-emerald-200/80 p-5 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900">
              Why this suggestion makes sense:
            </h4>
            <ul className="space-y-2 text-sm text-slate-700">
              {points.slice(0, 3).map((pt, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="text-emerald-700 font-bold text-base leading-none mt-0.5">✓</span>
                  <span className="leading-relaxed">{pt}</span>
                </li>
              ))}
            </ul>
          </div>

          {runnerUp && (
            <p className="mt-4 text-xs text-slate-500">
              <strong>Close alternative: </strong>
              <em>{runnerUp.label}</em> provides a viable secondary route if personal priorities place higher value on different trade-offs.
            </p>
          )}

          <div className="mt-6 rounded-xl bg-slate-50 border border-slate-200 p-4 text-xs text-slate-600 flex items-start gap-3">
            <span className="text-emerald-700 font-bold text-base leading-none">ℹ</span>
            <p className="leading-relaxed">
              <strong>Remember: </strong> This suggestion is thoughtful ethical guidance to assist your thinking, not a guaranteed or objectively required answer. You are in control of what feels right for your unique situation.
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border-2 border-amber-300 bg-gradient-to-br from-amber-50/40 via-white to-amber-50/20 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="chip bg-amber-600 text-white font-bold text-xs">
              Multiple Close Choices
            </span>
            <span className="text-xs font-medium text-slate-500">
              No single option strictly dominates
            </span>
          </div>

          <h3 className="text-xl font-bold text-slate-900">
            There isn’t one clearly best choice based on the information provided.
          </h3>

          <p className="mt-2 text-sm text-slate-700 leading-relaxed">
            Here’s what you may want to consider before deciding: the top options are closely matched in their overall balance of benefits and risks. Your personal priorities—such as whether you prioritize minimizing personal conflict or ensuring full transparency—will be the deciding factor.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {actions.slice(0, 2).map((act, i) => (
              <div key={act.id} className="rounded-xl bg-white border border-slate-200 p-4 space-y-1.5">
                <span className="text-[11px] font-bold text-slate-500 uppercase">
                  Leading Contender {i + 1}
                </span>
                <div className="font-bold text-sm text-slate-900">{act.label}</div>
                <p className="text-xs text-slate-600">{act.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-xl bg-slate-50 border border-slate-200 p-4 text-xs text-slate-600 flex items-start gap-3">
            <span className="text-amber-700 font-bold text-base leading-none">ℹ</span>
            <p className="leading-relaxed">
              When an ethical dilemma is tightly balanced, neither choice is without costs. Review the considerations below to see which principles matter most to you.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
