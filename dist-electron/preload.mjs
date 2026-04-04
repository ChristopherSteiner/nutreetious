import { contextBridge, ipcRenderer, webUtils } from "electron";
//#region electron/preload.ts
contextBridge.exposeInMainWorld("electronAPI", {
	minimize: () => ipcRenderer.send("window-minimize"),
	maximize: () => ipcRenderer.send("window-maximize"),
	close: () => ipcRenderer.send("window-close"),
	openFileDialog: () => ipcRenderer.invoke("dialog:openFile"),
	getFilePath: (file) => webUtils.getPathForFile(file)
});
//#endregion
