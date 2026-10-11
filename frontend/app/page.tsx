import Link from "next/link";
import { DilemmaInputForm } from "@/components/consumer/DilemmaInputForm";

export default function Home() {
  return (
    <div className="space-y-12 py-4">
      {/* Mahabharata Sage Feature Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-emerald-200/90 bg-gradient-to-r from-emerald-50 via-teal-50 to-slate-50 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="grid h-6 w-6 place-items-center rounded-lg bg-emerald-800 text-xs font-bold text-white shadow-xs">
                ध
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                New Feature · Multilingual AI Sage
              </span>
              <span className="rounded-full bg-emerald-100/80 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                6 Languages + Audio
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Seek Grounded Counsel from the Mahabharata AI Sage
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Explore your dilemma through classical episodes, character decisions, and Gita teachings. Get a structured 6-part reasoned answer with verified textual citations in English, தமிழ், हिन्दी, తెలుగు, ಕನ್ನಡ, or മലയാളം.
            </p>
          </div>
          <div className="shrink-0">
            <Link
              href="/sage"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-800 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition"
            >
              <span>Consult the Sage</span>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Primary Input Hero */}
      <DilemmaInputForm />

      {/* How DharmaNet Helps */}
      <section className="mx-auto max-w-4xl border-t border-slate-200/80 pt-12">
        <div className="text-center space-y-2 mb-10">
          <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            How DharmaNet Helps You Think Through Decisions
          </h2>
          <p className="text-sm text-slate-600 max-w-xl mx-auto">
            Instead of giving you a single arbitrary answer, DharmaNet structures your dilemma so you can see all sides clearly.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          <div className="card space-y-3 bg-white p-6 border border-slate-200/80">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-800 font-bold border border-emerald-200/60">
              1
            </div>
            <h3 className="font-bold text-slate-900 text-base">Clear Choices</h3>
            <p className="text-xs leading-relaxed text-slate-600">
              Identifies realistic paths forward: from direct conversations and quiet escalation to mediation, gathering facts, or pausing.
            </p>
          </div>

          <div className="card space-y-3 bg-white p-6 border border-slate-200/80">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-800 font-bold border border-emerald-200/60">
              2
            </div>
            <h3 className="font-bold text-slate-900 text-base">Trade-Offs & People</h3>
            <p className="text-xs leading-relaxed text-slate-600">
              Breaks down what could go well, what could go wrong, and who stands to be helped or harmed by each choice.
            </p>
          </div>

          <div className="card space-y-3 bg-white p-6 border border-slate-200/80">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-800 font-bold border border-emerald-200/60">
              3
            </div>
            <h3 className="font-bold text-slate-900 text-base">You Stay in Control</h3>
            <p className="text-xs leading-relaxed text-slate-600">
              Gives grounded perspective and thoughtful guidance without forcing an answer. You make the final call.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
