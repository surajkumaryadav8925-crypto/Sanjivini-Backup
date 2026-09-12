// Hospital-side beds queries (Supabase-backed).
// Reads are RLS-scoped automatically (staff of other hospitals cannot even
// see rows here thanks to the caller-scoped select filters + DB policies).
import { supabase } from '@/lib/supabase';
import type { Ward } from '@/stores/hospitalStore';

export interface BedRow {
  id: string;
  bed_type: string;
  bed_number: string;
  ward: string | null;
  status: string;
  is_icu: boolean;
  has_oxygen: boolean;
  has_ventilator: boolean;
}

/** All beds for one hospital, grouped into the UI's ward summary shape. */
export async function fetchHospitalWards(hospitalId: string): Promise<Ward[]> {
  const { data, error } = await supabase
    .from('beds')
    .select('id, bed_type, bed_number, ward, status, is_icu')
    .eq('hospital_id', hospitalId)
    .order('bed_number');

  if (error) throw new Error(error.message);
  return summarizeBeds((data ?? []) as BedRow[]);
}

export function summarizeBeds(rows: BedRow[]): Ward[] {
  const wardMap = new Map<string, Ward>();
  for (const row of rows) {
    const wardName = row.ward?.trim() || row.bed_type;
    const wardLabel = wardName.charAt(0).toUpperCase() + wardName.slice(1);
    let ward = wardMap.get(wardLabel);
    if (!ward) {
      ward = {
        id: wardLabel,
        name: wardLabel,
        totalBeds: 0,
        availableBeds: 0,
        occupiedBeds: 0,
        reservedBeds: 0,
        outOfService: 0,
      };
      wardMap.set(wardLabel, ward);
    }
    ward.totalBeds += 1;
    if (row.status === 'available') ward.availableBeds += 1;
    else if (row.status === 'occupied') ward.occupiedBeds += 1;
    else if (row.status === 'reserved') ward.reservedBeds += 1;
    else ward.outOfService += 1; // maintenance
  }
  return Array.from(wardMap.values());
}

export async function updateBedStatus(
  bedId: string,
  status: 'available' | 'occupied' | 'maintenance' | 'reserved'
): Promise<void> {
  const { error } = await supabase
    .from('beds')
    .update({ status })
    .eq('id', bedId);
  if (error) throw new Error(error.message);
}
