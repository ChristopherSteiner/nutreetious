declare global {
  interface Window {
    electronAPI: {
      minimize: () => void;
      maximize: () => void;
      close: () => void;
      openFileDialog: () => Promise<string | null>;
      readFile: (path: string) => Promise<string>;
      getFilePath: (file: File) => string;
      getSettings: () => Promise<import('./src/common/settings').UserSettings>;
      saveSettings: (
        settings: import('./src/common/settings').UserSettings,
      ) => Promise<void>;
    };
  }
}

export {};
