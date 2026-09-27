import React, { useState } from 'react';
import { useHospital } from '../context/HospitalContext';
import { DEPARTMENTS, getDepartmentById } from '../data/departments';
import { getLanguageMeta } from '../utils/languages';
import { 
  Stethoscope, Users, Play, SkipForward, AlertCircle, CheckCircle2, 
  PhoneCall, Volume2, Clock, Sparkles, Filter, ChevronRight, Zap
} from 'lucide-react';

export const DoctorDesk: React.FC = () => {
  const { 
    tokens, 
    currentServingTokens, 
    advanceQueueForDepartment, 
    setServingTokenForDepartment,
    markTokenStatus, 
    triggerSimulatedCall, 
    autoQueueAdvance, 
    toggleAutoQueueAdvance,
    appLanguage,
    highContrastMode 
  } = useHospital();

  const [selectedDeptId, setSelectedDeptId] = useState<string>('gen-med');

  const dept = getDepartmentById(selectedDeptId);
  const currentServingNum = currentServingTokens[selectedDeptId] || 1;
  const currentServingFormatted = `${dept.code}-${String(currentServingNum).padStart(3, '0')}`;

  // Tokens for this department
  const deptTokens = tokens.filter(t => t.departmentId === selectedDeptId);
  
  // Current patient in consultation
  const activeConsultation = deptTokens.find(t => t.tokenNumber === currentServingNum);
  
  // Waiting queue (tokenNumber > currentServingNum)
  const waitingQueue = deptTokens
    .filter(t => t.tokenNumber > currentServingNum && t.status !== 'COMPLETED' && t.status !== 'MISSED')
    .sort((a, b) => a.tokenNumber - b.tokenNumber);

  // Completed tokens
  const completedQueue = deptTokens
    .filter(t => t.status === 'COMPLETED')
    .sort((a, b) => b.tokenNumber - a.tokenNumber);

  // Test helper: Set queue to exactly 10 people away from a selected waiting token
  const handleJumpTo10Away = (targetTokenNumber: number) => {
    const targetServing = Math.max(1, targetTokenNumber - 10);
    setServingTokenForDepartment(selectedDeptId, targetServing);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Top Department Switcher */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Doctor Consultation & Queue Controller</h2>
            <p className="text-xs text-slate-500">Manage OPD consultations, advance tokens & trigger automated regional calls.</p>
          </div>
        </div>

        {/* Auto simulation switch */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleAutoQueueAdvance}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              autoQueueAdvance
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Zap className={`w-3.5 h-3.5 ${autoQueueAdvance ? 'animate-pulse' : ''}`} />
            <span>Auto-Advance Queue: {autoQueueAdvance ? 'ON (15s)' : 'OFF'}</span>
          </button>
        </div>
      </div>

      {/* Department Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {DEPARTMENTS.map(d => {
          const isSelected = d.id === selectedDeptId;
          const count = tokens.filter(t => t.departmentId === d.id && t.tokenNumber > (currentServingTokens[d.id] || 1)).length;
          return (
            <button
              key={d.id}
              onClick={() => setSelectedDeptId(d.id)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 border ${
                isSelected
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <span>{d.name}</span>
              {count > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                  isSelected ? 'bg-white text-emerald-700' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Active Consultation Hero Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200 dark:border-slate-800 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        
        {/* Left: Current Serving Token Status */}
        <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-slate-100 dark:border-slate-800 pb-6 lg:pb-0 lg:pr-6 text-center lg:text-left">
          <div className="text-xs uppercase tracking-widest font-bold text-slate-400">
            Currently In Consultation
          </div>
          <div className="text-4xl sm:text-5xl font-black text-emerald-600 dark:text-emerald-400 font-mono my-2">
            {currentServingFormatted}
          </div>
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {dept.name} • {dept.roomNumber}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Consultant: {dept.doctorName}
          </p>

          <div className="mt-4 flex flex-col gap-2">
            <button
              onClick={() => advanceQueueForDepartment(selectedDeptId)}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition-all active:scale-98 cursor-pointer"
            >
              <SkipForward className="w-4 h-4" />
              <span>Call Next Token</span>
            </button>
          </div>
        </div>

        {/* Right: Active Patient Profile */}
        <div className="lg:col-span-8">
          {activeConsultation ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {activeConsultation.patientName}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                      Age {activeConsultation.age} • {activeConsultation.gender}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    Phone: {activeConsultation.phoneNumber}
                  </p>
                </div>

                <div className="text-right">
                  <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Language: {getLanguageMeta(activeConsultation.language).flag} {getLanguageMeta(activeConsultation.language).name}
                  </span>
                </div>
              </div>

              {/* Symptoms banner */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs">
                <span className="font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Reported Problem / Symptoms:
                </span>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                  {activeConsultation.symptoms}
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => advanceQueueForDepartment(selectedDeptId)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Complete Consultation</span>
                </button>
                <button
                  onClick={() => triggerSimulatedCall(activeConsultation)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Call Patient Phone Again</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-slate-400">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-semibold">Doctor Desk is Ready</p>
              <p className="text-xs text-slate-500 mt-0.5">Click "Call Next Token" to start with the first patient in line.</p>
            </div>
          )}
        </div>

      </div>

      {/* Waiting Queue List */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-600" />
              <span>Upcoming Queue for {dept.name}</span>
            </h3>
            <p className="text-xs text-slate-500">
              {waitingQueue.length} patient(s) waiting in department line
            </p>
          </div>

          <div className="text-xs text-slate-500">
            Current Running: <strong className="font-mono text-emerald-600">{currentServingFormatted}</strong>
          </div>
        </div>

        {waitingQueue.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500 opacity-60" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No Patients in Waiting Queue</p>
            <p className="text-xs text-slate-500">Generate a new token from the Kiosk.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {waitingQueue.map((patient) => {
              const peopleAway = patient.tokenNumber - currentServingNum;
              const is10Away = peopleAway === 10;
              const langMeta = getLanguageMeta(patient.language);

              return (
                <div 
                  key={patient.id} 
                  className={`py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl px-3 transition-colors ${
                    is10Away ? 'bg-amber-50/70 dark:bg-amber-950/30 border border-amber-300/60 dark:border-amber-800' : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Token pill */}
                    <div className="text-center shrink-0 w-20 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <span className="font-mono font-bold text-sm text-slate-900 dark:text-white block">
                        {patient.formattedToken}
                      </span>
                      <span className="text-[10px] text-slate-500 font-semibold">
                        #{patient.tokenNumber}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {patient.patientName}
                        </span>
                        <span className="text-xs text-slate-500">
                          ({patient.gender}, {patient.age}y)
                        </span>
                        {patient.alert10AwaySent && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                            10-Away Alert Dispatched
                          </span>
                        )}
                        {is10Away && (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500 text-white animate-pulse">
                            EXACTLY 10 AWAY!
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-1 mt-0.5">
                        Symptoms: {patient.symptoms}
                      </p>

                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                        <span>Phone: {patient.phoneNumber}</span>
                        <span>•</span>
                        <span>Lang: {langMeta.flag} {langMeta.name}</span>
                        <span>•</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          {peopleAway} people away
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions for this patient */}
                  <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                    {/* Fast test trigger for 10 away */}
                    {!is10Away && peopleAway > 10 && (
                      <button
                        onClick={() => handleJumpTo10Away(patient.tokenNumber)}
                        className="px-2.5 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        title="Fast-forward current running token to exactly 10 people away from this patient"
                      >
                        <Sparkles className="w-3 h-3 text-amber-600" />
                        <span>Simulate 10-Away Now</span>
                      </button>
                    )}

                    <button
                      onClick={() => triggerSimulatedCall(patient)}
                      className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                      title="Trigger Voice Call in Patient Language"
                    >
                      <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
                    </button>
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
