"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { humanize, stabilityTone } from "@/lib/format";
import type { AnalysisSummary } from "@/types/api";

export default function History() {
  const [items, setItems] = useState<AnalysisSummary[] | null>(null);
  const [err, setErr] = useState("");

  const load = () => api.list().then(setItems).catch((e) => setErr(e.message));
  useEffect(() => { load(); }, []);

  async function remove(id: string) {
    if (!confirm("Permanently delete this decision analysis?")) return;
    await api.remove(id);
    load();
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-end justify-between border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Past Decisions</h1>
          <p className="text-xs text-slate-500 mt-1">Review your previously analyzed situations and recorded decisions.</p>
        </div>
        <Link href="/" className="btn-primary text-xs shadow-sm">Start New Decision</Link>
      </div>

      {err && <p className="text-sm text-rose-600 bg-rose-50 border border-rose-200 p-4 rounded-xl">{err}</p>}

      {items && items.length === 0 && (
        <div className="card text-center p-12 text-slate-500 space-y-3">
          <p className="text-sm font-medium">You haven't analyzed any decisions yet.</p>
          <Link href="/" className="btn-primary text-xs py-2 px-4 inline-block">
            Analyze your first decision →
          </Link>
        </div>
      )}

      <div className="space-y-3">
        {items?.map((a) => (
          <div
            key={a.id}
            className="card flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between hover:border-emerald-300 transition shadow-sm"
          >
            <Link href={`/analysis/${a.id}`} className="min-w-0 flex-1 group">
              <div className="truncate font-bold text-slate-900 group-hover:text-emerald-800 transition">
                {a.summary}
              </div>
              <div className="mt-1 flex flex-wrap gap-2 text-xs text-slate-500">
                <span>{new Date(a.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</span>
                <span>· {humanize(a.domain)}</span>
                {a.parent_id && <span className="text-emerald-700">· revision of earlier run</span>}
              </div>
            </Link>

            <div className="flex flex-wrap items-center gap-2 text-xs shrink-0">
              <span className="chip bg-emerald-50 text-emerald-900 border border-emerald-200 font-semibold">
                Leading: {a.recommended_label}
              </span>
              {a.decision && (
                <span className="chip bg-slate-900 text-white font-bold">
                  Decision: {a.decision}
                </span>
              )}
              <button
                className="btn-ghost px-2 py-1 text-xs text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                onClick={() => remove(a.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
