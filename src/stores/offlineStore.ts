import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SyncStatus, OfflineOperationType } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface OfflineOperation {
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

interface OfflineState {
  isOnline: boolean;
  pendingOperations: OfflineOperation[];
  isSyncing: boolean;
  lastSyncTime: string | null;
  syncError: string | null;
  setOnline: (online: boolean) => void;
  addOperation: (operation: Omit<OfflineOperation, 'id' | 'status' | 'retry_count' | 'created_at'>) => void;
  removeOperation: (id: string) => void;
  updateOperationStatus: (id: string, status: SyncStatus, error?: string) => void;
  setSyncing: (syncing: boolean) => void;
  setSyncError: (error: string | null) => void;
  setLastSyncTime: (time: string) => void;
  getPendingCount: () => number;
  getFailedCount: () => number;
  clearSyncedOperations: () => void;
}

export const useOfflineStore = create<OfflineState>()(
  persist(
    (set, get) => ({
      // Default to true for SSR to prevent hydration mismatch
      isOnline: true,
      pendingOperations: [],
      isSyncing: false,
      lastSyncTime: null,
      syncError: null,

      setOnline: (isOnline) => set({ isOnline }),

      addOperation: (operation) => {
        const newOperation: OfflineOperation = {
          ...operation,
          id: uuidv4(),
          status: 'pending',
          retry_count: 0,
          created_at: new Date().toISOString(),
        };
        set((state) => ({
          pendingOperations: [...state.pendingOperations, newOperation],
        }));
      },

      removeOperation: (id) => set((state) => ({
        pendingOperations: state.pendingOperations.filter(op => op.id !== id),
      })),

      updateOperationStatus: (id, status, error) => set((state) => ({
        pendingOperations: state.pendingOperations.map(op =>
          op.id === id
            ? {
                ...op,
                status,
                last_error: error,
                retry_count: status === 'failed' ? op.retry_count + 1 : op.retry_count,
                synced_at: status === 'synced' ? new Date().toISOString() : op.synced_at,
              }
            : op
        ),
      })),

      setSyncing: (isSyncing) => set({ isSyncing }),

      setSyncError: (syncError) => set({ syncError }),

      setLastSyncTime: (lastSyncTime) => set({ lastSyncTime }),

      getPendingCount: () => get().pendingOperations.filter(op => op.status === 'pending').length,

      getFailedCount: () => get().pendingOperations.filter(op => op.status === 'failed').length,

      clearSyncedOperations: () => set((state) => ({
        pendingOperations: state.pendingOperations.filter(op => op.status !== 'synced'),
      })),
    }),
    {
      name: 'offline-storage',
      partialize: (state) => ({ 
        pendingOperations: state.pendingOperations,
        lastSyncTime: state.lastSyncTime,
      }),
    }
  )
);

// Network status listener - safely attached after hydration
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    useOfflineStore.getState().setOnline(true);
  });

  window.addEventListener('offline', () => {
    useOfflineStore.getState().setOnline(false);
  });
}
