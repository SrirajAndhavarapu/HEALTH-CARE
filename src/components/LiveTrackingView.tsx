import React, { useState } from 'react';
import { useHospital } from '../context/HospitalContext';
import { SUPPORTED_LANGUAGES, getLanguageMeta, generateAutomatedMessage, getUIText } from '../utils/languages';
import { getDepartmentById } from '../data/departments';
import { 
  Activity, Clock, MapPin, User, Stethoscope, Share2, Copy, Check, 
  PhoneCall, Volume2, ShieldCheck, AlertTriangle, ArrowRight, RefreshCw,
  QrCode, ExternalLink, MessageSquare, Globe, Sparkles
} from 'lucide-react';

export const LiveTrackingView: React.FC<{ onNavigateToKiosk: () => void }> = ({ onNavigateToKiosk }) => {
  const { 
    tokens, 
    currentServingTokens, 
    activeTrackingToken, 
    setActiveTrackingTokenId, 
    triggerSimulatedCall, 
    triggerSimulatedSms,
    appLanguage,
    updateTokenLanguage,
    highContrastMode 
  } = useHospital();

  const [copied, setCopied] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  const currentToken = activeTrackingToken || tokens[tokens.length - 1] || tokens[0];

  if (!currentToken) {
    return (
      <div className={`max-w-xl mx-auto text-center py-16 rounded-3xl p-8 border shadow-sm ${
        highContrastMode ? 'bg-black border-yellow-400 text-white' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
      }`}>
        <Activity className={`w-12 h-12 mx-auto mb-3 ${highContrastMode ? 'text-yellow-400' : 'text-slate-400'}`} />
        <h2 className="text-xl font-bold">No Active Token Found</h2>
        <p className="text-sm mt-1 mb-6 opacity-80">Generate an auto-token at the reception kiosk to start live tracking.</p>
        <button
          onClick={onNavigateToKiosk}
          className={`font-bold py-2.5 px-6 rounded-xl text-sm transition-all cursor-pointer ${
            highContrastMode ? 'bg-yellow-400 text-black border-2 border-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white'
          }`}
        >
          {getUIText(appLanguage, 'patientKiosk')}
        </button>
      </div>
    );
  }

  const dept = getDepartmentById(currentToken.departmentId);
  const currentServingNum = currentServingTokens[currentToken.departmentId] || 1;
  const currentServingFormatted = `${dept.code}-${String(currentServingNum).padStart(3, '0')}`;
  
  const peopleAway = Math.max(0, currentToken.tokenNumber - currentServingNum);
  const estimatedWaitMins = peopleAway * dept.avgConsultationMins;
  
  // Active language for this patient token
  const patientLang = currentToken.language || appLanguage;
  const langMeta = getLanguageMeta(patientLang);
  
  const regionalMessage = generateAutomatedMessage(patientLang, {
    currentToken: currentServingFormatted,
    patientToken: currentToken.formattedToken,
    peopleAway,
    department: currentToken.departmentName,
    room: currentToken.roomNumber,
    patientName: currentToken.patientName
  });

  const trackingUrl = `${window.location.origin}${window.location.pathname}?track=${currentToken.trackingCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(trackingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(`SwasthyaToken Live Status:\nToken: ${currentToken.formattedToken}\nCurrent Serving: ${currentServingFormatted}\nPeople Away: ${peopleAway}\nTrack live here: ${trackingUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const isNowServing = peopleAway === 0;
  const is10Away = peopleAway === 10;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Patient Token Selector if multiple exist */}
      {tokens.length > 1 && (
        <div className={`px-4 py-2.5 rounded-2xl border shadow-sm flex items-center justify-between text-xs ${
          highContrastMode ? 'bg-black border-yellow-400 text-white' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
        }`}>
          <div className="flex items-center gap-2">
            <User className={`w-3.5 h-3.5 ${highContrastMode ? 'text-yellow-400' : 'text-slate-400'}`} />
            <span>Tracking Patient:</span>
            <select
              value={currentToken.id}
              onChange={(e) => setActiveTrackingTokenId(e.target.value)}
              className={`font-bold bg-transparent border-b-2 border-dashed focus:outline-none cursor-pointer ${
                highContrastMode ? 'text-yellow-400 border-yellow-400' : 'text-slate-900 dark:text-white border-emerald-500'
              }`}
            >
              {tokens.slice().reverse().map(t => (
                <option key={t.id} value={t.id} className="text-black">
                  {t.formattedToken} - {t.patientName} ({t.departmentName})
                </option>
              ))}
            </select>
          </div>
          <span className={`font-mono font-bold ${highContrastMode ? 'text-yellow-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
            ID: {currentToken.trackingCode}
          </span>
        </div>
      )}

      {/* Main Live Tracking Smartphone Card */}
      <div className={`rounded-3xl shadow-xl border overflow-hidden ${
        highContrastMode ? 'bg-black border-yellow-400 text-white' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
      }`}>
        
        {/* Top Live Bar */}
        <div className={`px-6 py-4 flex items-center justify-between ${
          highContrastMode
            ? 'bg-neutral-900 border-b-2 border-yellow-400 text-yellow-400'
            : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white'
        }`}>
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-300 opacity-75"></span>
              <span className={`relative inline-flex rounded-full h-3 w-3 ${highContrastMode ? 'bg-yellow-400' : 'bg-white'}`}></span>
            </span>
            <div>
              <h2 className={`text-xs uppercase tracking-widest font-black ${highContrastMode ? 'text-white' : 'text-emerald-100'}`}>
                SwasthyaToken • Live OPD Queue Tracking
              </h2>
              <p className="text-sm font-extrabold">{currentToken.departmentName}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className={`p-2 rounded-xl text-xs flex items-center gap-1 font-bold transition-colors cursor-pointer border ${
                highContrastMode
                  ? 'bg-yellow-400 text-black border-white'
                  : 'bg-white/10 hover:bg-white/20 text-white border-transparent'
              }`}
              title="Copy Live Link"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span className="hidden sm:inline">{copied ? 'Copied' : 'Share Link'}</span>
            </button>
            <button
              onClick={() => setShowQrModal(true)}
              className={`p-2 rounded-xl transition-colors cursor-pointer border ${
                highContrastMode
                  ? 'bg-yellow-400 text-black border-white'
                  : 'bg-white/10 hover:bg-white/20 text-white border-transparent'
              }`}
              title="Show QR Code"
            >
              <QrCode className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live Token Status Section */}
        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Running Status vs Patient Token Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Current Running Token Box */}
            <div className={`p-5 rounded-2xl border text-center relative overflow-hidden ${
              highContrastMode
                ? 'bg-neutral-900 border-yellow-400'
                : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
            }`}>
              <div className={`text-xs uppercase font-extrabold tracking-wider ${
                highContrastMode ? 'text-white' : 'text-slate-500 dark:text-slate-400'
              }`}>
                {getUIText(patientLang, 'nowServing')}
              </div>
              <div className={`text-4xl sm:text-5xl font-black font-mono my-1 ${
                highContrastMode ? 'text-yellow-400' : 'text-slate-900 dark:text-white'
              }`}>
                {currentServingFormatted}
              </div>
              <div className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                highContrastMode
                  ? 'bg-yellow-400 text-black border-white'
                  : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
              }`}>
                <Activity className="w-3 h-3" /> {getUIText(patientLang, 'nowServingRoom')}
              </div>
            </div>

            {/* Patient's Token Box */}
            <div className={`p-5 rounded-2xl border-2 text-center relative overflow-hidden ${
              highContrastMode
                ? 'bg-black border-yellow-400 ring-2 ring-yellow-400'
                : 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-500/60'
            }`}>
              <div className={`text-xs uppercase font-extrabold tracking-wider ${
                highContrastMode ? 'text-yellow-400' : 'text-emerald-800 dark:text-emerald-300'
              }`}>
                {getUIText(patientLang, 'yourToken')}
              </div>
              <div className={`text-4xl sm:text-5xl font-black font-mono my-1 ${
                highContrastMode ? 'text-white' : 'text-emerald-600 dark:text-emerald-400'
              }`}>
                {currentToken.formattedToken}
              </div>
              <div className="inline-flex items-center gap-1 text-xs font-bold opacity-90">
                <User className="w-3 h-3" /> {currentToken.patientName} (Age {currentToken.age})
              </div>
            </div>

          </div>

          {/* People Away Highlight Alert Banner */}
          <div className={`p-5 rounded-2xl border-2 transition-all ${
            isNowServing
              ? highContrastMode ? 'bg-yellow-400 text-black border-white' : 'bg-emerald-500 text-white border-emerald-600'
              : is10Away
              ? highContrastMode ? 'bg-neutral-900 border-yellow-400 text-yellow-400 ring-2 ring-yellow-400' : 'bg-amber-500/10 border-amber-500 text-amber-900 dark:text-amber-200'
              : highContrastMode ? 'bg-neutral-900 border-white text-white' : 'bg-sky-500/10 border-sky-500 text-sky-950 dark:text-sky-200'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shrink-0 border ${
                  highContrastMode ? 'bg-black text-yellow-400 border-yellow-400' : isNowServing ? 'bg-white text-emerald-600' : 'bg-amber-500 text-white'
                }`}>
                  {peopleAway}
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg leading-tight">
                    {isNowServing 
                      ? 'IT IS YOUR TURN NOW!' 
                      : `Your Number is ${peopleAway} People Away`}
                  </h3>
                  <p className="text-xs sm:text-sm mt-0.5 opacity-90 font-medium">
                    {isNowServing
                      ? `Please step inside Room ${currentToken.roomNumber} immediately for ${currentToken.doctorName}.`
                      : `Please be available at the designated department ${currentToken.departmentName}, Room ${currentToken.roomNumber} for your consultation.`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                <div className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 border ${
                  highContrastMode
                    ? 'bg-black text-yellow-400 border-yellow-400'
                    : 'bg-white/80 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-black/10'
                }`}>
                  <Clock className="w-3.5 h-3.5" />
                  <span>Est. Wait: ~{estimatedWaitMins} mins</span>
                </div>
              </div>
            </div>
          </div>

          {/* DYNAMIC REGIONAL LANGUAGE CHANGER SECTION */}
          <div className={`rounded-2xl p-5 border space-y-3 ${
            highContrastMode ? 'bg-neutral-900 border-yellow-400' : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700'
          }`}>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3 border-inherit">
              <div className="flex items-center gap-2">
                <Globe className={`w-4 h-4 ${highContrastMode ? 'text-yellow-400' : 'text-emerald-600'}`} />
                <h4 className="font-extrabold text-xs uppercase tracking-wider">
                  Regional Language for Voice Calls & Automated SMS
                </h4>
              </div>

              <span className={`text-xs px-2.5 py-0.5 rounded-full font-extrabold border ${
                highContrastMode ? 'bg-yellow-400 text-black border-white' : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300'
              }`}>
                Active: {langMeta.flag} {langMeta.nativeName} ({langMeta.name})
              </span>
            </div>

            {/* Quick One-Tap Regional Language Switcher Pills */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block">
                Tap to Switch Regional Language Instantly:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                {SUPPORTED_LANGUAGES.map(lang => {
                  const isSelected = patientLang === lang.code;
                  return (
                    <button
                      key={lang.code}
                      onClick={() => updateTokenLanguage(currentToken.id, lang.code)}
                      className={`px-2.5 py-2 rounded-xl text-center text-xs font-bold transition-all cursor-pointer border ${
                        isSelected
                          ? highContrastMode
                            ? 'bg-yellow-400 text-black border-white ring-2 ring-yellow-400'
                            : 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : highContrastMode
                          ? 'bg-black text-white border-yellow-400/40 hover:bg-neutral-800'
                          : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="font-extrabold">{lang.nativeName}</div>
                      <div className="text-[10px] opacity-80">{lang.name}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Localized Message Text Preview */}
            <div className={`p-4 rounded-xl border ${
              highContrastMode ? 'bg-black border-yellow-400 text-white' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'
            }`}>
              <div className="text-[10px] font-mono uppercase tracking-wider text-yellow-400 mb-1 font-bold">
                Automated Announcement Content:
              </div>
              <p className="text-sm font-semibold leading-relaxed font-sans">
                "{regionalMessage}"
              </p>
            </div>

            {/* Voice Call & SMS Simulation buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => triggerSimulatedCall(currentToken)}
                className={`flex-1 min-w-[160px] font-black py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer border ${
                  highContrastMode
                    ? 'bg-yellow-400 text-black border-white hover:bg-yellow-300'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600'
                }`}
              >
                <PhoneCall className="w-4 h-4" />
                <span>Simulate Automated Voice Call Now</span>
              </button>

              <button
                type="button"
                onClick={() => triggerSimulatedSms(currentToken)}
                className={`flex-1 min-w-[160px] font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer border ${
                  highContrastMode
                    ? 'bg-black text-yellow-400 border-yellow-400 hover:bg-neutral-800'
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
                }`}
              >
                <MessageSquare className="w-4 h-4 text-sky-400" />
                <span>Simulate SMS Alert Now</span>
              </button>
            </div>

          </div>

          {/* Department & Consultation Details Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className={`p-4 rounded-2xl border space-y-2 ${
              highContrastMode ? 'bg-neutral-900 border-yellow-400' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
            }`}>
              <div className="flex items-center gap-2 font-bold">
                <MapPin className={`w-4 h-4 ${highContrastMode ? 'text-yellow-400' : 'text-emerald-600'}`} />
                <span>Hospital Navigation & Room</span>
              </div>
              <p><strong>Room:</strong> {currentToken.roomNumber}</p>
              <p><strong>Location:</strong> {dept.floor}</p>
              <p><strong>Doctor:</strong> {currentToken.doctorName}</p>
            </div>

            <div className={`p-4 rounded-2xl border space-y-2 ${
              highContrastMode ? 'bg-neutral-900 border-yellow-400' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
            }`}>
              <div className="flex items-center gap-2 font-bold">
                <ShieldCheck className={`w-4 h-4 ${highContrastMode ? 'text-yellow-400' : 'text-teal-600'}`} />
                <span>Patient Registration Record</span>
              </div>
              <p><strong>Patient:</strong> {currentToken.patientName} ({currentToken.gender}, {currentToken.age} yrs)</p>
              <p><strong>Registered Phone:</strong> {currentToken.phoneNumber}</p>
              <p className="truncate"><strong>Reported Symptoms:</strong> {currentToken.symptoms}</p>
            </div>
          </div>

          {/* Share live link bar */}
          <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs ${
            highContrastMode ? 'bg-neutral-900 border-yellow-400' : 'border-slate-200 dark:border-slate-700'
          }`}>
            <div className="flex items-center gap-2">
              <Share2 className={`w-4 h-4 ${highContrastMode ? 'text-yellow-400' : 'text-emerald-600'}`} />
              <span>Share live tracking link:</span>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleShareWhatsApp}
                className={`flex-1 sm:flex-none px-3.5 py-2 font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer border ${
                  highContrastMode ? 'bg-yellow-400 text-black border-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                <span>WhatsApp</span>
              </button>
              <button
                onClick={handleCopyLink}
                className={`flex-1 sm:flex-none px-3.5 py-2 font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer border ${
                  highContrastMode ? 'bg-black text-yellow-400 border-yellow-400' : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Link'}</span>
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* QR Code Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className={`rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl border-2 ${
            highContrastMode ? 'bg-black border-yellow-400 text-white' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
          }`}>
            <h3 className="font-black text-lg">Scan Live Tracking QR Code</h3>
            <p className="text-xs opacity-80">Scan with your smartphone camera to open live tracking status.</p>
            
            <div className={`w-52 h-52 mx-auto p-4 rounded-2xl flex items-center justify-center border-2 ${
              highContrastMode ? 'bg-neutral-900 border-yellow-400' : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
            }`}>
              <div className="relative w-full h-full flex flex-col items-center justify-center space-y-1">
                <QrCode className={`w-36 h-36 ${highContrastMode ? 'text-yellow-400' : 'text-slate-900 dark:text-white'}`} />
                <span className={`font-mono text-[10px] font-bold ${highContrastMode ? 'text-white' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {currentToken.trackingCode}
                </span>
              </div>
            </div>

            <div className="text-[11px] font-mono break-all p-2 bg-neutral-900 rounded-lg text-yellow-400">
              {trackingUrl}
            </div>

            <button
              onClick={() => setShowQrModal(false)}
              className={`w-full font-bold py-2.5 rounded-xl text-xs transition-all cursor-pointer border ${
                highContrastMode ? 'bg-yellow-400 text-black border-white' : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
              }`}
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
