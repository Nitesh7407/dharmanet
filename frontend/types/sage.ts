export type SupportedLang = "auto" | "en" | "ta" | "hi" | "te" | "kn" | "ml";

export interface LanguageMeta {
  code: SupportedLang;
  name: string;
  native_name: string;
  script: string;
  voice_locale: string;
}

export interface SourceReference {
  entry_id: string;
  concept: string;
  sanskrit_term: string;
  source: string;
  chapter: string | null;
  verse: string | null;
  citation: string;
  excerpt: string;
  interpretation: string;
  relevance: number;
}

export interface StructuredAnswer {
  // Phase 6 Core Concise Structure (80-150 words total)
  short_answer?: string;
  why?: string;
  mahabharata_connection: string;
  what_you_can_do?: string[];
  source_evidence: SourceReference[];

  // Detailed Analytical Framework (expandable depth)
  understanding: string;
  ethical_analysis: string;
  possible_solution: string;
  alternative_perspective: string;
}

export interface SageAudioResponse {
  supported: boolean;
  provider: string;
  audio_base64: string | null;
  format?: string;
  message?: string | null;
}

export interface SageConsultRequest {
  dilemma: string;
  target_language?: SupportedLang;
  session_id?: string;
}

export interface SageConsultResponse {
  session_id: string;
  message_id: string;
  detected_language: string;
  selected_language: string;
  answer: StructuredAnswer;
  sources_found: boolean;
  source_count: number;
  model: string;
  created_at: string;
}

export interface SageMessageRecord {
  id: string;
  session_id: string;
  role: "user" | "sage";
  content: string;
  language: string;
  created_at: string;
  sources?: SourceReference[];
  answer_structure?: StructuredAnswer | null;
}

export interface SageHistoryResponse {
  session_id: string;
  messages: SageMessageRecord[];
}
