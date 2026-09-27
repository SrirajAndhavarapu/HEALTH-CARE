import React, { useState } from 'react';
import { useHospital } from '../context/HospitalContext';
import { getLanguageMeta } from '../utils/languages';
import { speakRegionalText, stopSpeech } from '../utils/audio';
import { 
  MessageSquare, PhoneCall, Volume2, VolumeX, ShieldCheck, 
  Clock, Filter, Search, CheckCheck, RefreshCw, Trash2 
} from 'lucide-react';

export const NotificationHistoryView: React.FC = () => {
  const { notificationLogs } = useHospital();
  const [filterChannel, setFilterChannel] = useState<'ALL' | 'SMS' | 'VOICE_CALL'>('ALL');
  const [playingId, setPlayingId] = useState<string | null>(null);

  const filtered = notificationLogs.filter(log => {
    if (filterChannel === 'ALL') return true;
    return log.channel === filterChannel;
  });

  const handlePlayAudio = (id: string, text: string, speechCode: string) => {
    if (playingId === id) {
      stopSpeech();
      setPlayingId(null);
      return;
    }

    setPlayingId(id);
    speakRegionalText(
      text,
      speechCode,
      () => setPlayingId(id),
      () => setPlayingId(null)
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <PhoneCall className="w-5 h-5 text-emerald-600" />
            <span>Automated Call & SMS Dispatch Logs</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Real-time delivery log of automated regional voice calls and SMS alerts scheduled at 10-away thresholds.
          </p>
        </div>

        {/* Channel Filters */}
        <div className="flex items-center gap-2">
          {(['ALL', 'VOICE_CALL', 'SMS'] as const).map(ch => (
            <button
              key={ch}
              onClick={() => setFilterChannel(ch)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterChannel === ch
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {ch === 'ALL' ? 'All Dispatches' : ch === 'VOICE_CALL' ? 'Voice Calls' : 'SMS Messages'}
            </button>
          ))}
        </div>
      </div>

      {/* Logs Table / List */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No Dispatched Notifications Yet</p>
            <p className="text-xs text-slate-500 mt-0.5">
              Generate a patient token or simulate queue progression to trigger automated calls.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.map(log => {
              const langMeta = getLanguageMeta(log.language);
              const isPlaying = playingId === log.id;

              return (
                <div key={log.id} className="py-4 space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${
                        log.channel === 'VOICE_CALL' 
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                          : 'bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300'
                      }`}>
                        {log.channel === 'VOICE_CALL' ? <PhoneCall className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900 dark:text-white">
                            {log.patientName}
                          </span>
                          <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                            {log.tokenFormatted}
                          </span>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            {langMeta.flag} {langMeta.nativeName}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                          To: {log.phoneNumber} • Current Serving: {log.currentRunningToken} • {log.peopleAway} people away
                        </p>
                      </div>
                    </div>

                    {/* Right: Timestamp & Voice Playback */}
                    <div className="flex items-center gap-3 self-start sm:self-center">
                      <button
                        onClick={() => handlePlayAudio(log.id, log.message, langMeta.speechCode)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                          isPlaying
                            ? 'bg-rose-600 text-white animate-pulse'
                            : 'bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100'
                        }`}
                        title="Listen to regional voice announcement synthesis"
                      >
                        {isPlaying ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                        <span>{isPlaying ? 'Stop Audio' : 'Listen Call'}</span>
                      </button>

                      <div className="text-right text-[11px] text-slate-400">
                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                          <CheckCheck className="w-3.5 h-3.5" /> {log.status}
                        </span>
                        <div>{new Date(log.timestamp).toLocaleTimeString()}</div>
                      </div>
                    </div>

                  </div>

                  {/* Message transcript */}
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                    <p className="italic">"{log.message}"</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};
