// Core Types
export type UserRole = 'patient' | 'hospital_staff' | 'government_admin' | 'super_admin';
export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say';
export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
export type RiskLevel = 'red' | 'yellow' | 'green';
export type TriageStatus = 'in_progress' | 'completed' | 'cancelled';
export type BedType = 'icu' | 'general' | 'private' | 'emergency' | 'pediatric' | 'maternity';
export type BedStatus = 'available' | 'occupied' | 'maintenance' | 'reserved';
export type SyncStatus = 'pending' | 'syncing' | 'synced' | 'failed';
export type OfflineOperationType = 'create' | 'update' | 'delete';
export type OPDQueueStatus = 'waiting' | 'called' | 'in_progress' | 'completed' | 'skipped' | 'no_show';
export type ReviewStatus = 'pending' | 'approved' | 'rejected' | 'flagged';

export interface Profile { id: string; email: string; full_name: string; phone?: string; role: UserRole; avatar_url?: string; created_at: string; updated_at: string; last_login?: string; is_active: boolean; }
export interface Patient { id: string; user_id: string; abha_id?: string; abha_profile_id?: string; date_of_birth: string; gender: Gender; blood_group?: BloodGroup; address?: string; city?: string; district?: string; state?: string; pincode?: string; emergency_contact_name?: string; emergency_contact_phone?: string; emergency_contact_relation?: string; allergies?: string[]; chronic_conditions?: string[]; created_at: string; updated_at: string; }
export interface FamilyMember { id: string; patient_id: string; full_name: string; date_of_birth: string; gender: Gender; relation: string; blood_group?: BloodGroup; phone?: string; email?: string; abha_id?: string; is_primary: boolean; created_at: string; updated_at: string; }
export interface TriageSymptom { id: string; name: string; severity?: number; duration?: string; body_part?: string; }
export interface TriageResult { id: string; session_id: string; risk_level: RiskLevel; possible_conditions: string[]; confidence: number; recommended_action: string; recommended_specialization?: string; red_flags: string[]; urgency_level: number; self_care_instructions?: string; when_to_seek_care?: string; disclaimer: string; created_at: string; }
export interface TriageSession { id: string; patient_id: string; symptoms: TriageSymptom[]; age: number; gender: Gender; medical_history?: string[]; medications?: string[]; result?: TriageResult; status: TriageStatus; preferred_language?: string; voice_input_used: boolean; created_at: string; completed_at?: string; }
export interface OPDQueue { id: string; hospital_id: string; department: string; date: string; total_tokens: number; current_token: number; average_wait_time?: number; is_active: boolean; created_at: string; updated_at: string; }
export interface OPDToken { id: string; queue_id: string; patient_id: string; token_number: number; status: OPDQueueStatus; estimated_time?: string; called_at?: string; started_at?: string; completed_at?: string; notes?: string; created_at: string; updated_at: string; }
export interface EmergencyAlert { id: string; patient_id: string; location_lat?: number; location_lng?: number; location_address?: string; emergency_type: string; description?: string; status: 'reported' | 'dispatched' | 'in_progress' | 'resolved' | 'cancelled'; assigned_hospital_id?: string; ambulance_requested: boolean; created_at: string; resolved_at?: string; }
export interface HospitalReview { id: string; hospital_id: string; patient_id: string; rating: number; title?: string; comment?: string; status: ReviewStatus; hospital_response?: string; responded_at?: string; created_at: string; updated_at: string; }
export interface OfflineOperation { id: string; user_id: string; entity_type: string; entity_id: string; operation: OfflineOperationType; payload: Record<string, unknown>; status: SyncStatus; retry_count: number; last_error?: string; created_at: string; synced_at?: string; }
export interface Hospital { id: string; name: string; display_name?: string; type: 'government' | 'private' | 'charitable' | 'trust'; category: 'medical_college' | 'district_hospital' | 'sub_district' | 'community' | 'primary_healthcare' | 'nursing_home' | 'clinic'; address: string; city: string; district: string; state: string; pincode: string; phone: string; email?: string; latitude?: number; longitude?: number; verification_status: 'pending' | 'verified' | 'rejected' | 'suspended'; verified_at?: string; verified_by?: string; license_number?: string; bed_capacity?: number; icu_capacity?: number; created_at: string; updated_at: string; }
export interface HospitalMatch { hospital: Hospital; distance_km: number; score: number; has_required_specialist: boolean; specialist_name?: string; icu_available: number; beds_available: number; medicine_available: boolean; blood_available: Record<BloodGroup, number>; estimated_arrival_time?: number; }
export interface PMJAYEligibility { patient_id: string; is_eligible: boolean; ration_card_number?: string; family_id?: string; sec_status?: string; district?: string; verified_at?: string; }
export interface ABDMSession { id: string; patient_id: string; transaction_id: string; purpose: string; hip_id?: string; status: string; created_at: string; expires_at?: string; }
export interface AmbulanceRequestInput { pickup_location: string; pickup_lat: number; pickup_lng: number; patient_id: string; emergency_type: string; }
export interface AmbulanceResponse { request_id: string; status: string; eta_minutes: number; ambulance_number?: string; }
export interface AmbulanceTrackingInfo { request_id: string; status: string; current_lat: number; current_lng: number; eta_minutes: number; driver_name?: string; driver_phone?: string; }

export interface ScanShareSession { id: string; patient_id: string; hospital_id?: string; qr_code: string; health_records_linked: string[]; expires_at: string; used_at?: string; created_at: string; }
