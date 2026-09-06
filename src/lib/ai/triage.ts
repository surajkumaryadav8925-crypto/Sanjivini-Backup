// AI Triage Engine
import type { TriageSymptom, TriageResult, RiskLevel, Gender } from '@/types';

const RED_FLAGS = ['chest pain', 'difficulty breathing', 'severe bleeding', 'loss of consciousness', 'stroke symptoms', 'seizures', 'severe burns', 'poisoning', 'uncontrollable bleeding', 'sudden weakness'];
const YELLOW_FLAGS = ['high fever', 'persistent vomiting', 'severe dehydration', 'moderate pain', 'breathing difficulty', 'confusion', 'blood in stool', 'severe abdominal pain', 'fainting', 'severe headache'];

const CONDITIONS: Record<string, { s: string[]; sp: string; c: string[] }> = {
  respiratory: { s: ['cough', 'fever', 'breathing difficulty', 'sore throat'], sp: 'Pulmonology', c: ['Common Cold', 'Flu', 'Bronchitis', 'Pneumonia'] },
  cardiovascular: { s: ['chest pain', 'shortness of breath', 'palpitations', 'dizziness'], sp: 'Cardiology', c: ['Angina', 'Heart Arrhythmia', 'High Blood Pressure'] },
  gastrointestinal: { s: ['abdominal pain', 'nausea', 'vomiting', 'diarrhea'], sp: 'Gastroenterology', c: ['Gastritis', 'Food Poisoning', 'GERD', 'Appendicitis'] },
  neurological: { s: ['headache', 'dizziness', 'confusion', 'numbness'], sp: 'Neurology', c: ['Migraine', 'Tension Headache', 'Vertigo'] },
  musculoskeletal: { s: ['joint pain', 'back pain', 'muscle pain', 'stiffness'], sp: 'Orthopedics', c: ['Arthritis', 'Muscle Strain', 'Back Pain'] },
  skin: { s: ['rash', 'itching', 'redness', 'swelling'], sp: 'Dermatology', c: ['Allergic Reaction', 'Eczema', 'Dermatitis'] },
  general: { s: ['fever', 'fatigue', 'body aches', 'chills'], sp: 'General Medicine', c: ['Viral Infection', 'Flu', 'Dehydration'] }
};

export interface TriageInput { symptoms: TriageSymptom[]; age: number; gender: Gender; medicalHistory?: string[]; medications?: string[]; }

export function checkRedFlags(symptoms: TriageSymptom[]): string[] {
  const text = symptoms.map(s => s.name.toLowerCase()).join(' ');
  return RED_FLAGS.filter(f => text.includes(f)).map(f => `Immediate attention: ${f}`);
}

export function determineRiskLevel(symptoms: TriageSymptom[], redFlags: string[]): RiskLevel {
  if (redFlags.length > 0) return 'red';
  const text = symptoms.map(s => s.name.toLowerCase()).join(' ');
  if (YELLOW_FLAGS.some(f => text.includes(f)) || symptoms.some(s => (s.severity || 1) >= 4)) return 'yellow';
  return 'green';
}

export function matchConditions(symptoms: TriageSymptom[]): { conditions: string[]; specialization: string } {
  const text = symptoms.map(s => s.name.toLowerCase()).join(' ');
  let best = CONDITIONS.general, max = 0;
  for (const p of Object.values(CONDITIONS)) {
    const m = p.s.filter(s => text.includes(s)).length;
    if (m > max) { max = m; best = p; }
  }
  return { conditions: best.c.slice(0, 3), specialization: best.sp };
}

export function getRiskColorClass(r: RiskLevel): string {
  return r === 'red' ? 'bg-red-500 text-white' : r === 'yellow' ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white';
}

export function getRiskLabel(r: RiskLevel): string {
  return r === 'red' ? 'EMERGENCY' : r === 'yellow' ? 'URGENT' : 'NON-URGENT';
}

export function performTriage(input: TriageInput): TriageResult {
  const { symptoms } = input;
  const redFlags = checkRedFlags(symptoms);
  const riskLevel = determineRiskLevel(symptoms, redFlags);
  const { conditions, specialization } = matchConditions(symptoms);
  
  const [action, urgency] = riskLevel === 'red' 
    ? ['EMERGENCY: Seek immediate medical attention at the nearest hospital.', 1]
    : riskLevel === 'yellow'
    ? ['URGENT: Visit a hospital or clinic within hours.', 2]
    : ['NON-URGENT: Schedule appointment within 24-48 hours.', 3];

  const confidence = Math.min(0.95, 0.5 + (symptoms.length * 0.1) + (symptoms.some(s => s.severity) ? 0.2 : 0));

  return {
    id: crypto.randomUUID(), session_id: '', risk_level: riskLevel,
    possible_conditions: conditions, confidence: Math.round(confidence * 100),
    recommended_action: action, recommended_specialization: specialization,
    red_flags: redFlags, urgency_level: urgency,
    self_care_instructions: riskLevel === 'red' ? 'Seek emergency care immediately.' : 'Rest, stay hydrated, monitor symptoms.',
    when_to_seek_care: riskLevel === 'red' ? 'NOW - Emergency' : 'If symptoms worsen.',
    disclaimer: 'This is informational only. Consult a healthcare professional. In emergencies, call emergency services.',
    created_at: new Date().toISOString()
  };
}
