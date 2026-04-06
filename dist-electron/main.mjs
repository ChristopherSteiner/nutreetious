import * as path$1 from "node:path";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { BrowserWindow, app, dialog, ipcMain } from "electron";
import * as fs$1 from "node:fs";
import fs from "node:fs/promises";
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
			if (!fs$1.existsSync(this.filePath)) return { ...DEFAULT_SETTINGS };
			const fileData = fs$1.readFileSync(this.filePath, "utf-8");
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
			if (!fs$1.existsSync(dir)) fs$1.mkdirSync(dir, { recursive: true });
			fs$1.writeFileSync(this.filePath, JSON.stringify(this.settings, null, 2));
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
//#region src/main/Tree/NugetTreeManager.ts
var NugetTreeManager = class {
	getAssetsPath(csprojPath) {
		const projectDir = path.dirname(csprojPath);
		return path.join(projectDir, "obj", "project.assets.json");
	}
	async parseProjectAssets(csprojPath) {
		const assetsPath = this.getAssetsPath(csprojPath);
		const rawData = await fs.readFile(assetsPath, "utf-8");
		const data = JSON.parse(rawData);
		const { projectName, projectPath } = data.project.restore;
		const frameworkTrees = {};
		for (const [frameworkName, targetPackages] of Object.entries(data.targets)) {
			const directDeps = data.project.frameworks[frameworkName]?.dependencies || {};
			const roots = [];
			for (const [name, info] of Object.entries(directDeps)) {
				const version = info.target === "Package" ? info.version : "";
				const node = this.buildRecursiveNode(name, version, targetPackages, "Package");
				if (node) roots.push(node);
			}
			frameworkTrees[frameworkName] = roots;
		}
		return {
			projectName,
			projectPath,
			frameworkTrees
		};
	}
	buildRecursiveNode(name, version, targetPackages, type) {
		const matchKey = Object.keys(targetPackages).find((key) => key.startsWith(`${name}/`));
		if (!matchKey) return null;
		const targetInfo = targetPackages[matchKey];
		const actualVersion = matchKey.split("/")[1];
		const hasConflict = version !== "" && !actualVersion.startsWith(version.replace(/[*[\]()]/g, ""));
		const pkg = {
			id: crypto.randomUUID(),
			name,
			referencedVersion: version || actualVersion,
			actualVersion,
			type,
			hasConflict,
			references: []
		};
		if (targetInfo.dependencies) for (const [depName, depVersion] of Object.entries(targetInfo.dependencies)) {
			const childNode = this.buildRecursiveNode(depName, depVersion, targetPackages, "Transitive");
			if (childNode) pkg.references.push(childNode);
		}
		return pkg;
	}
};
//#endregion
//#region src/main/index.ts
var __dirname = path.dirname(fileURLToPath(import.meta.url));
var settingsManager = new SettingsManager();
var nugetTreeManager = new NugetTreeManager();
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
	ipcMain.handle("project:parseProjectAssets", async (_event, csprojPath) => {
		return await nugetTreeManager.parseProjectAssets(csprojPath);
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
