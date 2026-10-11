import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "DharmaNet — Explainable Multi-Framework Ethical AI",
  description: "An Explainable Multi-Framework AI System for Culturally Contextualized Ethical Decision Support. Preserving human decision authority.",
};

const NAV = [
  { href: "/", label: "New Decision" },
  { href: "/sage", label: "Mahabharata Sage" },
  { href: "/history", label: "Past Decisions" },
  { href: "/knowledge", label: "Knowledge Base" },
  { href: "/presentation", label: "Research Overview" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased">
        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-md shadow-xs">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2.5 font-bold tracking-tight text-slate-900 transition hover:opacity-90">
                <span aria-hidden className="grid h-8 w-8 place-items-center rounded-xl bg-emerald-700 text-sm font-semibold text-white shadow-sm shadow-emerald-700/20">
                  ध
                </span>
                <span className="text-xl font-bold tracking-tight text-slate-900">DharmaNet</span>
              </Link>
              <span className="hidden sm:inline-flex items-center rounded-full bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800">
                Decision Support
              </span>
            </div>

            <nav className="flex items-center gap-1 sm:gap-2 text-sm">
              {NAV.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  className="rounded-lg px-3 py-1.5 font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 text-xs sm:text-sm"
                >
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>

        <main className="mx-auto max-w-5xl flex-1 px-4 py-8 sm:px-6 w-full">{children}</main>

        <footer className="border-t border-slate-200/80 bg-white/80 mt-16">
          <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 text-xs text-slate-500 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="font-semibold text-slate-800">
                DharmaNet · Ethical Decision Support
              </p>
              <div className="flex gap-4 font-medium text-emerald-800">
                <Link href="/" className="hover:underline">New Decision</Link>
                <Link href="/sage" className="hover:underline">Mahabharata Sage</Link>
                <Link href="/history" className="hover:underline">Past Decisions</Link>
                <Link href="/knowledge" className="hover:underline">Knowledge Base</Link>
                <Link href="/presentation" className="hover:underline">Research Overview</Link>
              </div>
            </div>
            <p className="leading-relaxed text-slate-500 text-[11px]">
              DharmaNet provides structured perspectives to help you think through difficult ethical dilemmas.
              It does not replace human judgment, professional counsel, or institutional policies.
              You retain full authority and responsibility for any decision you choose to make.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
