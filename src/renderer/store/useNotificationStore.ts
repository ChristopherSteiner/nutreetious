import { create } from 'zustand';

export interface Notification {
  id: string;
  title: string;
  message?: string;
  type: 'error' | 'success' | 'info';
  timestamp: number;
}

interface NotificationState {
  notifications: Notification[];
  add: (n: Omit<Notification, 'id' | 'timestamp'>) => void;
  remove: (id: string) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  add: (n) => {
    const id = crypto.randomUUID();
    const newNote = { ...n, id, timestamp: Date.now() };
    set((state) => ({ notifications: [newNote, ...state.notifications] }));

    setTimeout(() => {
      set((state) => ({
        notifications: state.notifications.filter((note) => note.id !== id),
      }));
    }, 50000);
  },
  remove: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
}));
