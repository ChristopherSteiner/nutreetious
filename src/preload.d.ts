import type { AppInfo } from './common/app';
import type { UserSettings } from './common/settings';
import type { ParseProjectAssetsResult } from './common/tree';

export interface IElectronAPI {
  minimize: () => void;
  maximize: () => void;
  close: () => void;
  openFileDialog: () => Promise<string | null>;
  readFile: (path: string) => Promise<string>;
  getFilePath: (file: File) => string;
  getSettings: () => Promise<UserSettings>;
  saveSettings: (settings: UserSettings) => Promise<void>;
  parseProjectAssets: (csprojPath: string) => Promise<ParseProjectAssetsResult>;
  getAppInfo: () => Promise<AppInfo>;
  openExternal: (url: string) => Promise<void>;
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}
