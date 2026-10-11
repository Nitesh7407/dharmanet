"""Schemas for Mahabharata Multilingual AI Sage."""
from __future__ import annotations

from datetime import datetime
from typing import Literal
from pydantic import BaseModel, Field

SupportedLang = Literal["auto", "en", "ta", "hi", "te", "kn", "ml"]


class SourceReference(BaseModel):
    entry_id: str
    concept: str
    sanskrit_term: str = ""
    source: str
    chapter: str | None = None
    verse: str | None = None
    citation: str
    excerpt: str
    interpretation: str
    relevance: float = 0.5


class StructuredAnswer(BaseModel):
    # Phase 6 Core Concise Structure (80-150 words total)
    short_answer: str = Field(
        default="",
        description="1-2 direct sentences stating the core counsel directly and clearly.",
    )
    why: str = Field(
        default="",
        description="Main ethical considerations in plain language.",
    )
    mahabharata_connection: str = Field(
        default="",
        description="Relevant teaching/episode with verified source citation.",
    )
    what_you_can_do: list[str] = Field(
        default_factory=list,
        description="1-3 practical action steps.",
    )
    source_evidence: list[SourceReference] = Field(default_factory=list)

    # Detailed Analytical Framework (expandable depth)
    understanding: str = ""
    ethical_analysis: str = ""
    possible_solution: str = ""
    alternative_perspective: str = ""


class SageAudioRequest(BaseModel):
    text: str = Field(min_length=1, max_length=4000)
    language: str = "en"
    speaker: str = "shubh"


class SageAudioResponse(BaseModel):
    supported: bool
    provider: str
    audio_base64: str | None = None
    format: str = "audio/wav"
    message: str | None = None


class SageConsultRequest(BaseModel):
    dilemma: str = Field(min_length=5, max_length=8000)
    target_language: SupportedLang = "auto"
    session_id: str | None = None


class SageConsultResponse(BaseModel):
    session_id: str
    message_id: str
    detected_language: str
    selected_language: str
    answer: StructuredAnswer
    sources_found: bool
    source_count: int
    model: str
    created_at: datetime


class SageMessageRecord(BaseModel):
    id: str
    session_id: str
    role: Literal["user", "sage"]
    content: str
    language: str
    created_at: datetime
    sources: list[SourceReference] = Field(default_factory=list)
    answer_structure: StructuredAnswer | None = None


class SageHistoryResponse(BaseModel):
    session_id: str
    messages: list[SageMessageRecord]
