import React, { useState, useEffect, useRef } from 'react';
import { useHospital } from '../context/HospitalContext';
import { speechManager } from '../utils/speechRecognition';
import { speakRegionalText, stopSpeech, playHospitalChime } from '../utils/audio';
import { getLanguageMeta, SUPPORTED_LANGUAGES, getUIText } from '../utils/languages';
import { 
  Mic, MicOff, Volume2, Sparkles, X, ChevronRight, 
  CheckCircle2, ArrowRight, Zap, Globe, MessageSquare, AlertCircle
} from 'lucide-react';
import { ActiveTab } from './Navbar';

interface VoiceCommandAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  setActiveTab: (tab: ActiveTab) => void;
}

export const VoiceCommandAssistant: React.FC<VoiceCommandAssistantProps> = ({
  isOpen,
  onClose,
  setActiveTab
}) => {
  const { 
    tokens, 
    currentServingTokens, 
    activeTrackingToken, 
    advanceQueueForDepartment, 
    setAppLanguage, 
    appLanguage,
    highContrastMode, 
    toggleHighContrastMode, 
    triggerSimulatedCall,
    generateToken 
  } = useHospital();

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [feedback, setFeedback] = useState('Tap the microphone or say a command...');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const langMeta = getLanguageMeta(appLanguage);

  // Suggested voice commands
  const suggestedCommands = [
    { text: 'What is current token?', label: 'Check Current Running Token' },
    { text: 'How many people away am I?', label: 'Check My Queue Position' },
    { text: 'Call next token', label: 'Doctor: Call Next Patient' },
    { text: 'Turn on high contrast', label: 'Enable High Contrast Mode' },
    { text: 'Switch to Hindi', label: 'Change to हिन्दी' },
    { text: 'Switch to Telugu', label: 'Change to తెలుగు' },
    { text: 'Switch to English', label: 'Change to English' },
    { text: 'Go to live tracking', label: 'Open Live Tracker' },
    { text: 'Simulate 10-away voice call', label: 'Test Hospital Phone Call' },
    { text: 'Book token for Ramesh age 45 fever', label: 'Auto-Register Patient' }
  ];

  useEffect(() => {
    if (isOpen) {
      startListening();
    } else {
      stopListening();
      stopSpeech();
    }
  }, [isOpen]);

  const speakFeedback = (text: string, speechCode = langMeta.speechCode) => {
    setIsSpeaking(true);
    speakRegionalText(
      text,
      speechCode,
      () => setIsSpeaking(true),
      () => setIsSpeaking(false)
    );
  };

  const processCommand = (cmd: string) => {
    const lower = cmd.toLowerCase().trim();
    const currentGen = currentServingTokens['gen-med'] || 14;
    const currentGenFormatted = `GEN-${String(currentGen).padStart(3, '0')}`;
    const myToken = activeTrackingToken || tokens[tokens.length - 1];

    // 1. Current token inquiry
    if (lower.includes('current token') || lower.includes('running token') || lower.includes('now serving') || lower.includes('token number')) {
      const reply = `The current running token in General Medicine is ${currentGenFormatted} at Room OPD-102.`;
      setFeedback(reply);
      speakFeedback(reply);
      return;
    }

    // 2. Patient queue status
    if (lower.includes('how many people away') || lower.includes('where is my token') || lower.includes('my token') || lower.includes('my queue') || lower.includes('status')) {
      if (myToken) {
        const away = Math.max(0, myToken.tokenNumber - currentGen);
        const reply = `Your token is ${myToken.formattedToken}. You are ${away} people away from your doctor consultation at ${myToken.departmentName}.`;
        setFeedback(reply);
        speakFeedback(reply);
        setActiveTab('tracking');
      } else {
        const reply = 'No active patient token found. Please register at the kiosk first.';
        setFeedback(reply);
        speakFeedback(reply);
        setActiveTab('kiosk');
      }
      return;
    }

    // 3. High contrast mode
    if (lower.includes('turn on high contrast') || lower.includes('enable high contrast') || (lower.includes('high contrast') && lower.includes('on'))) {
      if (!highContrastMode) toggleHighContrastMode();
      const reply = 'High contrast mode has been enabled for better visibility.';
      setFeedback(reply);
      speakFeedback(reply);
      return;
    }

    if (lower.includes('turn off high contrast') || lower.includes('disable high contrast') || (lower.includes('high contrast') && lower.includes('off'))) {
      if (highContrastMode) toggleHighContrastMode();
      const reply = 'High contrast mode has been turned off.';
      setFeedback(reply);
      speakFeedback(reply);
      return;
    }

    // 4. Regional Language switching
    if (lower.includes('hindi') || lower.includes('हिन्दी')) {
      setAppLanguage('hi');
      const reply = 'भाषा को हिन्दी में बदल दिया गया है।';
      setFeedback(reply);
      speakFeedback(reply, 'hi-IN');
      return;
    }

    if (lower.includes('telugu') || lower.includes('తెలుగు')) {
      setAppLanguage('te');
      const reply = 'భాష తెలుగులోకి మార్చబడింది.';
      setFeedback(reply);
      speakFeedback(reply, 'te-IN');
      return;
    }

    if (lower.includes('tamil') || lower.includes('தமிழ்')) {
      setAppLanguage('ta');
      const reply = 'மொழி தமிழுக்கு மாற்றப்பட்டது.';
      setFeedback(reply);
      speakFeedback(reply, 'ta-IN');
      return;
    }

    if (lower.includes('kannada') || lower.includes('ಕನ್ನಡ')) {
      setAppLanguage('kn');
      const reply = 'ಭಾಷೆಯನ್ನು ಕನ್ನಡಕ್ಕೆ ಬದಲಾಯಿಸಲಾಗಿದೆ.';
      setFeedback(reply);
      speakFeedback(reply, 'kn-IN');
      return;
    }

    if (lower.includes('malayalam') || lower.includes('മലയാളം')) {
      setAppLanguage('ml');
      const reply = 'ഭാഷ മലയാളത്തിലേക്ക് മാറ്റി.';
      setFeedback(reply);
      speakFeedback(reply, 'ml-IN');
      return;
    }

    if (lower.includes('marathi') || lower.includes('मराठी')) {
      setAppLanguage('mr');
      const reply = 'भाषा मराठीत बदलली आहे.';
      setFeedback(reply);
      speakFeedback(reply, 'mr-IN');
      return;
    }

    if (lower.includes('bengali') || lower.includes('বাংলা')) {
      setAppLanguage('bn');
      const reply = 'ভাষা বাংলায় পরিবর্তন করা হয়েছে।';
      setFeedback(reply);
      speakFeedback(reply, 'bn-IN');
      return;
    }

    if (lower.includes('gujarati') || lower.includes('ગુજરાતી')) {
      setAppLanguage('gu');
      const reply = 'ભાષા ગુજરાતીમાં બદલાઈ ગઈ છે.';
      setFeedback(reply);
      speakFeedback(reply, 'gu-IN');
      return;
    }

    if (lower.includes('punjabi') || lower.includes('ਪੰਜਾਬੀ')) {
      setAppLanguage('pa');
      const reply = 'ਭਾਸ਼ਾ ਪੰਜਾਬੀ ਵਿੱਚ ਬਦਲ ਦਿੱਤੀ ਗਈ ਹੈ।';
      setFeedback(reply);
      speakFeedback(reply, 'pa-IN');
      return;
    }

    if (lower.includes('english')) {
      setAppLanguage('en');
      const reply = 'Language switched to English.';
      setFeedback(reply);
      speakFeedback(reply, 'en-IN');
      return;
    }

    // 5. Doctor queue advance
    if (lower.includes('call next') || lower.includes('next patient') || lower.includes('next token')) {
      advanceQueueForDepartment('gen-med');
      playHospitalChime();
      const reply = `Calling next token in General Medicine. Current serving is now GEN-${String(currentGen + 1).padStart(3, '0')}.`;
      setFeedback(reply);
      speakFeedback(reply);
      setActiveTab('doctor');
      return;
    }

    // 6. Navigation
    if (lower.includes('kiosk') || lower.includes('register') || lower.includes('new token')) {
      setActiveTab('kiosk');
      const reply = 'Opening patient registration kiosk.';
      setFeedback(reply);
      speakFeedback(reply);
      return;
    }

    if (lower.includes('live track') || lower.includes('tracking') || lower.includes('tracker')) {
      setActiveTab('tracking');
      const reply = 'Navigating to dedicated live queue tracker.';
      setFeedback(reply);
      speakFeedback(reply);
      return;
    }

    if (lower.includes('doctor') || lower.includes('consultation desk')) {
      setActiveTab('doctor');
      const reply = 'Opening doctor consultation queue desk.';
      setFeedback(reply);
      speakFeedback(reply);
      return;
    }

    if (lower.includes('tv') || lower.includes('waiting hall') || lower.includes('display')) {
      setActiveTab('display');
      const reply = 'Opening public waiting hall TV board.';
      setFeedback(reply);
      speakFeedback(reply);
      return;
    }

    if (lower.includes('notification') || lower.includes('logs') || lower.includes('sms')) {
      setActiveTab('logs');
      const reply = 'Opening automated voice calls and SMS logs.';
      setFeedback(reply);
      speakFeedback(reply);
      return;
    }

    // 7. Simulate phone call
    if (lower.includes('call') || lower.includes('simulate') || lower.includes('phone')) {
      if (myToken) {
        triggerSimulatedCall(myToken);
        const reply = `Triggering automated voice call for ${myToken.patientName} in ${langMeta.name}.`;
        setFeedback(reply);
        speakFeedback(reply);
      }
      return;
    }

    // 8. Auto-booking patient by voice (e.g., "Book token for Rajesh age 45 fever")
    if (lower.includes('book token') || lower.includes('register patient')) {
      // Parse details if possible
      const newTok = generateToken({
        patientName: 'Voice Patient (Ramesh)',
        phoneNumber: '+91 98450 11999',
        age: 45,
        gender: 'Male',
        symptoms: 'Fever and bodily fatigue registered via voice command',
        departmentId: 'gen-med',
        language: appLanguage
      });
      const reply = `Token ${newTok.formattedToken} has been successfully generated for you via voice command!`;
      setFeedback(reply);
      speakFeedback(reply);
      setActiveTab('tracking');
      return;
    }

    // Default unrecognized
    const fallback = `I heard: "${cmd}". You can ask: "What is current token?", "Call next token", "Turn on high contrast", or "Switch to Hindi".`;
    setFeedback(fallback);
    speakFeedback(`I heard ${cmd}. Please try a recognized command like: What is current token.`);
  };

  const startListening = () => {
    setErrorMsg(null);
    setTranscript('');
    setFeedback('Listening for hospital voice command in ' + langMeta.name + '...');

    const started = speechManager.start(
      langMeta.speechCode,
      (res) => {
        setTranscript(res.transcript);
        if (res.isFinal) {
          setIsListening(false);
          processCommand(res.transcript);
        }
      },
      (err) => {
        console.warn('Speech error:', err);
        setIsListening(false);
        if (err.includes('not-allowed') || err.includes('permission')) {
          setErrorMsg('Microphone access blocked. Click any quick command below to execute by voice!');
        } else {
          setErrorMsg('Voice input paused. Tap microphone to speak or click a command below.');
        }
      },
      () => {
        setIsListening(false);
      }
    );

    setIsListening(started);
  };

  const stopListening = () => {
    speechManager.stop();
    setIsListening(false);
  };

  const handleManualCommandClick = (cmdText: string) => {
    setTranscript(cmdText);
    processCommand(cmdText);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className={`w-full max-w-lg rounded-3xl shadow-2xl border-2 overflow-hidden flex flex-col transition-all ${
        highContrastMode 
          ? 'bg-black border-yellow-400 text-white' 
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white'
      }`}>
        
        {/* Header */}
        <div className={`px-6 py-4 flex items-center justify-between border-b ${
          highContrastMode ? 'bg-neutral-900 border-yellow-400' : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold ${
              highContrastMode ? 'bg-yellow-400 text-black border border-white' : 'bg-white/20'
            }`}>
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider">
                <span>SwasthyaVoice</span>
                <span className={`px-2 py-0.2 rounded-full text-[10px] ${
                  highContrastMode ? 'bg-black text-yellow-400 border border-yellow-400' : 'bg-emerald-800 text-emerald-100'
                }`}>
                  ENABLED
                </span>
              </div>
              <p className="text-[11px] opacity-90">Hospital Voice Command & Accessibility Assistant</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
            title="Close Voice Assistant"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Listening Core Area */}
        <div className="p-6 text-center space-y-5">
          
          {/* Animated Big Mic Button */}
          <div className="relative inline-block my-2">
            <button
              onClick={isListening ? stopListening : startListening}
              className={`w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-xl cursor-pointer active:scale-95 border-4 ${
                isListening
                  ? highContrastMode
                    ? 'bg-yellow-400 text-black border-white ring-8 ring-yellow-400/40 animate-pulse'
                    : 'bg-rose-600 text-white border-rose-300 ring-8 ring-rose-500/30 animate-pulse'
                  : highContrastMode
                  ? 'bg-black text-yellow-400 border-yellow-400 hover:bg-neutral-900'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-400 ring-4 ring-emerald-500/20'
              }`}
              title={isListening ? 'Click to Stop Listening' : 'Click to Speak'}
            >
              {isListening ? <Mic className="w-10 h-10 animate-bounce" /> : <MicOff className="w-10 h-10" />}
            </button>

            {isListening && (
              <div className="absolute -inset-3 rounded-full border-2 border-emerald-400 animate-ping pointer-events-none"></div>
            )}
          </div>

          {/* Status badge */}
          <div>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
              isListening
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500 animate-pulse'
                : highContrastMode
                ? 'bg-neutral-900 text-yellow-400 border-yellow-400'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isListening ? 'bg-emerald-400 animate-ping' : 'bg-slate-400'}`} />
              {isListening ? `Listening (${langMeta.nativeName})... Speak now` : 'Microphone Ready • Click to Speak'}
            </span>
          </div>

          {/* Transcript / Result Box */}
          <div className={`p-4 rounded-2xl border text-left space-y-2 min-h-[90px] ${
            highContrastMode ? 'bg-neutral-900 border-yellow-400 text-white' : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700'
          }`}>
            <div className="flex items-center justify-between text-[11px] opacity-70 font-bold uppercase tracking-wider">
              <span>{transcript ? 'You said:' : 'Voice Assistant Response:'}</span>
              {isSpeaking && (
                <span className="flex items-center gap-1 text-emerald-400 font-bold animate-pulse">
                  <Volume2 className="w-3.5 h-3.5" /> Speaking Response
                </span>
              )}
            </div>

            {transcript && (
              <p className="text-base font-bold text-yellow-400 italic">
                "{transcript}"
              </p>
            )}

            <p className="text-sm font-semibold leading-relaxed">
              {feedback}
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-amber-500/10 border border-amber-500 rounded-xl text-amber-300 text-xs flex items-center gap-2 text-left">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Quick Voice Command Chips (Click to test anytime) */}
          <div className="text-left space-y-2 pt-2 border-t border-inherit">
            <div className="flex items-center justify-between text-xs font-bold opacity-80">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                Quick Voice Commands (Click to simulate speaking):
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
              {suggestedCommands.map((cmd, idx) => (
                <button
                  key={idx}
                  onClick={() => handleManualCommandClick(cmd.text)}
                  className={`p-2 rounded-xl text-left text-xs font-medium border flex items-center justify-between transition-colors cursor-pointer ${
                    highContrastMode
                      ? 'bg-neutral-900 border-yellow-400/50 hover:bg-black text-white hover:text-yellow-300'
                      : 'bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <div>
                    <div className="font-bold text-[11px] truncate">"{cmd.text}"</div>
                    <div className="text-[10px] opacity-70 truncate">{cmd.label}</div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-50" />
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className={`px-6 py-3 border-t flex items-center justify-between text-xs ${
          highContrastMode ? 'bg-neutral-900 border-yellow-400' : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
        }`}>
          <div className="flex items-center gap-1.5 text-[11px] opacity-80">
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span>Voice Language: <strong>{langMeta.flag} {langMeta.name}</strong></span>
          </div>

          <button
            onClick={onClose}
            className={`font-bold px-4 py-1.5 rounded-xl transition-all cursor-pointer border ${
              highContrastMode ? 'bg-yellow-400 text-black border-white' : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
            }`}
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
