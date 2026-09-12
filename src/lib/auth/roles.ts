// Pure role -> route authorization logic.
// Shared by the proxy (route guard) and unit-tested in isolation so the
// security-critical mapping lives in one place with no framework imports.

export type AuthRole =
  | 'patient'
  | 'hospital_staff'
  | 'government_admin'
  | 'super_admin';

export interface ProtectedPathConfig {
  path: string;
  roles: AuthRole[];
}

// Single source of truth for protected route prefixes and the roles that
// may access them. The proxy evaluates these server-side against the
// Supabase session; the Header uses the same shape for nav visibility.
export const PROTECTED_PATHS: ProtectedPathConfig[] = [
  { path: '/patient', roles: ['patient', 'hospital_staff', 'government_admin', 'super_admin'] },
  { path: '/hospital', roles: ['hospital_staff', 'super_admin'] },
  { path: '/admin', roles: ['government_admin', 'super_admin'] },
];

export const AUTH_PAGES = ['/login', '/register'];

/** Return the matching protected-path config for a pathname, if any. */
export function matchProtectedPath(pathname: string): ProtectedPathConfig | null {
  return PROTECTED_PATHS.find((c) => pathname === c.path || pathname.startsWith(c.path + '/')) ?? null;
}

/** Does this role have access to the given protected-path config? */
export function roleHasAccess(role: string | null | undefined, config: ProtectedPathConfig): boolean {
  return !!role && (config.roles as string[]).includes(role);
}

export interface ProxyDecision {
  action: 'allow' | 'redirect';
  destination?: string;
  setRedirectParam?: boolean;
}

/**
 * Decide what should happen for a given request, based on:
 *  - pathname
 *  - whether the user is authenticated (per the Supabase session)
 *  - the user's role from the profiles table (server-verified)
 *
 * Pure function: no Next.js imports, fully unit-testable.
 */
export function evaluateAccess(params: {
  pathname: string;
  isAuthenticated: boolean;
  role: string | null;
  /** Demo mode skips role checks for the showcase (login still required). */
  isDemoMode?: boolean;
}): ProxyDecision {
  const { pathname, isAuthenticated, role, isDemoMode = false } = params;

  // Redirect signed-in users away from auth pages.
  if (isAuthenticated && AUTH_PAGES.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    return { action: 'redirect', destination: '/' };
  }

  const config = matchProtectedPath(pathname);
  if (!config) return { action: 'allow' };

  if (!isAuthenticated) {
    return { action: 'redirect', destination: '/login', setRedirectParam: true };
  }

  // Demo mode showcase: role enforcement is relaxed (but login is still
  // required, and this NEVER relaxes RLS, which applies regardless).
  if (isDemoMode) {
    return { action: 'allow' };
  }

  if (!roleHasAccess(role, config)) {
    return { action: 'redirect', destination: '/' };
  }

  return { action: 'allow' };
}
