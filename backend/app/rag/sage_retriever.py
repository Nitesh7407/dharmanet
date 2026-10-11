"""Specialized Mahabharata Sage Retriever with multilingual keyword expansion and relevance checking."""
from __future__ import annotations

import math
import re
from collections import Counter
from typing import NamedTuple

from app.schemas.dharma import KBEntry, KnowledgeBase

# Common multilingual dilemma concepts mapped to English index terms
MULTILINGUAL_CONCEPT_MAP: dict[str, list[str]] = {
    # Duty / Responsibility
    "கடமை": ["duty", "responsibility", "svadharma", "kartavya"],
    "कर्तव्य": ["duty", "responsibility", "svadharma", "kartavya"],
    "बाध्यता": ["duty", "obligation", "responsibility"],
    "బాధ్యత": ["duty", "responsibility", "kartavya"],
    "ಕರ್ತವ್ಯ": ["duty", "responsibility", "kartavya"],
    "ബാധ്യത": ["duty", "responsibility", "obligation"],
    "ധർമ്മം": ["dharma", "duty", "righteousness"],

    # Truth / Honesty / Lies / Deception
    "பொய்": ["lie", "half-truth", "deception", "mislead", "conceal"],
    "உண்மை": ["truth", "satya", "truthfulness", "transparent"],
    "झूठ": ["lie", "half-truth", "deception", "mislead", "conceal"],
    "सत्य": ["truth", "satya", "truthfulness", "transparent"],
    "सच": ["truth", "satya", "honest"],
    "అబద్ధం": ["lie", "deception", "half-truth"],
    "నిజం": ["truth", "satya", "honest"],
    "ಸುಳ್ಳು": ["lie", "deception", "half-truth"],
    "ಸತ್ಯ": ["truth", "satya", "honest"],
    "നുണ": ["lie", "deception", "half-truth"],
    "സത്യം": ["truth", "satya", "honest"],

    # Loyalty / Friendship / Gratitude
    "நண்பன்": ["friend", "loyalty", "friendship", "relationship"],
    "விசுவாசம்": ["loyalty", "gratitude", "faithful", "promise"],
    "दोस्त": ["friend", "loyalty", "friendship", "relationship"],
    "मित्र": ["friend", "loyalty", "friendship", "mitra"],
    "वफादारी": ["loyalty", "gratitude", "faithful", "promise"],
    "స్నేహితుడు": ["friend", "loyalty", "friendship"],
    "విశ్వాసం": ["loyalty", "gratitude", "faithful"],
    "ಸ್ನೇಹಿತ": ["friend", "loyalty", "friendship"],
    "ವಿಶ್ವಾಸ": ["loyalty", "gratitude", "faithful"],
    "സുഹൃത്ത്": ["friend", "loyalty", "friendship"],
    "വിശ്വസ്തത": ["loyalty", "gratitude", "faithful"],

    # Taking Credit / Favoritism
    "கிரெடிட்": ["credit", "taking credit", "favoritism", "workplace credit"],
    "பக்கச்சார்பு": ["favoritism", "bias", "unfair"],
    "क्रेडिट": ["credit", "taking credit", "favoritism", "workplace credit"],
    "पक्षपात": ["favoritism", "bias", "unfair"],
    "క్రెడిట్": ["credit", "taking credit", "favoritism"],
    "పక్షపాతం": ["favoritism", "bias", "unfair"],
    "ಕ್ರೆಡಿಟ್": ["credit", "taking credit", "favoritism"],
    "ತಾರತಮ್ಯ": ["favoritism", "bias", "unfair"],
    "ക്രെഡിറ്റ്": ["credit", "taking credit", "favoritism"],
    "പക്ഷപാതം": ["favoritism", "bias", "unfair"],

    # Boss / Manager / Coworker / Workplace / Whistleblowing
    "மேலாளர்": ["manager", "boss", "escalate", "whistleblowing", "authority"],
    "ஊழியர்": ["colleague", "workplace", "job", "coworker", "team"],
    "வேலை": ["job", "work", "duty", "project"],
    "அலுவலகம்": ["workplace", "job", "company", "employer"],
    "प्रबंधक": ["manager", "boss", "escalate", "whistleblowing", "authority"],
    "सहकर्मी": ["colleague", "coworker", "teammate", "workplace"],
    "नौकरी": ["job", "career", "employment", "company"],
    "काम": ["work", "job", "project", "duty"],
    "మేనేజర్": ["manager", "boss", "escalate", "authority"],
    "సహోద్యోగి": ["colleague", "coworker", "teammate"],
    "ఉద్యోగం": ["job", "career", "employment"],
    "పని": ["work", "job", "project"],
    "ಮ್ಯಾನೇಜರ್": ["manager", "boss", "escalate", "authority"],
    "ಸಹೋದ್ಯೋಗಿ": ["colleague", "coworker", "teammate"],
    "ಕೆಲಸ": ["job", "work", "career", "project"],
    "മാനേജർ": ["manager", "boss", "escalate", "authority"],
    "സഹപ്രവർത്തകൻ": ["colleague", "coworker", "teammate"],
    "ജോലി": ["job", "career", "work", "project"],

    # Silence / Bystander / Complicity
    "மௌனம்": ["silent", "silence", "bystander", "complicit", "ignore"],
    "கண்டும்காணாமல்": ["look away", "ignore", "do nothing", "inaction"],
    "चुप": ["silent", "silence", "bystander", "complicit"],
    "मौन": ["silent", "silence", "inaction"],
    "మౌనం": ["silent", "silence", "bystander"],
    "ಮೌನ": ["silent", "silence", "bystander"],
    "മൗനം": ["silent", "silence", "bystander"],

    # Revenge / Anger / Harm
    "பழிவாங்குதல்": ["revenge", "anger", "retaliation", "payback"],
    "கோபம்": ["anger", "rage", "wrath"],
    "बदला": ["revenge", "retaliation", "payback"],
    "गुस्सा": ["anger", "rage"],
    "తీర్చుకోవడం": ["revenge", "retaliation"],
    "కోపం": ["anger", "rage"],
    "ಸೇಡು": ["revenge", "retaliation"],
    "പ്രതികാരം": ["revenge", "retaliation"],

    # Secrets / Concealment
    "ரகசியம்": ["secret", "hide truth", "conceal", "delayed disclosure"],
    "गुप्त": ["secret", "hide truth", "conceal"],
    "రహస్యం": ["secret", "hide truth", "conceal"],
    "ರಹಸ್ಯ": ["secret", "hide truth", "conceal"],
    "രഹസ്യം": ["secret", "hide truth", "conceal"],

    # Diet / Meat / Non-veg / Food
    "அசைவம்": ["non-veg", "meat", "eating meat", "diet", "food"],
    "சைவம்": ["vegetarian", "diet", "food", "ahimsa"],
    "இறைச்சி": ["meat", "non-veg", "animal"],
    "உணவு": ["food", "diet", "eating"],
    "मांसाहार": ["non-veg", "meat", "eating meat", "diet"],
    "शाकाहार": ["vegetarian", "diet", "ahimsa"],
    "मांस": ["meat", "non-veg", "animal"],
    "भोजन": ["food", "diet", "eating"],
    "आहार": ["food", "diet", "eating"],
    "మాంసాహారం": ["non-veg", "meat", "diet"],
    "శాకాహారం": ["vegetarian", "diet"],
    "ఆహారం": ["food", "diet"],
    "ಮಾಂಸಾಹಾರ": ["non-veg", "meat", "diet"],
    "ಆಹಾರ": ["food", "diet"],
    "മാംസാഹാരം": ["non-veg", "meat", "diet"],
    "ഭക്ഷണം": ["food", "diet"],
}

