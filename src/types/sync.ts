// Offline Sync and Government Types

export type SyncStatus = 'pending' | 'syncing' | 'synced' | 'failed';
export type OfflineOperationType = 'create' | 'update' | 'delete';

export interface OfflineOperation {
  id: string;
  user_id: string;
  entity_type: string;
  entity_id: string;
  operation: OfflineOperationType;
  payload: Record<string, unknown>;
  status: SyncStatus;
  retry_count: number;
  last_error?: string;
  created_at: string;
  synced_at?: string;
}

export interface SymptomEvent {
  id: string;
  district: string;
  symptom: string;
  age_group: string;
  gender: Gender;
  count: number;
  date: string;
  is_aggregated: boolean;
  created_at: string;
}

export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say';

export interface OutbreakCluster {
  id: string;
  district: string;
  location_name: string;
  latitude?: number;
  longitude?: number;
  disease: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  reported_cases: number;
  suspected_cases?: number;
  deaths?: number;
  status: 'investigating' | 'contained' | 'active' | 'resolved';
  identified_at: string;
  resolved_at?: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  ip_address?: string;
  user_agent?: string;
  old_values?: Record<string, unknown>;
  new_values?: Record<string, unknown>;
  created_at: string;
}
