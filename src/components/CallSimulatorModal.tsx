import React, { useState, useEffect, useRef } from 'react';
import { useHospital } from '../context/HospitalContext';
import { PhoneRingtone, speakRegionalText, stopSpeech } from '../utils/audio';
import { getLanguageMeta } from '../utils/languages';
import { Phone, PhoneOff, Volume2, Mic, Clock, ShieldCheck, MapPin, User } from 'lucide-react';

export const CallSimulatorModal: React.FC = () => {
  const { incomingCall, closeIncomingCall, highContrastMode } = useHospital();
  const [callState, setCallState] = useState<'RINGING' | 'CONNECTED' | 'ENDED'>('RINGING');
  const [duration, setDuration] = useState<number>(0);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const ringtoneRef = useRef<PhoneRingtone | null>(null);

  useEffect(() => {
    if (incomingCall?.isOpen) {
      setCallState('RINGING');
      setDuration(0);

      // Start phone ringtone
      const ringtone = new PhoneRingtone();
      ringtoneRef.current = ringtone;
      ringtone.start();

      return () => {
        ringtone.stop();
        stopSpeech();
      };
    }
  }, [incomingCall?.isOpen]);

  // Duration timer when connected
  useEffect(() => {
    let timer: number;
    if (callState === 'CONNECTED') {
      timer = window.setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [callState]);

  if (!incomingCall || !incomingCall.isOpen || !incomingCall.token) {
    return null;
  }

  const { token, message, language, peopleAway, currentToken } = incomingCall;
  const langMeta = getLanguageMeta(language);

  const handleAnswer = () => {
    if (ringtoneRef.current) {
      ringtoneRef.current.stop();
    }
    setCallState('CONNECTED');

    // Automatically speak the regional message
    playSpeech();
  };

  const playSpeech = () => {
    setIsSpeaking(true);
    speakRegionalText(
      message,
      langMeta.speechCode,
      () => setIsSpeaking(true),
      () => setIsSpeaking(false)
    );
  };

  const handleDeclineOrEnd = () => {
    if (ringtoneRef.current) {
      ringtoneRef.current.stop();
    }
    stopSpeech();
    setCallState('ENDED');
    setTimeout(() => {
      closeIncomingCall();
    }, 700);
  };

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in">
      {/* Smartphone mockup container */}
      <div className="w-full max-w-sm bg-slate-900 text-white rounded-3xl shadow-2xl border-4 border-slate-700 overflow-hidden flex flex-col relative transition-all">
        
        {/* Phone Top Notch / Speaker bar */}
        <div className="pt-3 pb-2 px-6 flex items-center justify-between text-xs text-slate-400 border-b border-slate-800/80">
          <span className="font-mono">OPD HOTLINE</span>
          <div className="w-16 h-4 bg-slate-800 rounded-full flex items-center justify-center">
            <div className="w-8 h-1 bg-slate-600 rounded-full"></div>
          </div>
          <span className="font-mono">AUTOMATED IVR</span>
        </div>

        {/* Call Status Header */}
        <div className="p-6 text-center flex-1 flex flex-col items-center justify-center space-y-4">
          
          {/* Animated Avatar / Radar */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/30">
              <Phone className={`w-10 h-10 ${callState === 'RINGING' ? 'animate-bounce' : ''}`} />
            </div>
            {callState === 'RINGING' && (
              <>
                <div className="absolute inset-0 rounded-full border border-emerald-400/60 animate-ping"></div>
                <div className="absolute -inset-3 rounded-full border border-emerald-400/30 animate-pulse"></div>
              </>
            )}
          </div>

          <div>
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-2 border ${
              highContrastMode ? 'bg-black text-yellow-400 border-yellow-400' : 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
            }`}>
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Hospital Automated Desk
            </div>
            <h3 className={`text-xl font-black tracking-tight ${highContrastMode ? 'text-yellow-400' : 'text-white'}`}>
              SwasthyaToken
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Hospital Smart Voice Token & Live Tracking</p>
            <p className={`text-xs font-mono mt-1 ${highContrastMode ? 'text-yellow-400 font-bold' : 'text-emerald-400'}`}>
              +91 80 4000 1200
            </p>
          </div>

          {/* Caller Details Card */}
          <div className="w-full bg-slate-800/80 border border-slate-700 rounded-xl p-3.5 text-left text-xs space-y-1.5">
            <div className="flex justify-between items-center text-slate-300">
              <span className="flex items-center gap-1 text-slate-400">
                <User className="w-3.5 h-3.5" /> Patient:
              </span>
              <span className="font-semibold text-white">{token.patientName}</span>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span className="flex items-center gap-1 text-slate-400">
                <MapPin className="w-3.5 h-3.5" /> Dept & Room:
              </span>
              <span className="font-semibold text-sky-400">{token.departmentName} ({token.roomNumber})</span>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span className="text-slate-400">Your Token:</span>
              <span className="font-mono font-bold text-amber-300 text-sm">{token.formattedToken}</span>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span className="text-slate-400">Current Serving:</span>
              <span className="font-mono font-bold text-emerald-300 text-sm">{currentToken}</span>
            </div>
            <div className="flex justify-between items-center pt-1 border-t border-slate-700/60">
              <span className="text-slate-400">Regional Audio:</span>
              <span className="px-2 py-0.5 rounded bg-slate-700 text-slate-200 font-medium text-[11px]">
                {langMeta.flag} {langMeta.nativeName} ({langMeta.name})
              </span>
            </div>
          </div>

          {/* State message */}
          {callState === 'RINGING' && (
            <div className="text-center">
              <p className="text-sm font-semibold text-emerald-400 animate-pulse">Incoming Automated Voice Call...</p>
              <p className="text-xs text-slate-400 mt-1">
                Queue Alert: <strong className="text-amber-300">{peopleAway} people away</strong>
              </p>
            </div>
          )}

          {callState === 'CONNECTED' && (
            <div className="w-full space-y-3">
              <div className="flex items-center justify-center gap-2 text-xs font-mono text-emerald-400">
                <Clock className="w-3.5 h-3.5" />
                <span>Call Connected • {formatTimer(duration)}</span>
              </div>

              {/* Sound visualizer wave */}
              <div className="flex items-center justify-center gap-1.5 h-6">
                {[40, 75, 90, 50, 85, 95, 60, 80, 45].map((h, i) => (
                  <div
                    key={i}
                    className={`w-1 rounded-full bg-emerald-400 transition-all duration-300 ${
                      isSpeaking ? 'animate-pulse' : 'opacity-40'
                    }`}
                    style={{
                      height: isSpeaking ? `${h}%` : '20%',
                      animationDelay: `${i * 100}ms`
                    }}
                  />
                ))}
              </div>

              {/* Live Transcript Box */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3 text-left">
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <Mic className="w-3 h-3" /> Voice Announcement ({langMeta.nativeName})
                  </span>
                  <button
                    onClick={playSpeech}
                    className="text-sky-400 hover:text-sky-300 flex items-center gap-1 text-[11px] font-semibold cursor-pointer"
                  >
                    <Volume2 className="w-3 h-3" /> Replay
                  </button>
                </div>
                <p className="text-xs leading-relaxed text-slate-200 font-sans">
                  "{message}"
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Call Action Buttons */}
        <div className="p-6 bg-slate-950 border-t border-slate-800">
          {callState === 'RINGING' ? (
            <div className="flex items-center justify-around">
              {/* Decline button */}
              <div className="flex flex-col items-center gap-1.5">
                <button
                  onClick={handleDeclineOrEnd}
                  className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-900/50 cursor-pointer active:scale-95 transition-all"
                  title="Decline"
                >
                  <PhoneOff className="w-7 h-7" />
                </button>
                <span className="text-[11px] text-slate-400 font-medium">Decline</span>
              </div>

              {/* Answer button */}
              <div className="flex flex-col items-center gap-1.5">
                <button
                  onClick={handleAnswer}
                  className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white flex items-center justify-center shadow-lg shadow-emerald-900/50 cursor-pointer active:scale-95 transition-all animate-bounce"
                  title="Answer Call"
                >
                  <Phone className="w-7 h-7" />
                </button>
                <span className="text-[11px] text-emerald-400 font-semibold">Answer & Listen</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <div className="flex flex-col items-center gap-1.5">
                <button
                  onClick={handleDeclineOrEnd}
                  className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-900/50 cursor-pointer active:scale-95 transition-all"
                  title="Hang Up"
                >
                  <PhoneOff className="w-7 h-7" />
                </button>
                <span className="text-[11px] text-rose-400 font-medium">End Call</span>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
