// OPD queue + token booking queries (Supabase-backed).
import { supabase } from '@/lib/supabase';

export interface OpdQueueInfo {
  id: string;
  hospital_id: string;
  department: string;
  current_token: number;
  total_tokens: number;
}

export interface PatientBooking {
  token_id: string;
  token_number: number;
  status: string;
  department: string;
  hospital_name: string;
  queue_id: string;
  current_token: number;
  estimated_time: string | null;
  created_at: string;
  notes: string | null;
}

/** Active queues for a hospital (drives the hospital-side department list). */
export async function fetchHospitalQueues(hospitalId: string): Promise<OpdQueueInfo[]> {
  const { data, error } = await supabase
    .from('opd_queues')
    .select('id, hospital_id, department, current_token, total_tokens')
    .eq('hospital_id', hospitalId)
    .eq('is_active', true)
    .eq('date', new Date().toISOString().slice(0, 10))
    .order('department');

  if (error) throw new Error(error.message);
  return (data ?? []) as OpdQueueInfo[];
}

/** All active queues (patient-side "now serving" info). */
export async function fetchActiveQueues(hospitalIds?: string[]): Promise<OpdQueueInfo[]> {
  let query = supabase
    .from('opd_queues')
    .select('id, hospital_id, department, current_token, total_tokens')
    .eq('is_active', true)
    .eq('date', new Date().toISOString().slice(0, 10));

  if (hospitalIds && hospitalIds.length > 0) {
    query = query.in('hospital_id', hospitalIds);
  }

  const { data, error } = await query.order('department');
  if (error) throw new Error(error.message);
  return (data ?? []) as OpdQueueInfo[];
}

/** Book a token via the race-safe SECURITY DEFINER RPC. */
export async function bookOpdToken(params: {
  hospitalId: string;
  department: string;
  slot?: string;
  patientName?: string;
  phone?: string;
}): Promise<{ token_number: number; queue_id: string }> {
  const { data, error } = await supabase.rpc('book_opd_token', {
    p_hospital_id: params.hospitalId,
    p_department: params.department,
    p_slot: params.slot ?? null,
    p_patient_name: params.patientName ?? null,
    p_phone: params.phone ?? null,
  });

  if (error) throw new Error(error.message);
  if (!data) throw new Error('Booking failed: no result returned.');
  return data as { token_number: number; queue_id: string };
}

/** Hospital staff: today's tokens for one queue. */
export async function fetchQueueTokens(queueId: string) {
  const { data, error } = await supabase
    .from('opd_tokens')
    .select('id, token_number, status, notes, patient_id, created_at, called_at, completed_at')
    .eq('queue_id', queueId)
    .order('token_number');

  if (error) throw new Error(error.message);
  return data ?? [];
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

/** The logged-in patient's own bookings (today and future). */
export async function fetchMyBookings(): Promise<PatientBooking[]> {
  const patientId = await getMyPatientId();
  if (!patientId) return [];

  const { data, error } = await supabase
    .from('opd_tokens')
    .select(`
      id,
      token_number,
      status,
      estimated_time,
      notes,
      created_at,
      queue:opd_queues!inner (
        id,
        department,
        current_token,
        hospital:hospitals ( id, name )
      )
    `)
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) throw new Error(error.message);

  return (data ?? []).map((row: Record<string, unknown>) => {
    const queue = row.queue as Record<string, unknown> | null;
    const hospital = queue?.hospital as Record<string, unknown> | null;
    return {
      token_id: String(row.id),
      token_number: Number(row.token_number),
      status: String(row.status),
      department: String(queue?.department ?? ''),
      hospital_name: String(hospital?.name ?? ''),
      queue_id: String(queue?.id ?? ''),
      current_token: Number(queue?.current_token ?? 0),
      estimated_time: (row.estimated_time as string | null) ?? null,
      created_at: String(row.created_at),
      notes: (row.notes as string | null) ?? null,
    };
  });
}
