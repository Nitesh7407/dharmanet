import type { LanguageMeta, SupportedLang } from "@/types/sage";

export const SAGE_LANGUAGES: LanguageMeta[] = [
  { code: "en", name: "English", native_name: "English", script: "Latin", voice_locale: "en-US" },
  { code: "ta", name: "Tamil", native_name: "தமிழ்", script: "Tamil", voice_locale: "ta-IN" },
  { code: "hi", name: "Hindi", native_name: "हिन्दी", script: "Devanagari", voice_locale: "hi-IN" },
  { code: "te", name: "Telugu", native_name: "తెలుగు", script: "Telugu", voice_locale: "te-IN" },
  { code: "kn", name: "Kannada", native_name: "ಕನ್ನಡ", script: "Kannada", voice_locale: "kn-IN" },
  { code: "ml", name: "Malayalam", native_name: "മലയാളം", script: "Malayalam", voice_locale: "ml-IN" },
];

export interface I18nBundle {
  pageTitle: string;
  subtitle: string;
  badge: string;
  selectorLabel: string;
  autoDetect: string;
  inputPlaceholder: string;
  askButton: string;
  thinkingStatus: string;
  clearChat: string;
  clearConfirm: string;
  copyAnswer: string;
  copied: string;
  listen: string;
  stopAudio: string;
  retry: string;
  sampleHeading: string;
  charCountNotice: string;
  sourcesVerifiedBadge: string;
  noSourcesNotice: string;
  // Phase 6 Concise Structure Labels
  shortAnswer: string;
  why: string;
  whatYouCanDo: string;
  detailedAnalysisToggle: string;
  hideDetailedAnalysis: string;
  // Mic & Voice
  micStart: string;
  micListening: string;
  micNotSupported: string;
  sections: {
    understanding: string;
    ethicalAnalysis: string;
    mahabharataConnection: string;
    sourceEvidence: string;
    possibleSolution: string;
    alternativePerspective: string;
  };
  samples: { title: string; text: string }[];
}

export const ROTATING_LOADING_MESSAGES: Record<string, string[]> = {
  en: [
    "AI Sage is recalling ancient wisdom...",
    "Consulting the sacred texts and episodes...",
    "Seeking insight from the cosmic order (Dharma)...",
    "Channeling dharmic guidance...",
    "Unraveling the threads of moral conflict...",
    "Contemplating the great epic decisions...",
    "Traversing classical ethical precedents...",
  ],
  ta: [
    "மகாபாரத வரலாற்றுப் பதிவுகளை ஆராய்கிறது...",
    "அறநெறி நூல்களின் சான்றுகளைத் திரட்டுகிறது...",
    "தர்மத்தின் ஆழமான வழிகாட்டலைத் தேடுகிறது...",
    "கதாபாத்திரங்களின் முடிவுகளை எடைபோடுகிறது...",
    "மெய்யான அறநெறிப் பாதையை வெளிப்படுத்துகிறது...",
  ],
  hi: [
    "महाभारत के प्राचीन प्रसंगों का स्मरण किया जा रहा है...",
    "शास्त्रों एवं गीता के श्लोकों का परामर्श...",
    "धर्म के गहरे नैतिक द्वंद्वों का विश्लेषण...",
    "पात्रों के निर्णयों और मर्यादाओं का मनन...",
    "सत्य और कर्तव्य का संतुलित मार्ग तलाशा जा रहा है...",
  ],
  te: [
    "మహాభారత గాథల ఆధారాలను పరిశీలిస్తోంది...",
    "ధర్మ సూక్ష్మాలను విశ్లేషిస్తోంది...",
    "గీతోపదేశం మరియు పురాణ ప్రసంగాల అవలోకనం...",
    "నైతిక కర్తవ్య మార్గాన్ని అన్వేషిస్తోంది...",
  ],
  kn: [
    "ಮಹಾಭಾರತದ ಪವಿತ್ರ ಪ್ರಸಂಗಗಳನ್ನು ನೆನಪಿಸಿಕೊಳ್ಳುತ್ತಿದೆ...",
    "ಧರ್ಮ ಮತ್ತು ಕರ್ತವ್ಯದ ತತ್ವಗಳನ್ನು ಅವಲೋಕಿಸುತ್ತಿದೆ...",
    "ಪ್ರಾಚೀನ ಜ್ಞಾನದ ಬೆಳಕಿನಲ್ಲಿ ಪರಿಹಾರವನ್ನು ಅನ್ವೇಷಿಸುತ್ತಿದೆ...",
  ],
  ml: [
    "മഹാഭാരതത്തിലെ പവിത്ര സന്ദർഭങ്ങൾ പരിശോധിക്കുന്നു...",
    "ധർമ്മത്തിന്റെ സൂക്ഷ്മ തലങ്ങൾ വിശകലനം ചെയ്യുന്നു...",
    "ആധികാരിക ജ്ഞാനത്തിൽ നിന്ന് മാർഗ്ഗനിർദ്ദേശം കണ്ടെത്തുന്നു...",
  ],
};

