import { create } from 'zustand';
import { DEFAULT_SETTINGS } from '../../common/settings';
import { useUserSettingStore } from './useUserSettingStore';

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
  add: (n: Omit<Notification, 'id' | 'timestamp' | 'isToastActive'>) => void;
  remove: (id: string) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  add: (notification) => {
    const id = crypto.randomUUID();
    const settings = useUserSettingStore.getState().settings;

    const toastDuration =
      settings?.notifications?.timeout ??
      DEFAULT_SETTINGS.notifications.timeout;
    const shouldShowToast = !settings?.windows.notificationDrawerOpen;

    set((state) => {
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
    }, toastDuration);
  },
  remove: (id) =>
    set((state) => ({
      notifications: state.notifications.filter(
        (notification) => notification.id !== id,
      ),
    })),
  clearAll: () => set({ notifications: [] }),
}));
