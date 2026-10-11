"use client";
import { useState } from "react";
import { api } from "@/lib/api";
import type { Action, AnalysisResult, Decision } from "@/types/api";

interface Props {
  r: AnalysisResult;
  onUpdate: (updated: AnalysisResult) => void;
}

export function HumanDecisionCard({ r, onUpdate }: Props) {
  const rec = r.matrix.recommendation;
  const existingDecision = r.decision;

  const [choice, setChoice] = useState<string>(existingDecision?.choice || "accept");
  const [actionId, setActionId] = useState<string>(existingDecision?.action_id || rec.action_id);
  const [note, setNote] = useState<string>(existingDecision?.note || "");
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(Boolean(existingDecision));
  const [err, setErr] = useState("");

  async function handleRecordDecision(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      await api.decide(r.id, choice, actionId, note);
      const updated = await api.get(r.id);
      onUpdate(updated);
      setSaved(true);
    } catch (error) {
      setErr(error instanceof Error ? error.message : "Could not record decision.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="card space-y-5 bg-white border border-slate-200/80 p-6 sm:p-7">
      <div className="space-y-1">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
          Section 8 · Your Decision
        </span>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight sm:text-2xl">
          What have you decided to do?
        </h2>
        <p className="text-xs text-slate-500">
          You are the moral authority. DharmaNet never acts on your behalf. Record your conclusion here for your own records:
        </p>
      </div>

      <form onSubmit={handleRecordDecision} className="space-y-4">
        <div className="grid gap-2.5 sm:grid-cols-2">
          <label
            className={`rounded-xl border p-3.5 flex items-start gap-3 cursor-pointer transition ${
              choice === "accept"
                ? "border-emerald-600 bg-emerald-50/40 ring-1 ring-emerald-600/20"
                : "border-slate-200 hover:bg-slate-50"
            }`}
          >
            <input
              type="radio"
              name="decisionChoice"
              value="accept"
              checked={choice === "accept"}
              onChange={() => {
                setChoice("accept");
                setActionId(rec.action_id);
                setSaved(false);
              }}
              className="mt-0.5 accent-emerald-600"
            />
            <div>
              <span className="text-xs font-bold text-slate-900 block">Follow suggested path</span>
              <span className="text-[11px] text-slate-500">
                You agree with the leading recommendation.
              </span>
            </div>
          </label>

          <label
            className={`rounded-xl border p-3.5 flex items-start gap-3 cursor-pointer transition ${
              choice === "alternative"
                ? "border-emerald-600 bg-emerald-50/40 ring-1 ring-emerald-600/20"
                : "border-slate-200 hover:bg-slate-50"
            }`}
          >
            <input
              type="radio"
              name="decisionChoice"
              value="alternative"
              checked={choice === "alternative"}
              onChange={() => {
                setChoice("alternative");
                setSaved(false);
              }}
              className="mt-0.5 accent-emerald-600"
            />
            <div>
              <span className="text-xs font-bold text-slate-900 block">Choose an alternative</span>
              <span className="text-[11px] text-slate-500">
                Another option fits your priorities better.
              </span>
            </div>
          </label>

          <label
            className={`rounded-xl border p-3.5 flex items-start gap-3 cursor-pointer transition ${
              choice === "modify"
                ? "border-emerald-600 bg-emerald-50/40 ring-1 ring-emerald-600/20"
                : "border-slate-200 hover:bg-slate-50"
            }`}
          >
            <input
              type="radio"
              name="decisionChoice"
              value="modify"
              checked={choice === "modify"}
              onChange={() => {
                setChoice("modify");
                setSaved(false);
              }}
              className="mt-0.5 accent-emerald-600"
            />
            <div>
              <span className="text-xs font-bold text-slate-900 block">Combine or customize</span>
              <span className="text-[11px] text-slate-500">
                You will merge elements or add safety steps.
              </span>
            </div>
          </label>

          <label
            className={`rounded-xl border p-3.5 flex items-start gap-3 cursor-pointer transition ${
              choice === "reject"
                ? "border-emerald-600 bg-emerald-50/40 ring-1 ring-emerald-600/20"
                : "border-slate-200 hover:bg-slate-50"
            }`}
          >
            <input
              type="radio"
              name="decisionChoice"
              value="reject"
              checked={choice === "reject"}
              onChange={() => {
                setChoice("reject");
                setSaved(false);
              }}
              className="mt-0.5 accent-emerald-600"
            />
            <div>
              <span className="text-xs font-bold text-slate-900 block">Pause or seek another way</span>
              <span className="text-[11px] text-slate-500">
                None of the generated options are acceptable.
              </span>
            </div>
          </label>
        </div>

        {/* Action selection if alternative */}
        {choice === "alternative" && (
          <div className="space-y-1.5 pt-1">
            <label className="label">Which option do you prefer?</label>
            <select
              className="input"
              value={actionId}
              onChange={(e) => {
                setActionId(e.target.value);
                setSaved(false);
              }}
            >
              {r.structured.actions.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Note */}
        <div className="space-y-1.5">
          <label className="label">Your personal notes / reasoning (optional)</label>
          <textarea
            className="input min-h-[70px] text-xs"
            placeholder="e.g. I decided to schedule a private talk on Monday before involving anyone else..."
            value={note}
            maxLength={2000}
            onChange={(e) => {
              setNote(e.target.value);
              setSaved(false);
            }}
          />
        </div>

        {err && <p className="text-xs text-rose-600">{err}</p>}

        <div className="flex items-center justify-between pt-1">
          <button
            type="submit"
            disabled={busy}
            className="btn-primary text-xs font-bold py-2.5 px-5 cursor-pointer"
          >
            {busy ? "Saving…" : saved ? "✓ Decision Recorded (Update)" : "Record My Decision"}
          </button>

          {saved && (
            <span className="text-xs text-emerald-800 font-semibold flex items-center gap-1.5">
              <span>✓ Saved to your research log</span>
            </span>
          )}
        </div>
      </form>
    </section>
  );
}
