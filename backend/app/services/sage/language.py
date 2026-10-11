"""Language detection and localization for the Mahabharata Multilingual AI Sage."""
from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Literal

SupportedLanguage = Literal["en", "ta", "hi", "te", "kn", "ml"]

@dataclass(frozen=True)
class LanguageMeta:
    code: SupportedLanguage
    name: str
    native_name: str
    script: str
    voice_locale: str  # For Web Speech TTS locale tag


SUPPORTED_LANGUAGES: dict[SupportedLanguage, LanguageMeta] = {
    "en": LanguageMeta("en", "English", "English", "Latin", "en-US"),
    "ta": LanguageMeta("ta", "Tamil", "தமிழ்", "Tamil", "ta-IN"),
    "hi": LanguageMeta("hi", "Hindi", "हिन्दी", "Devanagari", "hi-IN"),
    "te": LanguageMeta("te", "Telugu", "తెలుగు", "Telugu", "te-IN"),
    "kn": LanguageMeta("kn", "Kannada", "ಕನ್ನಡ", "Kannada", "kn-IN"),
    "ml": LanguageMeta("ml", "Malayalam", "മലയാളം", "Malayalam", "ml-IN"),
}


# Unicode block boundaries for Indian scripts
SCRIPT_RANGES: dict[SupportedLanguage, tuple[int, int]] = {
    "hi": (0x0900, 0x097F),  # Devanagari
    "ta": (0x0B80, 0x0BFF),  # Tamil
    "te": (0x0C00, 0x0C7F),  # Telugu
    "kn": (0x0C80, 0x0CFF),  # Kannada
    "ml": (0x0D00, 0x0D7F),  # Malayalam
}


def detect_language(text: str) -> SupportedLanguage:
    """Detects primary language script from text. Defaults to 'en' for Latin or unrecognized scripts."""
    if not text or not text.strip():
        return "en"

    counts: dict[SupportedLanguage, int] = {"hi": 0, "ta": 0, "te": 0, "kn": 0, "ml": 0}

    for ch in text:
        cp = ord(ch)
        for lang, (start, end) in SCRIPT_RANGES.items():
            if start <= cp <= end:
                counts[lang] += 1
                break

    best_lang, best_count = max(counts.items(), key=lambda item: item[1])
    if best_count >= 2:  # If at least 2 Indic characters detected
        return best_lang

    return "en"


SECTION_TITLES: dict[SupportedLanguage, dict[str, str]] = {
    "en": {
        "understanding": "Understanding the Situation",
        "ethical_analysis": "Ethical Analysis",
        "mahabharata_connection": "Mahabharata Connection",
        "source_evidence": "Verified Source Evidence",
        "possible_solution": "Suggested Action Steps",
        "alternative_perspective": "Alternative Perspective",
        "no_evidence_found": "No Direct Scriptural Match Found",
    },
    "ta": {
        "understanding": "சூழ்நிலையைப் புரிந்துகொள்ளுதல்",
        "ethical_analysis": "அறநெறிப் பகுப்பாய்வு",
        "mahabharata_connection": "மகாபாரத வரலாற்றுத் தொடர்பு",
        "source_evidence": "சரிபார்க்கப்பட்ட மூல ஆதாரங்கள்",
        "possible_solution": "பரிந்துரைக்கப்படும் செயல்முறைகள்",
        "alternative_perspective": "மாற்றுப் பார்வை மற்றும் நுணுக்கம்",
        "no_evidence_found": "நேரடி வரலாற்று ஆதாரம் கண்டறியப்படவில்லை",
    },
    "hi": {
        "understanding": "परिस्थिति का अवलोकन",
        "ethical_analysis": "नैतिक विश्लेषण",
        "mahabharata_connection": "महाभारत प्रसंग एवं शिक्षा",
        "source_evidence": "सत्यापित ग्रंथ संदर्भ",
        "possible_solution": "व्यावहारिक समाधान के कदम",
        "alternative_perspective": "वैकल्पिक दृष्टिकोण एवं संतुलन",
        "no_evidence_found": "सीधा प्रासंगिक संदर्भ नहीं मिला",
    },
    "te": {
        "understanding": "పరిస్థితి అవగాహన",
        "ethical_analysis": "నైతిక విశ్లేషణ",
        "mahabharata_connection": "మహాభారత సందర్భం & కథ",
        "source_evidence": "ధృవీకరించబడిన మూల ఆధారాలు",
        "possible_solution": "ఆచరణాత్మక పరిష్కార మార్గాలు",
        "alternative_perspective": "ప్రత్యామ్నాయ దృక్పథం",
        "no_evidence_found": "ప్రత్యక్ష మూల ఆధారం లభించలేదు",
    },
    "kn": {
        "understanding": "ಸಂದರ್ಭದ ವಿವರಣೆ",
        "ethical_analysis": "ನೈತಿಕ ವಿಶ್ಲೇಷಣೆ",
        "mahabharata_connection": "ಮಹಾಭಾರತದ ಪ್ರಸಂಗ ಮತ್ತು ಶಿಕ್ಷಣ",
        "source_evidence": "ದೃಢೀಕೃತ ಮೂಲ ಉಲ್ಲೇಖಗಳು",
        "possible_solution": "ಪ್ರಾಯೋಗಿಕ ಪರಿಹಾರದ ಹಂತಗಳು",
        "alternative_perspective": "ಪರ್ಯಾಯ ದೃಷ್ಟಿಕೋನ",
        "no_evidence_found": "ನೇರ ಉಲ್ಲೇಖ ಲಭ್ಯವಿಲ್ಲ",
    },
    "ml": {
        "understanding": "സാഹചര്യത്തിന്റെ വിശകലനം",
        "ethical_analysis": "ധാർമ്മിക വിശകലനം",
        "mahabharata_connection": "മഹാഭാരത ചരിത്ര ബന്ധം",
        "source_evidence": "സ്ഥിരീകരിച്ച ഗ്രന്ഥ തെളിവുകൾ",
        "possible_solution": "പ്രായോഗിക പരിഹാര മാർഗ്ഗങ്ങൾ",
        "alternative_perspective": "മറ്റൊരു വീക്ഷണം",
        "no_evidence_found": "നേരിട്ടുള്ള തെളിവുകൾ ലഭ്യമല്ല",
    },
}
