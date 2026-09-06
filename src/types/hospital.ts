// Hospital and Medical Resource Types
export type HospitalVerificationStatus = 'pending' | 'verified' | 'rejected' | 'suspended';
export type BedType = 'icu' | 'general' | 'private' | 'emergency' | 'pediatric' | 'maternity';
export type BedStatus = 'available' | 'occupied' | 'maintenance' | 'reserved';
export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export interface Hospital {
  id: string; name: string; display_name?: string; type: 'government' | 'private' | 'charitable' | 'trust';
  category: 'medical_college' | 'district_hospital' | 'sub_district' | 'community' | 'primary_healthcare' | 'nursing_home' | 'clinic';
  address: string; city: string; district: string; state: string; pincode: string; phone: string; email?: string;
  latitude?: number; longitude?: number; verification_status: HospitalVerificationStatus; verified_at?: string;
  verified_by?: string; license_number?: string; bed_capacity?: number; icu_capacity?: number;
  created_at: string; updated_at: string;
}
export interface HospitalStaff { id: string; user_id: string; hospital_id: string; department?: string; designation: string; employee_id?: string; is_active: boolean; permissions: string[]; created_at: string; updated_at: string; }
export interface Bed { id: string; hospital_id: string; bed_type: BedType; bed_number: string; ward?: string; floor?: string; status: BedStatus; is_icu: boolean; has_oxygen: boolean; has_ventilator: boolean; price_per_day?: number; created_at: string; updated_at: string; }
export interface Medicine { id: string; name: string; generic_name?: string; category: string; unit: string; dosage_form?: string; strength?: string; manufacturer?: string; created_at: string; }
export interface MedicineInventory { id: string; hospital_id: string; medicine_id: string; batch_number?: string; expiry_date?: string; quantity: number; min_quantity: number; location?: string; last_updated: string; updated_by?: string; created_at: string; }
export interface BloodInventory { id: string; hospital_id: string; blood_group: BloodGroup; units_available: number; units_minimum: number; last_updated: string; updated_by?: string; created_at: string; }
export interface Doctor { id: string; hospital_id: string; name: string; specialization: string; qualification: string; registration_number?: string; experience_years?: number; phone?: string; email?: string; is_active: boolean; consultation_fee?: number; created_at: string; updated_at: string; }
export interface DoctorAvailability { id: string; doctor_id: string; day_of_week: number; start_time: string; end_time: string; is_available: boolean; max_appointments?: number; created_at: string; updated_at: string; }
