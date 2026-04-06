import { contextBridge, ipcRenderer, webUtils } from "electron";
//#region src/preload/index.ts
contextBridge.exposeInMainWorld("electronAPI", {
	minimize: () => ipcRenderer.send("window-minimize"),
	maximize: () => ipcRenderer.send("window-maximize"),
	close: () => ipcRenderer.send("window-close"),
	openFileDialog: () => ipcRenderer.invoke("dialog:openFile"),
	getFilePath: (file) => webUtils.getPathForFile(file),
	getSettings: () => ipcRenderer.invoke("settings:get"),
	saveSettings: (settings) => ipcRenderer.invoke("settings:save", settings),
	parseProjectAssets: (path) => ipcRenderer.invoke("project:parseProjectAssets", path)
});
//#endregion
