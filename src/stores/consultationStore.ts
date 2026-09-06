import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Consultation, Doctor, Specialization } from '@/data/doctors';
import { demoDoctors } from '@/data/doctors';

interface ConsultationState {
  doctors: Doctor[];
  consultations: Consultation[];
  selectedDoctor: Doctor | null;
  bookConsultation: (consultation: Omit<Consultation, 'id' | 'status'>) => Consultation;
  selectDoctor: (doctor: Doctor | null) => void;
  updateConsultationStatus: (id: string, status: Consultation['status']) => void;
  cancelConsultation: (id: string) => void;
  getUpcomingConsultations: () => Consultation[];
  getCompletedConsultations: () => Consultation[];
  getCancelledConsultations: () => Consultation[];
  getConsultationById: (id: string) => Consultation | undefined;
}

export const useConsultationStore = create<ConsultationState>()(
  persist(
    (set, get) => ({
      doctors: demoDoctors,
      consultations: [],
      selectedDoctor: null,

      selectDoctor: (doctor) => set({ selectedDoctor: doctor }),

      bookConsultation: (consultationData) => {
        const newConsultation: Consultation = {
          ...consultationData,
          id: `consult-${Date.now()}`,
          status: 'upcoming',
        };
        set((state) => ({
          consultations: [newConsultation, ...state.consultations],
        }));
        return newConsultation;
      },

      updateConsultationStatus: (id, status) => set((state) => ({
        consultations: state.consultations.map(c =>
          c.id === id ? { ...c, status } : c
        ),
      })),

      cancelConsultation: (id) => set((state) => ({
        consultations: state.consultations.map(c =>
          c.id === id ? { ...c, status: 'cancelled' as const } : c
        ),
      })),

      getUpcomingConsultations: () => {
        const state = get();
        return state.consultations
          .filter(c => c.status === 'upcoming' || c.status === 'in_progress')
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      },

      getCompletedConsultations: () => {
        const state = get();
        return state.consultations
          .filter(c => c.status === 'completed')
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      },

      getCancelledConsultations: () => {
        const state = get();
        return state.consultations
          .filter(c => c.status === 'cancelled')
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      },

      getConsultationById: (id) => {
        const state = get();
        return state.consultations.find(c => c.id === id);
      },
    }),
    {
      name: 'consultation-storage',
      partialize: (state) => ({
        consultations: state.consultations,
      }),
    }
  )
);