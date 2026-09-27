import React, { useState } from 'react';
import { useHospital } from '../context/HospitalContext';
import { getLanguageMeta } from '../utils/languages';
import { MessageSquare, ExternalLink, Copy, Check, X, Shield, PhoneCall } from 'lucide-react';

export const SmsNotificationModal: React.FC = () => {
  const { smsPreview, closeSmsPreview, setActiveTrackingTokenId, triggerSimulatedCall, highContrastMode } = useHospital();
  const [copied, setCopied] = useState(false);

  if (!smsPreview || !smsPreview.isOpen || !smsPreview.token) {
    return null;
  }

  const { token, message, language } = smsPreview;
  const langMeta = getLanguageMeta(language);
  const liveTrackingUrl = `${window.location.origin}${window.location.pathname}?track=${token.trackingCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(liveTrackingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenLiveTracking = () => {
    setActiveTrackingTokenId(token.id);
    closeSmsPreview();
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 max-w-md w-full animate-slide-up">
      <div className={`border-2 rounded-2xl shadow-2xl overflow-hidden ${
        highContrastMode ? 'bg-black border-yellow-400 text-white' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
      }`}>
        
        {/* SMS Header */}
        <div className={`px-4 py-3 flex items-center justify-between border-b ${
          highContrastMode ? 'bg-neutral-900 border-yellow-400 text-yellow-400' : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              highContrastMode ? 'bg-yellow-400 text-black' : 'bg-white/20'
            }`}>
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider">
                <span>VM-SWASTHYA</span>
                <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] lowercase font-bold ${
                  highContrastMode ? 'bg-yellow-400 text-black' : 'bg-emerald-700/80'
                }`}>
                  <Shield className="w-2.5 h-2.5" /> verified
                </span>
              </div>
              <p className="text-[11px] opacity-90">SwasthyaToken Dispatch • Just now</p>
            </div>
          </div>
          <button
            onClick={closeSmsPreview}
            className="p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* SMS Body */}
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between text-xs opacity-80">
            <span>To: <strong>{token.phoneNumber}</strong> ({token.patientName})</span>
            <span className="px-2 py-0.5 rounded bg-neutral-800 text-yellow-400 font-bold text-[11px]">
              {langMeta.flag} {langMeta.nativeName}
            </span>
          </div>

          <div className={`p-3.5 rounded-xl border text-xs sm:text-sm leading-relaxed font-sans ${
            highContrastMode ? 'bg-neutral-900 border-yellow-400 text-white' : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
          }`}>
            <p className="font-bold text-yellow-400 mb-1.5">
              [SwasthyaToken - Queue Alert]
            </p>
            <p className="mb-2.5 font-normal">
              {message}
            </p>
            
            <div className="pt-2 border-t border-inherit text-xs font-mono break-all flex items-center gap-1.5 text-sky-400">
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              <span>Dedicated Live Tracking: {liveTrackingUrl}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleOpenLiveTracking}
              className={`flex-1 text-xs font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer border ${
                highContrastMode ? 'bg-yellow-400 text-black border-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              View Live Tracker
            </button>

            <button
              onClick={() => triggerSimulatedCall(token)}
              className={`text-xs font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer border ${
                highContrastMode ? 'bg-black text-yellow-400 border-yellow-400' : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
              }`}
              title="Test Voice Call in Regional Language"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              Call Me
            </button>

            <button
              onClick={handleCopyLink}
              className={`text-xs font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer border ${
                highContrastMode ? 'bg-black text-yellow-400 border-yellow-400' : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
              }`}
              title="Copy Live Link"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Link'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
