import type { Action, AnalysisResult, AnalysisSummary, DilemmaContext, KBEntry, Meta, Stakeholder } from "@/types/api";

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response | null = null;
  let fetchErr: Error | null = null;

  try {
    res = await fetch(`/api${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
      cache: "no-store",
    });
  } catch (err: any) {
    fetchErr = err;
  }

  // If proxy returned 500 (e.g. Next.js connect EPERM) or fetch failed,
  // attempt direct fallback to backend on port 8005 (CORS is allowed)
  if ((!res || res.status === 500) && typeof window !== "undefined") {
    try {
      const fallbackUrl = `http://localhost:8005/api${path}`;
      const directRes = await fetch(fallbackUrl, {
        ...init,
        headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
        cache: "no-store",
      });
      if (directRes.ok) {
        return (await directRes.json()) as T;
      }
      if (!res) {
        res = directRes;
      }
    } catch {
      // Direct fallback failed, proceed with original response/error
    }
  }

  if (!res) {
    throw fetchErr || new Error("Failed to connect to DharmaNet service");
  }

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const j = await res.json();
      detail = typeof j.detail === "string" ? j.detail : JSON.stringify(j.detail);
    } catch {}
    throw new Error(`${res.status}: ${detail}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  meta: () => req<Meta>("/meta"),
  create: (dilemma: string, context: Partial<DilemmaContext>, include_dharma = true) =>
    req<AnalysisResult>("/analyses", { method: "POST", body: JSON.stringify({ dilemma, context, include_dharma }) }),
  get: (id: string) => req<AnalysisResult>(`/analyses/${id}`),
  list: () => req<AnalysisSummary[]>("/analyses"),
  remove: (id: string) => req<{ deleted: string }>(`/analyses/${id}`, { method: "DELETE" }),
  rescore: (id: string, weights: Record<string, number>) =>
    req<AnalysisResult>(`/analyses/${id}/rescore`, { method: "POST", body: JSON.stringify({ weights: { values: weights } }) }),
  revise: (id: string, body: { stakeholders?: Stakeholder[]; actions?: Action[]; assumptions?: string[]; additional_context?: string }) =>
    req<AnalysisResult>(`/analyses/${id}/revise`, { method: "POST", body: JSON.stringify(body) }),
  decide: (id: string, choice: string, action_id: string | null, note: string) =>
    req<Record<string, unknown>>(`/analyses/${id}/decision`, { method: "POST", body: JSON.stringify({ choice, action_id, note }) }),
  feedback: (id: string, useful: boolean | null, ratings: Record<string, number>, comment: string) =>
    req<{ recorded: boolean }>(`/analyses/${id}/feedback`, { method: "POST", body: JSON.stringify({ useful, ratings, comment }) }),
  knowledge: (q = "") => req<KBEntry[]>(`/knowledge${q ? `?q=${encodeURIComponent(q)}` : ""}`),
  exportUrl: (id: string) => `/api/analyses/${id}/export`,
  // Sage AI Grounded Multilingual Endpoints
  sageLanguages: () => req<{ languages: any[] }>("/sage/languages"),
  sageConsult: (body: { dilemma: string; target_language?: string; session_id?: string }) =>
    req<any>("/sage/consult", { method: "POST", body: JSON.stringify(body) }),
  sageHistory: (sessionId: string) => req<any>(`/sage/history/${sessionId}`),
  sageClearHistory: (sessionId: string) =>
    req<{ deleted: boolean; session_id: string }>(`/sage/history/${sessionId}`, { method: "DELETE" }),
  sageAudio: (text: string, language = "en") =>
    req<{ supported: boolean; provider: string; audio_base64: string | null; format?: string; message?: string | null }>(
      "/sage/audio",
      { method: "POST", body: JSON.stringify({ text, language }) }
    ),
};

