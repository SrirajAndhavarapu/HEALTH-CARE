/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { HospitalProvider, useHospital } from './context/HospitalContext';
import { Navbar, ActiveTab } from './components/Navbar';
import { TokenGenerator } from './components/TokenGenerator';
import { LiveTrackingView } from './components/LiveTrackingView';
import { DoctorDesk } from './components/DoctorDesk';
import { WaitingHallDisplay } from './components/WaitingHallDisplay';
import { NotificationHistoryView } from './components/NotificationHistoryView';
import { CallSimulatorModal } from './components/CallSimulatorModal';
import { SmsNotificationModal } from './components/SmsNotificationModal';
import { VoiceCommandAssistant } from './components/VoiceCommandAssistant';
import { getUIText } from './utils/languages';
import { Sparkles, PhoneCall, CheckCircle2, Mic } from 'lucide-react';

function MainAppContent() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('kiosk');
  const [isVoiceAssistantOpen, setIsVoiceAssistantOpen] = useState<boolean>(false);

  const { 
    activeTrackingToken, 
    triggerSimulatedCall, 
    tokens, 
    appLanguage, 
    highContrastMode 
  } = useHospital();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('track')) {
      setActiveTab('tracking');
    }
  }, []);

  const handleTest10AwayCall = () => {
    const token = activeTrackingToken || tokens.find(t => t.tokenNumber === 24) || tokens[tokens.length - 1];
    if (token) {
      triggerSimulatedCall(token);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors ${
      highContrastMode 
        ? 'bg-black text-white' 
        : 'bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100'
    }`}>
      
      {/* Top Navigation with Voice Command, High Contrast Toggle & Regional Language Switcher */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onOpenVoiceCommand={() => setIsVoiceAssistantOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Scenario Demonstration Banner */}
        <div className={`mb-6 p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
          highContrastMode
            ? 'bg-neutral-900 border-yellow-400 text-white'
            : 'bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-sky-500/10 border-emerald-500/20'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
              highContrastMode ? 'bg-yellow-400 text-black' : 'bg-emerald-600 text-white'
            }`}>
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <strong className={`font-bold block ${highContrastMode ? 'text-yellow-400' : 'text-slate-900 dark:text-white'}`}>
                SwasthyaToken • Hospital Smart Voice Token Protocol Active:
              </strong>
              <span className={highContrastMode ? 'text-white' : 'text-slate-600 dark:text-slate-400'}>
                Mandatory fields validated • Dedicated live tracking link generated • Voice Command enabled • Automated 10-away regional call & SMS scheduled
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
            <button
              onClick={() => setIsVoiceAssistantOpen(true)}
              className={`px-3 py-1.5 rounded-xl font-black flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer border ${
                highContrastMode
                  ? 'bg-black text-yellow-400 border-yellow-400 hover:bg-neutral-900'
                  : 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 hover:bg-emerald-50'
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Voice Command</span>
            </button>

            <button
              onClick={handleTest10AwayCall}
              className={`px-3.5 py-1.5 rounded-xl font-black flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer border-2 ${
                highContrastMode
                  ? 'bg-yellow-400 text-black border-white hover:bg-yellow-300 ring-2 ring-yellow-400'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600'
              }`}
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>{getUIText(appLanguage, 'testCallBtn')}</span>
            </button>
          </div>
        </div>

        {/* Tab View Routing */}
        {activeTab === 'kiosk' && (
          <TokenGenerator onNavigateToTracker={() => setActiveTab('tracking')} />
        )}

        {activeTab === 'tracking' && (
          <LiveTrackingView onNavigateToKiosk={() => setActiveTab('kiosk')} />
        )}

        {activeTab === 'doctor' && (
          <DoctorDesk />
        )}

        {activeTab === 'display' && (
          <WaitingHallDisplay />
        )}

        {activeTab === 'logs' && (
          <NotificationHistoryView />
        )}

      </main>

      {/* Floating Bottom-Left Voice Command Trigger (Always reachable by visually impaired / mobile users) */}
      <div className="fixed bottom-6 left-6 z-40">
        <button
          onClick={() => setIsVoiceAssistantOpen(true)}
          className={`flex items-center gap-2.5 px-4 py-3 rounded-full shadow-2xl transition-all active:scale-95 cursor-pointer border-2 group ${
            highContrastMode
              ? 'bg-yellow-400 text-black border-white ring-4 ring-yellow-400/40 hover:bg-yellow-300'
              : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white border-emerald-300 shadow-emerald-900/40'
          }`}
          title="Open Voice Command Assistant"
          aria-label="Open Voice Command Assistant"
        >
          <div className="relative">
            <Mic className="w-5 h-5 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
          </div>
          <span className="text-xs font-black tracking-wide pr-1">
            VOICE COMMAND
          </span>
        </button>
      </div>

      {/* Footer */}
      <footer className={`mt-auto border-t py-6 text-center text-xs ${
        highContrastMode 
          ? 'bg-black border-yellow-400 text-white' 
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500'
      }`}>
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} SwasthyaToken • Hospital Smart Voice Token & Live Tracking System</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1 font-semibold">
              <Mic className={`w-3.5 h-3.5 ${highContrastMode ? 'text-yellow-400' : 'text-emerald-500'}`} />
              Voice Command Enabled
            </span>
            <span className="flex items-center gap-1 font-semibold">
              <CheckCircle2 className={`w-3.5 h-3.5 ${highContrastMode ? 'text-yellow-400' : 'text-emerald-500'}`} />
              10 Regional Languages Enabled
            </span>
          </div>
        </div>
      </footer>

      {/* Interactive Modals */}
      <CallSimulatorModal />
      <SmsNotificationModal />
      
      {/* Voice Command Assistant Modal */}
      <VoiceCommandAssistant
        isOpen={isVoiceAssistantOpen}
        onClose={() => setIsVoiceAssistantOpen(false)}
        setActiveTab={setActiveTab}
      />

    </div>
  );
}

export default function App() {
  return (
    <HospitalProvider>
      <MainAppContent />
    </HospitalProvider>
  );
}
