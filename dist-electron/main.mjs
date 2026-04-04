import path from "node:path";
import { fileURLToPath } from "node:url";
import { BrowserWindow, app, dialog, ipcMain } from "electron";
//#region electron/main.ts
var __dirname = path.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path.join(__dirname, "..");
var VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
var RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
var win = null;
function registerIpcHandlers() {
	ipcMain.on("window-minimize", () => {
		win?.minimize();
	});
	ipcMain.on("window-maximize", () => {
		if (!win) return;
		if (win.isMaximized()) win.unmaximize();
		else win.maximize();
	});
	ipcMain.on("window-close", () => {
		win?.close();
	});
	ipcMain.handle("dialog:openFile", async () => {
		const { canceled, filePaths } = await dialog.showOpenDialog({
			properties: ["openFile"],
			filters: [{
				name: "Projects & Solutions",
				extensions: [
					"sln",
					"slnx",
					"csproj"
				]
			}]
		});
		return canceled ? null : filePaths[0];
	});
}
function createWindow() {
	win = new BrowserWindow({
		width: 1200,
		height: 800,
		minWidth: 900,
		minHeight: 600,
		frame: false,
		icon: path.join(process.env.VITE_PUBLIC, "vite.svg"),
		webPreferences: {
			preload: path.join(__dirname, "preload.mjs"),
			sandbox: false,
			contextIsolation: true
		}
	});
	if (VITE_DEV_SERVER_URL) win.loadURL(VITE_DEV_SERVER_URL);
	else win.loadFile(path.join(RENDERER_DIST, "index.html"));
	win.on("closed", () => {
		win = null;
	});
}
app.whenReady().then(() => {
	registerIpcHandlers();
	createWindow();
});
app.on("window-all-closed", () => {
	if (process.platform !== "darwin") app.quit();
});
app.on("activate", () => {
	if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
//#endregion
export { RENDERER_DIST, VITE_DEV_SERVER_URL };
