export interface IElectronAPI {
  minimize: () => void;
  maximize: () => void;
  close: () => void;
  openFileDialog: () => Promise<string | null>;
  readFile: (path: string) => Promise<string>;
  getFilePath: (file: File) => string;
  getSettings: () => Promise<UserSettings>;
  saveSettings: (settings: UserSettings) => Promise<void>;
  parseProjectAssets: (csprojPath: string) => Promise<Project>;
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}
