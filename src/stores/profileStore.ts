import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Gender, BloodGroup } from '@/types';

export interface PatientProfile {
  fullName: string;
  dateOfBirth: string;
  gender: Gender;
  bloodGroup: BloodGroup;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  emergencyContactName: string;
  emergencyContactRelation: string;
  emergencyContactPhone: string;
  allergies: string;
  chronicConditions: string;
  currentMedications: string;
}

interface ProfileState {
  profile: PatientProfile;
  isLoaded: boolean;
  updateProfile: (updates: Partial<PatientProfile>) => void;
  resetProfile: () => void;
}

const defaultProfile: PatientProfile = {
  fullName: 'Demo User',
  dateOfBirth: '1995-06-15',
  gender: 'male',
  bloodGroup: 'B+',
  phone: '+91 98765 43210',
  email: 'demo.user@email.com',
  address: '123 Healthcare Street',
  city: 'New Delhi',
  state: 'Delhi',
  pincode: '110001',
  emergencyContactName: 'Emergency Contact',
  emergencyContactRelation: 'Spouse',
  emergencyContactPhone: '+91 98765 43211',
  allergies: 'None reported',
  chronicConditions: 'None reported',
  currentMedications: 'None',
};

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      profile: defaultProfile,
      isLoaded: false,

      updateProfile: (updates) => set((state) => ({
        profile: { ...state.profile, ...updates },
        isLoaded: true,
      })),

      resetProfile: () => set({
        profile: defaultProfile,
        isLoaded: true,
      }),
    }),
    {
      name: 'patient-profile-storage',
    }
  )
);