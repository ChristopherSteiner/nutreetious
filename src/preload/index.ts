import { contextBridge, ipcRenderer, webUtils } from 'electron';
import type { AppInfo } from '../common/app';
import type { UserSettings } from '../common/settings';
import type { ParseProjectAssetsResult } from '../common/tree';

contextBridge.exposeInMainWorld('electronAPI', {
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),
  openFileDialog: () => ipcRenderer.invoke('dialog:openFile'),
  readFile: (path: string) => ipcRenderer.invoke('read-file', path),
  getFilePath: (file: File) => webUtils.getPathForFile(file),
  getSettings: (): Promise<UserSettings> => ipcRenderer.invoke('settings:get'),
  saveSettings: (settings: UserSettings): Promise<void> =>
    ipcRenderer.invoke('settings:save', settings),
  parseProjectAssets: (path: string): Promise<ParseProjectAssetsResult> =>
    ipcRenderer.invoke('project:parseProjectAssets', path),
  getAppInfo: (): Promise<AppInfo> => ipcRenderer.invoke('app:getInfo'),
  openExternal: (url: string): Promise<void> =>
    ipcRenderer.invoke('shell:openExternal', url),
});
