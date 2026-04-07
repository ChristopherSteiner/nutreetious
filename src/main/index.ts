import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import type { UserSettings } from '../common/Settings';
import { SettingsManager } from './Settings';
import { NugetTreeManager } from './Tree';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const settingsManager = new SettingsManager();
const nugetTreeManager = new NugetTreeManager();

process.env.APP_ROOT = path.join(__dirname, '../..');
export const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL;
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist');
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public')
  : RENDERER_DIST;

let win: BrowserWindow | null = null;

function registerIpcHandlers() {
  ipcMain.on('window-minimize', () => win?.minimize());
  ipcMain.on('window-maximize', () => {
    if (win?.isMaximized()) win.unmaximize();
    else win?.maximize();
  });
  ipcMain.on('window-close', () => win?.close());

  ipcMain.handle('dialog:openFile', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [
        { name: 'Projects & Solutions', extensions: ['sln', 'slnx', 'csproj'] },
      ],
    });
    return canceled ? null : filePaths[0];
  });

  ipcMain.handle('settings:get', (): UserSettings => settingsManager.get());
  ipcMain.handle('settings:save', (_event, newSettings: UserSettings) => {
    settingsManager.save(newSettings);
  });
  ipcMain.handle(
    'project:parseProjectAssets',
    async (_event, csprojPath: string) => {
      return await nugetTreeManager.parseProjectAssets(csprojPath);
    },
  );
}

function createWindow() {
  const isDev = !!process.env.VITE_DEV_SERVER_URL;
  const iconPath = isDev
    ? path.join(process.cwd(), 'public', 'app.ico')
    : path.join(RENDERER_DIST, 'app.ico');

  console.log('Icon Path:', iconPath); // Debug-Ausgabe für den Icon-Pfad

  win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    frame: false,
    icon: iconPath,
    webPreferences: {
      preload: path.join(__dirname, '/preload.mjs'),
      sandbox: false,
      contextIsolation: true,
    },
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(RENDERER_DIST, 'index.html'));
  }
}

app.whenReady().then(() => {
  registerIpcHandlers();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