export const I18N_BUNDLES: Record<string, I18nBundle> = {
  en: {
    pageTitle: "Mahabharata AI Sage",
    subtitle: "Grounded ethical counsel drawn from the classical episodes, character decisions, and teachings of the Mahabharata & Bhagavad Gita.",
    badge: "Multilingual Grounded RAG Sage",
    selectorLabel: "Response Language",
    autoDetect: "Auto-detect",
    inputPlaceholder: "Describe your ethical dilemma in any language... (e.g. My colleague is taking credit for my project feature. Should I confront them privately or escalate to our manager?)",
    askButton: "Seek Sage Guidance",
    thinkingStatus: "Retrieving scriptural passages and weighing ethical perspectives...",
    clearChat: "Clear Consultation",
    clearConfirm: "Are you sure you want to clear this consultation history?",
    copyAnswer: "Copy Guidance",
    copied: "Copied to clipboard!",
    listen: "Listen (Audio)",
    stopAudio: "Stop Audio",
    retry: "Retry Question",
    sampleHeading: "Try a Classical or Everyday Dilemma",
    charCountNotice: "Minimum 10 characters required",
    sourcesVerifiedBadge: "Verified Text Evidence",
    noSourcesNotice: "No direct scriptural passage found in KB (avoids fabricating verses)",
    shortAnswer: "Direct Guidance",
    why: "Ethical Considerations",
    whatYouCanDo: "What You Can Do",
    detailedAnalysisToggle: "View In-Depth Analytical Framework",
    hideDetailedAnalysis: "Hide Detailed Analytical Framework",
    micStart: "Voice Input",
    micListening: "Listening... Speak your dilemma",
    micNotSupported: "Microphone speech input is not supported in this browser.",
    sections: {
      understanding: "Understanding the Situation",
      ethicalAnalysis: "Ethical Analysis & Competing Values",
      mahabharataConnection: "Mahabharata Precedent & Story",
      sourceEvidence: "Verified Source Citations",
      possibleSolution: "Suggested Practical Action Steps",
      alternativePerspective: "Alternative Perspective & Nuance",
    },
    samples: [
      {
        title: "Workplace Credit Theft",
        text: "My colleague took sole credit for a major project feature I built alone. During our leadership demo, they presented it as their idea. Should I confront them privately first or tell our manager?",
      },
      {
        title: "Friend Cheating on Exam",
        text: "I saw my close friend cheating on a bell-curved university exam. Reporting protects honest peers but will cause my friend to lose their vital financial-aid scholarship.",
      },
      {
        title: "Reporting Defect vs Company Loyalty",
        text: "I discovered a safety defect in a medical product my company sells. Management wants to patch it silently in six months. Whistleblowing protects patients but threatens 400 coworkers' jobs.",
      },
    ],
  },
  ta: {
    pageTitle: "மகாபாரத ஞானி (AI Sage)",
    subtitle: "மகாபாரதம் மற்றும் பகவத் கீதையின் வரலாற்றுப் பதிவுகள் மற்றும் கதாபாத்திர முடிவுகளின் அடிப்படையிலான மெய்யான அறநெறி வழிகாட்டல்.",
    badge: "பலமொழி வரலாற்று வழிகாட்டி",
    selectorLabel: "பதில் மொழி",
    autoDetect: "தானியங்கி கண்டறிதல்",
    inputPlaceholder: "உங்கள் அறநெறிக் குழப்பத்தை விவரிக்கவும்... (உதா: என் சக ஊழியர் நான் செய்த வேலையை தனது வேலை என்று மேலாளரிடம் கூறிவிட்டார். நான் அவரிடம் நேரடியாக பேசவா அல்லது மேலாளரிடம் சொல்லவா?)",
    askButton: "ஞானியிடம் ஆலோசனை கேட்க",
    thinkingStatus: "மகாபாரத வரலாற்றுப் பதிவுகளை ஆராய்ந்து அறநெறிப் பார்வைகளை எடைபோடுகிறது...",
    clearChat: "உரையாடலை அழிக்க",
    clearConfirm: "இந்த உரையாடல் வரலாற்றை அழிக்க நிச்சயமாக விரும்புகிறீர்களா?",
    copyAnswer: "பதிலை நகலெடுக்க",
    copied: "பதில் நகலெடுக்கப்பட்டது!",
    listen: "ஒலி வடிவில் கேட்க (Audio)",
    stopAudio: "ஒலியை நிறுத்த",
    retry: "மீண்டும் முயற்சிக்க",
    sampleHeading: "மாதிரி அறநெறிக் கேள்விகள்",
    charCountNotice: "குறைந்தது 10 எழுத்துக்கள் தேவை",
    sourcesVerifiedBadge: "சரிபார்க்கப்பட்ட மூல ஆதாரங்கள்",
    noSourcesNotice: "நேரடி ஆதாரங்கள் கிடைக்கவில்லை (போலி மேற்கோள்கள் தவிர்க்கப்படுகின்றன)",
    shortAnswer: "நேரடி வழிகாட்டல்",
    why: "அறநெறிக் காரணங்கள்",
    whatYouCanDo: "நீங்கள் செய்யக்கூடிய நடைமுறை வழிகள்",
    detailedAnalysisToggle: "விரிவான தார்மீக ஆய்வைக் காண்க",
    hideDetailedAnalysis: "விரிவான தார்மீக ஆய்வை மறைக்க",
    micStart: "குரல் வழி பதிவு",
    micListening: "கேட்கிறது... உங்கள் கேள்வியைப் பேசுங்கள்",
    micNotSupported: "இந்த உலாவியில் ஒலிவாங்கி உள்ளீடு ஆதரிக்கப்படவில்லை.",
    sections: {
      understanding: "சூழ்நிலையைப் புரிந்துகொள்ளுதல்",
      ethicalAnalysis: "அறநெறிப் பகுப்பாய்வு மற்றும் மோதும் மதிப்புகள்",
      mahabharataConnection: "மகாபாரத வரலாற்றுத் தொடர்பு மற்றும் கதை",
      sourceEvidence: "சரிபார்க்கப்பட்ட மூல ஆதாரங்கள்",
      possibleSolution: "பரிந்துரைக்கப்படும் செயல்முறைகள்",
      alternativePerspective: "மாற்றுப் பார்வை மற்றும் நுணுக்கம்",
    },
    samples: [
      {
        title: "அலுவலக கிரெடிட் பிரச்சனை",
        text: "என் சக ஊழியர் நான் செய்த திட்டப் பணியை தனது சொந்த முயற்சி என்று மேலாளரிடம் கூறிவிட்டார். அவரிடம் தனியாகப் பேசவா அல்லது மேலாளரிடம் முறையிடவா?",
      },
      {
        title: "நண்பனின் பொய் vs உண்மை",
        text: "என் நெருங்கிய நண்பர் தன் வேலையைக் காப்பாற்றிக்கொள்ள என்னை மேலாளரிடம் ஒரு பொய் சொல்லச் சொல்கிறார். உண்மை பேசினால் அவர் வேலை போகும். நான் என்ன செய்ய வேண்டும்?",
      },
      {
        title: "பாதுகாப்புக் குறைபாட்டை வெளிப்படுத்துதல்",
        text: "நிறுவனம் தயாரிக்கும் மருத்துவக் கருவியில் குறைபாடு இருப்பதை கண்டறிந்தேன். இதை வெளிப்படுத்தினால் நூற்றுக்கணக்கான ஊழியர்களின் வேலைக்கு ஆபத்து நேரிடலாம். நான் எதை தேர்ந்தெடுக்க வேண்டும்?",
      },
    ],
  },
  hi: {
    pageTitle: "महाभारत एआई मुनि (AI Sage)",
    subtitle: "महाभारत एवं भगवद्गीता के प्रामाणिक प्रसंगों, पात्रों के निर्णयों और उपदेशों पर आधारित संतुलित नैतिक मार्गदर्शन।",
    badge: "बहुभाषी शास्त्र-आधारित मार्गदर्शन",
    selectorLabel: "उत्तर की भाषा",
    autoDetect: "स्वतः पहचान",
    inputPlaceholder: "अपनी नैतिक दुविधा का वर्णन करें... (उदा. मेरे सहकर्मी ने मेरा काम चुराकर अपने नाम से प्रस्तुत किया। क्या मैं उनसे सीधे बात करूँ या प्रबंधक को सूचित करूँ?)",
    askButton: "मुनि से मार्गदर्शन प्राप्त करें",
    thinkingStatus: "महाभारत के प्रामाणिक संदर्भों का विश्लेषण और धर्म-संकट पर विचार जारी है...",
    clearChat: "संवाद साफ़ करें",
    clearConfirm: "क्या आप इस संवाद को मिटाना चाहते हैं?",
    copyAnswer: "उत्तर कॉपी करें",
    copied: "उत्तर कॉपी हो गया!",
    listen: "ऑडियो सुनें",
    stopAudio: "ऑडियो रोकें",
    retry: "पुनः प्रयास करें",
    sampleHeading: "प्रासंगिक नैतिक उदाहरण",
    charCountNotice: "कम से कम 10 अक्षर आवश्यक हैं",
    sourcesVerifiedBadge: "सत्यापित ग्रंथ संदर्भ",
    noSourcesNotice: "ज्ञान-भंडार में कोई सीधा संदर्भ नहीं मिला (मनगढ़ंत श्लोक वर्जित हैं)",
    shortAnswer: "संक्षिप्त मार्गदर्शन",
    why: "नैतिक आधार एवं कारण",
    whatYouCanDo: "आप क्या कर सकते हैं",
    detailedAnalysisToggle: "गहन नैतिक विश्लेषण देखें",
    hideDetailedAnalysis: "गहन नैतिक विश्लेषण छिपाएं",
    micStart: "बोलकर पूछें",
    micListening: "सुन रहा है... अपनी दुविधा बोलिए",
    micNotSupported: "इस ब्राउज़र में ध्वनि पहचान समर्थित नहीं है।",
    sections: {
      understanding: "परिस्थिति का अवलोकन",
      ethicalAnalysis: "नैतिक विश्लेषण एवं परस्पर विरोधी मूल्य",
      mahabharataConnection: "महाभारत प्रसंग एवं ऐतिहासिक कथा",
      sourceEvidence: "सत्यापित ग्रंथ संदर्भ",
      possibleSolution: "व्यावहारिक समाधान के कदम",
      alternativePerspective: "वैकल्पिक दृष्टिकोण एवं संतुलन",
    },
    samples: [
      {
        title: "कार्यस्थल पर काम का श्रेय चुराना",
        text: "मेरे सहकर्मी ने मेरे बनाए गए प्रोजेक्ट फीचर का पूरा श्रेय खुद ले लिया। क्या मुझे उनसे अकेले में बात करनी चाहिए या सीधे सीनियर मैनेजर को बताना चाहिए?",
      },
      {
        title: "मित्र की सहायता बनाम सत्यनिष्ठा",
        text: "मेरे मित्र ने परीक्षा में अनुचित साधन का प्रयोग किया। यदि मैं सच बताऊँ तो उसकी छात्रवृत्ति छिन जाएगी, यदि चुप रहूँ तो अन्य ईमानदार छात्रों के साथ अन्याय होगा।",
      },
      {
        title: "उत्पाद दोष और कंपनी निष्ठा",
        text: "हमारी कंपनी के उत्पाद में एक गंभीर सुरक्षा दोष है। इसे उजागर करने से 400 कर्मचारियों की आजीविका संकट में आ सकती है। धर्म क्या कहता है?",
      },
    ],
  },
  te: {
    pageTitle: "మహాభారత వివేకవేత్త (AI Sage)",
    subtitle: "మహాభారతం మరియు భగవద్గీతలోని పవిత్ర సందర్భాలు, పాత్రల నిర్ణయాల ఆధారంగా నైతిక మార్గదర్శనం.",
    badge: "బహుభాషా నైతిక విశ్లేషణ",
    selectorLabel: "సమాధాన భాష",
    autoDetect: "స్వయం గుర్తింపు",
    inputPlaceholder: "మీ నైతిక సంకటాన్ని వివరించండి... (ఉదా: నా సహోద్యోగి నా పనిని తనదిగా చూపించుకున్నాడు. నేను వారితో మాట్లాడాలా లేక మేనేజర్‌కి ఫిర్యాదు చేయాలా?)",
    askButton: "మార్గదర్శనం కోరండి",
    thinkingStatus: "మహాభారత మూలాలను శోధిస్తూ నైతిక పరిష్కారాన్ని విశ్లేషిస్తోంది...",
    clearChat: "చాట్ క్లియర్ చేయండి",
    clearConfirm: "మీరు ఈ సంభాషణను తొలగించాలనుకుంటున్నారా?",
    copyAnswer: "సమాధానం కాపీ చేయండి",
    copied: "కాపీ చేయబడింది!",
    listen: "వినండి (ఆడియో)",
    stopAudio: "ఆపండి",
    retry: "మళ్ళీ ప్రయత్నించండి",
    sampleHeading: "ఉదాహరణ ప్రశ్నలు",
    charCountNotice: "కనీసం 10 అక్షరాలు అవసరం",
    sourcesVerifiedBadge: "ధృవీకరించబడిన మూలాలు",
    noSourcesNotice: "ప్రత్యక్ష గ్రంథ ఆధారాలు లభించలేదు (కల్పిత శ్లోకాలు నివారించబడతాయి)",
    shortAnswer: "సూటి సమాధానం",
    why: "నైతిక కారణాలు",
    whatYouCanDo: "మీరు ఏమి చేయవచ్చు",
    detailedAnalysisToggle: "సమగ్ర నైతిక విశ్లేషణను చూడండి",
    hideDetailedAnalysis: "సమగ్ర విశ్లేషణను దాచండి",
    micStart: "వాయిస్ ఇన్‌పుట్",
    micListening: "వింటోంది... మాట్లాడండి",
    micNotSupported: "ఈ బ్రౌజర్‌లో వాయిస్ రికగ్నిషన్ మద్దతు లేదు.",
    sections: {
      understanding: "పరిస్థితి అవగాహన",
      ethicalAnalysis: "నైతిక విశ్లేషణ మరియు ద్వంద్వాలు",
      mahabharataConnection: "మహాభారత సందర్భం మరియు బోధన",
      sourceEvidence: "ధృవీకరించబడిన మూల ఆధారాలు",
      possibleSolution: "ఆచరణాత్మక పరిష్కార మార్గాలు",
      alternativePerspective: "ప్రత్యామ్నాయ దృక్పథం",
    },
    samples: [
      {
        title: "పని క్రెడిట్ చోరీ",
        text: "నేను ఒంటరిగా చేసిన ప్రాజెక్ట్ పనికి నా సహోద్యోగి క్రెడిట్ తీసుకున్నాడు. నేను వారితో నేరుగా మాట్లాడాలా లేదా మేనేజర్‌కి చెప్పాలా?",
      },
      {
        title: "స్నేహితుడి తప్పు vs సత్యం",
        text: "నా స్నేహితుడు పరీక్షలో కాపీ కొట్టాడు. నేను నిజం చెబితే అతనికి స్కాలర్‌షిప్ పోతుంది, చెప్పకపోతే ఇతరులకు అన్యాయం.",
      },
    ],
  },
  kn: {
    pageTitle: "ಮಹಾಭಾರತ ಜ್ಞಾನಿ (AI Sage)",
    subtitle: "ಮಹಾಭಾರತ ಮತ್ತು ಭಗವದ್ಗೀತೆಯ ಐತಿಹಾಸಿಕ ಪ್ರಸಂಗಗಳು ಮತ್ತು ಬೋಧನೆಗಳ ಆಧಾರದ ಮೇಲೆ ನೈತಿಕ ಸಮಾಲೋಚನೆ.",
    badge: "ಬಹುಭಾಷಾ ಶಾಸ್ತ್ರೀಯ ಮಾರ್ಗದರ್ಶನ",
    selectorLabel: "ಉತ್ತರದ ಭಾಷೆ",
    autoDetect: "ಸ್ವಯಂ ಪತ್ತೆ",
    inputPlaceholder: "ನಿಮ್ಮ ನೈತಿಕ ಸಂದಿಗ್ಧತೆಯನ್ನು ವಿವರಿಸಿ... (ಉದಾ: ನನ್ನ ಸಹೋದ್ಯೋಗಿ ನನ್ನ ಕೆಲಸದ ಶ್ರೇಯವನ್ನು ತಾನೇ ಪಡೆದುಕೊಂಡಿದ್ದಾರೆ. ನಾನು ಏನು ಮಾಡಬೇಕು?)",
    askButton: "ಮಾರ್ಗದರ್ಶನ ಪಡೆಯಿರಿ",
    thinkingStatus: "ಮಹಾಭಾರತದ ಮೂಲ ಉಲ್ಲೇಖಗಳನ್ನು ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...",
    clearChat: "ಸಂವಾದ ತೆರವುಗೊಳಿಸಿ",
    clearConfirm: "ಈ ಸಂವಾದವನ್ನು ಅಳಿಸಲು ನೀವು ಖಚಿತವಾಗಿ ಬಯಸುವಿರಾ?",
    copyAnswer: "ಉತ್ತರ ನಕಲಿಸಿ",
    copied: "ನಕಲಿಸಲಾಗಿದೆ!",
    listen: "ಆಲಿಸಿ (ಆಡಿಯೋ)",
    stopAudio: "ನಿಲ್ಲಿಸಿ",
    retry: "ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ",
    sampleHeading: "ಮಾದರಿ ನೈತಿಕ ಸಂದರ್ಭಗಳು",
    charCountNotice: "ಕನಿಷ್ಠ 10 ಅಕ್ಷರಗಳು ಅಗತ್ಯವಿದೆ",
    sourcesVerifiedBadge: "ದೃಢೀಕೃತ ಮೂಲ ಉಲ್ಲೇಖಗಳು",
    noSourcesNotice: "ನೇರ ಉಲ್ಲೇಖ ಲಭ್ಯವಿಲ್ಲ (ಕೃತಕ ಶ್ಲೋಕಗಳನ್ನು ತಪ್ಪಿಸಲಾಗಿದೆ)",
    shortAnswer: "ನೇರ ಮಾರ್ಗದರ್ಶನ",
    why: "ನೈತಿಕ ಕಾರಣಗಳು",
    whatYouCanDo: "ನೀವು ಏನು ಮಾಡಬಹುದು",
    detailedAnalysisToggle: "ಆಳವಾದ ನೈತಿಕ ವಿಶ್ಲೇಷಣೆಯನ್ನು ವೀಕ್ಷಿಸಿ",
    hideDetailedAnalysis: "ಆಳವಾದ ವಿಶ್ಲೇಷಣೆಯನ್ನು ಮರೆಮಾಡಿ",
    micStart: "ಧ್ವನಿ ಮೂಲಕ ಇನ್‌ಪುಟ್",
    micListening: "ಕೇಳಿಸಿಕೊಳ್ಳುತ್ತಿದೆ... ಮಾತನಾಡಿ",
    micNotSupported: "ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಧ್ವನಿ ಇನ್‌ಪುಟ್ ಬೆಂಬಲಿಸುವುದಿಲ್ಲ.",
    sections: {
      understanding: "ಸಂದರ್ಭದ ವಿವರಣೆ",
      ethicalAnalysis: "ನೈತಿಕ ವಿಶ್ಲೇಷಣೆ ಮತ್ತು ಸಂಘರ್ಷ",
      mahabharataConnection: "ಮಹಾಭಾರತದ ಪ್ರಸಂಗ ಮತ್ತು ಶಿಕ್ಷಣ",
      sourceEvidence: "ದೃಢೀಕೃತ ಮೂಲ ಉಲ್ಲೇಖಗಳು",
      possibleSolution: "ಪ್ರಾಯೋಗಿಕ ಪರಿಹಾರದ ಹಂತಗಳು",
      alternativePerspective: "ಪರ್ಯಾಯ ದೃಷ್ಟಿಕೋನ",
    },
    samples: [
      {
        title: "ಕೆಲಸದ ಶ್ರೇಯಸ್ಸು ಕದಿಯುವುದು",
        text: "ನನ್ನ ಪ್ರಾಜೆಕ್ಟ್ ಕೆಲಸದ ಸಂಪೂರ್ಣ ಗೌರವವನ್ನು ನನ್ನ ಸಹೋದ್ಯೋಗಿ ತಮ್ಮದಾಗಿಸಿಕೊಂಡಿದ್ದಾರೆ. ನಾನು ಅವರೊಂದಿಗೆ ನೇರವಾಗಿ ಮಾತನಾಡಬೇಕೇ ಅಥವಾ ಮೇಲಧಿಕಾರಿಗೆ ತಿಳಿಸಬೇಕೇ?",
      },
      {
        title: "ಸ್ನೇಹಿತನ ರಕ್ಷಣೆ vs ಸತ್ಯ",
        text: "ನನ್ನ ಸ್ನೇಹಿತ ಪರೀಕ್ಷೆಯಲ್ಲಿ ನಕಲು ಮಾಡಿದ್ದಾರೆ. ನಾನು ಸತ್ಯ ಹೇಳಿದರೆ ಅವರ ವಿದ್ಯಾರ್ಥಿವೇತನ ರದ್ದಾಗುತ್ತದೆ. ನಾನು ಏನು ಮಾಡಬೇಕು?",
      },
    ],
  },
  ml: {
    pageTitle: "മഹാഭാരത ജ്ഞാനി (AI Sage)",
    subtitle: "മഹാഭാരതത്തിലെയും ഭഗവദ്ഗീതയിലെയും സന്ദർഭങ്ങളെയും ധാർമ്മിക കഥാപാത്രങ്ങളെയും അടിസ്ഥാനമാക്കിയുള്ള ഉപദേശം.",
    badge: "ബഹുഭാഷാ ധാർമ്മിക ഉപദേശം",
    selectorLabel: "ഉത്തരത്തിന്റെ ഭാഷ",
    autoDetect: "ഓട്ടോ ഡിറ്റക്ട്",
    inputPlaceholder: "നിങ്ങളുടെ ധർമ്മസങ്കടം പങ്കുവെക്കുക... (ഉദാ: എന്റെ സഹപ്രവർത്തകൻ എന്റെ ജോലി സ്വന്തം പേരിലാക്കി അവതരിപ്പിച്ചു. ഞാൻ എന്തു ചെയ്യണം?)",
    askButton: "ഉപദേശം തേടുക",
    thinkingStatus: "മഹാഭാരത ഗ്രന്ഥങ്ങളെ ആസ്പദമാക്കി ധാർമ്മിക പരിഹാരം വിലയിരുത്തുന്നു...",
    clearChat: "ചാറ്റ് മായ്ക്കുക",
    clearConfirm: "ഈ സംഭാഷണം പൂർണ്ണമായി ഒഴിവാക്കണോ?",
    copyAnswer: "ഉത്തരം കോപ്പി ചെയ്യുക",
    copied: "കോപ്പി ചെയ്തു!",
    listen: "കേൾക്കുക (ഓഡിയോ)",
    stopAudio: "നിർത്തുക",
    retry: "വീണ്ടും ശ്രമിക്കുക",
    sampleHeading: "ഉദാഹരണ ചോദ്യങ്ങൾ",
    charCountNotice: "കുറഞ്ഞത് 10 അക്ഷരങ്ങൾ വേണം",
    sourcesVerifiedBadge: "സ്ഥിരീകരിച്ച ഗ്രന്ഥ തെളിവുകൾ",
    noSourcesNotice: "നേരിട്ടുള്ള തെളിവുകൾ ലഭ്യമല്ല (വ്യാജ ശ്ലോകങ്ങൾ ഒഴിവാക്കുന്നു)",
    shortAnswer: "നേരിട്ടുള്ള ഉത്തരം",
    why: "ധാർമ്മിക പരിഗണനകൾ",
    whatYouCanDo: "നിങ്ങൾക്ക് ചെയ്യാവുന്ന കാര്യങ്ങൾ",
    detailedAnalysisToggle: "ആഴത്തിലുള്ള ധാർമ്മിക വിശകലനം കാണുക",
    hideDetailedAnalysis: "വിശകലനം മറയ്ക്കുക",
    micStart: "വോയ്‌സ് ഇൻപുട്ട്",
    micListening: "കേൾക്കുന്നു... സംസാരിക്കുക",
    micNotSupported: "ഈ ബ്രൗസറിൽ മൈക്രോഫോൺ ഇൻപുട്ട് പിന്തുണയ്ക്കുന്നില്ല.",
    sections: {
      understanding: "സാഹചര്യത്തിന്റെ വിശകലനം",
      ethicalAnalysis: "ധാർമ്മിക വിശകലനം",
      mahabharataConnection: "മഹാഭാരത ചരിത്ര ബന്ധം",
      sourceEvidence: "സ്ഥിരീകരിച്ച ഗ്രന്ഥ തെളിവുകൾ",
      possibleSolution: "പ്രായോഗിക പരിഹാര മാർഗ്ഗങ്ങൾ",
      alternativePerspective: "മറ്റൊരു വീക്ഷണം",
    },
    samples: [
      {
        title: "പ്രോജക്റ്റ് ക്രെഡിറ്റ് മോഷണം",
        text: "ഞാൻ ചെയ്ത പ്രോജക്റ്റിന്റെ മുഴുവൻ ക്രെഡിറ്റും എന്റെ സഹപ്രവർത്തകൻ സ്വന്തം പേരിലാക്കി. ഞാൻ നേരിട്ട് സംസാരിക്കണോ മാനേജറോട് പറയണോ?",
      },
      {
        title: "സുഹൃത്തിന്റെ നുണയും സത്യവും",
        text: "കമ്പനിയിലെ ഗുരുതരമായ തെറ്റ് മറച്ചുവെക്കാൻ എന്റെ ഉറ്റസുഹൃത്ത് എന്നോട് ആവശ്യപ്പെടുന്നു. ഞാൻ സത്യം പറയണോ അതോ സുഹൃത്തിനെ സഹായിക്കണോ?",
      },
    ],
  },
};

export function getBundle(lang: SupportedLang): I18nBundle {
  return I18N_BUNDLES[lang] || I18N_BUNDLES.en;
}
