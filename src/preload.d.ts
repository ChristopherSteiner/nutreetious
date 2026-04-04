export interface IElectronAPI {
  minimize: () => void;
  maximize: () => void;
  close: () => void;
  openFileDialog: () => Promise<string | null>;
  readFile: (path: string) => Promise<string>;
  getFilePath: (file: File) => string;
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}
