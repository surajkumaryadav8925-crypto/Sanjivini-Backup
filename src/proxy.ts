// Next.js 16 proxy (replaces deprecated middleware.ts).
// Delegates all auth/session/role logic to lib/supabase/proxy.ts.
import { updateSession } from '@/lib/supabase/proxy';
import type { NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
