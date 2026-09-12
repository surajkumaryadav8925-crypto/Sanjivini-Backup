// Consolidated Supabase session handling + role-based route guard for the
// Next.js 16 proxy (replaces the old src/middleware.ts and the unused
// src/lib/supabase/middleware.ts updateSession helper).
//
// SECURITY MODEL:
// - The session is read from httpOnly auth cookies via createServerClient.
// - The role comes from the profiles TABLE (server-side query), never from
//   any client-controlled state.
// - Demo mode (NEXT_PUBLIC_APP_MODE=demo) skips ROLE enforcement for the
//   showcase, but RLS is unaffected and still enforces data access.
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { evaluateAccess } from '@/lib/auth/roles';

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  return (
    !!url &&
    !url.includes('demo.supabase.co') &&
    !!anonKey &&
    !anonKey.includes('demo-')
  );
}

export async function updateSession(request: NextRequest): Promise<NextResponse> {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const isDemoMode = process.env.NEXT_PUBLIC_APP_MODE === 'demo';
  const configured = isSupabaseConfigured();

  // No real Supabase credentials (local demo showcase): skip server-side
  // session validation. Client-side demo login still works, exactly as in
  // the original middleware's demo-mode early return.
  if (!configured) {
    return response;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  // Refresh session if expired; getUser() validates the JWT server-side.
  const { data: { user } } = await supabase.auth.getUser();

  // Role is resolved from the profiles table on every protected request.
  let role: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    role = profile?.role ?? null;
  }

  const decision = evaluateAccess({
    pathname: request.nextUrl.pathname,
    isAuthenticated: !!user,
    role,
    isDemoMode,
  });

  if (decision.action === 'redirect' && decision.destination) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = decision.destination;
    redirectUrl.search = '';
    if (decision.setRedirectParam) {
      redirectUrl.searchParams.set('redirect', request.nextUrl.pathname + request.nextUrl.search);
    }
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}
