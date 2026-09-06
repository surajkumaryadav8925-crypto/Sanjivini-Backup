import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { NotificationType, NotificationPriority } from '@/data/notifications';
import { demoNotifications } from '@/data/notifications';

export interface HealthNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

interface NotificationState {
  notifications: HealthNotification[];
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  dismissNotification: (id: string) => void;
  addNotification: (notification: Omit<HealthNotification, 'id' | 'timestamp' | 'read'>) => void;
  clearAll: () => void;
  getUnreadCount: () => number;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: demoNotifications,

      markAsRead: (id) => set((state) => ({
        notifications: state.notifications.map(n =>
          n.id === id ? { ...n, read: true } : n
        ),
      })),

      markAllAsRead: () => set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, read: true })),
      })),

      dismissNotification: (id) => set((state) => ({
        notifications: state.notifications.filter(n => n.id !== id),
      })),

      addNotification: (notification) => set((state) => ({
        notifications: [
          {
            ...notification,
            id: `notif-${Date.now()}`,
            timestamp: new Date().toISOString(),
            read: false,
          },
          ...state.notifications,
        ],
      })),

      clearAll: () => set({ notifications: [] }),

      getUnreadCount: () => {
        const state = get();
        return state.notifications.filter(n => !n.read).length;
      },
    }),
    {
      name: 'health-notifications-storage',
      partialize: (state) => ({
        notifications: state.notifications,
      }),
    }
  )
);