import React, { useState, useEffect } from 'react';
import { useHospital } from '../context/HospitalContext';
import { DEPARTMENTS, recommendDepartment } from '../data/departments';
import { SUPPORTED_LANGUAGES, getLanguageMeta, getUIText } from '../utils/languages';
import { speechManager } from '../utils/speechRecognition';
import { Gender, RegionalLanguage, PatientToken } from '../types';
import { 
  User, Phone, Calendar, Users, Stethoscope, Globe, AlertCircle, 
  CheckCircle2, Sparkles, QrCode, ExternalLink, Copy, Check, Printer, 
  Send, PhoneCall, ArrowRight, ShieldAlert, Mic, MicOff 
} from 'lucide-react';

interface FormState {
  patientName: string;
  phoneNumber: string;
  age: string;
  gender: Gender | '';
  symptoms: string;
  departmentId: string;
  language: RegionalLanguage;
}

export const TokenGenerator: React.FC<{ onNavigateToTracker: () => void }> = ({ onNavigateToTracker }) => {
  const { 
    generateToken, 
    currentServingTokens, 
    triggerSimulatedCall, 
    triggerSimulatedSms, 
    appLanguage, 
    setAppLanguage,
    highContrastMode 
  } = useHospital();

  const [form, setForm] = useState<FormState>({
    patientName: '',
    phoneNumber: '',
    age: '',
    gender: '',
    symptoms: '',
    departmentId: 'gen-med',
    language: appLanguage
  });

  // Keep form language synced if user toggled in header
  useEffect(() => {
    setForm(prev => ({ ...prev, language: appLanguage }));
  }, [appLanguage]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [createdToken, setCreatedToken] = useState<PatientToken | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [dictatingField, setDictatingField] = useState<string | null>(null);

  const startDictation = (field: 'patientName' | 'phoneNumber' | 'age' | 'symptoms') => {
    if (dictatingField === field) {
      speechManager.stop();
      setDictatingField(null);
      return;
    }

    setDictatingField(field);
    const speechCode = getLanguageMeta(form.language).speechCode;

    speechManager.start(
      speechCode,
      (res) => {
        let val = res.transcript;

        if (field === 'phoneNumber') {
          // Keep digits and plus
          val = val.replace(/[^0-9+]/g, '');
          if (val) setForm(prev => ({ ...prev, phoneNumber: val }));
        } else if (field === 'age') {
          const match = val.match(/\d+/);
          const ageVal = match ? match[0] : val.replace(/[^0-9]/g, '');
          if (ageVal) setForm(prev => ({ ...prev, age: ageVal }));
        } else if (field === 'symptoms') {
          const rec = recommendDepartment(val);
          setForm(prev => ({ ...prev, symptoms: val, departmentId: rec.id }));
        } else {
          setForm(prev => ({ ...prev, [field]: val }));
        }

        if (res.isFinal) {
          setDictatingField(null);
        }
      },
      (err) => {
        console.warn('Dictation error:', err);
        setDictatingField(null);
      },
      () => {
        setDictatingField(null);
      }
    );
  };

  const quickSymptoms = [
    'High fever and chills for 2 days',
    'Severe persistent headache',
    'Chest discomfort and breathlessness',
    'Knee joint pain & swelling',
    'Throat pain, cough and runny nose',
    'Skin rash with itching',
    'Child acute stomach pain and nausea'
  ];

  const handleSymptomSelect = (symptomText: string) => {
    const recommended = recommendDepartment(symptomText);
    setForm(prev => ({
      ...prev,
      symptoms: symptomText,
      departmentId: recommended.id
    }));
    if (errors.symptoms) {
      setErrors(prev => {
        const next = { ...prev };
        delete next.symptoms;
        return next;
      });
    }
  };

  const handleSymptomChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    const recommended = recommendDepartment(val);
    setForm(prev => ({
      ...prev,
      symptoms: val,
      departmentId: recommended.id
    }));
    if (errors.symptoms && val.trim()) {
      setErrors(prev => {
        const next = { ...prev };
        delete next.symptoms;
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!form.patientName.trim()) {
      newErrors.patientName = 'Patient Name is mandatory';
    } else if (form.patientName.trim().length < 2) {
      newErrors.patientName = 'Name must be at least 2 characters';
    }

    const cleanedPhone = form.phoneNumber.replace(/[\s\-()]/g, '');
    if (!form.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone Number is mandatory for live SMS & Call updates';
    } else if (cleanedPhone.length < 8) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }

    const ageNum = parseInt(form.age, 10);
    if (!form.age.trim()) {
      newErrors.age = 'Patient Age is mandatory';
    } else if (isNaN(ageNum) || ageNum <= 0 || ageNum > 120) {
      newErrors.age = 'Age must be between 1 and 120';
    }

    if (!form.gender) {
      newErrors.gender = 'Gender selection is mandatory';
    }

    if (!form.symptoms.trim()) {
      newErrors.symptoms = 'Problem or symptoms description is mandatory';
    } else if (form.symptoms.trim().length < 3) {
      newErrors.symptoms = 'Please describe the problem or symptoms';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const token = generateToken({
      patientName: form.patientName,
      phoneNumber: form.phoneNumber,
      age: parseInt(form.age, 10),
      gender: form.gender as Gender,
      symptoms: form.symptoms,
      departmentId: form.departmentId,
      language: form.language
    });

    setCreatedToken(token);
  };

  const handleFillDemoSample = () => {
    setForm({
      patientName: 'Sunita Rao',
      phoneNumber: '+91 98452 77123',
      age: '42',
      gender: 'Female',
      symptoms: 'High fever for 3 days with throat pain and viral weakness',
      departmentId: 'gen-med',
      language: form.language || 'te'
    });
    setErrors({});
  };

  const trackingUrl = createdToken 
    ? `${window.location.origin}${window.location.pathname}?track=${createdToken.trackingCode}`
    : '';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(trackingUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className={`rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border ${
        highContrastMode
          ? 'bg-black border-yellow-400 text-white'
          : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 text-white border-transparent'
      }`}>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-3 border ${
              highContrastMode
                ? 'bg-black text-yellow-400 border-yellow-400'
                : 'bg-white/20 text-emerald-50 border-white/20'
            }`}>
              <Sparkles className="w-3.5 h-3.5" />
              SwasthyaToken • Automated Hospital Token Kiosk
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              {getUIText(form.language, 'patientKiosk')}
            </h1>
            <p className="text-sm mt-1 max-w-xl opacity-90 font-medium">
              All 5 core patient particulars are mandatory. Live tracking link is instantly created, and an automated voice call & SMS is scheduled in your regional language when your number is 10 people away.
            </p>
          </div>

          <button
            type="button"
            onClick={handleFillDemoSample}
            className={`self-start md:self-center px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold shadow-lg transition-all active:scale-95 flex items-center gap-2 cursor-pointer shrink-0 border-2 ${
              highContrastMode
                ? 'bg-yellow-400 text-black border-white'
                : 'bg-white text-emerald-800 hover:bg-emerald-50 border-white'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Quick Fill Demo Patient
          </button>
        </div>
      </div>

      {/* Main Grid: Form + Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Form Container (7 cols) */}
        <div className={`lg:col-span-7 rounded-3xl p-6 sm:p-7 shadow-sm border ${
          highContrastMode
            ? 'bg-black border-yellow-400 text-white'
            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
        }`}>
          <form onSubmit={handleSubmit} className="space-y-5">
            
            <div className="flex items-center justify-between border-b pb-3 border-inherit">
              <h2 className="text-base font-bold flex items-center gap-2">
                <User className={`w-4 h-4 ${highContrastMode ? 'text-yellow-400' : 'text-emerald-600'}`} />
                <span>Mandatory Patient Particulars</span>
              </h2>
              <span className={`text-xs font-bold ${highContrastMode ? 'text-yellow-400' : 'text-rose-500'}`}>
                * 5 Mandatory Fields
              </span>
            </div>

            {/* 1. Patient Name */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider">
                  1. {getUIText(form.language, 'patientName')} <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => startDictation('patientName')}
                  className={`text-[11px] font-bold flex items-center gap-1 px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
                    dictatingField === 'patientName'
                      ? 'bg-rose-600 text-white border-rose-300 animate-pulse'
                      : highContrastMode
                      ? 'bg-neutral-900 text-yellow-400 border-yellow-400'
                      : 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300'
                  }`}
                  title="Speak Patient Name by Voice"
                >
                  <Mic className="w-3 h-3" />
                  <span>{dictatingField === 'patientName' ? 'Listening...' : 'Speak Name'}</span>
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none opacity-60">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={form.patientName}
                  onChange={e => {
                    setForm(prev => ({ ...prev, patientName: e.target.value }));
                    if (errors.patientName) setErrors(prev => { const n = {...prev}; delete n.patientName; return n; });
                  }}
                  placeholder="e.g. Ramesh Verma / Sunita Rao"
                  className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border font-medium focus:outline-none transition-all ${
                    errors.patientName 
                      ? 'border-rose-500 ring-2 ring-rose-500/30' 
                      : highContrastMode 
                      ? 'border-yellow-400 bg-black text-white focus:ring-2 focus:ring-yellow-400' 
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white focus:border-emerald-500'
                  }`}
                />
              </div>
              {errors.patientName && (
                <p className="text-rose-500 text-xs mt-1 flex items-center gap-1 font-bold">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.patientName}
                </p>
              )}
            </div>

            {/* 2. Phone Number */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider">
                  2. {getUIText(form.language, 'phoneNumber')} <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => startDictation('phoneNumber')}
                  className={`text-[11px] font-bold flex items-center gap-1 px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
                    dictatingField === 'phoneNumber'
                      ? 'bg-rose-600 text-white border-rose-300 animate-pulse'
                      : highContrastMode
                      ? 'bg-neutral-900 text-yellow-400 border-yellow-400'
                      : 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300'
                  }`}
                  title="Speak Phone Number by Voice"
                >
                  <Mic className="w-3 h-3" />
                  <span>{dictatingField === 'phoneNumber' ? 'Listening...' : 'Speak Phone'}</span>
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none opacity-60">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  value={form.phoneNumber}
                  onChange={e => {
                    setForm(prev => ({ ...prev, phoneNumber: e.target.value }));
                    if (errors.phoneNumber) setErrors(prev => { const n = {...prev}; delete n.phoneNumber; return n; });
                  }}
                  placeholder="e.g. +91 98765 43210"
                  className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border font-mono font-medium focus:outline-none transition-all ${
                    errors.phoneNumber 
                      ? 'border-rose-500 ring-2 ring-rose-500/30' 
                      : highContrastMode 
                      ? 'border-yellow-400 bg-black text-white focus:ring-2 focus:ring-yellow-400' 
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white focus:border-emerald-500'
                  }`}
                />
              </div>
              {errors.phoneNumber && (
                <p className="text-rose-500 text-xs mt-1 flex items-center gap-1 font-bold">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.phoneNumber}
                </p>
              )}
            </div>

            {/* 3 & 4: Age & Gender */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider">
                    3. {getUIText(form.language, 'age')} <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => startDictation('age')}
                    className={`text-[11px] font-bold flex items-center gap-1 px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
                      dictatingField === 'age'
                        ? 'bg-rose-600 text-white border-rose-300 animate-pulse'
                        : highContrastMode
                        ? 'bg-neutral-900 text-yellow-400 border-yellow-400'
                        : 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300'
                    }`}
                    title="Speak Age by Voice"
                  >
                    <Mic className="w-3 h-3" />
                    <span>{dictatingField === 'age' ? 'Listening...' : 'Speak'}</span>
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none opacity-60">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={form.age}
                    onChange={e => {
                      setForm(prev => ({ ...prev, age: e.target.value }));
                      if (errors.age) setErrors(prev => { const n = {...prev}; delete n.age; return n; });
                    }}
                    placeholder="e.g. 35"
                    className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border font-medium focus:outline-none transition-all ${
                      errors.age 
                        ? 'border-rose-500 ring-2 ring-rose-500/30' 
                        : highContrastMode 
                        ? 'border-yellow-400 bg-black text-white focus:ring-2 focus:ring-yellow-400' 
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white focus:border-emerald-500'
                    }`}
                  />
                </div>
                {errors.age && (
                  <p className="text-rose-500 text-xs mt-1 flex items-center gap-1 font-bold">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.age}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">
                  4. {getUIText(form.language, 'gender')} <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['Male', 'Female', 'Other'] as Gender[]).map(g => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => {
                        setForm(prev => ({ ...prev, gender: g }));
                        if (errors.gender) setErrors(prev => { const n = {...prev}; delete n.gender; return n; });
                      }}
                      className={`py-2 px-2 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer ${
                        form.gender === g
                          ? highContrastMode
                            ? 'bg-yellow-400 text-black border-white ring-2 ring-yellow-400'
                            : 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : highContrastMode
                          ? 'bg-black text-white border-yellow-400/50 hover:bg-neutral-800'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
                {errors.gender && (
                  <p className="text-rose-500 text-xs mt-1 flex items-center gap-1 font-bold">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.gender}
                  </p>
                )}
              </div>
            </div>

            {/* 5. Problem or Symptoms */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider">
                  5. {getUIText(form.language, 'symptoms')} <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => startDictation('symptoms')}
                    className={`text-[11px] font-bold flex items-center gap-1 px-2.5 py-0.5 rounded-lg border transition-all cursor-pointer ${
                      dictatingField === 'symptoms'
                        ? 'bg-rose-600 text-white border-rose-300 animate-pulse'
                        : highContrastMode
                        ? 'bg-neutral-900 text-yellow-400 border-yellow-400'
                        : 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300'
                    }`}
                    title="Describe Symptoms by Voice"
                  >
                    <Mic className="w-3 h-3" />
                    <span>{dictatingField === 'symptoms' ? 'Listening...' : 'Speak Symptoms'}</span>
                  </button>

                  <span className={`text-[11px] font-bold flex items-center gap-1 ${
                    highContrastMode ? 'text-yellow-400' : 'text-emerald-600 dark:text-emerald-400'
                  }`}>
                    <Sparkles className="w-3 h-3" /> Auto-Triage
                  </span>
                </div>
              </div>
              <textarea
                rows={3}
                value={form.symptoms}
                onChange={handleSymptomChange}
                placeholder="Describe your health problem or symptoms (e.g. chest pain, severe cough, high fever, knee joint sprain)..."
                className={`w-full p-3 text-sm rounded-xl border font-medium focus:outline-none transition-all ${
                  errors.symptoms 
                    ? 'border-rose-500 ring-2 ring-rose-500/30' 
                    : highContrastMode 
                    ? 'border-yellow-400 bg-black text-white focus:ring-2 focus:ring-yellow-400' 
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white focus:border-emerald-500'
                }`}
              />
              
              <div className="mt-2 flex flex-wrap gap-1.5">
                {quickSymptoms.slice(0, 4).map((sym, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSymptomSelect(sym)}
                    className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors cursor-pointer font-medium ${
                      highContrastMode
                        ? 'border-yellow-400/50 bg-neutral-900 text-yellow-300 hover:bg-black'
                        : 'bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    + {sym}
                  </button>
                ))}
              </div>
              {errors.symptoms && (
                <p className="text-rose-500 text-xs mt-1 flex items-center gap-1 font-bold">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.symptoms}
                </p>
              )}
            </div>

            {/* Regional Language for Automated Message & Call */}
            <div className="pt-2 border-t border-inherit">
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Globe className={`w-4 h-4 ${highContrastMode ? 'text-yellow-400' : 'text-emerald-600'}`} />
                <span>Regional Language for Automated Voice Call & SMS</span>
              </label>
              
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {SUPPORTED_LANGUAGES.map(lang => {
                  const isSelected = form.language === lang.code;
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => {
                        setForm(prev => ({ ...prev, language: lang.code }));
                        setAppLanguage(lang.code);
                      }}
                      className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                        isSelected
                          ? highContrastMode
                            ? 'border-white bg-yellow-400 text-black font-black ring-2 ring-yellow-400'
                            : 'border-emerald-600 bg-emerald-600 text-white font-bold shadow-sm'
                          : highContrastMode
                          ? 'border-yellow-400/40 bg-black text-white hover:bg-neutral-800'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      <div className="text-sm font-extrabold">{lang.nativeName}</div>
                      <div className="text-[10px] opacity-80">{lang.name}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                className={`w-full font-black py-3.5 px-6 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 text-base cursor-pointer border-2 ${
                  highContrastMode
                    ? 'bg-yellow-400 text-black border-white hover:bg-yellow-300'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 shadow-emerald-700/25'
                }`}
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>{getUIText(form.language, 'generateTokenBtn')}</span>
              </button>
            </div>

          </form>
        </div>

        {/* Right Preview / Generated Token Card (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {createdToken ? (
            <div className={`rounded-3xl p-6 shadow-xl border-2 relative overflow-hidden animate-slide-up ${
              highContrastMode
                ? 'bg-black border-yellow-400 text-white ring-2 ring-yellow-400'
                : 'bg-white dark:bg-slate-900 border-emerald-500/40'
            }`}>
              
              <div className="flex items-center justify-between pb-4 border-b border-inherit">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    highContrastMode ? 'bg-yellow-400 text-black' : 'bg-emerald-100 text-emerald-600'
                  }`}>
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm">Token Generated Successfully</h3>
                    <p className={`text-[11px] font-bold ${highContrastMode ? 'text-yellow-400' : 'text-emerald-600'}`}>
                      Live Queue Tracking Activated
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-neutral-800 text-yellow-400 border border-yellow-400/40">
                  {createdToken.trackingCode}
                </span>
              </div>

              {/* Big Token Number Display */}
              <div className={`py-6 text-center rounded-2xl my-4 border ${
                highContrastMode
                  ? 'bg-neutral-900 border-yellow-400 text-white'
                  : 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/40'
              }`}>
                <span className="text-xs uppercase font-extrabold tracking-widest opacity-80">
                  {getUIText(createdToken.language, 'yourToken')}
                </span>
                <div className={`text-5xl font-black font-mono tracking-tight my-1 ${
                  highContrastMode ? 'text-yellow-400' : 'text-emerald-600 dark:text-emerald-400'
                }`}>
                  {createdToken.formattedToken}
                </div>
                <p className="text-xs font-bold opacity-90">
                  {createdToken.patientName} • Age {createdToken.age} • {createdToken.gender}
                </p>
              </div>

              {/* Live Tracking Link Box */}
              <div className="pt-2 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="flex items-center gap-1.5">
                    <ExternalLink className="w-3.5 h-3.5 text-yellow-400" />
                    Dedicated Live Tracking Link
                  </span>
                  <button
                    onClick={handleCopyLink}
                    className="font-bold flex items-center gap-1 text-[11px] text-yellow-400 cursor-pointer"
                  >
                    {copiedLink ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copiedLink ? 'Copied Link!' : 'Copy Link'}
                  </button>
                </div>

                <div className="p-2.5 bg-neutral-900 rounded-xl border border-yellow-400/40 text-[11px] font-mono text-yellow-300 break-all select-all">
                  {trackingUrl}
                </div>

                {/* Primary CTA: Open Live Tracker */}
                <button
                  type="button"
                  onClick={onNavigateToTracker}
                  className={`w-full font-black py-3 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer border-2 ${
                    highContrastMode
                      ? 'bg-yellow-400 text-black border-white hover:bg-yellow-300'
                      : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent'
                  }`}
                >
                  <span>Open Dedicated Patient Live Tracking</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* Test Simulation buttons */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => triggerSimulatedCall(createdToken)}
                    className="bg-neutral-900 text-yellow-400 border border-yellow-400 font-bold py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    Simulate Call
                  </button>
                  <button
                    type="button"
                    onClick={() => triggerSimulatedSms(createdToken)}
                    className="bg-neutral-900 text-white border border-white/60 font-bold py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Simulate SMS
                  </button>
                </div>
              </div>

            </div>
          ) : (
            <div className={`rounded-3xl p-6 shadow-sm border space-y-4 ${
              highContrastMode ? 'bg-black border-yellow-400 text-white' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
            }`}>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold ${
                highContrastMode ? 'bg-yellow-400 text-black' : 'bg-emerald-50 text-emerald-600'
              }`}>
                <Stethoscope className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold">SwasthyaToken Protocol</h3>
                <p className="text-xs opacity-80 mt-1 leading-relaxed">
                  Enter patient details to automatically generate token, queue status and regional voice notification schedule.
                </p>
              </div>

              <div className="space-y-3 pt-2 text-xs">
                <div className="flex items-start gap-2.5">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5 ${
                    highContrastMode ? 'bg-yellow-400 text-black' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    1
                  </div>
                  <div>
                    <strong className="block">Dedicated Live Tracking Link:</strong>
                    <span className="opacity-80">Sent directly to patient's mobile phone via SMS.</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5 ${
                    highContrastMode ? 'bg-yellow-400 text-black' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    2
                  </div>
                  <div>
                    <strong className="block">Automated 10-Away Voice Call & SMS:</strong>
                    <span className="opacity-80">
                      Dispatched in your preferred regional language (Hindi, Telugu, Tamil, Kannada, etc.).
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
