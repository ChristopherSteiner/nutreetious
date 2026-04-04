declare module 'react' {
  interface CSSProperties {
    WebkitAppRegion?: 'drag' | 'no-drag';
  }
}

export interface IElectronAPI {
  minimize: () => void;
  maximize: () => void; // Neu
  close: () => void;
  openFileDialog: () => Promise<string | null>;
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}