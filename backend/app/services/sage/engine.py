"""Core reasoning engine for the Mahabharata Multilingual AI Sage."""
from __future__ import annotations

import json
import logging
import uuid
from datetime import datetime, timezone
from typing import Any

from app.core.config import Settings
from app.llm.base import LLMProvider
from app.rag.sage_retriever import SageRetriever
from app.schemas.dharma import KnowledgeBase
from app.schemas.sage import (
    SageConsultRequest,
    SageConsultResponse,
    SourceReference,
    StructuredAnswer,
    SupportedLang,
)
from app.services.sage.language import (
    SUPPORTED_LANGUAGES,
    SupportedLanguage,
    detect_language,
)
from app.services.sage.prompts import SAGE_SYSTEM_PROMPT, build_sage_user_prompt

log = logging.getLogger("dharmanet.sage")


class SageEngine:
    """Orchestrates language detection, grounded retrieval, and multilingual reasoning."""

    def __init__(self, kb: KnowledgeBase, provider: LLMProvider | None, settings: Settings):
        self.kb = kb
        self.provider = provider
        self.settings = settings
        self.retriever = SageRetriever(kb)

    def consult(self, req: SageConsultRequest) -> SageConsultResponse:
        """Processes an ethical dilemma and returns a grounded 6-part multilingual consultation."""
        dilemma = req.dilemma.strip()
        detected_lang = detect_language(dilemma)

        if req.target_language == "auto" or not req.target_language:
            effective_lang: SupportedLanguage = detected_lang
        elif req.target_language in SUPPORTED_LANGUAGES:
            effective_lang = req.target_language  # type: ignore[assignment]
        else:
            effective_lang = "en"

        lang_meta = SUPPORTED_LANGUAGES[effective_lang]

        # 1. Evidence Retrieval
        evidence_list = self.retriever.retrieve(dilemma, top_k=4, min_relevance=0.15)
        sources_found = len(evidence_list) > 0

        source_refs: list[SourceReference] = []
        for ev in evidence_list:
            e = ev.entry
            source_refs.append(
                SourceReference(
                    entry_id=e.id,
                    concept=e.concept,
                    sanskrit_term=e.sanskrit_term,
                    source=e.source,
                    chapter=e.chapter,
                    verse=e.verse,
                    citation=e.citation,
                    excerpt=e.paraphrase,
                    interpretation=e.interpretation,
                    relevance=ev.relevance,
                )
            )

        # 2. Reasoning: LLM-backed if provider is available, otherwise Grounded Multilingual Synthesis
        structured_ans: StructuredAnswer | None = None
        model_used = "deterministic-multilingual-sage"

        if self.provider is not None:
            try:
                system_prompt = SAGE_SYSTEM_PROMPT.format(target_language_name=lang_meta.name)
                user_prompt = build_sage_user_prompt(
                    dilemma=dilemma,
                    evidence_entries=[ev.entry for ev in evidence_list],
                    target_language_code=effective_lang,
                    target_language_name=lang_meta.name,
                )
                raw_response = self.provider.complete(system=system_prompt, user=user_prompt)
                parsed = json.loads(raw_response)

                short_ans = parsed.get("short_answer") or parsed.get("understanding", "")
                why_ans = parsed.get("why") or parsed.get("ethical_analysis", "")
                mbh_conn = parsed.get("mahabharata_connection", "")
                what_can_do = parsed.get("what_you_can_do")
                if isinstance(what_can_do, str):
                    what_can_do = [s.strip("- *1234567890.") for s in what_can_do.split("\n") if s.strip()]
                elif not isinstance(what_can_do, list):
                    what_can_do = [parsed.get("possible_solution", "")] if parsed.get("possible_solution") else []

                structured_ans = StructuredAnswer(
                    short_answer=short_ans,
                    why=why_ans,
                    mahabharata_connection=mbh_conn,
                    what_you_can_do=what_can_do,
                    source_evidence=source_refs,
                    understanding=parsed.get("understanding") or short_ans,
                    ethical_analysis=parsed.get("ethical_analysis") or why_ans,
                    possible_solution=parsed.get("possible_solution") or "\n".join(what_can_do),
                    alternative_perspective=parsed.get("alternative_perspective", ""),
                )
                model_used = f"{self.provider.name}:{self.provider.model}"
            except Exception as e:
                log.warning("LLM Sage generation failed, falling back to grounded synthesis: %s", e)

        if structured_ans is None:
            # Deterministic, grounded multilingual synthesis
            structured_ans = self._synthesize_grounded_answer(
                dilemma=dilemma,
                lang=effective_lang,
                sources=source_refs,
                sources_found=sources_found,
            )

        session_id = req.session_id or f"sage-{uuid.uuid4().hex[:12]}"
        message_id = f"msg-{uuid.uuid4().hex[:8]}"

        return SageConsultResponse(
            session_id=session_id,
            message_id=message_id,
            detected_language=detected_lang,
            selected_language=effective_lang,
            answer=structured_ans,
            sources_found=sources_found,
            source_count=len(source_refs),
            model=model_used,
            created_at=datetime.now(timezone.utc),
        )

    def _synthesize_grounded_answer(
        self,
        dilemma: str,
        lang: SupportedLanguage,
        sources: list[SourceReference],
        sources_found: bool,
    ) -> StructuredAnswer:
        """Produces a grounded 6-part answer in the target language using verified KB records."""
        if not sources_found:
            return self._build_no_evidence_response(lang)

        top_src = sources[0]
        citation = top_src.citation
        concept = top_src.concept
        term = f" ({top_src.sanskrit_term})" if top_src.sanskrit_term else ""
        paraphrase = top_src.excerpt

        is_diet = (
            any(s.entry_id in ("mbh-dharmavyadha-meat", "bg-17-8", "mbh-ahimsa") for s in sources)
            or any(w in dilemma.lower() for w in ("meat", "non veg", "non-veg", "diet", "vegetarian", "अசைவம்", "मांस", "मांसाहार", "శాకాహారం", "మాంసాహారం"))
        )

        if is_diet:
            if lang == "ta":
                short_ans = "மகாபாரத நெறிமுறைகளின்படி அசைவ உணவு உண்பது தானாகவே பாவம் ஆகாது; ஆயினும் உயிர்களுக்குத் தீங்கு செய்யாமை (அகிம்சை) மிக உயர்ந்த ஆன்மீக அறமாகப் போற்றப்படுகிறது."
                why_ans = "உணவுப் பழக்கம் என்பது உடலின் தேவை, சூழல் மற்றும் அகிம்சை ஆகியவற்றுக்கு இடையேயான சமநிலையாகும். வெறும் புற உணவுக் கட்டுப்பாட்டை விட அகத்தில் இரக்கமும் நேர்மையும் இருப்பதே தர்மத்தின் அடித்தளம்."
                mbh_ans = f"மகாபாரத வன பர்வத்தில் வரும் தர்மவியாதன் வரலாறு ({top_src.citation}), தன் பரம்பரைத் தொழிலாக இறைச்சி விற்றாலும், உயிர்களிடத்தில் கொடுமையின்றி (அநிருசம்ஸ்யம்) கடமையாற்றுவதே உண்மையான தர்மம் என உணர்த்துகிறது."
                actions = [
                    "உண்ணும் உணவை வீணாக்காமல் உயிர்களின் மதிப்பை உணர்ந்து உட்கொள்ளுங்கள்.",
                    "மன அமைதியை நாடினால் சாத்வீக தாவர உணவுகளைப் படிப்படியாக அதிகரிக்கலாம்.",
                    "புற உணவுப் பழக்கத்தை விட அகத்தில் ஜீவகாருண்யம் மற்றும் வாய்மையைப் பேணுங்கள்.",
                ]
                return StructuredAnswer(
                    short_answer=short_ans,
                    why=why_ans,
                    mahabharata_connection=mbh_ans,
                    what_you_can_do=actions,
                    source_evidence=sources,
                    understanding="அசைவ உணவு உண்பது அறநெறிக்கு (தர்மத்திற்கு) உகந்ததா என்ற உங்கள் கேள்வி, உடல் நலம், பாரம்பரிய பழக்கவழக்கங்கள் மற்றும் உயிர்களுக்குத் தீங்கு செய்யாமை (அகிம்சை) ஆகியவற்றுக்கு இடையேயான முக்கிய அறநெறிப் போராட்டத்தைக் காட்டுகிறது.",
                    ethical_analysis="மகாபாரத மரபில் உணவுப் பழக்கம் என்பது ஒரே மாதிரியான சட்டமாகப் பார்க்கப்படாமல் பல பரிமாணங்களில் ஆராயப்படுகிறது:\n1. அகிம்சை: உயிரினங்களுக்குத் தீங்கு செய்யாமல் இருப்பதே உயர்ந்த அறமாகக் கருதப்படுகிறது (அஹிம்ஸா பரமோ தர்மஃ).\n2. சுவதர்மம் மற்றும் சூழல்: வெவ்வேறு நிலைகளிலும் கடமைகளிலும் உள்ள மனிதர்களுக்கு வாழ்க்கைச் சூழலும் பாரம்பரியமும் மாறுபடுகிறது.\n3. குணங்கள் (சத்வம், ரஜஸ், தமஸ்): பகவத் கீதை உணவு மனதின் அமைதியையும் சிந்தனையையும் பாதிக்கிறது என்பதை விளக்குகிறது.",
                    possible_solution="\n".join(f"{i+1}. {a}" for i, a in enumerate(actions)),
                    alternative_perspective="ஆன்மீகத் தளத்தில் முழு சைவ உணவு பரிந்துரைக்கப்பட்டாலும், தர்மவியாதன் வரலாறு உணர்த்துவது போல, உள்ளத்தில் இரக்கமும் நேர்மையும் இல்லாமல் வெறும் உணவுக் கட்டுப்பாட்டை மட்டும் பின்பற்றுவது முழுமையான தர்மமாகாது.",
                )
            elif lang == "hi":
                short_ans = "महाभारत के अनुसार मांसाहार स्वतः कोई अधर्म नहीं है, परंतु सभी जीवों के प्रति अकारण हिंसा का त्याग (अहिंसा) सर्वोच्च आध्यात्मिक आदर्श माना गया है।"
                why_ans = "आहार का संबंध शारीरिक पोषण, जीवनशैली और अहिंसा के संतुलन से है। केवल खान-पान के नियम से अधिक महत्वपूर्ण यह है कि मन में क्रूरता, द्वेष और अहंकार न हो।"
                mbh_ans = f"महाभारत के वन पर्व (अध्याय 205-216) में धर्मव्याध प्रसंग ({top_src.citation}) दर्शाता है कि आजीविका के साथ-साथ क्रूरता-रहित आचरण (आनृशंस्य) और कर्तव्यनिष्ठा ही सच्चा धर्म है।"
                actions = [
                    "भोजन के प्रति सजग व कृतज्ञ रहें; अनावश्यक बर्बादी और क्रूरता से बचें।",
                    "मानसिक शांति व साधना हेतु धीरे-धीरे सात्विक शाकाहार को प्राथमिकता दें।",
                    "दूसरों के आहार पर दोषारोपण के बजाय अपने आचरण में सत्य और दया बनाए रखें।",
                ]
                return StructuredAnswer(
                    short_answer=short_ans,
                    why=why_ans,
                    mahabharata_connection=mbh_ans,
                    what_you_can_do=actions,
                    source_evidence=sources,
                    understanding="मांसाहार करना धर्म के अनुकूल है या नहीं, यह प्रश्न व्यक्तिगत जीवनशैली, शारीरिक पोषण और अहिंसा (जीवों के प्रति दया) के बीच एक महत्वपूर्ण नैतिक विमर्श को दर्शाता है।",
                    ethical_analysis="भारतीय दर्शन और महाभारत में आहार को केवल एक रूढ़िवादी निषेध के रूप में नहीं, बल्कि बहुआयामी दृष्टिकोण से देखा गया है:\n1. अहिंसा: सभी प्राणियों के प्रति अकारण हिंसा का त्याग सर्वोच्च धर्म माना गया है (अहिंसा परमो धर्मः)।\n2. स्वधर्म और परिस्थिति: महाभारत में स्वीकार किया गया है कि विभिन्न आजीविका और परिस्थितियों में आवश्यकताएं भिन्न हो सकती हैं।\n3. आहार और गुण: भगवद्गीता (17.8-10) के अनुसार भोजन मन की शांति और गुणों (सात्विक, राजसिक, तामसिक) को प्रभावित करता है।",
                    possible_solution="\n".join(f"{i+1}. {a}" for i, a in enumerate(actions)),
                    alternative_perspective="यद्यपि आध्यात्मिक साधना के लिए शाकाहार को आदर्श माना गया है, परंतु धर्मव्याध की कथा यह स्मरण कराती है कि यदि हृदय में द्वेष और अहंकार हो तो केवल खान-पान का नियम सच्चा धर्म नहीं बन सकता।",
                )
            elif lang == "te":
                short_ans = "మహాభారత ధర్మం ప్రకారం మాంసాహారం తీసుకోవడం స్వయంగా అధర్మం కాదు; అయితే జీవులను హింసించకుండా ఉండటం (అహింస) పరమోన్నత ఆధ్యాత్మిక ఆదర్శం."
                why_ans = "ఆహార అలవాట్లు శరీర అవసరం, ఆచారం మరియు అహింసల సమతుల్యత. బాహ్య ఆహార నియమాల కన్నా అంతరంగంలో దయ, అహింసా భావన ఉండటమే ముఖ్యం."
                mbh_ans = f"వన పర్వంలోని ధర్మవ్యాధుని ఉపాఖ్యానం ({top_src.citation}) ద్వారా క్రూరత్వం లేని నిష్కామ జీవనమే నిజమైన ధర్మమని స్పష్టమవుతుంది."
                actions = [
                    "ఆహారాన్ని వృథా చేయకుండా గౌరవంతో, కృతజ్ఞతతో స్వీకరించండి.",
                    "మానసిక ప్రశాంతత కోసం సాత్విక శాకాహారానికి ప్రాధాన్యత ఇవ్వవచ్చు.",
                    "ఇతరుల అలవాట్లను నిందించకుండా అంతరంగంలో దయ, కరుణలను అలవర్చుకోండి.",
                ]
                return StructuredAnswer(
                    short_answer=short_ans,
                    why=why_ans,
                    mahabharata_connection=mbh_ans,
                    what_you_can_do=actions,
                    source_evidence=sources,
                    understanding="మాంసాహారం తీసుకోవడం ధర్మబద్ధమా కాదా అనే ప్రశ్న ఆహారపు అలవాట్లు, సంప్రదాయాలు మరియు అహింస (జీవహింస చేయకపోవడం) మధ్య ఉన్న లోతైన నైతిక విచారణను తెలియజేస్తుంది.",
                    ethical_analysis="మహాభారతంలో ఆహార నియమాలను ఒకే దృక్కోణంలో చూడకుండా విస్తృతంగా విశ్లేషించారు:\n1. అహింస: ప్రాణులను హింసించకుండా ఉండటమే పరమ ధర్మం (అహింసా పరమో ధర్మః).\n2. స్వధర్మం & జీవనం: వివిధ వర్గాలు, పరిస్థితులలో జీవన విధానాలు వేర్వేరుగా ఉంటాయి.\n3. ఆహార గుణాలు: భగవద్గీత (17.8-10) ప్రకారం సాత్విక ఆహారం మనస్సును ప్రశాంతంగా ఉంచుతుంది.",
                    possible_solution="\n".join(f"{i+1}. {a}" for i, a in enumerate(actions)),
                    alternative_perspective="ఆధ్యాత్మిక సాధనలో శాకాహారమే శ్రేష్ఠమైనదిగా చెప్పబడినప్పటికీ, మనస్సులో క్రోధం మరియు అహంకారం ఉంటే కేవలం బాహ్య ఆహార నియమం ధర్మం కాజాలదని మహాభారతం స్పష్టం చేస్తుంది.",
                )
            elif lang == "kn":
                short_ans = "ಮಹಾಭಾರತದ ಪ್ರಕಾರ ಮಾಂಸಾಹಾರ ಸೇವನೆಯು ತಾನೇ ತಾನಾಗಿ ಅಧರ್ಮವಲ್ಲ; ಆದರೆ ಜೀವಹಿಂಸೆಯಿಲ್ಲದಿರುವುದು (ಅಹಿಂಸೆ) ಅತ್ಯುನ್ನತ ಆಧ್ಯಾತ್ಮಿಕ ಆದರ್ಶವಾಗಿದೆ."
                why_ans = "ಆಹಾರ ಪದ್ಧತಿಯು ದೇಹದ ಅಗತ್ಯ ಮತ್ತು ಅಹಿಂಸೆಯ ನಡುವಿನ ಸಮತೋಲನ. ಕೇವಲ ಹೊರಗಿನ ಆಹಾರಕ್ಕಿಂತ ಆಂತರಿಕ ಕರುಣೆ ಮತ್ತು ಸತ್ಯನಿಷ್ಠೆ ಮುಖ್ಯ."
                mbh_ans = f"ವನಪರ್ವದ ಧರ್ಮವ್ಯಾಧನ ಕಥೆಯು ({top_src.citation}) ಕ್ರೂರತೆಯಿಲ್ಲದೆ ಕರ್ತವ್ಯ ಪಾಲಿಸುವುದೇ ನಿಜವಾದ ಧರ್ಮವೆಂದು ಕಲಿಸುತ್ತದೆ."
                actions = [
                    "ಆಹಾರವನ್ನು ವ್ಯರ್ಥ ಮಾಡದೆ ಕೃತಜ್ಞತೆಯಿಂದ ಸ್ವೀಕರಿಸಿ.",
                    "ಮಾನಸಿಕ ಶಾಂತಿಗಾಗಿ ಸಾತ್ವಿಕ ಸಸ್ಯಾಹಾರವನ್ನು ಹಂತಹಂತವಾಗಿ ಅಳವಡಿಸಿಕೊಳ್ಳಬಹುದು.",
                    "ಯಾರನ್ನೂ ದ್ವೇಷಿಸದೆ ನಿಮ್ಮ ನಡತೆಯಲ್ಲಿ ಕರುಣೆ ಮತ್ತು ಸತ್ಯವನ್ನು ಕಾಪಾಡಿಕೊಳ್ಳಿ.",
                ]
                return StructuredAnswer(
                    short_answer=short_ans,
                    why=why_ans,
                    mahabharata_connection=mbh_ans,
                    what_you_can_do=actions,
                    source_evidence=sources,
                    understanding="ಮಾಂಸಾಹಾರ ಸೇವನೆಯು ಧರ್ಮಕ್ಕೆ ಸಮ್ಮತವೇ ಎಂಬುದು ಆಹಾರ ಪದ್ಧತಿ, ಪರಿಸರ ಮತ್ತು ಅಹಿಂಸೆಯ ನಡುವಿನ ಆಳವಾದ ನೈತಿಕ ಜಿಜ್ಞಾಸೆಯನ್ನು ಬಿಂಬಿಸುತ್ತದೆ.",
                    ethical_analysis="ಮಹಾಭಾರತದಲ್ಲಿ ಆಹಾರವನ್ನು ಕೇವಲ ನಿಷೇಧವಾಗಿ ನೋಡದೆ ಸಮಗ್ರವಾಗಿ ವಿಶ್ಲೇಷಿಸಲಾಗಿದೆ:\n1. ಅಹಿಂಸೆ: ಜೀವಹಿಂಸೆಯನ್ನು ತ್ಯಜಿಸುವುದು ಅತ್ಯುನ್ನತ ಧರ್ಮ (ಅಹಿಂಸಾ ಪರಮೋ ಧರ್ಮಃ).\n2. ಸ್ವಧರ್ಮ: ಕುಲ ಮತ್ತು ಕರ್ತವ್ಯದ ಹಿನ್ನೆಲೆಯಲ್ಲಿ ಜೀವನೋಪಾಯಗಳು ಭಿನ್ನವಾಗಿರುತ್ತವೆ.\n3. ಆಹಾರ ಮತ್ತು ಮನಸ್ಸು: ಭಗವದ್ಗೀತೆಯ ಪ್ರಕಾರ ಸಾತ್ವಿಕ ಆಹಾರವು ಮನಸ್ಸಿಗೆ ಶಾಂತಿ ನೀಡುತ್ತದೆ.",
                    possible_solution="\n".join(f"{i+1}. {a}" for i, a in enumerate(actions)),
                    alternative_perspective="ಆಧ್ಯಾತ್ಮಿಕ ಸಾಧನೆಗೆ ಸಸ್ಯಾಹಾರವು ಪೂರಕವಾಗಿದ್ದರೂ, ಆಂತರಿಕ ಅಹಂಕಾರ ಮತ್ತು ದ್ವೇಷವಿದ್ದರೆ ಬರಿಯ ಆಹಾರ ನಿಯಮವು ಸಂಪೂರ್ಣ ಧರ್ಮವಾಗುವುದಿಲ್ಲ.",
                )
            elif lang == "ml":
                short_ans = "മഹാഭാരത ദർശനമനുസരിച്ച് മാംസാഹാരം സ്വയം ഒരു അധർമ്മമല്ല; എങ്കിലും ജീവികളെ ദ്രോഹിക്കാതിരിക്കുക (അഹിംസ) എന്നത് പരമോന്നത ആത്മീയ ധർമ്മമാണ്."
                why_ans = "ഭക്ഷണരീതി എന്നത് ശരീരത്തിന്റെ ആവശ്യവും അഹിംസയും തമ്മിലുള്ള സമതുലിതാവസ്ഥയാണ്. ബാഹ്യമായ ചിട്ടകളേക്കാൾ ഹൃദയത്തിലെ കാരുണ്യമാണ് പ്രധാനം."
                mbh_ans = f"വനപർവ്വത്തിലെ ധർമ്മവ്യാധന്റെ ചരിത്രം ({top_src.citation}) ക്രൂരതയില്ലാതെ സ്വന്തം കർത്തവ്യം ചെയ്യുന്നതാണ് യഥാർത്ഥ ധർമ്മമെന്ന് വ്യക്തമാക്കുന്നു."
                actions = [
                    "ഭക്ഷണം പാഴാക്കാതെ ജീവന്റെ വിലയറിഞ്ഞ് കഴിക്കുക.",
                    "മനസ്സിന്റെ ശാന്തിക്കായി സാത്വിക സസ്യഭക്ഷണത്തിലേക്ക് പടിപടിയായി മാറാം.",
                    "മറ്റുള്ളവരെ വിധിക്കാതെ സ്വന്തം ജീവിതത്തിൽ കാരുണ്യവും സത്യവും പാലിക്കുക.",
                ]
                return StructuredAnswer(
                    short_answer=short_ans,
                    why=why_ans,
                    mahabharata_connection=mbh_ans,
                    what_you_can_do=actions,
                    source_evidence=sources,
                    understanding="മാംസാഹാരം കഴിക്കുന്നത് ധർമ്മത്തിന് അനുയോജ്യമാണോ എന്ന ചോദ്യം ശാരീരിക നിലനിൽപ്പും ജീവകാരുണ്യവും (അഹിംസ) തമ്മിലുള്ള സങ്കീർണ്ണമായ ധാർമ്മിക വിചിന്തനത്തെ കാണിക്കുന്നു.",
                    ethical_analysis="മഹാഭാരതത്തിൽ ആഹാരത്തെക്കുറിച്ച് വിവിധ കാഴ്ചപ്പാടുകൾ അവതരിപ്പിക്കുന്നു:\n1. അഹിംസ: ജീവികളെ ദ്രോഹിക്കാതിരിക്കുക എന്നത് പരമോന്നത ധർമ്മമാണ് (അഹിംസാ പരമോ ധർമ്മഃ).\n2. സ്വധർമ്മം: വ്യത്യസ്ത ജീവിതാവസ്ഥകളിൽ കർത്തവ്യങ്ങളും ജീവിതരീതികളും വ്യത്യസ്തമാകാം.\n3. ആഹാരഗുണങ്ങൾ: ഭഗവദ്ഗീത (17.8-10) പ്രകാരം സാത്വിക ഭക്ഷണം മനസ്സിന് ശാന്തിയും തെളിമയും നൽകുന്നു.",
                    possible_solution="\n".join(f"{i+1}. {a}" for i, a in enumerate(actions)),
                    alternative_perspective="ആത്മീയമായ ഉയർച്ചയ്ക്ക് സസ്യഭക്ഷണം ഉത്തമമായി കണക്കാക്കപ്പെടുന്നുണ്ടെങ്കിലും, മനസ്സിൽ പകയും ദുരഭിമാനവുമുണ്ടെങ്കിൽ കേവലം ഭക്ഷണനിയമം കൊണ്ട് മാത്രം ഒരാൾ ധാർമ്മികനാകുന്നില്ല.",
                )
            else:  # en
                short_ans = "In classical Mahabharata wisdom, eating non-vegetarian food is not a sin by itself, but Ahimsa (minimizing harm to living beings) remains the highest spiritual ideal."
                why_ans = "Dietary ethics balances Ahimsa with bodily sustenance, traditional station, and personal conscience. Inner non-cruelty (anrishamsya) matters far more than mere external food dogma."
                mbh_ans = f"In the Vana Parva (chapters 205-216), the butcher Dharmavyadha teaches that doing one's duty without wanton cruelty and with genuine compassion is true dharma ({top_src.citation})."
                actions = [
                    "Cultivate mindfulness and gratitude regarding what you consume, avoiding food waste and wanton consumption.",
                    "If seeking greater spiritual clarity or meditative focus, consider gradually transitioning toward nourishing, peaceful (sattvic) plant-based alternatives.",
                    "Focus on inner non-cruelty (anrishamsya)—practicing kindness and truthfulness without judging or condemning others.",
                ]
                return StructuredAnswer(
                    short_answer=short_ans,
                    why=why_ans,
                    mahabharata_connection=mbh_ans,
                    what_you_can_do=actions,
                    source_evidence=sources,
                    understanding="The question explores whether consuming non-vegetarian food is aligned with dharma, navigating the tension between personal sustenance, cultural traditions, individual conscience, and the principle of Ahimsa (non-harm to sentient life).",
                    ethical_analysis="In classical Indian philosophy and the Mahabharata, dietary ethics is not treated as a rigid, universal condemnation, but evaluated through multiple interconnected dimensions:\n1. Ahimsa (Non-violence): Minimizing harm to all living beings is held as the supreme moral ideal (Ahimsa paramo dharmah).\n2. Svadharma & Station: The Mahabharata recognizes that diverse communities, stations in life, and responsibilities have varied dietary needs and traditional duties.\n3. Qualities of Mind (Gunas): The Bhagavad Gita (17.8-10) teaches that food influences consciousness (Sattvic pure foods promote clarity; Rajasic/Tamasic foods agitate), while cautioning against self-righteous judgment of others.",
                    possible_solution="\n".join(f"{i+1}. {a}" for i, a in enumerate(actions)),
                    alternative_perspective="While ascetic and devotional traditions uphold strict vegetarianism (shakahara) as essential for spiritual elevation, the Dharmavyadha dialogue reminds us that external dietary adherence without compassion, humility, and truthful conduct does not constitute true dharma.",
                )

        if lang == "ta":
            short_ans = "அச்சத்திற்கோ அவசர ஆதாயத்திற்கோ பணியாமல், உண்மையை நேரடியாகவும் அமைதியாகவும் பேசி உங்கள் நியாயமான கடமையை ஆற்றுங்கள்."
            why_ans = "இங்கு உண்மைத்தன்மை (சத்யம்), கடமைப்பொறுப்பு (சுவதர்மம்) மற்றும் இழப்பு குறித்த அச்சம் ஆகியவற்றுக்கு இடையே அறப்போராட்டம் நடக்கிறது. தற்காலிக அச்சம் தார்மீகத் தெளிவை மறைக்கக்கூடாது."
            mbh_ans = f"மகாபாரதத்தில் {concept}{term} பற்றிய {citation} அவசர ஆதாயத்திற்காக அறநெறி எல்லையை மீறுவது நீண்டகால சோகத்தைத் தரும் என்பதை உணர்த்துகிறது. மூல வரலாறு: '{paraphrase}'."
            actions = [
                "உண்மைகளை நிதானமாக சரிபார்த்து சம்பந்தப்பட்டவர்களிடம் நேரடியாகப் பேசுங்கள்.",
                "தற்காலிக அச்சத்தால் பொய் சொல்லாமல் உங்கள் நிலையின் நியாயமான கடமையை ஆற்றுங்கள்.",
                "உணர்ச்சிவசப்படாமல் தீய விளைவுகளைக் குறைக்கும் சீரான முடிவை எட்டுங்கள்.",
            ]
            return StructuredAnswer(
                short_answer=short_ans,
                why=why_ans,
                mahabharata_connection=mbh_ans,
                what_you_can_do=actions,
                source_evidence=sources,
                understanding="நீங்கள் எதிர்கொள்ளும் இந்தச் சூழல் தனிப்பட்ட அல்லது தொழில்முறை கடமைகளுக்கும், அதனால் ஏற்படும் விளைவுகளுக்கும் இடையே உள்ள ஒரு முக்கியமான அறநெறிப் போராட்டத்தைக் காட்டுகிறது.",
                ethical_analysis="இங்கு முக்கியமாக மோதும் அறநெறிகள்: உண்மைத்தன்மை (சத்யம்), கடமைப்பொறுப்பு (சுவதர்மம்) மற்றும் உறவுகளின் மீதான பற்று அல்லது தனிப்பட்ட இழப்பு குறித்த அச்சம். விளைவுகளுக்கு மட்டுமே முக்கியத்துவம் கொடுப்பதா அல்லது தூய கடமையை ஆற்றுவதா என்பதே மையக் குழப்பம்.",
                possible_solution="\n".join(f"{i+1}. {a}" for i, a in enumerate(actions)),
                alternative_perspective="மறுபுறம், உடனடி உறவுச்சிக்கல்களையோ அல்லது கடுமையான விளைவுகளையோ தவிர்க்க சமரசப் பாதையை யோசிக்கலாம்; ஆனால் அது உங்கள் உள்மனசாட்சியையும் நேர்மையையும் பலியிடாமல் இருக்க வேண்டும்.",
            )
        elif lang == "hi":
            short_ans = "भय या व्यक्तिगत हानि की चिंता से विचलित हुए बिना, सीधे और शांत संवाद द्वारा अपने प्राथमिक कर्तव्य का पालन करें।"
            why_ans = "यहाँ मुख्य रूप से कर्तव्य (स्वधर्म), सत्यनिष्ठा (सत्य) और परिणामों के भय के बीच द्वंद्व है। भयवश मर्यादा त्यागना दीर्घकालिक रूप से अधिक संकट लाता है।"
            mbh_ans = f"महाभारत में {concept}{term} पर {citation} प्रासंगिक प्रकाश डालता है। मूल प्रसंग अनुसार: '{paraphrase}'। यह शिक्षा दर्शाती है कि निष्काम भाव से किया गया धर्म ही कल्याणकारी है।"
            actions = [
                "स्थिति और प्रमाणों की पुष्टि शांतिपूर्वक करें और सीधे संबंधित पक्ष से संवाद करें।",
                "व्यक्तिगत लाभ या हानि के भय से ऊपर उठकर अपने दायित्व का पालन करें।",
                "बिना उत्तेजना के ऐसा मार्ग चुनें जिससे निर्दोषों को न्यूनतम क्षति पहुंचे।",
            ]
            return StructuredAnswer(
                short_answer=short_ans,
                why=why_ans,
                mahabharata_connection=mbh_ans,
                what_you_can_do=actions,
                source_evidence=sources,
                understanding="आपकी स्थिति व्यक्तिगत या व्यावसायिक जिम्मेदारियों और उनके संभावित परिणामों के बीच एक गंभीर नैतिक संघर्ष को दर्शाती है।",
                ethical_analysis="यहाँ मुख्य रूप से कर्तव्य (स्वधर्म), सत्यनिष्ठा (सत्य) और व्यक्तिगत सुरक्षा या संबंधों के प्रति लगाव के बीच द्वंद्व है। मुख्य प्रश्न यह है कि क्या परिणामों के डर से निर्णय लिया जाए या निष्पक्ष धर्म के आधार पर।",
                possible_solution="\n".join(f"{i+1}. {a}" for i, a in enumerate(actions)),
                alternative_perspective="एक वैकल्पिक विचार यह हो सकता है कि व्यावहारिक शांति बनाए रखने के लिए समझौता किया जाए; तथापि, यह सुनिश्चित करना आवश्यक है कि ऐसा समझौता आधारभूत सत्य को विकृत न करे।",
            )
        elif lang == "te":
            short_ans = "భయానికి లేదా స్వార్థానికి తావులేకుండా, ప్రశాంతమైన సంభాషణ ద్వారా మీ ప్రాథమిక కర్తవ్యాన్ని నిర్వహించండి."
            why_ans = "ఇది సత్యనిష్ట, బాధ్యత (స్వధర్మం) మరియు వ్యక్తిగత భయాల మధ్య ఉన్న నైతిక సంఘర్షణ. పర్యవసానాల భయంతో ధర్మాన్ని విడిచిపెట్టడం సరైనది కాదు."
            mbh_ans = f"మహాభారతంలోని {concept}{term} సందర్భంలో {citation} మనకు మార్గదర్శనం చేస్తుంది. మూల వివరణ: '{paraphrase}'."
            actions = [
                "వాస్తవాలను నిర్ధారించుకుని ప్రశాంతంగా నేరుగా మాట్లాడండి.",
                "భయం లేదా వ్యక్తిగత నష్టానికి వెరవక మీ బాధ్యతను ధైర్యంగా నిర్వహించండి.",
                "ఎవరికీ అన్యాయం జరగకుండా మధ్యేమార్గంగా పరిష్కారాన్ని అన్వేషించండి.",
            ]
            return StructuredAnswer(
                short_answer=short_ans,
                why=why_ans,
                mahabharata_connection=mbh_ans,
                what_you_can_do=actions,
                source_evidence=sources,
                understanding="మీరు ఎదుర్కొంటున్న ఈ పరిస్థితి బాధ్యతలకు మరియు వాటివల్ల వచ్చే పర్యవసానాలకు మధ్య ఉన్న సంక్లిష్టమైన నైతిక సంఘర్షణను తెలియజేస్తుంది.",
                ethical_analysis="ఇక్కడ ప్రధానంగా కర్తవ్య పాలన (స్వధర్మం), సత్యనిష్ట మరియు వ్యక్తిగత భయాలు లేదా సంబంధాల మధ్య ద్వంద్వం ఏర్పడింది. తాత్కాలిక లాభమా లేక నైతిక న్యాయమా అనేది ఇక్కడి ప్రశ్న.",
                possible_solution="\n".join(f"{i+1}. {a}" for i, a in enumerate(actions)),
                alternative_perspective="మరొక దృక్కోణంలో, సంబంధాలను కాపాడుకోవడానికి కొంత రాజీ పడవచ్చు; అయితే అది శాశ్వతమైన ఆత్మవంచనకు దారితీయకుండా చూసుకోవాలి.",
            )
        elif lang == "kn":
            short_ans = "ಭಯ ಅಥವಾ ಸ್ವಹಿತಾಸಕ್ತಿಗೆ ಒಳಗಾಗದೆ, ಶಾಂತಿಯುತ ಸಂವಾದದ ಮೂಲಕ ನಿಮ್ಮ ಪ್ರಾಥಮಿಕ ಕರ್ತವ್ಯವನ್ನು ಪಾಲಿಸಿ."
            why_ans = "ಇಲ್ಲಿ ಸತ್ಯನಿಷ್ಠೆ, ಕರ್ತವ್ಯ (ಸ್ವಧರ್ಮ) ಮತ್ತು ವೈಯಕ್ತಿಕ ನಷ್ಟದ ಭಯದ ನಡುವೆ ನೈತಿಕ ಸಂಘರ್ಷವಿದೆ. ಭಯದಿಂದ ನಿಯಮಗಳನ್ನು ಉಲ್ಲಂಘಿಸುವುದು ಕೊನೆಗೆ ವಿಷಾದಕ್ಕೆ ಕಾರಣವಾಗುತ್ತದೆ."
            mbh_ans = f"ಮಹಾಭಾರತದ {concept}{term} ಕುರಿತಾದ {citation} ನಮಗೆ ಮಾರ್ಗದರ್ಶನ ನೀಡುತ್ತದೆ. ವಿವರಣೆ: '{paraphrase}'."
            actions = [
                "ಸತ್ಯಾಸತ್ಯತೆಯನ್ನು ಪರಿಶೀಲಿಸಿ ಶಾಂತಿಯುತವಾಗಿ ಸಂಬಂಧಪಟ್ಟವರೊಂದಿಗೆ ಮಾತನಾಡಿ.",
                "ಸ್ವಹಿತಾಸಕ್ತಿಯ ಭಯವನ್ನು ಬಿಟ್ಟು ನಿಮ್ಮ ಪಾತ್ರದ ನ್ಯಾಯಸಮ್ಮತ ಕರ್ತವ್ಯವನ್ನು ಪಾಲಿಸಿ.",
                "ಯಾರಿಗೂ ಅನ್ಯಾಯವಾಗದಂತೆ ವಿವೇಕದಿಂದ ಹೆಜ್ಜೆಯಿಡಿ.",
            ]
            return StructuredAnswer(
                short_answer=short_ans,
                why=why_ans,
                mahabharata_connection=mbh_ans,
                what_you_can_do=actions,
                source_evidence=sources,
                understanding="ನೀವು ಎದುರಿಸುತ್ತಿರುವ ಸನ್ನಿವೇಶವು ಕರ್ತವ್ಯ ಮತ್ತು ಸಂಭಾವ್ಯ ಪರಿಣಾಮಗಳ ನಡುವಿನ ಗಂಭೀರ ನೈತಿಕ ದ್ವಂದ್ವವನ್ನು ತೋರಿಸುತ್ತದೆ.",
                ethical_analysis="ಇಲ್ಲಿ ಮುಖ್ಯವಾಗಿ ಸತ್ಯನಿಷ್ಠೆ, ಜವಾಬ್ದಾರಿ (ಸ್ವಧರ್ಮ) ಮತ್ತು ವೈಯಕ್ತಿಕ ನಷ್ಟ ಅಥವಾ ಸಂಬಂಧಗಳ ರಕ್ಷಣೆಯ ನಡುವೆ ಸಂಘರ್ಷವಿದೆ. ಧರ್ಮದ ಮಾರ್ಗವನ್ನು ಅನುಸರಿಸುವುದೇ ಅಥವಾ ಪರಿಣಾಮಗಳಿಗೆ ಹೆದರುವುದೇ ಎಂಬುದು ಪ್ರಶ್ನೆ.",
                possible_solution="\n".join(f"{i+1}. {a}" for i, a in enumerate(actions)),
                alternative_perspective="ಸಂಬಂಧಗಳನ್ನು ಉಳಿಸಿಕೊಳ್ಳಲು ತಾತ್ಕಾಲಿಕ ಹೊಂದಾಣಿಕೆಯನ್ನು ಪರಿಗಣಿಸಬಹುದು; ಆದರೆ ಅದು ನಿಮ್ಮ ಮೂಲ ಮೌಲ್ಯಗಳನ್ನು ಕಡೆಗಣಿಸಬಾರದು.",
            )
        elif lang == "ml":
            short_ans = "ഭയത്തിനോ സ്വാർത്ഥതയ്ക്കോ വഴങ്ങാതെ, ശാന്തമായ സംഭാഷണത്തിലൂടെ നിങ്ങളുടെ ധാർമ്മിക കർത്തവ്യം നിർവഹിക്കുക."
            why_ans = "സത്യസന്ധതയും (സത്യം) കർമ്മബോധവും (സ്വധർമ്മം) തമ്മിലുള്ള സംഘർഷമാണിത്. ഭയം കാരണം ധർമ്മപരിധി ലംഘിക്കുന്നത് ദൂരവ്യാപകമായ നഷ്ടം വരുത്തും."
            mbh_ans = f"മഹാഭാരതത്തിലെ {concept}{term} സംബന്ധിച്ച {citation} വെളിച്ചം വീശുന്നു. പരാമർശം: '{paraphrase}'."
            actions = [
                "വിവരങ്ങൾ സമാധാനപരമായി സ്ഥിരീകരിക്കുകയും നേരിട്ട് സംസാരിക്കുകയും ചെയ്യുക.",
                "വ്യക്തിപരമായ നേട്ടമോ നഷ്ടമോ നോക്കാതെ നിങ്ങളുടെ കർത്തവ്യം ചെയ്യുക.",
                "ആർക്കും അനാവശ്യ ദ്രോഹം വരാത്ത രീതിയിൽ വിവേകത്തോടെ തീരുമാനമെടുക്കുക.",
            ]
            return StructuredAnswer(
                short_answer=short_ans,
                why=why_ans,
                mahabharata_connection=mbh_ans,
                what_you_can_do=actions,
                source_evidence=sources,
                understanding="നിങ്ങൾ അഭിമുഖീകരിക്കുന്ന സാഹചര്യം ഉത്തരവാദിത്തങ്ങളും അവയുടെ അനന്തരഫലങ്ങളും തമ്മിലുള്ള സങ്കീർണ്ണമായ ധാർമ്മിക സംഘർഷത്തെ വെളിപ്പെടുത്തുന്നു.",
                ethical_analysis="ഇവിടെ പ്രധാനമായും സത്യസന്ധതയും (സത്യം), കർമ്മബോധവും (സ്വധർമ്മം), വ്യക്തിപരമായ നഷ്ടങ്ങളെക്കുറിച്ചുള്ള ഭയവും തമ്മിലാണ് പോരാട്ടം. ന്യായമായ കർത്തവ്യം അനുഷ്ഠിക്കലാണോ ഭയത്തിന് വഴങ്ങലാണോ ശരി എന്നതാണ് കാതലായ ചോദ്യം.",
                possible_solution="\n".join(f"{i+1}. {a}" for i, a in enumerate(actions)),
                alternative_perspective="ബന്ധങ്ങൾ തകരാതിരിക്കാൻ ചെറിയ വിട്ടുവീഴ്ചകൾ ആലോചിക്കാം; എങ്കിലും അത് സത്യത്തെ പൂർണ്ണമായി മൂടിവെക്കുന്നതാകരുത്.",
            )
        else:  # en
            short_ans = "Focus on your primary duty without deceit or panic, addressing the issue directly and calmly before escalating."
            why_ans = "The dilemma tests truthfulness (Satya) against role duty (Svadharma) and personal security. Acting purely out of fear of consequences undermines long-term trust and integrity."
            mbh_ans = f"The Mahabharata addresses this dynamic through {concept}{term} in {citation}. The text observes: '{paraphrase}'. Abandoning responsibility out of fear or personal attachment often leads to deeper regret."
            actions = [
                "Verify facts quietly and schedule a direct, calm conversation before escalating publicly.",
                "Focus on doing what is right in your role rather than acting out of panic over personal outcomes (Nishkama karma).",
                "Seek a measured intermediate path that minimizes collateral harm to innocent parties.",
            ]
            return StructuredAnswer(
                short_answer=short_ans,
                why=why_ans,
                mahabharata_connection=mbh_ans,
                what_you_can_do=actions,
                source_evidence=sources,
                understanding="The dilemma presents a difficult ethical tension between role duties, personal relationships, and the potential consequences of speaking up or remaining silent.",
                ethical_analysis="The primary conflict is between truthfulness (Satya), role-based responsibility (Svadharma), and the natural concern over personal loss or strained relationships. Acting purely out of fear of consequences often clouds moral clarity.",
                possible_solution="\n".join(f"{i+1}. {a}" for i, a in enumerate(actions)),
                alternative_perspective="Alternatively, preserving relationship harmony through a temporary compromise can be considered, provided it does not make you complicit in ongoing deceit or harm.",
            )

    def _build_no_evidence_response(self, lang: SupportedLanguage) -> StructuredAnswer:
        """Transparent response when no direct scriptural match is found."""
        if lang == "ta":
            return StructuredAnswer(
                short_answer="நீங்கள் சமர்ப்பித்த கேள்விக்கு மகாபாரத அறிவுத் தளத்தில் நேரடி சரிபார்க்கப்பட்ட பதிவு எதுவும் கிடைக்கவில்லை.",
                why="போலியான மேற்கோள்களை உருவாக்குவதைத் தவிர்க்கவும், தார்மீக நேர்மையைப் பேணவும், பதிவு செய்யப்படாத தகவல்களைக் குறிப்பிடாமல் இருப்பதையே தர்மநெட் கொள்கையாகக் கொண்டுள்ளது.",
                mahabharata_connection="மகாபாரத அறிவுத் தளத்தில் இந்த சூழ்நிலைக்கு பொருந்தும் சரிபார்க்கப்பட்ட அத்தியாயம் அல்லது கதை ஆதாரம் எதுவும் கண்டறியப்படவில்லை. போலியான மேற்கோள்களை உருவாக்குவதை கணினி தவிர்க்கிறது.",
                what_you_can_do=[
                    "இருவேறு கடமைகள் மோதும் உண்மையான தார்மீகக் குழப்பத்தை விவரிக்கவும்.",
                    "சம்பந்தப்பட்ட மனிதர்கள் மற்றும் முடிவின் தாக்கத்தை விளக்குங்கள்.",
                ],
                source_evidence=[],
                understanding="நீங்கள் சமர்ப்பித்த கேள்வி மகாபாரதத்தின் நேரடி அறநெறிப் பிரச்சினைகளுடன் பொருந்தவில்லை.",
                ethical_analysis="இந்த குறிப்பிட்ட கேள்விக்கு மகாபாரத அல்லது பகவத் கீதை அறிவுத் தளத்தில் நேரடி வரலாற்றுப் பதிவு அல்லது கூற்று எதுவும் கிடைக்கவில்லை.",
                possible_solution="தயவுசெய்து உங்கள் தார்மீகக் குழப்பத்தை அல்லது இருவேறு கடமைகள் மோதும் சூழ்நிலையை இன்னும் விரிவாக விவரிக்கவும்.",
                alternative_perspective="பொதுவான தார்மீக வழிகாட்டுதலைப் பெற சூழ்நிலையின் மனித தாக்கத்தை விவரிக்கவும்.",
            )
        elif lang == "hi":
            return StructuredAnswer(
                short_answer="इस विशिष्ट प्रश्न के लिए महाभारत या गीता ज्ञान-आधार में कोई प्रत्यक्ष शास्त्रीय संदर्भ उपलब्ध नहीं है।",
                why="प्रामाणिकता बनाए रखने और काल्पनिक श्लोकों के निर्माण से बचने के लिए, प्रणाली केवल सत्यापित संदर्भों पर आधारित उत्तर देती है।",
                mahabharata_connection="महाभारत ज्ञान-भंडार में इस स्थिति से मेल खाता कोई सत्यापित श्लोक या प्रसंग नहीं मिला। यह प्रणाली मनगढ़ंत संदर्भ नहीं बनाती।",
                what_you_can_do=[
                    "अपनी दुविधा के नैतिक पहलुओं या परस्पर विरोधी कर्तव्यों का अधिक विस्तार से वर्णन करें।",
                    "निर्णय से प्रभावित व्यक्तियों और परिस्थितियों का उल्लेख करें।",
                ],
                source_evidence=[],
                understanding="आपका प्रश्न महाभारत के किसी प्रत्यक्ष नैतिक प्रसंग से मेल नहीं खाता है।",
                ethical_analysis="इस विशिष्ट विषय के लिए महाभारत अथवा भगवद्गीता ज्ञान-आधार में कोई प्रत्यक्ष शास्त्रीय संदर्भ उपलब्ध नहीं है।",
                possible_solution="कृपया अपनी दुविधा के नैतिक पहलुओं या परस्पर विरोधी कर्तव्यों का अधिक विस्तार से वर्णन करें।",
                alternative_perspective="व्यावहारिक नैतिक मार्गदर्शन के लिए प्रभावित व्यक्तियों और जिम्मेदारियों का उल्लेख करें।",
            )
        elif lang == "te":
            return StructuredAnswer(
                short_answer="ఈ ప్రశ్నకు సంబంధించి మహాభారతం లేదా భగవద్గీతలో ప్రత్యక్ష గ్రంథ ఆధారాలు లభించలేదు.",
                why="కల్పిత శ్లోకాలను సృష్టించకుండా విశ్వసనీయతను కాపాడటమే ధర్మనెట్ విధానం.",
                mahabharata_connection="మహాభారత ఆధారాలలో దీనికి సంబంధించిన ధృవీకరించబడిన ప్రసంగం ఏదీ లభించలేదు. వ్యవస్థ కల్పిత శ్లోకాలను సృష్టించదు.",
                what_you_can_do=[
                    "మీ సమస్యలోని నైతిక సంకటాన్ని లేదా బాధ్యతలను వివరంగా వివరించండి.",
                    "పరిస్థితి మరియు దాని ప్రభావాలను పేర్కొనండి.",
                ],
                source_evidence=[],
                understanding="మీ ప్రశ్న మహాభారతంలోని ప్రత్యక్ష నైతిక కథలతో సరిపోలడం లేదు.",
                ethical_analysis="ఈ ప్రశ్నకు సంబంధించి మహాభారతం లేదా భగవద్గీతలో ప్రత్యక్ష గ్రంథ ఆధారాలు లభించలేదు.",
                possible_solution="దయచేసి మీ సమస్యలోని నైతిక సంకటాన్ని లేదా బాధ్యతలను వివరంగా వివరించండి.",
                alternative_perspective="స్పష్టమైన మార్గదర్శనం కోసం పరిస్థితి వివరాలను తెలియజేయండి.",
            )
        elif lang == "kn":
            return StructuredAnswer(
                short_answer="ಈ ಪ್ರಶ್ನೆಗೆ ಮಹಾಭಾರತ ಅಥವಾ ಭಗವದ್ಗೀತೆಯಲ್ಲಿ ನೇರ ಗ್ರಂಥ ಆಧಾರ ಲಭ್ಯವಿಲ್ಲ.",
                why="ಕೃತಕ ಉಲ್ಲೇಖಗಳನ್ನು ಸೃಷ್ಟಿಸದೆ ಸತ್ಯಾಸತ್ಯತೆಯನ್ನು ಕಾಪಾಡುವುದು ನಮ್ಮ ಆದ್ಯತೆಯಾಗಿದೆ.",
                mahabharata_connection="ಮಹಾಭಾರತದ ದೃಢೀಕೃತ ಮೂಲಗಳಲ್ಲಿ ಇದಕ್ಕೆ ಸಂಬಂಧಿಸಿದ ಯಾವುದೇ ಅಧ್ಯಾಯ ಅಥವಾ ಘಟನೆ ಸಿಕ್ಕಿಲ್ಲ. ಈ ವ್ಯವಸ್ಥೆಯು ಕೃತಕ ಉಲ್ಲೇಖಗಳನ್ನು ನೀಡುವುದಿಲ್ಲ.",
                what_you_can_do=[
                    "ನಿಮ್ಮ ಸಂದಿಗ್ಧತೆಯಲ್ಲಿರುವ ಪರಸ್ಪರ ಕರ್ತವ್ಯಗಳನ್ನು ಹೆಚ್ಚು ವಿವರವಾಗಿ ತಿಳಿಸಿ.",
                    "ಸನ್ನಿವೇಶದ ವಿವರಗಳನ್ನು ಹಂಚಿಕೊಳ್ಳಿ.",
                ],
                source_evidence=[],
                understanding="ನಿಮ್ಮ ಪ್ರಶ್ನೆಯು ಮಹಾಭಾರತದ ಯಾವುದೇ ನೇರ ನೈತಿಕ ಪ್ರಸಂಗಕ್ಕೆ ಹೊಂದಿಕೆಯಾಗುತ್ತಿಲ್ಲ.",
                ethical_analysis="ಈ ಪ್ರಶ್ನೆಗೆ ಮಹಾಭಾರತ ಅಥವಾ ಭಗವದ್ಗೀತೆಯಲ್ಲಿ ನೇರ ಗ್ರಂಥ ಆಧಾರ ಲಭ್ಯವಿಲ್ಲ.",
                possible_solution="ದಯವಿಟ್ಟು ನಿಮ್ಮ ಸಂದಿಗ್ಧತೆಯಲ್ಲಿರುವ ಪರಸ್ಪರ ಕರ್ತವ್ಯಗಳನ್ನು ಹೆಚ್ಚು ವಿವರವಾಗಿ ತಿಳಿಸಿ.",
                alternative_perspective="ಉತ್ತಮ ಮಾರ್ಗದರ್ಶನಕ್ಕಾಗಿ ಸನ್ನಿವೇಶದ ವಿವರಗಳನ್ನು ಹಂಚಿಕೊಳ್ಳಿ.",
            )
        elif lang == "ml":
            return StructuredAnswer(
                short_answer="ഈ വിഷയത്തിൽ മഹാഭാരതത്തിലോ ഭഗവദ്ഗീതയിലോ നേരിട്ടുള്ള ഗ്രന്ഥ തെളിവുകൾ ലഭ്യമല്ല.",
                why="തെറ്റായ തെളിവുകൾ ഉണ്ടാക്കാതിരിക്കാനും സത്യസന്ധത പാലിക്കാനും സിസ്റ്റം ശ്രദ്ധിക്കുന്നു.",
                mahabharata_connection="മഹാഭാരത വിജ്ഞാന ശേഖരത്തിൽ ഇതിന് അനുയോജ്യമായ അദ്ധ്യായമോ സന്ദർഭമോ കണ്ടെത്താനായില്ല. തെറ്റായ തെളിവുകൾ ഉണ്ടാക്കാൻ സിസ്റ്റം അനുവദിക്കുന്നില്ല.",
                what_you_can_do=[
                    "നിങ്ങളുടെ ധർമ്മസങ്കടവും ഉത്തരവാദിത്തങ്ങളും കൂടുതൽ വിശദമായി പങ്കുവെക്കുക.",
                    "തീരുമാനത്തിൽ ഉൾപ്പെട്ടിരിക്കുന്ന സാഹചര്യങ്ങൾ വ്യക്തമാക്കുക.",
                ],
                source_evidence=[],
                understanding="നിങ്ങളുടെ ചോദ്യം മഹാഭാരതത്തിലെ നേരിട്ടുള്ള ധാർമ്മിക സന്ദർഭങ്ങളുമായി പൊരുത്തപ്പെടുന്നില്ല.",
                ethical_analysis="ഈ വിഷയത്തിൽ മഹാഭാരതത്തിലോ ഭഗവദ്ഗീതയിലോ നേരിട്ടുള്ള ഗ്രന്ഥ തെളിവുകൾ ലഭ്യമല്ല.",
                possible_solution="ദയവായി നിങ്ങളുടെ ധർമ്മസങ്കടം കൂടുതൽ വിശദമായി പങ്കുവെക്കുക.",
                alternative_perspective="വ്യക്തമായ മാർഗ്ഗനിർദ്ദേശത്തിനായി കൂടുതൽ സാഹചര്യങ്ങൾ ചേർക്കുക.",
            )
        else:
            return StructuredAnswer(
                short_answer="No direct scriptural records in the curated Mahabharata knowledge base match this specific query.",
                why="To preserve scholarly integrity and prevent hallucination, DharmaNet avoids inventing verses or chapters when no textual evidence exists.",
                mahabharata_connection="No verified textual passages, character decisions, or parvas in the knowledge base correspond to this query. To maintain strict integrity, DharmaNet does not fabricate scripture or verses.",
                what_you_can_do=[
                    "Describe an ethical dilemma involving conflicting duties or difficult moral choices.",
                    "Include details about the people involved and what makes the choice morally challenging.",
                ],
                source_evidence=[],
                understanding="Your query does not present an ethical dilemma that matches the recorded themes of the Mahabharata knowledge base.",
                ethical_analysis="No direct scriptural records in the curated Mahabharata or Bhagavad Gita repository match this specific query.",
                possible_solution="Please describe an actual ethical dilemma involving conflicting duties, relationships, or difficult moral decisions.",
                alternative_perspective="Frame your situation by explaining what makes the choice morally difficult and who is impacted.",
            )
