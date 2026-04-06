export interface UserSettings {
  appearance: {
    language: string;
  };
  notifications: {
    timeout: number;
  };
  windows: {
    notificationDrawerOpen: boolean;
  };
}

export const DEFAULT_SETTINGS: UserSettings = {
  appearance: {
    language: 'de',
  },
  notifications: {
    timeout: 5000,
  },
  windows: {
    notificationDrawerOpen: false,
  },
};
