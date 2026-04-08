import e, { readFile as t } from "node:fs/promises";
import * as n from "node:path";
import r from "node:path";
import { fileURLToPath as i } from "node:url";
import { BrowserWindow as a, app as o, dialog as s, ipcMain as c } from "electron";
import * as l from "node:fs";
//#region src/common/settings/UserSettings.ts
var u = {
	appearance: { language: "en" },
	notifications: { timeout: 5e3 },
	windows: { notificationDrawerOpen: !1 }
}, d = class {
	filePath;
	settings;
	constructor() {
		this.filePath = n.join(o.getPath("userData"), "settings.json"), this.settings = this.load();
	}
	load() {
		try {
			if (!l.existsSync(this.filePath)) return { ...u };
			let e = l.readFileSync(this.filePath, "utf-8"), t = JSON.parse(e);
			return this.deepMerge({ ...u }, t);
		} catch (e) {
			return console.error("Fehler beim Laden der Settings:", e), { ...u };
		}
	}
	save(e) {
		try {
			this.settings = e;
			let t = n.dirname(this.filePath);
			l.existsSync(t) || l.mkdirSync(t, { recursive: !0 }), l.writeFileSync(this.filePath, JSON.stringify(this.settings, null, 2));
		} catch (e) {
			console.error("Fehler beim Speichern der Settings:", e);
		}
	}
	get() {
		return this.settings;
	}
	deepMerge(e, t) {
		let n = { ...e }, r = t;
		for (let e in r) if (Object.hasOwn(r, e)) {
			let t = r[e], i = n[e];
			this.isObject(t) ? n[e] = this.deepMerge(this.isObject(i) ? i : {}, t) : n[e] = t;
		}
		return n;
	}
	isObject(e) {
		return typeof e == "object" && !!e && !Array.isArray(e);
	}
}, f = class {
	getAssetsPath(e) {
		let t = r.dirname(e);
		return r.join(t, "obj", "project.assets.json");
	}
	async parseProjectAssets(t) {
		let n = this.getAssetsPath(t), r = await e.readFile(n, "utf-8"), i = JSON.parse(r), { projectName: a, projectPath: o } = i.project.restore, s = {};
		for (let [e, t] of Object.entries(i.targets)) {
			let n = i.project.frameworks[e]?.dependencies || {}, r = [];
			for (let [e, i] of Object.entries(n)) {
				let n = i.target === "Package" ? i.version : "", a = this.buildRecursiveNode(e, n, t, "Package");
				a && r.push(a);
			}
			s[e] = r;
		}
		return {
			projectName: a,
			projectPath: o,
			frameworkTrees: s
		};
	}
	buildRecursiveNode(e, t, n, r) {
		let i = Object.keys(n).find((t) => t.startsWith(`${e}/`));
		if (!i) return null;
		let a = n[i], o = i.split("/")[1], s = t.replace(/[[\]\s,()]/g, "").split("*")[0], c = t !== "" && !o.startsWith(s), l = {
			id: crypto.randomUUID(),
			name: e,
			referencedVersion: t || o,
			actualVersion: o,
			type: r,
			hasConflict: c,
			references: []
		};
		if (a.dependencies) for (let [e, t] of Object.entries(a.dependencies)) {
			let r = this.buildRecursiveNode(e, t, n, "Transitive");
			r && l.references.push(r);
		}
		return l;
	}
}, p = r.dirname(i(import.meta.url)), m = new d(), h = new f();
process.env.APP_ROOT = r.join(p, "../..");
var g = process.env.VITE_DEV_SERVER_URL, _ = r.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = g ? r.join(process.env.APP_ROOT, "public") : _;
var v = null;
function y() {
	c.on("window-minimize", () => v?.minimize()), c.on("window-maximize", () => {
		v?.isMaximized() ? v.unmaximize() : v?.maximize();
	}), c.on("window-close", () => v?.close()), c.handle("dialog:openFile", async () => {
		let { canceled: e, filePaths: t } = await s.showOpenDialog({
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
		return e ? null : t[0];
	}), c.handle("read-file", async (e, n) => {
		try {
			return await t(n, "utf-8");
		} catch (e) {
			throw console.error("Failed to read file:", e), e;
		}
	}), c.handle("settings:get", () => m.get()), c.handle("settings:save", (e, t) => {
		m.save(t);
	}), c.handle("project:parseProjectAssets", async (e, t) => await h.parseProjectAssets(t));
}
function b() {
	v = new a({
		width: 1200,
		height: 800,
		minWidth: 900,
		minHeight: 600,
		frame: !1,
		icon: process.env.VITE_DEV_SERVER_URL ? r.join(process.cwd(), "public", "app.ico") : r.join(_, "app.ico"),
		webPreferences: {
			preload: r.join(p, "/preload.mjs"),
			sandbox: !1,
			contextIsolation: !0
		}
	}), g ? v.loadURL(g) : v.loadFile(r.join(_, "index.html"));
}
o.whenReady().then(() => {
	y(), b();
}), o.on("window-all-closed", () => {
	process.platform !== "darwin" && o.quit();
}), o.on("activate", () => {
	a.getAllWindows().length === 0 && b();
});
//#endregion
export { _ as RENDERER_DIST, g as VITE_DEV_SERVER_URL };
