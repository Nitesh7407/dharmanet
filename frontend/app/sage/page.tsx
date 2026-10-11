import type { Metadata } from "next";
import { SageChatInterface } from "@/components/sage/SageChatInterface";

export const metadata: Metadata = {
  title: "Mahabharata AI Sage — Grounded Multilingual Ethical Counsel | DharmaNet",
  description:
    "Consult the Mahabharata AI Sage for grounded ethical counsel across English, Tamil, Hindi, Telugu, Kannada, and Malayalam, backed by verified textual passages from the Mahabharata and Bhagavad Gita.",
};

export default function SagePage() {
  return (
    <div className="py-2">
      <SageChatInterface />
    </div>
  );
}
