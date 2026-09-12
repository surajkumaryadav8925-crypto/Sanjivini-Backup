// Hospital-side identity resolution: which hospital is the logged-in staff
// member authorized to manage? Server-enforced via RLS (hospital_staff
// SELECT is already restricted to the caller's own rows); this helper just
// reads what RLS permits.
import { supabase } from '@/lib/supabase';

export interface StaffHospital {
  staffId: string;
  hospitalId: string;
  designation: string;
}

let cached: StaffHospital | null | undefined;

/**
 * Resolve the staff member's hospital. Returns null when the user is not
 * hospital staff. Cached per browser session (roles are stable within a
 * session; the proxy re-derives authorization on every request anyway).
 */
export async function getMyStaffHospital(): Promise<StaffHospital | null> {
  if (cached !== undefined) return cached;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return (cached = null);

  const { data, error } = await supabase
    .from('hospital_staff')
    .select('id, hospital_id, designation')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .limit(1);

  if (error || !data || data.length === 0) {
    cached = null;
  } else {
    cached = {
      staffId: data[0].id,
      hospitalId: data[0].hospital_id,
      designation: data[0].designation ?? 'Staff',
    };
  }
  return cached;
}
