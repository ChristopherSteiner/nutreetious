import * as path$1 from "node:path";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { BrowserWindow, app, dialog, ipcMain } from "electron";
import * as fs from "node:fs";
//#region src/common/Settings/UserSettings.ts
var DEFAULT_SETTINGS = {
	appearance: { language: "en" },
	notifications: { timeout: 5e3 },
	windows: { notificationDrawerOpen: false }
};
//#endregion
//#region src/main/Settings/SettingsManager.ts
var SettingsManager = class {
	filePath;
	settings;
	constructor() {
		this.filePath = path$1.join(app.getPath("userData"), "settings.json");
		this.settings = this.load();
	}
	load() {
		try {
			if (!fs.existsSync(this.filePath)) return { ...DEFAULT_SETTINGS };
			const fileData = fs.readFileSync(this.filePath, "utf-8");
			const userData = JSON.parse(fileData);
			return this.deepMerge({ ...DEFAULT_SETTINGS }, userData);
		} catch (error) {
			console.error("Fehler beim Laden der Settings:", error);
			return { ...DEFAULT_SETTINGS };
		}
	}
	save(newSettings) {
		try {
			this.settings = newSettings;
			const dir = path$1.dirname(this.filePath);
			if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
			fs.writeFileSync(this.filePath, JSON.stringify(this.settings, null, 2));
		} catch (error) {
			console.error("Fehler beim Speichern der Settings:", error);
		}
	}
	get() {
		return this.settings;
	}
	deepMerge(target, source) {
		const output = { ...target };
		const sourceObj = source;
		for (const key in sourceObj) if (Object.hasOwn(sourceObj, key)) {
			const sourceValue = sourceObj[key];
			const targetValue = output[key];
			if (this.isObject(sourceValue)) output[key] = this.deepMerge(this.isObject(targetValue) ? targetValue : {}, sourceValue);
			else output[key] = sourceValue;
		}
		return output;
	}
	isObject(item) {
		return item !== null && typeof item === "object" && !Array.isArray(item);
	}
};
//#endregion
//#region src/main/index.ts
var __dirname = path.dirname(fileURLToPath(import.meta.url));
var settingsManager = new SettingsManager();
process.env.APP_ROOT = path.join(__dirname, "../..");
var VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL;
var RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
var win = null;
function registerIpcHandlers() {
	ipcMain.on("window-minimize", () => win?.minimize());
	ipcMain.on("window-maximize", () => {
		if (win?.isMaximized()) win.unmaximize();
		else win?.maximize();
	});
	ipcMain.on("window-close", () => win?.close());
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
	ipcMain.handle("settings:get", () => settingsManager.get());
	ipcMain.handle("settings:save", (_event, newSettings) => {
		settingsManager.save(newSettings);
	});
}
function createWindow() {
	win = new BrowserWindow({
		width: 1200,
		height: 800,
		minWidth: 900,
		minHeight: 600,
		frame: false,
		icon: path.join(process.env.VITE_PUBLIC || "", "vite.svg"),
		webPreferences: {
			preload: path.join(__dirname, "/preload.mjs"),
			sandbox: false,
			contextIsolation: true
		}
	});
	if (VITE_DEV_SERVER_URL) win.loadURL(VITE_DEV_SERVER_URL);
	else win.loadFile(path.join(RENDERER_DIST, "index.html"));
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
