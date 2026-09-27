import React, { useState } from 'react';
import { useHospital } from '../context/HospitalContext';
import { SUPPORTED_LANGUAGES, getLanguageMeta, getUIText } from '../utils/languages';
import { 
  Building2, Ticket, Smartphone, Stethoscope, Tv, Bell, 
  RotateCcw, Sparkles, Activity, Eye, Globe, ChevronDown, Check, Mic
} from 'lucide-react';

export type ActiveTab = 'kiosk' | 'tracking' | 'doctor' | 'display' | 'logs';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenVoiceCommand: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onOpenVoiceCommand }) => {
  const { 
    tokens, 
    currentServingTokens, 
    notificationLogs, 
    resetSampleData,
    appLanguage,
    setAppLanguage,
    highContrastMode,
    toggleHighContrastMode 
  } = useHospital();

  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const currentServingGen = currentServingTokens['gen-med'] || 14;
  const waitingCount = tokens.filter(t => t.status === 'WAITING' || t.status === 'ALERTED_10_AWAY').length;
  const currentLangMeta = getLanguageMeta(appLanguage);

  const navItems = [
    { id: 'kiosk' as ActiveTab, label: getUIText(appLanguage, 'patientKiosk'), icon: Ticket },
    { id: 'tracking' as ActiveTab, label: getUIText(appLanguage, 'liveTracking'), icon: Smartphone },
    { id: 'doctor' as ActiveTab, label: getUIText(appLanguage, 'doctorDesk'), icon: Stethoscope },
    { id: 'display' as ActiveTab, label: getUIText(appLanguage, 'waitingHallTv'), icon: Tv },
    { 
      id: 'logs' as ActiveTab, 
      label: getUIText(appLanguage, 'notifications'), 
      icon: Bell,
      badge: notificationLogs.length > 0 ? notificationLogs.length : undefined
    }
  ];

  return (
    <header className={`sticky top-0 z-30 backdrop-blur-md border-b transition-colors ${
      highContrastMode 
        ? 'bg-black border-yellow-400 text-white' 
        : 'bg-white/95 dark:bg-slate-900/95 border-slate-200 dark:border-slate-800'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Header Row */}
        <div className="flex items-center justify-between h-20 gap-2 sm:gap-4">
          
          {/* Brand Name & Tagline */}
          <div 
            className="flex items-center gap-3 cursor-pointer shrink-0" 
            onClick={() => setActiveTab('kiosk')}
          >
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg transition-transform active:scale-95 ${
              highContrastMode
                ? 'bg-yellow-400 text-black border-2 border-white'
                : 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-emerald-600/30'
            }`}>
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`font-black text-lg sm:text-xl tracking-tight ${
                  highContrastMode ? 'text-yellow-400 font-extrabold' : 'text-slate-900 dark:text-white'
                }`}>
                  SwasthyaToken
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                  highContrastMode
                    ? 'bg-black text-yellow-400 border-yellow-400'
                    : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                }`}>
                  LIVE OPD
                </span>
              </div>
              <p className={`text-[11px] font-semibold truncate max-w-[200px] sm:max-w-none ${
                highContrastMode ? 'text-white' : 'text-slate-500'
              }`}>
                Hospital Smart Voice Token & Live Tracking
              </p>
            </div>
          </div>

          {/* Center Info Pill (Hidden on mobile) */}
          <div className="hidden xl:flex items-center gap-3">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs ${
              highContrastMode
                ? 'bg-black border-yellow-400 text-white'
                : 'bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700'
            }`}>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className={highContrastMode ? 'text-white' : 'text-slate-500'}>
                {getUIText(appLanguage, 'nowServing')}:
              </span>
              <strong className={`font-mono font-bold ${
                highContrastMode ? 'text-yellow-400' : 'text-emerald-600 dark:text-emerald-400'
              }`}>
                GEN-{String(currentServingGen).padStart(3, '0')}
              </strong>
            </div>

            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs ${
              highContrastMode
                ? 'bg-black border-yellow-400 text-white'
                : 'bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700'
            }`}>
              <span className={highContrastMode ? 'text-white' : 'text-slate-500'}>
                {getUIText(appLanguage, 'inLine')}:
              </span>
              <strong className={highContrastMode ? 'text-yellow-400 font-bold' : 'text-slate-800 dark:text-slate-200 font-bold'}>
                {waitingCount}
              </strong>
            </div>
          </div>

          {/* Right Action Controls: Voice Command + High Contrast Toggle + Regional Language Selector */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            
            {/* 1. VOICE COMMAND BUTTON */}
            <button
              onClick={onOpenVoiceCommand}
              className={`px-3 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer border-2 ${
                highContrastMode
                  ? 'bg-yellow-400 text-black border-white ring-2 ring-yellow-400 hover:bg-yellow-300'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white border-emerald-400 shadow-md shadow-emerald-600/30'
              }`}
              title="Activate Voice Command Assistant (Speech Input & Commands)"
              aria-label="Activate Voice Command"
            >
              <Mic className="w-4 h-4 animate-pulse shrink-0" />
              <span className="hidden sm:inline font-extrabold tracking-wide">
                VOICE COMMAND
              </span>
              <span className={`w-2 h-2 rounded-full ${highContrastMode ? 'bg-black' : 'bg-white'} animate-ping`}></span>
            </button>

            {/* 2. HIGH CONTRAST MODE TOGGLE (Mandatory for Visually Impaired Hospital Patients) */}
            <button
              onClick={toggleHighContrastMode}
              className={`px-3 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer border-2 ${
                highContrastMode
                  ? 'bg-neutral-900 text-yellow-400 border-yellow-400 hover:bg-black'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700'
              }`}
              title="Toggle High Contrast Theme for Visually Impaired Users"
              aria-label="High Contrast Mode Toggle"
            >
              <Eye className={`w-4 h-4 ${highContrastMode ? 'text-yellow-400 stroke-[2.5]' : 'text-slate-600 dark:text-slate-300'}`} />
              <span className="hidden sm:inline">
                {highContrastMode ? 'HIGH CONTRAST: ON' : 'HIGH CONTRAST'}
              </span>
            </button>

            {/* 2. REGIONAL LANGUAGE CHANGER (Dropdown & Direct Selector) */}
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(prev => !prev)}
                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                  highContrastMode
                    ? 'bg-black text-yellow-400 border-yellow-400 hover:bg-neutral-900'
                    : 'bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                }`}
                title="Change Regional Language for Voice Calls, SMS & UI"
              >
                <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="font-extrabold">{currentLangMeta.flag}</span>
                <span className="font-semibold">{currentLangMeta.nativeName}</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-70" />
              </button>

              {/* Regional Language Selection Menu */}
              {langDropdownOpen && (
                <div className={`absolute right-0 mt-2 w-64 rounded-2xl shadow-2xl border-2 z-50 p-2 animate-slide-up ${
                  highContrastMode
                    ? 'bg-black border-yellow-400 text-white'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                }`}>
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Regional Language
                    </span>
                    <span className="text-[10px] text-emerald-600 font-semibold">
                      Voice & SMS Enabled
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-1 max-h-72 overflow-y-auto">
                    {SUPPORTED_LANGUAGES.map(lang => {
                      const isSelected = appLanguage === lang.code;
                      return (
                        <button
                          key={lang.code}
                          onClick={() => {
                            setAppLanguage(lang.code);
                            setLangDropdownOpen(false);
                          }}
                          className={`w-full px-3 py-2 rounded-xl text-left text-xs flex items-center justify-between transition-colors cursor-pointer ${
                            isSelected
                              ? highContrastMode
                                ? 'bg-yellow-400 text-black font-extrabold'
                                : 'bg-emerald-600 text-white font-bold'
                              : highContrastMode
                              ? 'text-white hover:bg-neutral-900'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{lang.flag}</span>
                            <div>
                              <div className="font-bold">{lang.nativeName}</div>
                              <div className={`text-[10px] ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
                                {lang.name}
                              </div>
                            </div>
                          </div>
                          {isSelected && <Check className="w-4 h-4 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Reset Button */}
            <button
              onClick={resetSampleData}
              className={`p-2 rounded-xl text-xs flex items-center gap-1 transition-colors cursor-pointer ${
                highContrastMode
                  ? 'border border-yellow-400 text-yellow-400 hover:bg-neutral-900'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title="Reset Sample Data"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

          </div>

        </div>

        {/* Navigation Tabs Bar with Regional Translations */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-3 pt-1 scrollbar-none">
          {navItems.map(item => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer relative border ${
                  isActive
                    ? highContrastMode
                      ? 'bg-yellow-400 text-black border-white shadow-md font-extrabold'
                      : 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/25'
                    : highContrastMode
                    ? 'text-white border-yellow-400/40 hover:bg-neutral-900'
                    : 'text-slate-600 dark:text-slate-300 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? (highContrastMode ? 'text-black' : 'text-white') : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                    isActive
                      ? highContrastMode ? 'bg-black text-yellow-400' : 'bg-white text-emerald-700'
                      : highContrastMode ? 'bg-yellow-400 text-black' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
};
