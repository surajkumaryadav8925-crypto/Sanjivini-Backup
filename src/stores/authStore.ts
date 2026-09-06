import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Session } from '@supabase/supabase-js';
import type { Profile, UserRole } from '@/types';

interface AuthState {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  setSession: (session: Session | null) => void;
  setIsLoading: (loading: boolean) => void;
  logout: () => Promise<void>;
  getUserRole: () => UserRole | null;
  isPatient: () => boolean;
  isHospitalStaff: () => boolean;
  isGovernmentAdmin: () => boolean;
  isSuperAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      session: null,
      isLoading: true,
      isAuthenticated: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setProfile: (profile) => set({ profile, isAuthenticated: !!profile }),
      setSession: (session) => set({ session }),
      setIsLoading: (isLoading) => set({ isLoading }),

      logout: async () => {
        const { supabase } = await import('@/lib/supabase');
        await supabase.auth.signOut();
        set({ user: null, profile: null, session: null, isAuthenticated: false });
      },

      getUserRole: () => get().profile?.role || null,

      isPatient: () => get().profile?.role === 'patient',
      isHospitalStaff: () => ['hospital_staff', 'super_admin'].includes(get().profile?.role || ''),
      isGovernmentAdmin: () => ['government_admin', 'super_admin'].includes(get().profile?.role || ''),
      isSuperAdmin: () => get().profile?.role === 'super_admin',
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        profile: state.profile,
        isAuthenticated: state.isAuthenticated,
        user: state.user,
      }),
    }
  )
);
