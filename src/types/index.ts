export type Gender = 'Male' | 'Female' | 'Other';

export type RegionalLanguage = 
  | 'en' // English
  | 'hi' // Hindi
  | 'te' // Telugu
  | 'ta' // Tamil
  | 'kn' // Kannada
  | 'ml' // Malayalam
  | 'mr' // Marathi
  | 'bn' // Bengali
  | 'gu' // Gujarati
  | 'pa'; // Punjabi

export type TokenStatus = 
  | 'WAITING' 
  | 'ALERTED_10_AWAY' 
  | 'NEXT_IN_LINE' 
  | 'IN_CONSULTATION' 
  | 'COMPLETED' 
  | 'MISSED';

export interface DepartmentInfo {
  id: string;
  name: string;
  code: string;
  floor: string;
  roomNumber: string;
  doctorName: string;
  avgConsultationMins: number;
  iconName: string;
  symptomsKeywords: string[];
}

export interface PatientToken {
  id: string;
  tokenNumber: number;
  formattedToken: string; // e.g. "GEN-024"
  trackingCode: string;   // e.g. "MQ-78392"
  patientName: string;    // MANDATORY
  phoneNumber: string;    // MANDATORY
  age: number;            // MANDATORY
  gender: Gender;         // MANDATORY
  symptoms: string;       // MANDATORY
  departmentId: string;
  departmentName: string;
  roomNumber: string;
  doctorName: string;
  language: RegionalLanguage;
  status: TokenStatus;
  createdAt: string;
  initialQueuePosition: number;
  alert10AwaySent: boolean;
  alertNextSent: boolean;
  lastNotifiedAt?: string;
  completedAt?: string;
}

export interface NotificationLog {
  id: string;
  tokenId: string;
  tokenFormatted: string;
  patientName: string;
  phoneNumber: string;
  channel: 'SMS' | 'VOICE_CALL' | 'WHATSAPP';
  language: RegionalLanguage;
  message: string;
  currentRunningToken: string;
  peopleAway: number;
  timestamp: string;
  status: 'DELIVERED' | 'ANSWERED' | 'RINGING' | 'FAILED';
  audioDurationSeconds?: number;
}
