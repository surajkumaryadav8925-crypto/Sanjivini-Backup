"use client";

import { useEffect, useState } from 'react';
import { useSyncExternalStore } from 'react';
import { useAuthStore } from '@/stores';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { Profile, UserRole } from '@/types';

// Avoid hydration mismatch: children render once we're client-mounted.
function useIsHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

/**
 * Derives identity/role from the live Supabase session on mount and keeps
 * the auth store in sync with auth-state changes (SIGNED_OUT from another
 * tab, token refreshes, etc.).
 *
 * - Production: every load re-fetches user + profile from Supabase.
 *   Nothing is trusted from localStorage.
 * - Demo mode (no real Supabase): keeps the persisted showcase profile.
 *
 * Renders children after the first bootstrap pass so role-dependent UI
 * (Header nav, dashboards) doesn't flash logged-out.
 */
export function AuthBootstrap({ children }: { children: React.ReactNode }) {
  const bootstrap = useAuthStore((s) => s.bootstrap);
  const logout = useAuthStore((s) => s.logout);
  const hydrated = useIsHydrated();
  const [bootstrapped, setBootstrapped] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      await bootstrap();
      if (!cancelled) setBootstrapped(true);
    };
    void run();

    // Production-only subscription. In demo mode (mock client) this is a
    // no-op and demo sign-out is handled by the store directly.
    let unsubscribe: (() => void) | null = null;
    if (isSupabaseConfigured()) {
      const { data } = supabase.auth.onAuthStateChange((event) => {
        if (cancelled) return;
        if (event === 'SIGNED_OUT') {
          void logout();
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
          void bootstrap();
        }
      });
      unsubscribe = () => data.subscription.unsubscribe();
    }

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [bootstrap, logout]);

  // Render children immediately during SSR; gate only the first client
  // pass while the session is being resolved.
  if (hydrated && !bootstrapped) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}

/** Convenience selector for role-aware UI (Header, dashboards). */
export function useCurrentRole(): UserRole | null {
  return useAuthStore((s) => s.profile?.role ?? null);
}

export type { Profile };
