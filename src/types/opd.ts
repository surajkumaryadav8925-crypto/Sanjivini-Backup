// OPD, Emergency and Review Types

export interface OPDQueue {
  id: string;
  hospital_id: string;
  department: string;
  date: string;
  total_tokens: number;
  current_token: number;
  average_wait_time?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type OPDQueueStatus = 'waiting' | 'called' | 'in_progress' | 'completed' | 'skipped' | 'no_show';

export interface OPDToken {
  id: string;
  queue_id: string;
  patient_id: string;
  token_number: number;
  status: OPDQueueStatus;
  estimated_time?: string;
  called_at?: string;
  started_at?: string;
  completed_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: string;
  patient_id: string;
  hospital_id: string;
  doctor_id: string;
  appointment_date: string;
  appointment_time: string;
  department: string;
  reason?: string;
  status: AppointmentStatus;
  is_urgent: boolean;
  created_at: string;
  updated_at: string;
}

export type AppointmentStatus = 'scheduled' | 'checked_in' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';

export interface EmergencyAlert {
  id: string;
  patient_id: string;
  location_lat?: number;
  location_lng?: number;
  location_address?: string;
  emergency_type: string;
  description?: string;
  status: EmergencyStatus;
  assigned_hospital_id?: string;
  ambulance_requested: boolean;
  created_at: string;
  resolved_at?: string;
}

export type EmergencyStatus = 'reported' | 'dispatched' | 'in_progress' | 'resolved' | 'cancelled';

export interface AmbulanceRequest {
  id: string;
  emergency_alert_id: string;
  patient_id: string;
  pickup_location: string;
  pickup_lat?: number;
  pickup_lng?: number;
  destination_hospital_id?: string;
  status: string;
  ambulance_type?: string;
  eta_minutes?: number;
  driver_name?: string;
  driver_phone?: string;
  created_at: string;
  updated_at: string;
}

export interface HospitalReview {
  id: string;
  hospital_id: string;
  patient_id: string;
  rating: number;
  title?: string;
  comment?: string;
  staff_rating?: number;
  cleanliness_rating?: number;
  facilities_rating?: number;
  status: ReviewStatus;
  hospital_response?: string;
  responded_at?: string;
  created_at: string;
  updated_at: string;
}

export type ReviewStatus = 'pending' | 'approved' | 'rejected' | 'flagged';
