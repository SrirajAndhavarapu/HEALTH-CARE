import { DepartmentInfo } from '../types';

export const DEPARTMENTS: DepartmentInfo[] = [
  {
    id: 'gen-med',
    name: 'General Medicine',
    code: 'GEN',
    floor: '1st Floor - Wing A',
    roomNumber: 'OPD-102',
    doctorName: 'Dr. Arvind Kumar (MD)',
    avgConsultationMins: 4,
    iconName: 'Stethoscope',
    symptomsKeywords: ['fever', 'cold', 'cough', 'headache', 'weakness', 'body ache', 'vomiting', 'nausea', 'flu', 'infection', 'fatigue', 'chills']
  },
  {
    id: 'cardio',
    name: 'Cardiology',
    code: 'CARD',
    floor: '2nd Floor - Wing B',
    roomNumber: 'OPD-204',
    doctorName: 'Dr. Priya Nambiar (DM Cardio)',
    avgConsultationMins: 5,
    iconName: 'HeartPulse',
    symptomsKeywords: ['chest pain', 'palpitations', 'high bp', 'blood pressure', 'breathlessness', 'shortness of breath', 'heart', 'dizziness']
  },
  {
    id: 'ortho',
    name: 'Orthopedics & Joint Care',
    code: 'ORTH',
    floor: '1st Floor - Wing C',
    roomNumber: 'OPD-108',
    doctorName: 'Dr. Rajesh Sharma (MS Ortho)',
    avgConsultationMins: 4,
    iconName: 'Bone',
    symptomsKeywords: ['fracture', 'bone pain', 'knee pain', 'back pain', 'joint pain', 'sprain', 'swelling', 'arthritis', 'spine']
  },
  {
    id: 'pediatrics',
    name: 'Pediatrics & Child Care',
    code: 'PED',
    floor: '1st Floor - Wing B',
    roomNumber: 'OPD-105',
    doctorName: 'Dr. Sneha Reddy (MD Pedia)',
    avgConsultationMins: 4,
    iconName: 'Baby',
    symptomsKeywords: ['child fever', 'baby', 'child rash', 'pediatric', 'vaccination', 'child cough', 'toddler']
  },
  {
    id: 'ent',
    name: 'ENT (Ear, Nose & Throat)',
    code: 'ENT',
    floor: '2nd Floor - Wing A',
    roomNumber: 'OPD-202',
    doctorName: 'Dr. Vikram Deshmukh (MS ENT)',
    avgConsultationMins: 3,
    iconName: 'Ear',
    symptomsKeywords: ['ear pain', 'hearing loss', 'throat pain', 'tonsils', 'runny nose', 'sinus', 'voice loss', 'ear discharge']
  },
  {
    id: 'derma',
    name: 'Dermatology & Skin',
    code: 'DERM',
    floor: '3rd Floor - Wing A',
    roomNumber: 'OPD-301',
    doctorName: 'Dr. Ananya Sen (MD Derma)',
    avgConsultationMins: 4,
    iconName: 'Sparkles',
    symptomsKeywords: ['skin rash', 'itching', 'allergy', 'acne', 'fungal infection', 'eczema', 'hair loss', 'skin burn']
  },
  {
    id: 'emergency',
    name: 'Emergency & Casualty',
    code: 'EMRG',
    floor: 'Ground Floor - Emergency Gate',
    roomNumber: 'EMERG-01',
    doctorName: 'Dr. Rohan Mehta (Emergency Care)',
    avgConsultationMins: 3,
    iconName: 'Activity',
    symptomsKeywords: ['severe bleeding', 'unconscious', 'breathing difficulty', 'accident', 'poisoning', 'trauma', 'seizure', 'severe pain', 'emergency']
  }
];

export function getDepartmentById(id: string): DepartmentInfo {
  return DEPARTMENTS.find(d => d.id === id) || DEPARTMENTS[0];
}

export function recommendDepartment(symptoms: string): DepartmentInfo {
  const lower = symptoms.toLowerCase();
  for (const dept of DEPARTMENTS) {
    if (dept.symptomsKeywords.some(keyword => lower.includes(keyword))) {
      return dept;
    }
  }
  return DEPARTMENTS[0]; // fallback to General Medicine
}
