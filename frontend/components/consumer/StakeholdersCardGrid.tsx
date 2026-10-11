"use client";
import type { Stakeholder } from "@/types/api";

interface Props {
  stakeholders: Stakeholder[];
}

export function StakeholdersCardGrid({ stakeholders }: Props) {
  if (!stakeholders || stakeholders.length === 0) return null;

  function getFamiliarName(s: Stakeholder): string {
    const n = s.name.toLowerCase();
    if (s.category === "decision_maker" || n.includes("decision-maker") || n.includes("decision maker") || n === "you") {
      return "You";
    }
    if (n.includes("colleague") || n.includes("coworker") || n.includes("employee")) {
      return `Your Colleagues (${s.name})`;
    }
    if (n.includes("friend") || n.includes("roommate")) {
      return `Your Friend (${s.name})`;
    }
    if (n.includes("family") || n.includes("parent") || n.includes("father") || n.includes("mother")) {
      return `Your Family (${s.name})`;
    }
    if (n.includes("patient") || n.includes("customer") || n.includes("public")) {
      return `The Public (${s.name})`;
    }
    return s.name;
  }

  function getImpactSentence(s: Stakeholder): string {
    if (s.potential_harms && s.potential_harms.length > 0 && s.potential_benefits && s.potential_benefits.length > 0) {
      return `Could face ${s.potential_harms[0].toLowerCase()}, but stands to gain ${s.potential_benefits[0].toLowerCase()}.`;
    }
    if (s.potential_harms && s.potential_harms.length > 0) {
      return `Faces the risk of ${s.potential_harms[0].toLowerCase()}.`;
    }
    if (s.potential_benefits && s.potential_benefits.length > 0) {
      return `May benefit through ${s.potential_benefits[0].toLowerCase()}.`;
    }
    if (s.interests && s.interests.length > 0) {
      return `Has a direct interest in ${s.interests[0].toLowerCase()}.`;
    }
    if (s.vulnerabilities && s.vulnerabilities.length > 0) {
      return `Particularly vulnerable to ${s.vulnerabilities[0].toLowerCase()}.`;
    }
    return "Directly impacted by the course of action chosen.";
  }

  return (
    <section className="card space-y-4 bg-white border border-slate-200/80 p-6 sm:p-7">
      <div className="space-y-1">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
          Section 2 · People Involved
        </span>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight sm:text-2xl">
          Who could be affected?
        </h2>
        <p className="text-xs text-slate-500">
          Every ethical choice impacts different people in different ways. Here is who is involved in your dilemma:
        </p>
      </div>

      <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3 pt-1">
        {stakeholders.map((s) => {
          const isVulnerable = s.roles.includes("vulnerable") || (s.vulnerabilities && s.vulnerabilities.length > 0);
          const isYou = s.category === "decision_maker" || s.name.toLowerCase().includes("decision");

          return (
            <div
              key={s.id}
              className={`rounded-xl border p-4 transition-all flex flex-col justify-between ${
                isYou
                  ? "border-emerald-200 bg-emerald-50/30"
                  : isVulnerable
                  ? "border-amber-200 bg-amber-50/20"
                  : "border-slate-200/80 bg-white"
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-bold text-slate-900">
                    {getFamiliarName(s)}
                  </h3>
                  {isYou && (
                    <span className="chip text-[10px] bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200">
                      Decision-Maker
                    </span>
                  )}
                  {isVulnerable && !isYou && (
                    <span className="chip text-[10px] bg-amber-100 text-amber-800 font-semibold border border-amber-200">
                      Vulnerable
                    </span>
                  )}
                </div>

                <p className="text-xs leading-relaxed text-slate-600">
                  {getImpactSentence(s)}
                </p>
              </div>

              {s.rights && s.rights.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-500">
                  <span className="font-semibold text-slate-700">Key consideration: </span>
                  {s.rights[0]}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
