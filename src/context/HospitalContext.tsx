import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { PatientToken, NotificationLog, RegionalLanguage, Gender, TokenStatus } from '../types';
import { DEPARTMENTS, getDepartmentById } from '../data/departments';
import { generateAutomatedMessage, getLanguageMeta } from '../utils/languages';
import { playHospitalChime } from '../utils/audio';

interface NewTokenInput {
  patientName: string;
  phoneNumber: string;
  age: number;
  gender: Gender;
  symptoms: string;
  departmentId: string;
  language: RegionalLanguage;
}

interface HospitalContextType {
  tokens: PatientToken[];
  currentServingTokens: Record<string, number>;
  activeTrackingToken: PatientToken | null;
  notificationLogs: NotificationLog[];
  appLanguage: RegionalLanguage;
  highContrastMode: boolean;
  incomingCall: {
    isOpen: boolean;
    token: PatientToken | null;
    message: string;
    language: RegionalLanguage;
    peopleAway: number;
    currentToken: string;
  } | null;
  smsPreview: {
    isOpen: boolean;
    token: PatientToken | null;
    message: string;
    language: RegionalLanguage;
  } | null;
  autoQueueAdvance: boolean;
  
  // Actions
  generateToken: (input: NewTokenInput) => PatientToken;
  setActiveTrackingTokenId: (tokenId: string | null) => void;
  setAppLanguage: (lang: RegionalLanguage) => void;
  toggleHighContrastMode: () => void;
  updateTokenLanguage: (tokenId: string, lang: RegionalLanguage) => void;
  advanceQueueForDepartment: (departmentId: string) => void;
  setServingTokenForDepartment: (departmentId: string, tokenNumber: number) => void;
  markTokenStatus: (tokenId: string, status: TokenStatus) => void;
  triggerSimulatedCall: (token: PatientToken) => void;
  triggerSimulatedSms: (token: PatientToken) => void;
  closeIncomingCall: () => void;
  closeSmsPreview: () => void;
  toggleAutoQueueAdvance: () => void;
  resetSampleData: () => void;
}

const HospitalContext = createContext<HospitalContextType | undefined>(undefined);

function generateSeedTokens(): { tokens: PatientToken[]; servingMap: Record<string, number> } {
  const servingMap: Record<string, number> = {
    'gen-med': 14,
    'cardio': 6,
    'ortho': 8,
    'pediatrics': 5,
    'ent': 7,
    'derma': 4,
    'emergency': 2
  };

  const seed: PatientToken[] = [];

  for (let i = 1; i <= 14; i++) {
    seed.push({
      id: `seed-gen-${i}`,
      tokenNumber: i,
      formattedToken: `GEN-${String(i).padStart(3, '0')}`,
      trackingCode: `ST-100${i}`,
      patientName: i === 14 ? 'Ramesh Verma' : `Patient #${i}`,
      phoneNumber: `+91 98765 432${String(i).padStart(2, '0')}`,
      age: 30 + (i % 30),
      gender: i % 2 === 0 ? 'Male' : 'Female',
      symptoms: 'Fever and viral cough for 3 days',
      departmentId: 'gen-med',
      departmentName: 'General Medicine',
      roomNumber: 'OPD-102',
      doctorName: 'Dr. Arvind Kumar (MD)',
      language: i % 3 === 0 ? 'hi' : (i % 3 === 1 ? 'te' : 'en'),
      status: i === 14 ? 'IN_CONSULTATION' : 'COMPLETED',
      createdAt: new Date(Date.now() - (15 - i) * 12 * 60000).toISOString(),
      initialQueuePosition: i,
      alert10AwaySent: true,
      alertNextSent: true
    });
  }

  const names = ['Anita Sharma', 'Karthik Rao', 'Pooja Iyer', 'Mohammed Bilal', 'Lakshmi Devi', 'Suresh Patel', 'Geeta Reddy', 'Amit Roy', 'Deepak Joshi'];
  for (let i = 15; i <= 23; i++) {
    const idx = i - 15;
    seed.push({
      id: `seed-gen-${i}`,
      tokenNumber: i,
      formattedToken: `GEN-${String(i).padStart(3, '0')}`,
      trackingCode: `ST-200${i}`,
      patientName: names[idx] || `Patient #${i}`,
      phoneNumber: `+91 98450 112${String(idx).padStart(2, '0')}`,
      age: 24 + idx * 4,
      gender: idx % 2 === 0 ? 'Female' : 'Male',
      symptoms: idx % 2 === 0 ? 'Severe cold and throat irritation' : 'High fever and bodily fatigue',
      departmentId: 'gen-med',
      departmentName: 'General Medicine',
      roomNumber: 'OPD-102',
      doctorName: 'Dr. Arvind Kumar (MD)',
      language: ['hi', 'te', 'ta', 'kn', 'en', 'mr', 'bn', 'ml', 'gu'][idx % 9] as RegionalLanguage,
      status: 'WAITING',
      createdAt: new Date(Date.now() - (24 - i) * 5 * 60000).toISOString(),
      initialQueuePosition: i,
      alert10AwaySent: false,
      alertNextSent: false
    });
  }

  return { tokens: seed, servingMap };
}

