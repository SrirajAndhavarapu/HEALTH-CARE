import React, { useState, useEffect } from 'react';
import { useHospital } from '../context/HospitalContext';
import { DEPARTMENTS } from '../data/departments';
import { playHospitalChime } from '../utils/audio';
import { Tv, Volume2, Maximize, Clock, AlertCircle, Sparkles } from 'lucide-react';

export const WaitingHallDisplay: React.FC = () => {
  const { currentServingTokens, tokens, highContrastMode } = useHospital();
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* TV Display Board Container */}
      <div className={`text-white rounded-3xl shadow-2xl border-4 overflow-hidden ${
        highContrastMode ? 'bg-black border-yellow-400' : 'bg-slate-950 border-slate-800'
      }`}>
        
        {/* Header Bar */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${
          highContrastMode ? 'bg-neutral-900 border-yellow-400' : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg ${
              highContrastMode ? 'bg-yellow-400 text-black border-2 border-white' : 'bg-emerald-600 text-white shadow-emerald-600/40'
            }`}>
              <Tv className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                <span className={highContrastMode ? 'text-yellow-400' : ''}>SWASTHYATOKEN OPD DISPLAY</span>
                <span className={`text-xs px-2 py-0.5 rounded font-black border ${
                  highContrastMode ? 'bg-black text-yellow-400 border-yellow-400' : 'bg-emerald-900/60 text-emerald-300 border-emerald-700'
                }`}>
                  PUBLIC TV MODE
                </span>
              </h1>
              <p className="text-xs text-slate-400">Hospital Smart Voice Token & Live Queue Calling Board</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={playHospitalChime}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
              title="Test Hospital Chime Sound"
            >
              <Volume2 className="w-4 h-4 text-emerald-400" />
              <span>Chime</span>
            </button>

            <button
              onClick={toggleFullscreen}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
            >
              <Maximize className="w-4 h-4" />
              <span>{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen TV'}</span>
            </button>

            <div className="text-right">
              <div className="text-base font-mono font-bold text-emerald-400">{currentTime}</div>
              <div className="text-[10px] text-slate-400">Live Hospital Server Time</div>
            </div>
          </div>
        </div>

        {/* Big Department Boards Grid */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {DEPARTMENTS.slice(0, 6).map(dept => {
            const servingNum = currentServingTokens[dept.id] || 1;
            const servingFormatted = `${dept.code}-${String(servingNum).padStart(3, '0')}`;
            const activePatient = tokens.find(t => t.departmentId === dept.id && t.tokenNumber === servingNum);
            
            // Next up
            const nextPatient = tokens.find(t => t.departmentId === dept.id && t.tokenNumber === servingNum + 1);

            return (
              <div
                key={dept.id}
                className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 flex flex-col justify-between relative overflow-hidden group hover:border-emerald-500/50 transition-all shadow-lg"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-base text-white tracking-wide">{dept.name}</h3>
                    <p className="text-xs text-slate-400">{dept.doctorName}</p>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-emerald-400 font-mono font-bold border border-slate-700">
                    {dept.roomNumber}
                  </span>
                </div>

                {/* Big Token Number */}
                <div className="my-6 text-center bg-slate-950/80 rounded-xl py-5 border border-slate-800/80">
                  <span className="text-[11px] uppercase tracking-widest text-slate-500 font-bold block mb-1">
                    NOW SERVING TOKEN
                  </span>
                  <div className="text-5xl font-black font-mono text-emerald-400 tracking-wider">
                    {servingFormatted}
                  </div>
                  {activePatient && (
                    <p className="text-xs font-medium text-slate-300 mt-2 truncate px-4">
                      {activePatient.patientName}
                    </p>
                  )}
                </div>

                {/* Next Up Info */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span>Next In Line:</span>
                  <span className="font-mono font-bold text-amber-300">
                    {nextPatient ? nextPatient.formattedToken : 'Queue Clear'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Hospital Marquee Notice */}
        <div className="bg-emerald-950/80 border-t border-emerald-900/60 px-6 py-3 flex items-center gap-3">
          <div className="px-2.5 py-1 rounded bg-emerald-800 text-white font-black text-xs shrink-0 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            NOTICE TO PATIENTS
          </div>
          <div className="overflow-hidden whitespace-nowrap text-xs text-emerald-200 font-medium">
            Keep your registered mobile phones active. You will receive an automated phone call & SMS in your regional language when your number is 10 people away. Open your live tracking link anytime.
          </div>
        </div>

      </div>

    </div>
  );
};
