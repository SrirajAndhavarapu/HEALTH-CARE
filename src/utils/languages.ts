import { RegionalLanguage } from '../types';

export interface LanguageMeta {
  code: RegionalLanguage;
  name: string;
  nativeName: string;
  speechCode: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageMeta[] = [
  { code: 'en', name: 'English', nativeName: 'English', speechCode: 'en-IN', flag: '🇬🇧' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', speechCode: 'hi-IN', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', speechCode: 'te-IN', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', speechCode: 'ta-IN', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', speechCode: 'kn-IN', flag: '🇮🇳' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', speechCode: 'ml-IN', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', speechCode: 'mr-IN', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', speechCode: 'bn-IN', flag: '🇮🇳' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', speechCode: 'gu-IN', flag: '🇮🇳' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', speechCode: 'pa-IN', flag: '🇮🇳' },
];

export interface NotificationParams {
  currentToken: string;
  patientToken: string;
  peopleAway: number;
  department: string;
  room: string;
  patientName: string;
}

export function generateAutomatedMessage(lang: RegionalLanguage, params: NotificationParams): string {
  const { currentToken, peopleAway, department, room } = params;

  switch (lang) {
    case 'hi':
      return `वर्तमान टोकन संख्या ${currentToken} है और आपका नंबर ${peopleAway} लोग दूर है, इसलिए कृपया अपने परामर्श के लिए निर्धारित विभाग ${department}, कमरा ${room} में उपलब्ध रहें।`;
    
    case 'te':
      return `ప్రస్తుత టోకెన్ సంఖ్య ${currentToken} మరియు మీ నంబర్ ${peopleAway} మంది దూరంలో ఉంది, కాబట్టి దయచేసి మీ సంప్రదింపుల కోసం కేటాయించిన విభాగం ${department}, గది ${room} వద్ద అందుబాటులో ఉండండి.`;
    
    case 'ta':
      return `தற்போதைய டோக்கன் எண் ${currentToken} மற்றும் உங்கள் எண் ${peopleAway} நபர்கள் தள்ளி உள்ளது, எனவே தயவுசெய்து உங்கள் ஆலோசனைக்காக நியமிக்கப்பட்ட துறை ${department}, அறை ${room}ல் இருக்கவும்.`;
    
    case 'kn':
      return `ಪ್ರಸ್ತುತ ಟೋಕನ್ ಸಂಖ್ಯೆ ${currentToken} ಮತ್ತು ನಿಮ್ಮ ಸಂಖ್ಯೆ ${peopleAway} ಜನರ ದೂರದಲ್ಲಿದೆ, ಆದ್ದರಿಂದ ದಯವಿಟ್ಟು ನಿಮ್ಮ ಸಮಾಲೋಚನೆಗಾಗಿ ನಿಗದಿತ ವಿಭಾಗ ${department}, ಕೊಠಡಿ ${room} ನಲ್ಲಿ ಲಭ್ಯವಿರಿ.`;
    
    case 'ml':
      return `നിലവിലെ ടോക്കൺ നമ്പർ ${currentToken} ആണ്, നിങ്ങളുടെ നമ്പർ ${peopleAway} ആളുകൾ അകലെയാണ്, അതിനാൽ നിങ്ങളുടെ കൺസൾട്ടേഷനായി നിശ്ചിത ഡിപ്പാർട്ട്മെന്റായ ${department}, റൂം ${room}-ൽ ലഭ്യമായിരിക്കുക.`;
    
    case 'mr':
      return `सध्याचा टोकन क्रमांक ${currentToken} आहे आणि तुमचा नंबर ${peopleAway} लोक दूर आहे, म्हणून कृपया तुमच्या तपासणीसाठी नियुक्त विभाग ${department}, खोली ${room} येथे उपस्थित राहा.`;
    
    case 'bn':
      return `বর্তমান টোকেন নম্বর হল ${currentToken} এবং আপনার নম্বর ${peopleAway} জন দূরে রয়েছে, তাই অনুগ্রহ করে আপনার পরামর্শের জন্য নির্ধারিত বিভাগ ${department}, রুম ${room}-এ উপস্থিত থাকুন।`;
    
    case 'gu':
      return `વર્તમાન ટોકન નંબર ${currentToken} છે અને તમારો નંબર ${peopleAway} લોકો દૂર છે, તેથી કૃપા કરીને તમારા પરામર્શ માટે નિયુક્ત વિભાગ ${department}, રૂમ ${room} માં ઉપસ્થિત રહો.`;
    
    case 'pa':
      return `ਮੌਜੂਦਾ ਟੋਕਨ ਨੰਬਰ ${currentToken} ਹੈ ਅਤੇ ਤੁਹਾਡਾ ਨੰਬਰ ${peopleAway} ਲੋਕ ਦੂਰ ਹੈ, ਇਸ ਲਈ ਕਿਰਪਾ ਕਰਕੇ ਆਪਣੀ ਸਲਾਹ ਲਈ ਨਿਰਧਾਰਤ ਵਿਭਾਗ ${department}, ਕਮਰਾ ${room} ਵਿੱਚ ਮੌਜੂਦ ਰਹੋ।`;
    
    case 'en':
    default:
      return `The current token number is ${currentToken} and your number is ${peopleAway} people away so please be available at the designated department ${department}, Room ${room} for your consultation.`;
  }
}

export function getLanguageMeta(code: RegionalLanguage): LanguageMeta {
  return SUPPORTED_LANGUAGES.find(l => l.code === code) || SUPPORTED_LANGUAGES[0];
}

// Full multilingual UI dictionary for regional switching
export const UI_TRANSLATIONS: Record<RegionalLanguage, Record<string, string>> = {
  en: {
    appName: 'SwasthyaToken',
    appTagline: 'Hospital Smart Voice Token & Live Tracking',
    patientKiosk: 'Patient Kiosk',
    liveTracking: 'Live Tracking',
    doctorDesk: 'Doctor Desk',
    waitingHallTv: 'Waiting Hall TV',
    notifications: 'Automated Calls & SMS',
    highContrast: 'High Contrast Mode',
    highContrastOn: 'High Contrast: ON',
    highContrastOff: 'High Contrast: OFF',
    selectLanguage: 'Change Language',
    nowServing: 'Now Serving',
    yourToken: 'Your Assigned Token',
    peopleAway: 'People Away',
    estWaitTime: 'Estimated Wait Time',
    generateTokenBtn: 'Generate Auto-Token & Activate Live Tracking',
    simulateCall: 'Simulate Voice Call',
    simulateSms: 'Simulate SMS',
    mandatoryNotice: 'All 5 Fields are Mandatory',
    patientName: 'Patient Full Name',
    phoneNumber: 'Phone Number',
    age: 'Age',
    gender: 'Gender',
    symptoms: 'Problem or Symptoms',
    designatedDept: 'Designated Department',
    regionalNoticeTitle: 'Automated Alert in Your Regional Language',
    testCallBtn: 'Simulate 10-Away Voice Call',
    resetQueue: 'Reset Queue',
    copyLink: 'Copy Live Link',
    inLine: 'Patients Waiting',
    nowServingRoom: 'Now in Doctor Consultation'
  },
  hi: {
    appName: 'स्वास्थ्यटोकन',
    appTagline: 'अस्पताल स्मार्ट वॉइस टोकन और लाइव ट्रैकिंग',
    patientKiosk: 'मरीज टोकन कियोस्क',
    liveTracking: 'लाइव ट्रैकिंग',
    doctorDesk: 'डॉक्टर कंसल्टेशन डेस्क',
    waitingHallTv: 'प्रतीक्षालय टीवी बोर्ड',
    notifications: 'ऑटोमेटेड कॉल और एसएमएस',
    highContrast: 'हाई कंट्रास्ट मोड',
    highContrastOn: 'हाई कंट्रास्ट: चालू',
    highContrastOff: 'हाई कंट्रास्ट: बंद',
    selectLanguage: 'भाषा बदलें',
    nowServing: 'वर्तमान टोकन',
    yourToken: 'आपका टोकन नंबर',
    peopleAway: 'लोग आगे हैं',
    estWaitTime: 'अनुमानित प्रतीक्षा समय',
    generateTokenBtn: 'ऑटो-टोकन बनाएं और लाइव ट्रैकिंग शुरू करें',
    simulateCall: 'वॉइस कॉल का परीक्षण करें',
    simulateSms: 'एसएमएस परीक्षण',
    mandatoryNotice: 'सभी 5 विवरण अनिवार्य हैं',
    patientName: 'मरीज का पूरा नाम',
    phoneNumber: 'फोन नंबर',
    age: 'उम्र',
    gender: 'लिंग',
    symptoms: 'समस्या या लक्षण',
    designatedDept: 'निर्धारित विभाग',
    regionalNoticeTitle: 'आपकी क्षेत्रीय भाषा में स्वचालित अलर्ट',
    testCallBtn: '10-लोग दूर वॉइस कॉल चलाएं',
    resetQueue: 'कतार रीसेट करें',
    copyLink: 'लाइव लिंक कॉपी करें',
    inLine: 'प्रतीक्षारत मरीज',
    nowServingRoom: 'वर्तमान में डॉक्टर के पास'
  },
  te: {
    appName: 'స్వాస్థ్యటోకెన్',
    appTagline: 'హాస్పిటల్ స్మార్ట్ వాయిస్ టోకెన్ & లైవ్ ట్రాకింగ్',
    patientKiosk: 'రోగి టోకెన్ కియోస్క్',
    liveTracking: 'లైవ్ ట్రాకింగ్',
    doctorDesk: 'డాక్టర్ డెస్క్',
    waitingHallTv: 'వెయిటింగ్ హాల్ టీవీ',
    notifications: 'స్వయంచాలక కాల్స్ & SMS',
    highContrast: 'హై కాంట్రాస్ట్ మోడ్',
    highContrastOn: 'హై కాంట్రాస్ట్: ఆన్',
    highContrastOff: 'హై కాంట్రాస్ట్: ఆఫ్',
    selectLanguage: 'భాష మార్చండి',
    nowServing: 'ప్రస్తుతం సేవలందిస్తున్నది',
    yourToken: 'మీ టోకెన్ నంబర్',
    peopleAway: 'మంది దూరంలో ఉన్నారు',
    estWaitTime: 'అంచనా వేచి ఉండే సమయం',
    generateTokenBtn: 'ఆటో-టోకెన్ రూపొందించి లైవ్ ట్రాకింగ్ ప్రారంభించండి',
    simulateCall: 'వాయిస్ కాల్ టెస్ట్ చేయండి',
    simulateSms: 'SMS టెస్ట్ చేయండి',
    mandatoryNotice: 'అన్ని 5 వివరాలు తప్పనిసరి',
    patientName: 'రోగి పూర్తి పేరు',
    phoneNumber: 'ఫోన్ నంబర్',
    age: 'వయస్సు',
    gender: 'లింగం',
    symptoms: 'సమస్య లేదా లక్షణాలు',
    designatedDept: 'కేటాయించిన విభాగం',
    regionalNoticeTitle: 'మీ ప్రాంతీయ భాషలో స్వయంచాలక హెచ్చరిక',
    testCallBtn: '10 మంది దూరం వాయిస్ కాల్ టెస్ట్',
    resetQueue: 'క్యూ రీసెట్ చేయండి',
    copyLink: 'లైవ్ లింక్ కాపీ చేయండి',
    inLine: 'వేచి ఉన్న రోగులు',
    nowServingRoom: 'డాక్టర్ సంప్రదింపుల్లో ఉన్నారు'
  },
  ta: {
    appName: 'சுவாஸ்தியடோக்கன்',
    appTagline: 'மருத்துவமனை ஸ்மார்ட் வாய்ஸ் டோக்கன் & நேரலை கண்காணிப்பு',
    patientKiosk: 'நோயாளி டோக்கன் மையம்',
    liveTracking: 'நேரலை கண்காணிப்பு',
    doctorDesk: 'மருத்துவர் மேசை',
    waitingHallTv: 'காத்திருப்பு அறை டிவி',
    notifications: 'தானியங்கி அழைப்பு & SMS',
    highContrast: 'உயர் மாறுபாடு முறை',
    highContrastOn: 'உயர் மாறுபாடு: ஆன்',
    highContrastOff: 'உயர் மாறுபாடு: ஆஃப்',
    selectLanguage: 'மொழியை மாற்றுக',
    nowServing: 'தற்போதைய டோக்கன்',
    yourToken: 'உங்கள் டோக்கன் எண்',
    peopleAway: 'நபர்கள் தள்ளி உள்ளனர்',
    estWaitTime: 'மதிப்பிடப்பட்ட காத்திருப்பு நேரம்',
    generateTokenBtn: 'டோக்கன் பெற்று நேரலை கண்காணிப்பை தொடங்கவும்',
    simulateCall: 'குரல் அழைப்பு சோதனை',
    simulateSms: 'SMS சோதனை',
    mandatoryNotice: 'அனைத்து 5 விவரங்களும் கட்டாயமாகும்',
    patientName: 'நோயாளி பெயர்',
    phoneNumber: 'தொலைபேசி எண்',
    age: 'வயது',
    gender: 'பாலினம்',
    symptoms: 'பிரச்சனை அல்லது அறிகுறிகள்',
    designatedDept: 'நியமிக்கப்பட்ட துறை',
    regionalNoticeTitle: 'உங்கள் பிராந்திய மொழியில் தானியங்கி எச்சரிக்கை',
    testCallBtn: '10 பேர் தள்ளி குரல் அழைப்பு சோதனை',
    resetQueue: 'வரிசையை மீட்டமை',
    copyLink: 'இணைப்பை நகலெடு',
    inLine: 'காத்திருக்கும் நோயாளிகள்',
    nowServingRoom: 'மருத்துவர் ஆலோசனையில் உள்ளது'
  },
  kn: {
    appName: 'ಸ್ವಾಸ್ಥ್ಯಟೋಕನ್',
    appTagline: 'ಆಸ್ಪತ್ರೆ ಸ್ಮಾರ್ಟ್ ಧ್ವನಿ ಟೋಕನ್ ಮತ್ತು ಲೈವ್ ಟ್ರ್ಯಾಕಿಂಗ್',
    patientKiosk: 'ರೋಗಿ ಟೋಕನ್ ಕಿಯೋಸ್ಕ್',
    liveTracking: 'ಲೈವ್ ಟ್ರ್ಯಾಕಿಂಗ್',
    doctorDesk: 'ವೈದ್ಯರ ಕನ್ಸಲ್ಟೇಶನ್ ಡೆಸ್ಕ್',
    waitingHallTv: 'ಕಾಯುವ ಹಾಲ್ ಟಿವಿ',
    notifications: 'ಸ್ವಯಂಚಾಲಿತ ಕರೆ ಮತ್ತು SMS',
    highContrast: 'ಹೈ ಕಾಂಟ್ರಾಸ್ಟ್ ಮೋಡ್',
    highContrastOn: 'ಹೈ ಕಾಂಟ್ರಾಸ್ಟ್: ಆನ್',
    highContrastOff: 'ಹೈ ಕಾಂಟ್ರಾಸ್ಟ್: ಆಫ್',
    selectLanguage: 'ಭಾಷೆ ಬದಲಾಯಿಸಿ',
    nowServing: 'ಪ್ರಸ್ತುತ ಚಾಲನೆಯಲ್ಲಿರುವ ಟೋಕನ್',
    yourToken: 'ನಿಮ್ಮ ಟೋಕನ್ ಸಂಖ್ಯೆ',
    peopleAway: 'ಜನರು ದೂರದಲ್ಲಿದ್ದಾರೆ',
    estWaitTime: 'ಅಂದಾಜು ಕಾಯುವ ಸಮಯ',
    generateTokenBtn: 'ಆಟೋ-ಟೋಕನ್ ರಚಿಸಿ ಲೈವ್ ಟ್ರ್ಯಾಕಿಂಗ್ ಪ್ರಾರಂಭಿಸಿ',
    simulateCall: 'ಧ್ವನಿ ಕರೆ ಪರೀಕ್ಷಿಸಿ',
    simulateSms: 'SMS ಪರೀಕ್ಷಿಸಿ',
    mandatoryNotice: 'ಎಲ್ಲಾ 5 ವಿವರಗಳು ಕಡ್ಡಾಯ',
    patientName: 'ರೋಗಿಯ ಪೂರ್ಣ ಹೆಸರು',
    phoneNumber: 'ದೂರವಾಣಿ ಸಂಖ್ಯೆ',
    age: 'ವಯಸ್ಸು',
    gender: 'ಲಿಂಗ',
    symptoms: 'ಸಮಸ್ಯೆ ಅಥವಾ ಲಕ್ಷಣಗಳು',
    designatedDept: 'ನಿಗದಿತ ವಿಭಾಗ',
    regionalNoticeTitle: 'ನಿಮ್ಮ ಪ್ರಾದೇಶಿಕ ಭಾಷೆಯಲ್ಲಿ ಸ್ವಯಂಚಾಲಿತ ಎಚ್ಚರಿಕೆ',
    testCallBtn: '10 ಜನರ ದೂರ ಧ್ವನಿ ಕರೆ ಪರೀಕ್ಷೆ',
    resetQueue: 'ಕ್ಯೂ ಮರುಹೊಂದಿಸಿ',
    copyLink: 'ಲೈವ್ ಲಿಂಕ್ ನಕಲಿಸಿ',
    inLine: 'ಕಾಯುತ್ತಿರುವ ರೋಗಿಗಳು',
    nowServingRoom: 'ವೈದ್ಯರ ಸಮಾಲೋಚನೆಯಲ್ಲಿದ್ದಾರೆ'
  },
  ml: {
    appName: 'സ്വാസ്ഥ്യടോക്കൺ',
    appTagline: 'ആശുപത്രി സ്മാർട്ട് വോയ്‌സ് ടോക്കൺ & ലൈവ് ട്രാക്കിംഗ്',
    patientKiosk: 'പേഷ്യന്റ് ടോക്കൺ കിയോസ്ക്',
    liveTracking: 'ലൈവ് ട്രാക്കിംഗ്',
    doctorDesk: 'ഡോക്ടർ ഡെസ്ക്',
    waitingHallTv: 'വെയ്റ്റിംഗ് ഹാൾ ടിവി',
    notifications: 'ഓട്ടോമേറ്റഡ് കോൾ & SMS',
    highContrast: 'ഹൈ കോൺട്രാസ്റ്റ് മോഡ്',
    highContrastOn: 'ഹൈ കോൺട്രാസ്റ്റ്: ഓൺ',
    highContrastOff: 'ഹൈ കോൺട്രാസ്റ്റ്: ഓഫ്',
    selectLanguage: 'ഭാഷ മാറ്റുക',
    nowServing: 'നിലവിലെ ടോക്കൺ',
    yourToken: 'നിങ്ങളുടെ ടോക്കൺ നമ്പർ',
    peopleAway: 'ആളുകൾ അകലെയാണ്',
    estWaitTime: 'പ്രതീക്ഷിക്കുന്ന സമയം',
    generateTokenBtn: 'ടോക്കൺ സൃഷ്ടിച്ച് ട്രാക്കിംഗ് ആരംഭിക്കുക',
    simulateCall: 'വോയ്‌സ് കോൾ പരിശോധിക്കുക',
    simulateSms: 'SMS പരിശോധിക്കുക',
    mandatoryNotice: '5 ഫീൽഡുകളും നിർബന്ധമാണ്',
    patientName: 'രോഗിയുടെ പേര്',
    phoneNumber: 'ഫോൺ നമ്പർ',
    age: 'പ്രായം',
    gender: 'ലിംഗഭേദം',
    symptoms: 'രോഗലക്ഷണങ്ങൾ',
    designatedDept: 'നിശ്ചിത വിഭാഗം',
    regionalNoticeTitle: 'പ്രാദേശിക ഭാഷയിലെ അറിയിപ്പ്',
    testCallBtn: '10 ആളുകൾ അകലെ കോൾ പരിശോധന',
    resetQueue: 'ക്യൂ പുനഃക്രമീകരിക്കുക',
    copyLink: 'ലിങ്ക് പകർത്തുക',
    inLine: 'കാത്തിരിക്കുന്ന രോഗികൾ',
    nowServingRoom: 'കൺസൾട്ടേഷനിൽ'
  },
  mr: {
    appName: 'स्वास्थ्यटोकन',
    appTagline: 'रुग्णालय स्मार्ट व्हॉइस टोकन आणि लाईव्ह ट्रॅकिंग',
    patientKiosk: 'रुग्ण टोकन किऑस्क',
    liveTracking: 'लाईव्ह ट्रॅकिंग',
    doctorDesk: 'डॉक्टर कन्सल्टेशन डेस्क',
    waitingHallTv: 'प्रतीक्षा कक्ष टीव्ही',
    notifications: 'स्वयंचलित कॉल्स व SMS',
    highContrast: 'हाय कॉन्ट्रास्ट मोड',
    highContrastOn: 'हाय कॉन्ट्रास्ट: चालू',
    highContrastOff: 'हाय कॉन्ट्रास्ट: बंद',
    selectLanguage: 'भाषा बदला',
    nowServing: 'सध्याचा चालू टोकन',
    yourToken: 'तुमचा टोकन क्रमांक',
    peopleAway: 'व्यक्ती दूर आहेत',
    estWaitTime: 'अंदाजे प्रतीक्षा वेळ',
    generateTokenBtn: 'ऑटो-टोकन तयार करा व ट्रॅकिंग सुरू करा',
    simulateCall: 'व्हॉइस कॉल तपासा',
    simulateSms: 'SMS तपासा',
    mandatoryNotice: 'सर्व ५ माहिती भरणे अनिवार्य आहे',
    patientName: 'रुग्णाचे पूर्ण नाव',
    phoneNumber: 'फोन नंबर',
    age: 'वय',
    gender: 'लिंग',
    symptoms: 'त्रास किंवा लक्षणे',
    designatedDept: 'नियुक्त विभाग',
    regionalNoticeTitle: 'तुमच्या प्रादेशिक भाषेत स्वयंचलित सूचना',
    testCallBtn: '१० लोक दूर कॉल तपासा',
    resetQueue: 'रांग पूर्ववत करा',
    copyLink: 'लाईव्ह लिंक कॉपी करा',
    inLine: 'प्रतीक्षेत असलेले रुग्ण',
    nowServingRoom: 'सध्या तपासणी सुरू आहे'
  },
  bn: {
    appName: 'স্বাস্থ্যটোকেন',
    appTagline: 'হাসপাতাল স্মার্ট ভয়েস টোকেন এবং লাইভ ট্র্যাকিং',
    patientKiosk: 'রোগী টোকেন কিয়স্ক',
    liveTracking: 'লাইভ ট্র্যাকিং',
    doctorDesk: 'ডাক্তার ডেস্ক',
    waitingHallTv: 'ওয়েটিং হল টিভি',
    notifications: 'স্বয়ংক্রিয় কল ও SMS',
    highContrast: 'হাই কন্ট্রাস্ট মোড',
    highContrastOn: 'হাই কন্ট্রাস্ট: চালু',
    highContrastOff: 'হাই কন্ট্রাস্ট: বন্ধ',
    selectLanguage: 'ভাষা পরিবর্তন করুন',
    nowServing: 'বর্তমান টোকেন',
    yourToken: 'আপনার টোকেন নম্বর',
    peopleAway: 'জন দূরে আছেন',
    estWaitTime: 'আনুমানিক অপেক্ষার সময়',
    generateTokenBtn: 'টোকেন তৈরি করুন ও লাইভ ট্র্যাকিং শুরু করুন',
    simulateCall: 'ভয়েস কল পরীক্ষা করুন',
    simulateSms: 'SMS পরীক্ষা করুন',
    mandatoryNotice: 'সব ৫টি তথ্য বাধ্যতামূলক',
    patientName: 'রোগীর পুরো নাম',
    phoneNumber: 'ফোন নম্বর',
    age: 'বয়স',
    gender: 'লিঙ্গ',
    symptoms: 'সমস্যা বা উপসর্গ',
    designatedDept: 'নির্ধারিত বিভাগ',
    regionalNoticeTitle: 'আপনার আঞ্চলিক ভাষায় স্বয়ংক্রিয় সতর্কতা',
    testCallBtn: '১০ জন দূরে ভয়েস কল পরীক্ষা',
    resetQueue: 'কিউ রিসেট করুন',
    copyLink: 'লাইভ লিংক কপি করুন',
    inLine: 'অপেক্ষমাণ রোগী',
    nowServingRoom: 'ডাক্তারের পরামর্শে আছেন'
  },
  gu: {
    appName: 'સ્વાસ્થ્યટોકન',
    appTagline: 'હોસ્પિટલ સ્માર્ટ વોઈસ ટોકન અને લાઈવ ટ્રેકિંગ',
    patientKiosk: 'દર્દી ટોકન કિયોસ્ક',
    liveTracking: 'લાઈવ ટ્રેકિંગ',
    doctorDesk: 'ડૉક્ટર ડેસ્ક',
    waitingHallTv: 'પ્રતીક્ષા કક્ષ ટીવી',
    notifications: 'સ્વચાલિત કૉલ્સ અને SMS',
    highContrast: 'હાઈ કોન્ટ્રાસ્ટ મોડ',
    highContrastOn: 'હાઈ કોન્ટ્રાસ્ટ: ચાલુ',
    highContrastOff: 'હાઈ કોન્ટ્રાસ્ટ: બંધ',
    selectLanguage: 'ભાષા બદલો',
    nowServing: 'વર્તમાન ટોકન નંબર',
    yourToken: 'તમારો ટોકન નંબર',
    peopleAway: 'લોકો આગળ છે',
    estWaitTime: 'અંદાજિત રાહ જોવાનો સમય',
    generateTokenBtn: 'ટોકન બનાવો અને લાઈવ ટ્રેકિંગ શરૂ કરો',
    simulateCall: 'વોઈસ કૉલ ટેસ્ટ કરો',
    simulateSms: 'SMS ટેસ્ટ કરો',
    mandatoryNotice: 'તમામ ૫ વિગતો ફરજિયાત છે',
    patientName: 'દર્દીનું પૂરું નામ',
    phoneNumber: 'ફોન નંબર',
    age: 'ઉંમર',
    gender: 'જાતિ',
    symptoms: 'સમસ્યા અથવા લક્ષણો',
    designatedDept: 'નિયુક્ત વિભાગ',
    regionalNoticeTitle: 'તમારી પ્રાદેશિક ભાષામાં સ્વચાલિત ચેતવણી',
    testCallBtn: '૧૦ લોકો દૂર કૉલ ટેસ્ટ',
    resetQueue: 'કતાર રીસેટ કરો',
    copyLink: 'લાઈવ લિંક કોપી કરો',
    inLine: 'રાહ જોતા દર્દીઓ',
    nowServingRoom: 'ડૉક્ટર પરામર્શમાં છે'
  },
  pa: {
    appName: 'ਸਵਾਸਥਟੋਕਨ',
    appTagline: 'ਹਸਪਤਾਲ ਸਮਾਰਟ ਵੌਇਸ ਟੋਕਨ ਅਤੇ ਲਾਈਵ ਟਰੈਕਿੰਗ',
    patientKiosk: 'ਮਰੀਜ਼ ਟੋਕਨ ਕਿਓਸਕ',
    liveTracking: 'ਲਾਈਵ ਟਰੈਕਿੰਗ',
    doctorDesk: 'ਡਾਕਟਰ ਡੈਸਕ',
    waitingHallTv: 'ਵੇਟਿੰਗ ਹਾਲ ਟੀਵੀ',
    notifications: 'ਸਵੈਚਾਲਤ ਕਾਲਾਂ ਅਤੇ SMS',
    highContrast: 'ਹਾਈ ਕੰਟਰਾਸਟ ਮੋਡ',
    highContrastOn: 'ਹਾਈ ਕੰਟਰਾਸਟ: ਚਾਲੂ',
    highContrastOff: 'ਹਾਈ ਕੰਟਰਾਸਟ: ਬੰਦ',
    selectLanguage: 'ਭਾਸ਼ਾ ਬਦਲੋ',
    nowServing: 'ਮੌਜੂਦਾ ਚੱਲ ਰਿਹਾ ਟੋਕਨ',
    yourToken: 'ਤੁਹਾਡਾ ਟੋਕਨ ਨੰਬਰ',
    peopleAway: 'ਲੋਕ ਦੂਰ ਹਨ',
    estWaitTime: 'ਅਨੁਮਾਨਿਤ ਇੰਤਜ਼ਾਰ ਦਾ ਸਮਾਂ',
    generateTokenBtn: 'ਟੋਕਨ ਤਿਆਰ ਕਰੋ ਅਤੇ ਲਾਈਵ ਟਰੈਕਿੰਗ ਸ਼ੁਰੂ ਕਰੋ',
    simulateCall: 'ਵੌਇਸ ਕਾਲ ਦੀ ਜਾਂਚ ਕਰੋ',
    simulateSms: 'SMS ਦੀ ਜਾਂਚ ਕਰੋ',
    mandatoryNotice: 'ਸਾਰੇ 5 ਵੇਰਵੇ ਲਾਜ਼ਮੀ ਹਨ',
    patientName: 'ਮਰੀਜ਼ ਦਾ ਪੂਰਾ ਨਾਮ',
    phoneNumber: 'ਫ਼ੋਨ ਨੰਬਰ',
    age: 'ਉਮਰ',
    gender: 'ਲਿੰਗ',
    symptoms: 'ਸਮੱਸਿਆ ਜਾਂ ਲੱਛਣ',
    designatedDept: 'ਨਿਰਧਾਰਤ ਵਿਭਾਗ',
    regionalNoticeTitle: 'ਤੁਹਾਡੀ ਖੇਤਰੀ ਭਾਸ਼ਾ ਵਿੱਚ ਸਵੈਚਾਲਤ ਚੇਤਾਵਨੀ',
    testCallBtn: '10 ਲੋਕ ਦੂਰ ਕਾਲ ਟੈਸਟ',
    resetQueue: 'ਕਤਾਰ ਰੀਸੈਟ ਕਰੋ',
    copyLink: 'ਲਾਈਵ ਲਿੰਕ ਕਾਪੀ ਕਰੋ',
    inLine: 'ਉਡੀਕ ਰਹੇ ਮਰੀਜ਼',
    nowServingRoom: 'ਡਾਕਟਰੀ ਸਲਾਹ ਵਿੱਚ ਹਨ'
  }
};

export function getUIText(lang: RegionalLanguage, key: string): string {
  const dict = UI_TRANSLATIONS[lang] || UI_TRANSLATIONS.en;
  return dict[key] || UI_TRANSLATIONS.en[key] || key;
}
