// Blood inventory + blood requests queries (Supabase-backed).
import { supabase } from '@/lib/supabase';

export interface BloodInventoryRow {
  hospital_id: string;
  blood_group: string;
  units_available: number;
  units_reserved: number;
  units_minimum: number;
  last_updated: string;
}

export interface BloodRequestRow {
  id: string;
  patient_id: string;
  hospital_id: string;
  patient_name: string;
  blood_group: string;
  units: number;
  urgency: 'routine' | 'urgent' | 'emergency';
  contact_phone: string;
  status: 'pending' | 'approved' | 'fulfilled' | 'rejected';
  created_at: string;
  updated_at: string;
  hospital_name?: string; // joined
}

/**
 * All blood banks (hospitals with has_blood_bank) with their live inventory,
 * shaped for the patient blood page. Inventory reads are RLS-scoped to
 * verified hospitals automatically.
 */
export interface BloodBankView {
  id: string;
  hospital: string;
  address: string;
  phone: string;
  inventory: Record<string, number>;
  totalUnits: number;
}

export async function fetchBloodBanks(): Promise<BloodBankView[]> {
  const { data, error } = await supabase
    .from('blood_inventory')
    .select(
      'hospital_id, blood_group, units_available, hospitals(id, name, address, phone, has_blood_bank)'
    )
    .order('blood_group');

  if (error) throw new Error(error.message);

  const byHospital = new Map<string, BloodBankView>();
  for (const row of (data ?? []) as Array<Record<string, unknown>>) {
    const hosp = row.hospitals as
      | { id: string; name: string; address: string; phone: string; has_blood_bank: boolean }
      | null;
    if (!hosp || !hosp.has_blood_bank) continue;

    let bank = byHospital.get(hosp.id);
    if (!bank) {
      bank = { id: hosp.id, hospital: hosp.name, address: hosp.address, phone: hosp.phone, inventory: {}, totalUnits: 0 };
      byHospital.set(hosp.id, bank);
    }
    const units = Number(row.units_available ?? 0);
    bank.inventory[String(row.blood_group)] = units;
    bank.totalUnits += units;
  }
  return Array.from(byHospital.values());
}

/** All blood inventory for a hospital (RLS scopes SELECT to verified hospitals or own hospital). */
export async function fetchBloodInventory(hospitalId: string): Promise<BloodInventoryRow[]> {
  const { data, error } = await supabase
    .from('blood_inventory')
    .select('hospital_id, blood_group, units_available, units_reserved, units_minimum, last_updated')
    .eq('hospital_id', hospitalId)
    .order('blood_group');

  if (error) throw new Error(error.message);
  return (data ?? []) as BloodInventoryRow[];
}

/** Update inventory counts for one blood group (hospital staff only; RLS enforces scope). */
export async function updateBloodInventory(
  hospitalId: string,
  bloodGroup: string,
  unitsAvailable: number,
  unitsReserved: number
): Promise<void> {
  const { error } = await supabase
    .from('blood_inventory')
    .update({ units_available: unitsAvailable, units_reserved: unitsReserved, last_updated: new Date().toISOString() })
    .eq('hospital_id', hospitalId)
    .eq('blood_group', bloodGroup);
  if (error) throw new Error(error.message);
}

/** Blood requests visible to the logged-in user (RLS scopes: own / own hospital / gov admin). */
export async function fetchBloodRequests(hospitalId?: string): Promise<BloodRequestRow[]> {
  let query = supabase
    .from('blood_requests')
    .select('*, hospitals(name)')
    .order('created_at', { ascending: false })
    .limit(50);

  if (hospitalId) {
    query = query.eq('hospital_id', hospitalId);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return (data ?? []).map((row: Record<string, unknown>) => ({
    ...(row as unknown as BloodRequestRow),
    hospital_name: (row.hospitals as { name?: string } | null)?.name ?? undefined,
  }));
}

/** Patient creates a blood requisition. */
export async function createBloodRequest(input: {
  patientId: string;
  hospitalId: string;
  patientName: string;
  bloodGroup: string;
  units: number;
  urgency: 'routine' | 'urgent' | 'emergency';
  contactPhone: string;
}): Promise<string> {
  const { data, error } = await supabase
    .from('blood_requests')
    .insert({
      patient_id: input.patientId,
      hospital_id: input.hospitalId,
      patient_name: input.patientName,
      blood_group: input.bloodGroup,
      units: input.units,
      urgency: input.urgency,
      contact_phone: input.contactPhone,
    })
    .select('id')
    .single();

  if (error) throw new Error(error.message);
  return data.id;
}

/** Hospital staff action via the SECURITY DEFINER RPC (atomic transitions + inventory). */
export async function setBloodRequestStatus(
  requestId: string,
  action: 'approve' | 'reject' | 'fulfill'
): Promise<void> {
  const { data, error } = await supabase.rpc('set_blood_request_status', {
    p_request_id: requestId,
    p_action: action,
  });
  if (error) throw new Error(error.message);
  return (data ?? undefined) as void;
}
