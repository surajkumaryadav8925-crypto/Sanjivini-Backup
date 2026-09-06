// Profile and Patient Types
export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  last_login?: string;
  is_active: boolean;
}

export interface Patient {
  id: string;
  user_id: string;
  abha_id?: string;
  abha_profile_id?: string;
  date_of_birth: string;
  gender: Gender;
  blood_group?: BloodGroup;
  address?: string;
  city?: string;
  district?: string;
  state?: string;
  pincode?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relation?: string;
  allergies?: string[];
  chronic_conditions?: string[];
  created_at: string;
  updated_at: string;
}

export interface FamilyMember {
  id: string;
  patient_id: string;
  full_name: string;
  date_of_birth: string;
  gender: Gender;
  relation: string;
  blood_group?: BloodGroup;
  phone?: string;
  email?: string;
  abha_id?: string;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export type UserRole = 'patient' | 'hospital_staff' | 'government_admin' | 'super_admin';
export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say';
export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
