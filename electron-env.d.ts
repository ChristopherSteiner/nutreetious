declare global {
  interface Window {
    electronAPI: {
      minimize: () => void;
      maximize: () => void;
      close: () => void;
      openFileDialog: () => Promise<string | null>;
      getFilePath: (file: File) => string;
      getSettings: () => Promise<import('./src/common/Settings').UserSettings>;
      saveSettings: (
        settings: import('./src/common/Settings').UserSettings,
      ) => Promise<void>;
    };
  }
}

export {};
