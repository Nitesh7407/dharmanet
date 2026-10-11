"use client";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { ACTION_COLORS } from "@/lib/format";
import type { AnalysisResult } from "@/types/api";
import type { Ctx, Tab } from "@/components/analysis/ctx";

import { SimpleSummaryHeader } from "@/components/consumer/SimpleSummaryHeader";
import { SituationUnderstanding } from "@/components/consumer/SituationUnderstanding";
import { StakeholdersCardGrid } from "@/components/consumer/StakeholdersCardGrid";
import { OptionsCardGrid } from "@/components/consumer/OptionsCardGrid";
import { RecommendationCard } from "@/components/consumer/RecommendationCard";
import { ConsiderationsCard } from "@/components/consumer/ConsiderationsCard";
import { ReasoningRationale } from "@/components/consumer/ReasoningRationale";
import { CertaintyExplainer } from "@/components/consumer/CertaintyExplainer";
import { HumanDecisionCard } from "@/components/consumer/HumanDecisionCard";
import { TechnicalDetailsDrawer } from "@/components/consumer/TechnicalDetailsDrawer";

export default function AnalysisPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [r, setR] = useState<AnalysisResult | null>(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<Tab>("overview");

  // Edit / Revise inline state
  const [editing, setEditing] = useState(false);
  const [additionalContext, setAdditionalContext] = useState("");
  const [reviseBusy, setReviseBusy] = useState(false);
  const [reviseErr, setReviseErr] = useState("");

  useEffect(() => {
    setBusy(true);
    setErr("");
    api.get(id)
      .then((data) => {
        setR(data);
        setBusy(false);
      })
      .catch((e) => {
        setErr(e.message || "Failed to load analysis result.");
        setBusy(false);
      });
  }, [id]);

  const go = (t: Tab) => {
    setTab(t);
  };

  const ctx = useMemo<Ctx | null>(() => {
    if (!r) return null;
    const labels = Object.fromEntries(r.structured.actions.map((a) => [a.id, a.label]));
    const colors = Object.fromEntries(
      r.structured.actions.map((a, i) => [a.id, ACTION_COLORS[i % ACTION_COLORS.length]])
    );
    return { r, setR, label: (i) => labels[i] ?? i, color: (i) => colors[i] ?? "#16a34a", go };
  }, [r]);

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  async function handleReviseSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!r) return;
    setReviseBusy(true);
    setReviseErr("");
    try {
      const revised = await api.revise(r.id, {
        additional_context: additionalContext.trim() || undefined,
      });
      router.push(`/analysis/${revised.id}`);
      setEditing(false);
    } catch (error) {
      setReviseErr(error instanceof Error ? error.message : "Could not update situation.");
    } finally {
      setReviseBusy(false);
    }
  }

  // Loading State
  if (busy || !r) {
    return (
      <div className="card my-12 mx-auto max-w-xl text-center p-12 space-y-4 border border-slate-200/90 shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800">
          <svg className="h-6 w-6 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-slate-900">Loading your decision guidance…</h2>
        <p className="text-xs text-slate-500">
          Retrieving ethical perspectives, potential consequences, and stakeholder trade-offs.
        </p>
      </div>
    );
  }

  // Error State
  if (err) {
    return (
      <div className="card my-12 mx-auto max-w-xl p-8 space-y-4 bg-rose-50/50 border border-rose-200 text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-rose-100 text-rose-800 font-bold text-xl">
          !
        </div>
        <h2 className="text-lg font-bold text-rose-950">Could not load this analysis</h2>
        <p className="text-xs text-rose-800">{err}</p>
        <div className="flex justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="btn-primary text-xs py-2 px-4"
          >
            Retry
          </button>
          <Link href="/" className="btn-secondary text-xs py-2 px-4">
            Start New Decision
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16 max-w-4xl mx-auto">
      {/* 1. Fast Summary Header (10–15 second comprehension) */}
      <SimpleSummaryHeader
        r={r}
        onScrollToSection={scrollToSection}
        onEditSituation={() => setEditing(!editing)}
      />

      {/* Inline Edit / Revise Drawer */}
      {editing && (
        <section className="card bg-emerald-50/30 border border-emerald-200 p-6 space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Add Context or Adjust Your Situation</h3>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="text-xs text-slate-500 hover:text-slate-800"
            >
              Cancel ✕
            </button>
          </div>
          <form onSubmit={handleReviseSubmit} className="space-y-3">
            <p className="text-xs text-slate-600">
              Did you forget an important detail, constraint, or relationship? Add it here to re-run the ethical analysis:
            </p>
            <textarea
              className="input bg-white min-h-[90px] text-xs"
              placeholder="e.g. I also found out that a manager already knows about the issue..."
              value={additionalContext}
              onChange={(e) => setAdditionalContext(e.target.value)}
              disabled={reviseBusy}
            />
            {reviseErr && <p className="text-xs text-rose-600">{reviseErr}</p>}
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="btn-secondary text-xs py-2 px-4"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={reviseBusy || !additionalContext.trim()}
                className="btn-primary text-xs py-2 px-4"
              >
                {reviseBusy ? "Re-analyzing…" : "Update Analysis →"}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* 2. Section A: Understanding Your Situation */}
      <SituationUnderstanding structured={r.structured} />

      {/* 3. Section B: People Affected */}
      <StakeholdersCardGrid stakeholders={r.structured.stakeholders} />

      {/* 4. Section C: Your Available Choices */}
      <OptionsCardGrid
        actions={r.structured.actions}
        comparisons={r.comparison}
        stakeholders={r.structured.stakeholders}
        recommendedActionId={r.matrix.recommendation.action_id}
        isClearPreference={r.matrix.recommendation.clear_preference}
      />

      {/* 5. Section D: Recommended Next Step */}
      <RecommendationCard
        recommendation={r.matrix.recommendation}
        actions={r.structured.actions}
        comparisons={r.comparison}
        whyExplanation={r.explanation.why}
      />

      {/* 6. Section E: What You Should Consider Before Deciding */}
      <ConsiderationsCard
        structured={r.structured}
        explanation={r.explanation}
      />

      {/* 7. Section F: Why This Suggestion? (Philosophical Principles in Everyday English) */}
      <ReasoningRationale
        explanation={r.explanation}
        dharma={r.dharma}
      />

      {/* 8. Section G: How Certain Is This Analysis? */}
      <CertaintyExplainer
        sensitivity={r.sensitivity}
        explanation={r.explanation}
        isClearPreference={r.matrix.recommendation.clear_preference}
      />

      {/* 9. Section H: Your Decision */}
      <HumanDecisionCard
        r={r}
        onUpdate={(updated) => setR(updated)}
      />

      {/* 10. Section I: Progressive Disclosure (Technical Frameworks & Research Details) */}
      {ctx && <TechnicalDetailsDrawer {...ctx} />}

      {/* Bottom Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-200/80 pt-6 text-xs text-slate-500">
        <Link href="/" className="font-semibold text-emerald-800 hover:underline">
          ← Analyze Another Dilemma
        </Link>
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="font-medium hover:text-slate-900"
        >
          Back to Top ↑
        </button>
      </div>
    </div>
  );
}
