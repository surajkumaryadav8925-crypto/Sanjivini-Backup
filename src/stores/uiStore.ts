import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  sidebarOpen: boolean;
  darkMode: boolean;
  language: string;
  notifications: Notification[];
  toasts: Toast[];
  // Shared state for voice assistants - only one can be active at a time
  activeAssistant: 'voice' | 'call' | null;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setDarkMode: (dark: boolean) => void;
  toggleDarkMode: () => void;
  setLanguage: (lang: string) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'created_at'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  // Actions for controlling active assistant
  setActiveAssistant: (assistant: 'voice' | 'call' | null) => void;
  closeActiveAssistant: () => void;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  created_at: string;
}

interface Toast {
  id: string;
  title: string;
  description?: string;
  type: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      sidebarOpen: true,
      darkMode: false,
      language: 'en',
      notifications: [],
      toasts: [],
      activeAssistant: null, // Initially no assistant is active

      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      
      setDarkMode: (darkMode) => {
        set({ darkMode });
        if (typeof document !== 'undefined') {
          document.documentElement.classList.toggle('dark', darkMode);
        }
      },
      toggleDarkMode: () => set((state) => {
        const newMode = !state.darkMode;
        if (typeof document !== 'undefined') {
          document.documentElement.classList.toggle('dark', newMode);
        }
        return { darkMode: newMode };
      }),

      setLanguage: (language) => { console.log("SET LANGUAGE TO:", language); set({ language }); },

      addNotification: (notification) => set((state) => ({
        notifications: [
          {
            ...notification,
            id: crypto.randomUUID(),
            read: false,
            created_at: new Date().toISOString(),
          },
          ...state.notifications,
        ],
      })),

      removeNotification: (id) => set((state) => ({
        notifications: state.notifications.filter(n => n.id !== id),
      })),

      clearNotifications: () => set({ notifications: [] }),

      addToast: (toast) => {
        const id = crypto.randomUUID();
        set((state) => ({
          toasts: [...state.toasts, { ...toast, id }],
        }));
        
        const duration = toast.duration ?? 5000;
        if (duration > 0) {
          setTimeout(() => {
            set((state) => ({
              toasts: state.toasts.filter(t => t.id !== id),
            }));
          }, duration);
        }
      },

      removeToast: (id) => set((state) => ({
        toasts: state.toasts.filter(t => t.id !== id),
      })),

      // Set the active assistant - if switching, close the previous one
      setActiveAssistant: (assistant) => set({ activeAssistant: assistant }),

      // Close the currently active assistant
      closeActiveAssistant: () => set({ activeAssistant: null }),
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({
        darkMode: state.darkMode,
        language: state.language,
      }),
    }
  )
);
