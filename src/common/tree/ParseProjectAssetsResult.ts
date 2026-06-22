import type { Project } from './Project';

export type ParseProjectAssetsResult =
  | { ok: true; project: Project }
  | { ok: false; reason: 'ASSETS_NOT_FOUND'; assetsPath: string };