_WORD_REGEX = re.compile(r"[^\s\.,;:!?\"\'\(\)\[\]\{\}\\\/\<\>\+\=\*\&\^\%\$\#\@\~\|\`]+", re.UNICODE)


class SageEvidence(NamedTuple):
    entry: KBEntry
    relevance: float
    matched_terms: list[str]


class SageRetriever:
    """Retrieves relevant passages, teachings, and character decisions from the Mahabharata KB."""

    def __init__(self, kb: KnowledgeBase):
        self.kb = kb
        self.docs: dict[str, Counter] = {}

        for e in kb.entries:
            text = " ".join([
                e.concept,
                e.sanskrit_term,
                e.source,
                e.chapter or "",
                e.paraphrase,
                e.interpretation,
                " ".join(e.keywords * 2),
                " ".join(e.applicability).replace("_", " "),
                " ".join(e.ethical_dimension),
            ]).lower()
            tokens = [t for t in _WORD_REGEX.findall(text) if len(t) > 2]
            self.docs[e.id] = Counter(tokens)

        n = len(self.docs)
        df = Counter(t for c in self.docs.values() for t in c)
        self.idf = {t: math.log((1 + n) / (1 + d)) + 1.0 for t, d in df.items()}
        self.vecs = {i: self._vec(c) for i, c in self.docs.items()}

    def _vec(self, counts: Counter) -> dict[str, float]:
        v = {t: (1.0 + math.log(c)) * self.idf.get(t, 1.0) for t, c in counts.items()}
        norm = math.sqrt(sum(x * x for x in v.values())) or 1.0
        return {t: x / norm for t, x in v.items()}

    def expand_query(self, query: str) -> list[str]:
        """Extracts native words and expands Indic words into equivalent concepts."""
        tokens = [t.lower() for t in _WORD_REGEX.findall(query) if len(t) > 1]
        expanded = list(tokens)

        for token in tokens:
            for indic_word, en_equivalents in MULTILINGUAL_CONCEPT_MAP.items():
                stem = indic_word[:-2] if (len(indic_word) > 3 and indic_word.endswith("்")) else indic_word
                if indic_word in token or token in indic_word or (len(stem) >= 3 and stem in token):
                    expanded.extend(en_equivalents)

        # Multi-word English concepts
        if ("non" in tokens and "veg" in tokens) or "non-veg" in tokens or "meat" in tokens:
            expanded.extend(["non-veg", "meat", "eating", "diet", "food", "dharmavyadha", "vegetarian"])

        return expanded

    def retrieve(self, query: str, top_k: int = 5, min_relevance: float = 0.12) -> list[SageEvidence]:
        """Retrieves passages with evidence matching. Returns empty list if query is unrelated."""
        if not query or len(query.strip()) < 5:
            return []

        expanded_tokens = self.expand_query(query)
        q_vec = self._vec(Counter(expanded_tokens))
        query_lower = query.lower()

        results: list[SageEvidence] = []

        for e in self.kb.entries:
            dv = self.vecs[e.id]
            cos = sum(w * dv.get(t, 0.0) for t, w in q_vec.items())

            # Direct keyword hits
            kw_hits: list[str] = []
            expanded_set = set(expanded_tokens)
            for kw in e.keywords:
                kw_l = kw.lower()
                if " " in kw_l:
                    if kw_l in query_lower:
                        kw_hits.append(kw)
                else:
                    if kw_l in expanded_set:
                        kw_hits.append(kw)

            # Character / incident matching bonus
            incident_hit = False
            for term in ("yudhishthira", "arjuna", "karna", "bhishma", "drona", "draupadi", "vidura", "ashvatthama", "kunti", "ekalavya", "dharmavyadha", "kaushika"):
                if (term in expanded_set or re.search(r"\b" + re.escape(term) + r"\b", query_lower)) and (term in e.paraphrase.lower() or term in e.citation.lower()):
                    incident_hit = True
                    kw_hits.append(term)

            score = 0.55 * cos + 0.15 * min(len(kw_hits), 4) + (0.2 if incident_hit else 0.0)

            if score >= min_relevance:
                relevance = round(min(0.99, score), 3)
                results.append(SageEvidence(
                    entry=e,
                    relevance=relevance,
                    matched_terms=kw_hits[:4]
                ))

        results.sort(key=lambda item: (-item.relevance, item.entry.id))
        return results[:top_k]
