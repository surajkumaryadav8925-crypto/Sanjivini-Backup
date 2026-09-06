import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  const isDemoMode = process.env.NEXT_PUBLIC_APP_MODE === 'demo';
  const isSupabaseConfigured = 
    process.env.NEXT_PUBLIC_SUPABASE_URL && 
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('demo.supabase.co') &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://demo.supabase.co';

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // In demo mode without real Supabase, skip server-side auth validation
  // Client-side auth will handle demo user protection
  if (isDemoMode && !isSupabaseConfigured) {
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

  // Refresh session if expired
  const { data: { user } } = await supabase.auth.getUser();

  // Protected routes configuration
  const protectedPaths = [
    { path: '/patient', roles: ['patient', 'hospital_staff', 'government_admin', 'super_admin'] },
    { path: '/hospital', roles: ['hospital_staff', 'super_admin'] },
    { path: '/admin', roles: ['government_admin', 'super_admin'] },
  ];

  for (const config of protectedPaths) {
    if (request.nextUrl.pathname.startsWith(config.path)) {
      if (!user) {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = '/login';
        redirectUrl.searchParams.set('redirect', request.nextUrl.pathname);
        return NextResponse.redirect(redirectUrl);
      }

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profile && !config.roles.includes(profile.role)) {
          const redirectUrl = request.nextUrl.clone();
          redirectUrl.pathname = '/';
          return NextResponse.redirect(redirectUrl);
        }
      }
    }
  }

  // Redirect logged-in users away from auth pages
  if (user && ['/login', '/register'].some(path => 
    request.nextUrl.pathname === path
  )) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/';
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};