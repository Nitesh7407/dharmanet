"use client";
import type { Conflict, Explanation, StructuredDilemma } from "@/types/api";

interface Props {
  structured: StructuredDilemma;
  explanation: Explanation;
}

export function ConsiderationsCard({ structured, explanation }: Props) {
  // Generate up to 3 context-specific questions derived from actual dilemma conflicts & uncertainties
  const items: { question: string; context: string }[] = [];

  const conflicts = structured.conflicts || [];
  const uncertainties = structured.uncertainties || [];
  const assumptions = explanation?.assumptions || [];

  // Check 1: Harm / vulnerability check
  const hasHarmOrSafety = conflicts.some(
    (c) => c.type.includes("harm") || c.title.toLowerCase().includes("safety") || c.description.toLowerCase().includes("harm")
  );
  if (hasHarmOrSafety || structured.cues.vulnerability > 0.4) {
    items.push({
      question: "Could anyone be hurt or unfairly burdened?",
      context: "Consider whether vulnerable people or innocent bystanders are protected from severe fallout.",
    });
  }

  // Check 2: Duties, trust, or agreements
  const hasDutyOrLoyalty = conflicts.some(
    (c) => c.type.includes("duty") || c.type.includes("loyalty") || c.title.toLowerCase().includes("loyalty") || c.title.toLowerCase().includes("truth")
  );
  if (hasDutyOrLoyalty || structured.constraints.length > 0) {
    items.push({
      question: "Are there core duties or promises you need to fulfill?",
      context: "Check if you have contractual, professional, or personal commitments that cannot be ignored.",
    });
  }

  // Check 3: Fact verification / safer intermediate steps
  if (uncertainties.length > 0) {
    items.push({
      question: "Is there a safer way to gather facts before acting?",
      context: `Before taking an irreversible step, consider whether ${uncertainties[0].toLowerCase()} can be clarified first.`,
    });
  } else if (assumptions.length > 0) {
    items.push({
      question: "Are there assumptions you can verify first?",
      context: `You may be assuming that ${assumptions[0].toLowerCase()}. Can you confirm this quietly?`,
    });
  } else {
    items.push({
      question: "Can this problem be resolved through private, step-by-step communication?",
      context: "Often, escalating directly to management or public channels can be delayed by a calm private conversation.",
    });
  }

  // Take up to 3 items
  const finalItems = items.slice(0, 3);

  return (
    <section className="card space-y-4 bg-white border border-slate-200/80 p-6 sm:p-7">
      <div className="space-y-1">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
          Section 5 · Reflection
        </span>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight sm:text-2xl">
          Before you decide
        </h2>
        <p className="text-xs text-slate-500">
          Take a moment to ask yourself these important questions based specifically on your dilemma:
        </p>
      </div>

      <div className="grid gap-3.5 sm:grid-cols-3 pt-1">
        {finalItems.map((item, index) => (
          <div
            key={index}
            className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 space-y-2 flex flex-col justify-between"
          >
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                Question {index + 1}
              </span>
              <h3 className="text-sm font-bold text-slate-900 leading-snug">
                {item.question}
              </h3>
            </div>
            <p className="text-xs leading-relaxed text-slate-600 border-t border-slate-200/50 pt-2">
              {item.context}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
