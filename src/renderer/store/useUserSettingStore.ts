import { create } from 'zustand';
import type { UserSettings } from '../../common/Settings';

interface SettingsState {
  settings: UserSettings | null;
  isLoaded: boolean;
  loadSettings: () => Promise<void>;
  toggleNotificationDrawer: () => void;
}

export const useUserSettingStore = create<SettingsState>((set, get) => ({
  settings: null,
  isLoaded: false,

  loadSettings: async () => {
    const data = await window.electronAPI.getSettings();
    set({ settings: data, isLoaded: true });
  },

  toggleNotificationDrawer: () => {
    const settings = get().settings;
    if (!settings) return;

    const updated = {
      ...settings,
      windows: {
        ...settings.windows,
        notificationDrawerOpen: !settings.windows.notificationDrawerOpen,
      },
    };

    set({ settings: updated });

    window.electronAPI.saveSettings(updated);
  },
}));
