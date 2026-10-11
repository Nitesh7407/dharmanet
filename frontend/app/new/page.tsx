"use client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { DilemmaInputForm, EVERYDAY_PRESETS } from "@/components/consumer/DilemmaInputForm";

function NewDilemmaContent() {
  const searchParams = useSearchParams();
  const exampleId = searchParams.get("example");
  const found = exampleId ? EVERYDAY_PRESETS.find((p) => p.id === exampleId) : undefined;

  return (
    <div className="py-4">
      <DilemmaInputForm
        initialText={found?.text || ""}
        initialRole={found?.role || ""}
        initialDomain={found?.domain || ""}
      />
    </div>
  );
}

export default function NewDilemmaPage() {
  return (
    <Suspense fallback={<div className="card p-8 text-center text-sm muted">Loading form…</div>}>
      <NewDilemmaContent />
    </Suspense>
  );
}
