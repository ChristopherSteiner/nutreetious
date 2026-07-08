import { create } from 'zustand';
import { MAX_RECENT_SOLUTIONS, type UserSettings } from '../../common/settings';

interface SettingsState {
  settings: UserSettings | null;
  isLoaded: boolean;
  loadSettings: () => Promise<void>;
  toggleNotificationDrawer: () => void;
  setLanguage: (language: string) => void;
  toggleHideProjectReferences: () => void;
  addRecentSolution: (path: string) => void;
  removeRecentSolution: (path: string) => void;
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

  setLanguage: (language) => {
    const settings = get().settings;
    if (!settings) return;

    const updated = {
      ...settings,
      appearance: { ...settings.appearance, language },
    };

    set({ settings: updated });

    window.electronAPI.saveSettings(updated);
  },

  toggleHideProjectReferences: () => {
    const settings = get().settings;
    if (!settings) return;

    const updated = {
      ...settings,
      filters: {
        ...settings.filters,
        hideProjectReferences: !settings.filters.hideProjectReferences,
      },
    };

    set({ settings: updated });

    window.electronAPI.saveSettings(updated);
  },

  addRecentSolution: (path) => {
    const settings = get().settings;
    if (!settings) return;

    const recentSolutions = [
      path,
      ...settings.recentSolutions.filter(
        (existing) => existing.toLowerCase() !== path.toLowerCase(),
      ),
    ].slice(0, MAX_RECENT_SOLUTIONS);

    const updated = { ...settings, recentSolutions };

    set({ settings: updated });

    window.electronAPI.saveSettings(updated);
  },

  removeRecentSolution: (path) => {
    const settings = get().settings;
    if (!settings) return;

    const updated = {
      ...settings,
      recentSolutions: settings.recentSolutions.filter(
        (existing) => existing !== path,
      ),
    };

    set({ settings: updated });

    window.electronAPI.saveSettings(updated);
  },
}));
