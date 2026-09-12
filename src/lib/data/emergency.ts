// Emergency alert persistence (Supabase-backed).
// NOTE: dispatch/ambulance integration is explicitly out of scope for Phase 2.
// We only persist the alert record so hospital/gov dashboards can see it.
import { supabase } from '@/lib/supabase';
import type { EmergencyAlert } from '@/types';

export interface EmergencyInput {
  emergencyType: string;
  description?: string;
  locationLat?: number | null;
  locationLng?: number | null;
  locationAddress?: string;
}

/** Persist an emergency alert for the logged-in patient. Returns the alert id. */
export async function createEmergencyAlert(input: EmergencyInput): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('You must be signed in to report an emergency.');

  const patientId = await getMyPatientId();
  if (!patientId) throw new Error('No patient profile found for this account.');

  const { data, error } = await supabase
    .from('emergency_alerts')
    .insert({
      patient_id: patientId,
      emergency_type: input.emergencyType,
      description: input.description ?? null,
      location_lat: input.locationLat ?? null,
      location_lng: input.locationLng ?? null,
      location_address: input.locationAddress ?? null,
      status: 'reported',
      ambulance_requested: false,
    })
    .select('id')
    .single();

  if (error) throw new Error(error.message);
  return data.id;
}

/** The logged-in patient's recent alerts. */
export async function fetchMyEmergencyAlerts(): Promise<EmergencyAlert[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const patientId = await getMyPatientId();
  if (!patientId) return [];

  const { data, error } = await supabase
    .from('emergency_alerts')
    .select('*')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) throw new Error(error.message);
  return (data ?? []) as EmergencyAlert[];
}

let cachedPatientId: string | null = null;

/** Resolve the patients.id for the logged-in user (cached per session). */
export async function getMyPatientId(): Promise<string | null> {
  if (cachedPatientId) return cachedPatientId;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('patients')
    .select('id')
    .eq('user_id', user.id)
    .limit(1);

  cachedPatientId = data?.[0]?.id ?? null;
  return cachedPatientId;
}
