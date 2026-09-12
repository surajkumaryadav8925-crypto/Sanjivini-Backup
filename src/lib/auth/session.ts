// Session/profile helpers used by client components.
//
// SECURITY CONTRACT:
// - Identity and role ALWAYS come from the Supabase session (cookie-based)
//   and the profiles table. Nothing here reads localStorage.
// - Client stores are display caches only; the proxy guards routes
//   server-side and RLS guards data. Never authorize from persisted state.

import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/types';

export interface SessionSnapshot {
  user: User | null;
  profile: Profile | null;
}

/**
 * Fetch the current user and their profile from Supabase.
 * Returns nulls when unauthenticated. Server-verified: Supabase validates
 * the JWT from the httpOnly auth cookies; the profile row comes from the
 * database, not from any client-persisted value.
 */
export async function getSessionSnapshot(): Promise<SessionSnapshot> {
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return { user: null, profile: null };
  }

  const { data: profileRow, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single();

  if (profileError || !profileRow) {
    // Authenticated but no profile row (should not happen after migration
    // 014's trigger; treated as not-authorized for safety).
    return { user: data.user, profile: null };
  }

  return { user: data.user, profile: profileRow as Profile };
}
