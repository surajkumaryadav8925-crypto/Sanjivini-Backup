import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Session } from '@supabase/supabase-js';
import type { Profile, UserRole } from '@/types';
import { supabase } from '@/lib/supabase';
import { getSessionSnapshot } from '@/lib/auth/session';

/**
 * SECURITY MODEL (Phase 1):
 * - In production mode NOTHING is persisted: identity and role are always
 *   re-derived from the Supabase session on load (see `bootstrap`).
 * - In demo mode (NEXT_PUBLIC_APP_MODE=demo) a showcase profile is stored
 *   in localStorage under a demo-only key so the showcase survives refresh.
 *   This is explicitly INSECURE and never used for real data access - RLS
 *   and the proxy guard run server-side regardless.
 */
const IS_DEMO_MODE = process.env.NEXT_PUBLIC_APP_MODE === 'demo';

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
  /**
   * Re-derive identity/role from the live Supabase session. Called once on
   * app mount (AuthBootstrap) and after auth state changes. Never reads
   * localStorage.
   */
  bootstrap: () => Promise<void>;
  logout: () => Promise<void>;
  getUserRole: () => UserRole | null;
  isPatient: () => boolean;
  isHospitalStaff: () => boolean;
  isGovernmentAdmin: () => boolean;
  isSuperAdmin: () => boolean;
}

function clearAuthState() {
  useAuthStore.setState({
    user: null,
    profile: null,
    session: null,
    isAuthenticated: false,
    isLoading: false,
  });
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      session: null,
      isLoading: true,
      isAuthenticated: false,

      setUser: (user) => set({ user, isAuthenticated: !!user && !!get().profile }),
      setProfile: (profile) => set({ profile, isAuthenticated: !!profile }),
      setSession: (session) => set({ session }),
      setIsLoading: (isLoading) => set({ isLoading }),

      bootstrap: async () => {
        // Demo mode without real Supabase: keep the persisted showcase
        // profile; there is no server session to derive anything from.
        if (IS_DEMO_MODE) {
          set({ isLoading: false });
          return;
        }

        set({ isLoading: true });
        try {
          const snapshot = await getSessionSnapshot();
          set({
            user: snapshot.user,
            profile: snapshot.profile,
            isAuthenticated: !!snapshot.profile,
            isLoading: false,
          });
        } catch {
          clearAuthState();
        }
      },

      logout: async () => {
        try {
          await supabase.auth.signOut();
        } catch {
          // Demo mock or offline: local sign-out below still applies.
        }
        clearAuthState();
      },

      getUserRole: () => get().profile?.role || null,

      isPatient: () => get().profile?.role === 'patient',
      isHospitalStaff: () => ['hospital_staff', 'super_admin'].includes(get().profile?.role || ''),
      isGovernmentAdmin: () => ['government_admin', 'super_admin'].includes(get().profile?.role || ''),
      isSuperAdmin: () => get().profile?.role === 'super_admin',
    }),
    {
      // Demo-only persistence. In production this persists an empty object,
      // so no auth state ever lands in localStorage.
      name: 'sanjivini-demo-auth',
      partialize: (state) =>
        IS_DEMO_MODE
          ? {
              user: state.user,
              profile: state.profile,
              session: state.session,
              isAuthenticated: state.isAuthenticated,
            }
          : ({} as Record<string, never>),
    }
  )
);