export const HospitalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tokens, setTokens] = useState<PatientToken[]>(() => {
    const saved = localStorage.getItem('swasthya_tokens');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return generateSeedTokens().tokens;
  });

  const [currentServingTokens, setCurrentServingTokens] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('swasthya_serving');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return generateSeedTokens().servingMap;
  });

  const [activeTrackingTokenId, setActiveTrackingTokenIdState] = useState<string | null>(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const trackParam = urlParams.get('track');
    return trackParam || null;
  });

  const [appLanguage, setAppLanguageState] = useState<RegionalLanguage>(() => {
    const saved = localStorage.getItem('swasthya_language') as RegionalLanguage;
    return saved || 'hi'; // Default regional language Hindi or English
  });

  const [highContrastMode, setHighContrastMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('swasthya_high_contrast');
    return saved === 'true';
  });

  const [notificationLogs, setNotificationLogs] = useState<NotificationLog[]>(() => {
    const saved = localStorage.getItem('swasthya_notifications');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [];
  });

  const [incomingCall, setIncomingCall] = useState<{
    isOpen: boolean;
    token: PatientToken | null;
    message: string;
    language: RegionalLanguage;
    peopleAway: number;
    currentToken: string;
  } | null>(null);

  const [smsPreview, setSmsPreview] = useState<{
    isOpen: boolean;
    token: PatientToken | null;
    message: string;
    language: RegionalLanguage;
  } | null>(null);

  const [autoQueueAdvance, setAutoQueueAdvance] = useState<boolean>(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('swasthya_tokens', JSON.stringify(tokens));
  }, [tokens]);

  useEffect(() => {
    localStorage.setItem('swasthya_serving', JSON.stringify(currentServingTokens));
  }, [currentServingTokens]);

  useEffect(() => {
    localStorage.setItem('swasthya_notifications', JSON.stringify(notificationLogs));
  }, [notificationLogs]);

  useEffect(() => {
    localStorage.setItem('swasthya_language', appLanguage);
  }, [appLanguage]);

  useEffect(() => {
    localStorage.setItem('swasthya_high_contrast', String(highContrastMode));
    if (highContrastMode) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }, [highContrastMode]);

  const toggleHighContrastMode = useCallback(() => {
    setHighContrastMode(prev => !prev);
  }, []);

  const setAppLanguage = useCallback((lang: RegionalLanguage) => {
    setAppLanguageState(lang);
    // If active token exists, also update its language preference
    if (activeTrackingTokenId) {
      setTokens(prev => prev.map(t => {
        if (t.id === activeTrackingTokenId || t.trackingCode === activeTrackingTokenId) {
          return { ...t, language: lang };
        }
        return t;
      }));
    }
  }, [activeTrackingTokenId]);

  const updateTokenLanguage = useCallback((tokenId: string, lang: RegionalLanguage) => {
    setTokens(prev => prev.map(t => {
      if (t.id === tokenId || t.trackingCode === tokenId) {
        return { ...t, language: lang };
      }
      return t;
    }));
    setAppLanguageState(lang);
  }, []);

  const activeTrackingToken = tokens.find(t => t.id === activeTrackingTokenId || t.trackingCode === activeTrackingTokenId) || null;

  const setActiveTrackingTokenId = useCallback((tokenId: string | null) => {
    setActiveTrackingTokenIdState(tokenId);
    if (tokenId) {
      const url = new URL(window.location.href);
      url.searchParams.set('track', tokenId);
      window.history.replaceState({}, '', url.toString());

      // If token has a specific language, sync app language with it
      const matched = tokens.find(t => t.id === tokenId || t.trackingCode === tokenId);
      if (matched) {
        setAppLanguageState(matched.language);
      }
    }
  }, [tokens]);

  const dispatchAlert = useCallback((token: PatientToken, peopleAway: number, currentServingNum: number, reason: '10_AWAY' | 'MANUAL') => {
    const dept = getDepartmentById(token.departmentId);
    const currentTokenFormatted = `${dept.code}-${String(currentServingNum).padStart(3, '0')}`;
    
    const regionalMsg = generateAutomatedMessage(token.language, {
      currentToken: currentTokenFormatted,
      patientToken: token.formattedToken,
      peopleAway,
      department: token.departmentName,
      room: token.roomNumber,
      patientName: token.patientName
    });

    const now = new Date().toISOString();

    const smsLog: NotificationLog = {
      id: `notif-sms-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      tokenId: token.id,
      tokenFormatted: token.formattedToken,
      patientName: token.patientName,
      phoneNumber: token.phoneNumber,
      channel: 'SMS',
      language: token.language,
      message: regionalMsg,
      currentRunningToken: currentTokenFormatted,
      peopleAway,
      timestamp: now,
      status: 'DELIVERED'
    };

    const callLog: NotificationLog = {
      id: `notif-call-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      tokenId: token.id,
      tokenFormatted: token.formattedToken,
      patientName: token.patientName,
      phoneNumber: token.phoneNumber,
      channel: 'VOICE_CALL',
      language: token.language,
      message: regionalMsg,
      currentRunningToken: currentTokenFormatted,
      peopleAway,
      timestamp: now,
      status: 'RINGING',
      audioDurationSeconds: 15
    };

    setNotificationLogs(prev => [callLog, smsLog, ...prev]);

    setIncomingCall({
      isOpen: true,
      token,
      message: regionalMsg,
      language: token.language,
      peopleAway,
      currentToken: currentTokenFormatted
    });

    setSmsPreview({
      isOpen: true,
      token,
      message: regionalMsg,
      language: token.language
    });

    setTokens(prev => prev.map(t => {
      if (t.id === token.id) {
        return {
          ...t,
          alert10AwaySent: true,
          status: 'ALERTED_10_AWAY',
          lastNotifiedAt: now
        };
      }
      return t;
    }));
  }, []);

  const checkQueueThresholds = useCallback((deptId: string, currentServingNum: number) => {
    const deptTokens = tokens.filter(t => t.departmentId === deptId && t.status !== 'COMPLETED' && t.status !== 'MISSED');
    deptTokens.forEach(t => {
      const distance = t.tokenNumber - currentServingNum;
      if (distance === 10 && !t.alert10AwaySent) {
        dispatchAlert(t, 10, currentServingNum, '10_AWAY');
      }
    });
  }, [tokens, dispatchAlert]);

  const generateToken = useCallback((input: NewTokenInput): PatientToken => {
    const dept = getDepartmentById(input.departmentId);
    const deptTokens = tokens.filter(t => t.departmentId === input.departmentId);
    const highestNum = deptTokens.reduce((max, t) => Math.max(max, t.tokenNumber), 0);
    const nextNum = highestNum > 0 ? highestNum + 1 : 1;
    const currentServing = currentServingTokens[input.departmentId] || 1;
    const peopleAway = Math.max(0, nextNum - currentServing);

    const formattedToken = `${dept.code}-${String(nextNum).padStart(3, '0')}`;
    const trackingCode = `ST-${Math.floor(10000 + Math.random() * 90000)}`;

    const newToken: PatientToken = {
      id: `tok-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      tokenNumber: nextNum,
      formattedToken,
      trackingCode,
      patientName: input.patientName.trim(),
      phoneNumber: input.phoneNumber.trim(),
      age: Number(input.age),
      gender: input.gender,
      symptoms: input.symptoms.trim(),
      departmentId: input.departmentId,
      departmentName: dept.name,
      roomNumber: dept.roomNumber,
      doctorName: dept.doctorName,
      language: input.language,
      status: 'WAITING',
      createdAt: new Date().toISOString(),
      initialQueuePosition: nextNum,
      alert10AwaySent: false,
      alertNextSent: false
    };

    setTokens(prev => [...prev, newToken]);
    setActiveTrackingTokenIdState(newToken.id);
    setAppLanguageState(input.language);

    const regMsg = `Hello ${newToken.patientName}, your token ${formattedToken} for ${dept.name} (${dept.roomNumber}) is generated. Current serving token is ${dept.code}-${String(currentServing).padStart(3, '0')}. You are ${peopleAway} people away. Live track: ${window.location.origin}?track=${trackingCode}`;
    const regLog: NotificationLog = {
      id: `notif-reg-${Date.now()}`,
      tokenId: newToken.id,
      tokenFormatted: formattedToken,
      patientName: newToken.patientName,
      phoneNumber: newToken.phoneNumber,
      channel: 'SMS',
      language: input.language,
      message: regMsg,
      currentRunningToken: `${dept.code}-${String(currentServing).padStart(3, '0')}`,
      peopleAway,
      timestamp: new Date().toISOString(),
      status: 'DELIVERED'
    };
    setNotificationLogs(prev => [regLog, ...prev]);

    if (peopleAway === 10) {
      setTimeout(() => {
        dispatchAlert(newToken, 10, currentServing, '10_AWAY');
      }, 1200);
    }

    playHospitalChime();
    return newToken;
  }, [tokens, currentServingTokens, dispatchAlert]);

  const advanceQueueForDepartment = useCallback((departmentId: string) => {
    const current = currentServingTokens[departmentId] || 1;
    const next = current + 1;
    
    setTokens(prev => prev.map(t => {
      if (t.departmentId === departmentId && t.tokenNumber === current) {
        return { ...t, status: 'COMPLETED', completedAt: new Date().toISOString() };
      }
      if (t.departmentId === departmentId && t.tokenNumber === next) {
        return { ...t, status: 'IN_CONSULTATION' };
      }
      return t;
    }));

    setCurrentServingTokens(prev => ({
      ...prev,
      [departmentId]: next
    }));

    playHospitalChime();
    checkQueueThresholds(departmentId, next);
  }, [currentServingTokens, checkQueueThresholds]);

  const setServingTokenForDepartment = useCallback((departmentId: string, tokenNumber: number) => {
    setCurrentServingTokens(prev => ({
      ...prev,
      [departmentId]: tokenNumber
    }));
    checkQueueThresholds(departmentId, tokenNumber);
  }, [checkQueueThresholds]);

  const markTokenStatus = useCallback((tokenId: string, status: TokenStatus) => {
    setTokens(prev => prev.map(t => t.id === tokenId ? { ...t, status } : t));
  }, []);

  const triggerSimulatedCall = useCallback((token: PatientToken) => {
    const currentServing = currentServingTokens[token.departmentId] || 1;
    const peopleAway = Math.max(0, token.tokenNumber - currentServing);
    dispatchAlert(token, peopleAway, currentServing, 'MANUAL');
  }, [currentServingTokens, dispatchAlert]);

  const triggerSimulatedSms = useCallback((token: PatientToken) => {
    const currentServing = currentServingTokens[token.departmentId] || 1;
    const peopleAway = Math.max(0, token.tokenNumber - currentServing);
    const dept = getDepartmentById(token.departmentId);
    const currentTokenFormatted = `${dept.code}-${String(currentServing).padStart(3, '0')}`;
    
    const message = generateAutomatedMessage(token.language, {
      currentToken: currentTokenFormatted,
      patientToken: token.formattedToken,
      peopleAway,
      department: token.departmentName,
      room: token.roomNumber,
      patientName: token.patientName
    });

    setSmsPreview({
      isOpen: true,
      token,
      message,
      language: token.language
    });

    const smsLog: NotificationLog = {
      id: `notif-sms-${Date.now()}`,
      tokenId: token.id,
      tokenFormatted: token.formattedToken,
      patientName: token.patientName,
      phoneNumber: token.phoneNumber,
      channel: 'SMS',
      language: token.language,
      message,
      currentRunningToken: currentTokenFormatted,
      peopleAway,
      timestamp: new Date().toISOString(),
      status: 'DELIVERED'
    };
    setNotificationLogs(prev => [smsLog, ...prev]);
  }, [currentServingTokens]);

  const closeIncomingCall = useCallback(() => {
    setIncomingCall(null);
  }, []);

  const closeSmsPreview = useCallback(() => {
    setSmsPreview(null);
  }, []);

  const toggleAutoQueueAdvance = useCallback(() => {
    setAutoQueueAdvance(prev => !prev);
  }, []);

  const resetSampleData = useCallback(() => {
    const { tokens: initialTokens, servingMap } = generateSeedTokens();
    setTokens(initialTokens);
    setCurrentServingTokens(servingMap);
    setNotificationLogs([]);
    setActiveTrackingTokenIdState(null);
    localStorage.removeItem('swasthya_tokens');
    localStorage.removeItem('swasthya_serving');
    localStorage.removeItem('swasthya_notifications');
  }, []);

  useEffect(() => {
    if (!autoQueueAdvance) return;
    const interval = setInterval(() => {
      advanceQueueForDepartment('gen-med');
    }, 15000);
    return () => clearInterval(interval);
  }, [autoQueueAdvance, advanceQueueForDepartment]);

  return (
    <HospitalContext.Provider
      value={{
        tokens,
        currentServingTokens,
        activeTrackingToken,
        notificationLogs,
        appLanguage,
        highContrastMode,
        incomingCall,
        smsPreview,
        autoQueueAdvance,
        generateToken,
        setActiveTrackingTokenId,
        setAppLanguage,
        toggleHighContrastMode,
        updateTokenLanguage,
        advanceQueueForDepartment,
        setServingTokenForDepartment,
        markTokenStatus,
        triggerSimulatedCall,
        triggerSimulatedSms,
        closeIncomingCall,
        closeSmsPreview,
        toggleAutoQueueAdvance,
        resetSampleData
      }}
    >
      {children}
    </HospitalContext.Provider>
  );
};

export const useHospital = (): HospitalContextType => {
  const context = useContext(HospitalContext);
  if (!context) {
    throw new Error('useHospital must be used within a HospitalProvider');
  }
  return context;
};
