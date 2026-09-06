// API Response and Integration Types

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  meta?: {
    total?: number;
    page?: number;
    per_page?: number;
  };
}

export interface HospitalMatch {
  hospital: Hospital;
  distance_km: number;
  score: number;
  has_required_specialist: boolean;
  specialist_name?: string;
  icu_available: number;
  beds_available: number;
  medicine_available: boolean;
  blood_available: Record<BloodGroup, number>;
  estimated_arrival_time?: number;
}

import type { Hospital } from './hospital';
import type { BloodGroup } from './index';

export interface PMJAYEligibility {
  patient_id: string;
  is_eligible: boolean;
  ration_card_number?: string;
  family_id?: string;
  sec_status?: string;
  district?: string;
  verified_at?: string;
}

export interface ABDMSession {
  id: string;
  patient_id: string;
  transaction_id: string;
  purpose: string;
  hip_id?: string;
  status: string;
  created_at: string;
  expires_at?: string;
}

export interface ScanShareSession {
  id: string;
  patient_id: string;
  hospital_id?: string;
  qr_code: string;
  health_records_linked: string[];
  expires_at: string;
  used_at?: string;
  created_at: string;
}

// Provider Types for External Integrations
export interface VoiceProvider {
  transcribe(audioBlob: Blob, language: string): Promise<string>;
  getSupportedLanguages(): string[];
  isAvailable(): boolean;
}

export interface BloodAvailabilityProvider {
  checkAvailability(bloodGroup: BloodGroup, district?: string): Promise<BloodAvailabilityResult[]>;
  isAvailable(): boolean;
}

export interface BloodAvailabilityResult {
  hospital_id: string;
  hospital_name: string;
  blood_group: BloodGroup;
  units_available: number;
  last_updated: string;
  distance_km?: number;
}

export interface InsuranceEligibilityProvider {
  checkEligibility(patientId: string, aadhaarNumber?: string): Promise<PMJAYEligibility>;
  isAvailable(): boolean;
}

export interface AmbulanceProvider {
  requestAmbulance(request: AmbulanceRequestInput): Promise<AmbulanceResponse>;
  trackAmbulance(requestId: string): Promise<AmbulanceTrackingInfo>;
  isAvailable(): boolean;
}

export interface AmbulanceRequestInput {
  pickup_location: string;
  pickup_lat: number;
  pickup_lng: number;
  patient_id: string;
  emergency_type: string;
}

export interface AmbulanceResponse {
  request_id: string;
  status: string;
  eta_minutes: number;
  ambulance_number?: string;
}

export interface AmbulanceTrackingInfo {
  request_id: string;
  status: string;
  current_lat: number;
  current_lng: number;
  eta_minutes: number;
  driver_name?: string;
  driver_phone?: string;
}

export interface ABDMProvider {
  createSession(patientId: string, purpose: string): Promise<ABDMSession>;
  generateQRCode(sessionId: string): Promise<string>;
  linkHealthRecord(sessionId: string, recordType: string): Promise<void>;
  isAvailable(): boolean;
}
