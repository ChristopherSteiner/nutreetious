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
  filters: {
    hideProjectReferences: boolean;
  };
  recentSolutions: string[];
}

export const MAX_RECENT_SOLUTIONS = 10;

export const DEFAULT_SETTINGS: UserSettings = {
  appearance: {
    language: 'en',
  },
  notifications: {
    timeout: 5000,
  },
  windows: {
    notificationDrawerOpen: false,
  },
  filters: {
    hideProjectReferences: false,
  },
  recentSolutions: [],
};
