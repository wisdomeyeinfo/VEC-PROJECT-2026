type Lang = "en" | "hi" | "mr" | "bn" | "gu" | "ta" | "kn";

/** Map full DB language names → short codes */
const LANG_MAP: Record<string, Lang> = {
  english:  "en",
  hindi:    "hi",
  marathi:  "mr",
  gujarati: "gu",
  gujrati:  "gu", // DB typo variant
  tamil:    "ta",
  bengali:  "bn",
  kannada:  "kn",
};

function resolveCode(raw: string | null | undefined): Lang {
  if (!raw) return "en";
  const lower = raw.toLowerCase().trim();
  // Already a short code?
  if (lower in dict) return lower as Lang;
  // Full language name?
  return LANG_MAP[lower] ?? "en";
}



const dict: Record<Lang, Record<string, string>> = {
  en: {
    studentDashboard: "Student dashboard",
    welcomeActivated: "Welcome! Your app is activated.",
    joinWhatsappRequired: "Join WhatsApp group (required)",
    openWhatsappLink: "Open WhatsApp invite link",
    iJoinedWhatsapp: "I joined the WhatsApp group",
    menu: "Menu",
    studyMaterials: "Study materials",
    contestExam: "Contest exam",
    results: "Results",
    welcomeBack: "Welcome Back",
    wisdomQuest: "Study Quest",
    bigContest: "Big Contest",
    hallOfFame: "Hall of Fame",
    dailyWisdom: "Daily Wisdom",
  },
  hi: {
    studentDashboard: "छात्र डैशबोर्ड",
    welcomeActivated: "स्वागत है! आपका ऐप सक्रिय हो गया है।",
    joinWhatsappRequired: "व्हाट्सऐप समूह में जुड़ना (अनिवार्य)",
    openWhatsappLink: "व्हाट्सऐप लिंक खोलें",
    iJoinedWhatsapp: "मैं व्हाट्सऐप समूह में जुड़ गया/गई",
    menu: "मेनू",
    studyMaterials: "अध्ययन सामग्री",
    contestExam: "प्रतियोगिता परीक्षा",
    results: "परिणाम",
    welcomeBack: "स्वागत है",
    wisdomQuest: "अध्ययन यात्रा",
    bigContest: "महा प्रतियोगिता",
    hallOfFame: "गौरवशाली परिणाम",
    dailyWisdom: "आज का सुविचार",
  },
  mr: {
    studentDashboard: "विद्यार्थी डॅशबोर्ड",
    welcomeActivated: "स्वागत आहे! तुमचे अॅप सक्रिय झाले आहे.",
    joinWhatsappRequired: "व्हॉट्सअॅप ग्रुप जॉइन करा (आवश्यक)",
    openWhatsappLink: "व्हॉट्सअॅप लिंक उघडा",
    iJoinedWhatsapp: "मी व्हॉट्सअॅप ग्रुप जॉइन केला",
    menu: "मेनू",
    studyMaterials: "अभ्यास सामग्री",
    contestExam: "स्पर्धा परीक्षा",
    results: "निकाल",
    welcomeBack: "पुनरागमन स्वागत",
    wisdomQuest: "अभ्यास शोध",
    bigContest: "महा स्पर्धा",
    hallOfFame: "यशवंत दालन",
    dailyWisdom: "आजचा सुविचार",
  },
  bn: {
    studentDashboard: "শিক্ষার্থী ড্যাশবোর্ড",
    welcomeActivated: "স্বাগতম! আপনার অ্যাপ সক্রিয় হয়েছে।",
    joinWhatsappRequired: "হোয়াটসঅ্যাপ গ্রুপে যোগ দিন (আবশ্যক)",
    openWhatsappLink: "হোয়াটসঅ্যাপ লিংক খুলুন",
    iJoinedWhatsapp: "আমি হোয়াটসঅ্যাপ গ্রুপে যোগ দিয়েছি",
    menu: "মেনু",
    studyMaterials: "পড়াশোনার উপকরণ",
    contestExam: "প্রতিযোগিতার পরীক্ষা",
    results: "ফলাফল",
    welcomeBack: "স্বাগতম",
    wisdomQuest: "শিক্ষা অন্বেষণ",
    bigContest: "মহা প্রতিযোগিতা",
    hallOfFame: "সাফল্য কেন্দ্র",
    dailyWisdom: "আজকের বাণী",
  },
  gu: {
    studentDashboard: "વિદ્યાર્થી ડેશબોર્ડ",
    welcomeActivated: "સ્વાગત છે! તમારું એપ સક્રિય થયું છે.",
    joinWhatsappRequired: "વોટ્સએપ ગ્રુપમાં જોડાવું (ફરજિયાત)",
    openWhatsappLink: "વોટ્સએપ લિંક ખોલો",
    iJoinedWhatsapp: "હું વોટ્સએપ ગ્રુપમાં જોડાયો/જોડાઈ",
    menu: "મેનુ",
    studyMaterials: "અભ્યાસ સામગ્રી",
    contestExam: "સ્પર્ધા પરીક્ષા",
    results: "પરિણામ",
    welcomeBack: "સ્વાગત છે",
    wisdomQuest: "અભ્યાસ યાત્રા",
    bigContest: "મહા સ્પર્ધા",
    hallOfFame: "સફળતા કેન્દ્ર",
    dailyWisdom: "આજનો સુવિચાર",
  },
  ta: {},
  kn: {},
};

export function t(lang: string | null | undefined, key: string): string {
  const l = resolveCode(lang);
  return dict[l]?.[key] ?? dict.en[key] ?? key;
}
