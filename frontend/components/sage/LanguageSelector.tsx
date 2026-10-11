"use client";
import type { SupportedLang } from "@/types/sage";
import { SAGE_LANGUAGES } from "@/lib/sage_i18n";

interface Props {
  selectedLanguage: SupportedLang;
  detectedLanguage?: string;
  onSelectLanguage: (lang: SupportedLang) => void;
  label?: string;
}

export function LanguageSelector({
  selectedLanguage,
  detectedLanguage,
  onSelectLanguage,
  label = "Response Language",
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      {label && <span className="font-semibold text-slate-600">{label}:</span>}

      <div className="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={() => onSelectLanguage("auto")}
          className={`rounded-lg px-2.5 py-1 font-semibold transition border cursor-pointer ${
            selectedLanguage === "auto"
              ? "bg-emerald-700 text-white border-emerald-700 shadow-xs"
              : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
          }`}
        >
          <span>Auto-detect</span>
          {detectedLanguage && selectedLanguage === "auto" && (
            <span className="ml-1 opacity-80 text-[10px]">({detectedLanguage})</span>
          )}
        </button>

        {SAGE_LANGUAGES.map((l) => {
          const active = selectedLanguage === l.code;
          return (
            <button
              key={l.code}
              type="button"
              onClick={() => onSelectLanguage(l.code)}
              className={`rounded-lg px-2.5 py-1 font-medium transition border cursor-pointer ${
                active
                  ? "bg-emerald-700 text-white border-emerald-700 shadow-xs font-semibold"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-emerald-50 hover:border-emerald-300"
              }`}
            >
              <span className="font-sans">{l.native_name}</span>
              {l.code !== "en" && (
                <span className={`ml-1 text-[10px] ${active ? "text-emerald-100" : "text-slate-400"}`}>
                  {l.name}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
