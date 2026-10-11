"use client";
import { useState } from "react";
import type { Ctx } from "@/components/analysis/ctx";
import { MatrixView } from "@/components/analysis/MatrixView";
import { DharmaView } from "@/components/analysis/DharmaView";
import { ExplanationView } from "@/components/analysis/ExplanationView";
import { SensitivityView } from "@/components/analysis/SensitivityView";
import { CompareView } from "@/components/analysis/CompareView";
import { api } from "@/lib/api";

export function TechnicalDetailsDrawer({ r, setR, label, color, go }: Ctx) {
  const [open, setOpen] = useState(false);
  const [subTab, setSubTab] = useState<"matrix" | "dharma" | "trace" | "sensitivity" | "compare">("matrix");

  return (
    <section className="card bg-slate-50/70 border border-slate-200/80 p-6 sm:p-7 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            For Researchers & Analysts
          </span>
          <h2 className="text-lg font-bold text-slate-900">
            Complete Technical & Ethical Framework Data
          </h2>
          <p className="text-xs text-slate-500">
            Explore mathematical score matrices, Monte Carlo distributions, and complete philosophical text citations.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="btn-secondary text-xs font-semibold py-2 px-4 shrink-0 flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <span>{open ? "Hide Technical Details" : "Explore Technical Details"}</span>
          <svg
            className={`h-4 w-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-200 pt-5 space-y-5 animate-in fade-in duration-200">
          {/* Subtabs */}
          <div className="flex flex-wrap gap-1.5 border-b border-slate-200 pb-3">
            {[
              { id: "matrix", label: "7-Framework Score Matrix" },
              { id: "dharma", label: "Dharma & RAG Citations" },
              { id: "sensitivity", label: "Sensitivity & Weight Adjustment" },
              { id: "compare", label: "Side-by-Side Trade-off Table" },
              { id: "trace", label: "Step-by-Step Reasoning Trace" },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setSubTab(t.id as typeof subTab)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  subTab === t.id
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Subtab Contents */}
          <div className="pt-2">
            {subTab === "matrix" && <MatrixView r={r} setR={setR} label={label} color={color} go={go} />}
            {subTab === "dharma" && <DharmaView r={r} setR={setR} label={label} color={color} go={go} />}
            {subTab === "sensitivity" && <SensitivityView r={r} setR={setR} label={label} color={color} go={go} />}
            {subTab === "compare" && <CompareView r={r} setR={setR} label={label} color={color} go={go} />}
            {subTab === "trace" && <ExplanationView r={r} setR={setR} label={label} color={color} go={go} />}
          </div>

          {/* Technical Metadata Footer */}
          <div className="mt-4 flex flex-wrap items-center justify-between border-t border-slate-200/80 pt-3 text-xs text-slate-500">
            <span>
              Engine: <strong>{r.provider.provider}</strong> ({r.provider.model || "deterministic heuristic"}) · Seed: {r.seed}
            </span>
            <a
              href={api.exportUrl(r.id)}
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-emerald-800 hover:underline"
            >
              Export Complete Research Record JSON ↗
            </a>
          </div>
        </div>
      )}
    </section>
  );
}
