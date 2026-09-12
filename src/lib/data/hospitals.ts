// Hospital directory + bed availability queries (Supabase-backed).
// Maps DB rows (v_hospital_directory view, doctors) onto the existing UI
// types from @/data/hospitals so pages keep their current shape.
import { supabase } from '@/lib/supabase';
import type { Hospital, HospitalDepartment, HospitalDoctor, HospitalTier } from '@/data/hospitals';

export interface DirectoryFilters {
  district?: string; // 'all' allowed
  search?: string;
}

interface DirectoryRow {
  id: string;
  name: string;
  ownership: string;
  category: string;
  address: string;
  district: string;
  state: string;
  phone: string;
  latitude: number | null;
  longitude: number | null;
  locality: string | null;
  opening_hours: string;
  emergency_available: boolean;
  has_blood_bank: boolean;
  icu_capacity: number | null;
  bed_capacity: number | null;
  total_beds: number;
  available_beds: number;
  icu_beds_available: number;
  departments: string[] | null;
}

function ownershipToUiType(ownership: string): Hospital['type'] {
  switch (ownership) {
    case 'government': return 'Government';
    case 'private': return 'Private';
    case 'charitable':
    case 'trust': return 'Trust';
    default: return 'Government';
  }
}

function categoryToTier(category: string): HospitalTier {
  switch (category) {
    case 'medical_college': return 'Medical College';
    case 'district_hospital': return 'District Hospital';
    case 'sub_district': return 'SDH';
    case 'community': return 'CHC';
    case 'primary_healthcare': return 'PHC';
    case 'nursing_home':
    case 'clinic': return 'CHC';
    default: return 'CHC';
  }
}

function rowToHospital(row: DirectoryRow): Hospital {
  const departments: HospitalDepartment[] = (row.departments ?? []).map((name, i) => ({
    id: `d-${row.id}-${i}`,
    name,
    available: true,
  }));

  return {
    id: row.id,
    name: row.name,
    type: ownershipToUiType(row.ownership),
    tier: categoryToTier(row.category),
    district: row.district,
    address: row.address,
    locality: row.locality || row.address,
    phone: row.phone,
    latitude: row.latitude ?? 0,
    longitude: row.longitude ?? 0,
    emergencyAvailable: row.emergency_available,
    openingHours: row.opening_hours || '24x7',
    availableBeds: row.available_beds,
    totalBeds: row.total_beds || row.bed_capacity || 0,
    bloodBankAvailable: row.has_blood_bank,
    icuAvailable: (row.icu_beds_available ?? 0) > 0 || (row.icu_capacity ?? 0) > 0,
    departments,
    doctors: [], // fetched separately via fetchHospitalDoctors
  };
}

export async function fetchHospitalDoctors(hospitalId: string): Promise<HospitalDoctor[]> {
  const { data, error } = await supabase
    .from('doctors')
    .select('id, name, specialization, qualification, is_active, consultation_fee')
    .eq('hospital_id', hospitalId)
    .eq('is_active', true)
    .order('name');

  if (error || !data) return [];

  return data.map((d) => ({
    id: d.id,
    name: d.name,
    specialty: d.specialization,
    qualification: d.qualification ?? '',
    available: true,
    schedule: d.consultation_fee != null ? `Fee Rs.${d.consultation_fee}` : 'OPD hours as posted',
  }));
}

export async function fetchHospitals(filters: DirectoryFilters = {}): Promise<Hospital[]> {
  let query = supabase.from('v_hospital_directory').select('*');

  if (filters.district && filters.district !== 'all') {
    query = query.eq('district', filters.district);
  }
  if (filters.search && filters.search.trim()) {
    const term = `%${filters.search.trim()}%`;
    query = query.or(`name.ilike.${term},locality.ilike.${term},city.ilike.${term}`);
  }

  const { data, error } = await query.order('district').order('name');

  if (error) throw new Error(error.message);

  return (data as unknown as DirectoryRow[]).map(rowToHospital);
}

export async function fetchHospitalDetail(id: string): Promise<Hospital | null> {
  const { data, error } = await supabase
    .from('v_hospital_directory')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  const hospital = rowToHospital(data as unknown as DirectoryRow);
  hospital.doctors = await fetchHospitalDoctors(id);
  return hospital;
}
