import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

let supabaseClient: SupabaseClient | null = null;

/**
 * True when real Supabase credentials exist (and are not placeholders).
 * Used by the demo-login UI and AuthBootstrap to decide whether
 * production auth flows are available.
 */
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  return (
    !!url &&
    !url.includes('demo.supabase.co') &&
    !!anonKey &&
    !anonKey.includes('demo-')
  );
}

export function createClient(): SupabaseClient {
  if (supabaseClient) return supabaseClient;
  
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  
  // In demo mode with placeholder credentials, create a client that won't make actual requests
  const isDemoMode = process.env.NEXT_PUBLIC_APP_MODE === 'demo';
  const configured = isSupabaseConfigured();

  if (!configured) {
    if (!isDemoMode) {
      // Production build with placeholder credentials must fail loudly,
      // not silently degrade to a fake client.
      throw new Error(
        'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY. ' +
          'Demo mode requires NEXT_PUBLIC_APP_MODE=demo.'
      );
    }
    // Demo mode: return a mock client that never hits the network.
    // Demo identity lives in authStore (explicitly non-secure, showcase only).
    const mockClient = {
      auth: {
        signInWithPassword: async () => {
          throw new Error('Supabase not configured. Please use Demo Login.');
        },
        signOut: async () => ({ data: null, error: null }),
        getUser: async () => ({ data: { user: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      },
      from: () => ({
        select: () => ({ eq: () => ({ single: async () => ({ data: null, error: null }) }) }),
      }),
    } as unknown as SupabaseClient;
    
    return mockClient;
  }
  
  supabaseClient = createBrowserClient(url, anonKey);
  return supabaseClient;
}

// Client-side Supabase client for browser use
export const supabase = createClient();