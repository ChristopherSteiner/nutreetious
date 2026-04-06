import * as fs from 'node:fs';
import * as path from 'node:path';
import { app } from 'electron';
import { DEFAULT_SETTINGS, type UserSettings } from '../../common/Settings';

export class SettingsManager {
  private readonly filePath: string;
  private settings: UserSettings;

  constructor() {
    this.filePath = path.join(app.getPath('userData'), 'settings.json');
    this.settings = this.load();
  }

  private load(): UserSettings {
    try {
      if (!fs.existsSync(this.filePath)) {
        return { ...DEFAULT_SETTINGS };
      }

      const fileData = fs.readFileSync(this.filePath, 'utf-8');
      const userData = JSON.parse(fileData);

      return this.deepMerge({ ...DEFAULT_SETTINGS }, userData);
    } catch (error) {
      console.error('Fehler beim Laden der Settings:', error);
      return { ...DEFAULT_SETTINGS };
    }
  }

  save(newSettings: UserSettings): void {
    try {
      this.settings = newSettings;

      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.filePath, JSON.stringify(this.settings, null, 2));
    } catch (error) {
      console.error('Fehler beim Speichern der Settings:', error);
    }
  }

  get(): UserSettings {
    return this.settings;
  }

  private deepMerge<T extends object>(target: T, source: Partial<T>): T {
    const output = { ...target } as Record<string, unknown>;
    const sourceObj = source as Record<string, unknown>;

    for (const key in sourceObj) {
      if (Object.hasOwn(sourceObj, key)) {
        const sourceValue = sourceObj[key];
        const targetValue = output[key];

        if (this.isObject(sourceValue)) {
          output[key] = this.deepMerge(
            this.isObject(targetValue) ? targetValue : {},
            sourceValue,
          );
        } else {
          output[key] = sourceValue;
        }
      }
    }
    return output as T;
  }

  private isObject(item: unknown): item is Record<string, unknown> {
    return item !== null && typeof item === 'object' && !Array.isArray(item);
  }
}
