// Triage Types
export type RiskLevel = 'red' | 'yellow' | 'green';
export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say';
export type TriageStatus = 'in_progress' | 'completed' | 'cancelled';

export interface TriageSymptom { id: string; name: string; severity?: number; duration?: string; body_part?: string; }
export interface TriageResult { id: string; session_id: string; risk_level: RiskLevel; possible_conditions: string[]; confidence: number; recommended_action: string; recommended_specialization?: string; red_flags: string[]; urgency_level: number; self_care_instructions?: string; when_to_seek_care?: string; disclaimer: string; created_at: string; }
export interface TriageSession { id: string; patient_id: string; symptoms: TriageSymptom[]; age: number; gender: Gender; medical_history?: string[]; medications?: string[]; result?: TriageResult; status: TriageStatus; preferred_language?: string; voice_input_used: boolean; created_at: string; completed_at?: string; }
