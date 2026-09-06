// Offline Sync Manager
import { useOfflineStore } from '@/stores';
import { supabase } from '@/lib/supabase';
import type { OfflineOperation, SyncStatus, OfflineOperationType } from '@/types';

const MAX_RETRIES = 3;
const SYNC_INTERVAL = 30000; // 30 seconds

export class SyncManager {
  private static instance: SyncManager;
  private isRunning = false;
  private intervalId: NodeJS.Timeout | null = null;

  private constructor() {}

  static getInstance(): SyncManager {
    if (!SyncManager.instance) {
      SyncManager.instance = new SyncManager();
    }
    return SyncManager.instance;
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.intervalId = setInterval(() => this.sync(), SYNC_INTERVAL);
    console.log('[SyncManager] Started');
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('[SyncManager] Stopped');
  }

  async sync(): Promise<void> {
    const store = useOfflineStore.getState();
    if (!store.isOnline || store.isSyncing) return;

    const pendingOps = store.pendingOperations.filter(op => op.status === 'pending');
    if (pendingOps.length === 0) return;

    store.setSyncing(true);
    console.log(`[SyncManager] Syncing ${pendingOps.length} operations`);

    for (const op of pendingOps) {
      try {
        await this.syncOperation(op);
        store.updateOperationStatus(op.id, 'synced');
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        if (op.retry_count >= MAX_RETRIES) {
          store.updateOperationStatus(op.id, 'failed', errorMessage);
        } else {
          store.updateOperationStatus(op.id, 'pending', errorMessage);
        }
        console.error(`[SyncManager] Sync failed for ${op.id}:`, errorMessage);
      }
    }

    store.setSyncing(false);
    store.setLastSyncTime(new Date().toISOString());
    store.clearSyncedOperations();
  }

  private async syncOperation(op: OfflineOperation): Promise<void> {
    const { entity_type, entity_id, operation, payload } = op;

    switch (operation) {
      case 'create':
        await this.syncCreate(entity_type, entity_id, payload);
        break;
      case 'update':
        await this.syncUpdate(entity_type, entity_id, payload);
        break;
      case 'delete':
        await this.syncDelete(entity_type, entity_id);
        break;
    }
  }

  private async syncCreate(entityType: string, _entityId: string, payload: Record<string, unknown>): Promise<void> {
    const tableName = this.getTableName(entityType);
    if (!tableName) throw new Error(`Unknown entity type: ${entityType}`);
    const { error } = await supabase.from(tableName).insert(payload);
    if (error) throw error;
  }

  private async syncUpdate(entityType: string, entityId: string, payload: Record<string, unknown>): Promise<void> {
    const tableName = this.getTableName(entityType);
    if (!tableName) throw new Error(`Unknown entity type: ${entityType}`);
    const { error } = await supabase.from(tableName).update(payload).eq('id', entityId);
    if (error) throw error;
  }

  private async syncDelete(entityType: string, entityId: string): Promise<void> {
    const tableName = this.getTableName(entityType);
    if (!tableName) throw new Error(`Unknown entity type: ${entityType}`);
    const { error } = await supabase.from(tableName).delete().eq('id', entityId);
    if (error) throw error;
  }

  private getTableName(entityType: string): string | null {
    const mappings: Record<string, string> = {
      'medicine_inventory': 'medicine_inventory',
      'bed': 'beds',
      'blood_inventory': 'blood_inventory',
      'doctor': 'doctors',
      'doctor_availability': 'doctor_availability',
      'opd_token': 'opd_tokens',
    };
    return mappings[entityType] || null;
  }
}

// Queue operation for offline sync
export function queueOperation(
  entityType: string,
  entityId: string,
  operation: OfflineOperationType,
  payload: Record<string, unknown>,
  userId: string
) {
  const store = useOfflineStore.getState();
  store.addOperation({
    user_id: userId,
    entity_type: entityType,
    entity_id: entityId,
    operation,
    payload,
  });

  // Try immediate sync if online
  if (store.isOnline) {
    SyncManager.getInstance().sync();
  }
}

// Hook for sync status
export function useSyncStatus() {
  const { isOnline, isSyncing, pendingOperations, lastSyncTime } = useOfflineStore();
  const pendingCount = pendingOperations.filter(op => op.status === 'pending').length;
  const failedCount = pendingOperations.filter(op => op.status === 'failed').length;

  return {
    isOnline,
    isSyncing,
    pendingCount,
    failedCount,
    lastSyncTime,
    hasPendingOperations: pendingCount > 0,
    hasFailedOperations: failedCount > 0,
  };
}
