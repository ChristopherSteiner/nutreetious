import { create } from 'zustand';

export interface Notification {
  id: string;
  title: string;
  message?: string;
  type: 'error' | 'success' | 'info';
  timestamp: number;
  isToastActive: boolean;
}

interface NotificationState {
  notifications: Notification[];
  isDrawerOpen: boolean;
  add: (n: Omit<Notification, 'id' | 'timestamp' | 'isToastActive'>) => void;
  remove: (id: string) => void;
  clearAll: () => void;
  toggleDrawer: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  isDrawerOpen: false,
  add: (notification) => {
    const id = crypto.randomUUID();
    set((state) => {
      const shouldShowToast = !state.isDrawerOpen;

      const newNote: Notification = {
        ...notification,
        id,
        timestamp: Date.now(),
        isToastActive: shouldShowToast,
      };

      return { notifications: [newNote, ...state.notifications] };
    });

    setTimeout(() => {
      set((state) => ({
        notifications: state.notifications.map((note) =>
          note.id === id ? { ...note, isToastActive: false } : note,
        ),
      }));
    }, 3000);
  },
  remove: (id) =>
    set((state) => ({
      notifications: state.notifications.filter(
        (notification) => notification.id !== id,
      ),
    })),
  clearAll: () => set({ notifications: [] }),
  toggleDrawer: () => set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),
}));
