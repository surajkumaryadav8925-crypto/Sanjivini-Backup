import { describe, it, expect } from 'vitest';
import {
  evaluateAccess,
  matchProtectedPath,
  roleHasAccess,
  PROTECTED_PATHS,
} from './roles';

describe('matchProtectedPath', () => {
  it('matches protected prefixes and nested paths', () => {
    expect(matchProtectedPath('/patient/dashboard')).not.toBeNull();
    expect(matchProtectedPath('/hospital/beds')).not.toBeNull();
    expect(matchProtectedPath('/admin/analytics')).not.toBeNull();
    expect(matchProtectedPath('/patientx')).toBeNull();
    expect(matchProtectedPath('/login')).toBeNull();
  });
});

describe('roleHasAccess', () => {
  it('enforces role lists', () => {
    const adminCfg = PROTECTED_PATHS.find((c) => c.path === '/admin')!;
    expect(roleHasAccess('government_admin', adminCfg)).toBe(true);
    expect(roleHasAccess('super_admin', adminCfg)).toBe(true);
    expect(roleHasAccess('patient', adminCfg)).toBe(false);
    expect(roleHasAccess(null, adminCfg)).toBe(false);
  });
});

describe('evaluateAccess', () => {
  it('redirects unauthenticated users from protected paths to login with redirect param', () => {
    const d = evaluateAccess({ pathname: '/patient/dashboard', isAuthenticated: false, role: null });
    expect(d.action).toBe('redirect');
    expect(d.destination).toBe('/login');
    expect(d.setRedirectParam).toBe(true);
  });

  it('redirects authenticated users away from auth pages', () => {
    expect(
      evaluateAccess({ pathname: '/login', isAuthenticated: true, role: 'patient' }).destination
    ).toBe('/');
    expect(
      evaluateAccess({ pathname: '/register', isAuthenticated: true, role: 'patient' }).destination
    ).toBe('/');
  });

  it('allows an authenticated patient on patient routes', () => {
    const d = evaluateAccess({ pathname: '/patient/triage', isAuthenticated: true, role: 'patient' });
    expect(d.action).toBe('allow');
  });

  it('blocks a patient from hospital and admin routes', () => {
    expect(
      evaluateAccess({ pathname: '/hospital/dashboard', isAuthenticated: true, role: 'patient' }).destination
    ).toBe('/');
    expect(
      evaluateAccess({ pathname: '/admin/dashboard', isAuthenticated: true, role: 'patient' }).action
    ).toBe('redirect');
  });

  it('allows staff on hospital routes and blocks them from admin routes', () => {
    expect(
      evaluateAccess({ pathname: '/hospital/inventory', isAuthenticated: true, role: 'hospital_staff' }).action
    ).toBe('allow');
    expect(
      evaluateAccess({ pathname: '/admin/analytics', isAuthenticated: true, role: 'hospital_staff' }).action
    ).toBe('redirect');
  });

  it('allows super_admin everywhere protected', () => {
    for (const prefix of ['/patient', '/hospital', '/admin']) {
      expect(
        evaluateAccess({ pathname: `${prefix}/dashboard`, isAuthenticated: true, role: 'super_admin' }).action
      ).toBe('allow');
    }
  });

  it('demo mode relaxes ROLE checks but never the login requirement', () => {
    // Demo: patient may pass an admin route (showcase), but only when authenticated.
    expect(
      evaluateAccess({
        pathname: '/admin/dashboard',
        isAuthenticated: true,
        role: 'patient',
        isDemoMode: true,
      }).action
    ).toBe('allow');

    // Demo does NOT skip login.
    expect(
      evaluateAccess({
        pathname: '/admin/dashboard',
        isAuthenticated: false,
        role: null,
        isDemoMode: true,
      }).action
    ).toBe('redirect');
  });

  it('never reaches role checks without authentication', () => {
    const d = evaluateAccess({ pathname: '/hospital/beds', isAuthenticated: false, role: 'super_admin' });
    expect(d.action).toBe('redirect');
    expect(d.destination).toBe('/login');
  });
});
