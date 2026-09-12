// Runtime gate: Supabase-backed data in production, demo fixtures in
// showcase mode. Demo mode (NEXT_PUBLIC_APP_MODE=demo) keeps the original
// fully-working showcase behavior; production always hits the database.
import { IS_DEMO_MODE } from '@/lib/auth/mode';

export function useSupabaseData(): boolean {
  return !IS_DEMO_MODE;
}
