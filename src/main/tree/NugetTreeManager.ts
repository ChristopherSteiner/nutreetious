// src/main/services/NugetTreeManager.ts
import fs from 'node:fs/promises';
import path from 'node:path';
import type {
  AssetsJson,
  Package,
  PackageType,
  ParseProjectAssetsResult,
  Project,
  RestoreInfo,
} from '../../common/tree';

export class NugetTreeManager {
  public getAssetsPath(csprojPath: string): string {
    const projectDir = path.dirname(csprojPath);
    return path.join(projectDir, 'obj', 'project.assets.json');
  }

  async parseProjectAssets(
    csprojPath: string,
  ): Promise<ParseProjectAssetsResult> {
    const assetsPath = this.getAssetsPath(csprojPath);

    let rawData: string;
    try {
      rawData = await fs.readFile(assetsPath, 'utf-8');
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return { ok: false, reason: 'ASSETS_NOT_FOUND', assetsPath };
      }
      throw error;
    }

    const data: AssetsJson = JSON.parse(rawData);

    const { projectName, projectPath } = data.project.restore;
    const restoreInfo = await this.buildRestoreInfo(data, assetsPath);
    const frameworkTrees: Record<string, Package[]> = {};
    const projectRefNamesByPath = this.buildProjectRefNameLookup(
      data.libraries,
      path.dirname(projectPath),
    );

    for (const [frameworkName, targetPackages] of Object.entries(
      data.targets,
    )) {
      const directDeps =
        data.project.frameworks[frameworkName]?.dependencies || {};
      const roots: Package[] = [];

      for (const [name, info] of Object.entries(directDeps)) {
        const version = info.target === 'Package' ? info.version : '';
        const node = this.buildRecursiveNode(
          name,
          version,
          targetPackages,
          true,
        );
        if (node) roots.push(node);
      }

      const projectRefs =
        data.project.restore.frameworks[frameworkName]?.projectReferences || {};

      for (const refCsprojPath of Object.keys(projectRefs)) {
        const name =
          projectRefNamesByPath.get(this.normalizePath(refCsprojPath)) ??
          path.basename(refCsprojPath, path.extname(refCsprojPath));
        const node = this.buildRecursiveNode(name, '', targetPackages, true);
        if (node) roots.push(node);
      }

      frameworkTrees[frameworkName] = roots;
    }

    const project: Project = {
      projectName,
      projectPath,
      restoreInfo,
      frameworkTrees,
    };
    await this.annotatePackageSources(project, restoreInfo.packagesPath);
    return { ok: true, project };
  }

  private async buildRestoreInfo(
    data: AssetsJson,
    assetsPath: string,
  ): Promise<RestoreInfo> {
    const restore = data.project.restore;

    let restoredAt: string | null = null;
    try {
      restoredAt = (await fs.stat(assetsPath)).mtime.toISOString();
    } catch {
      // stats are cosmetic; the tree still works without a timestamp
    }

    return {
      assetsPath,
      restoredAt,
      packagesPath: restore.packagesPath ?? null,
      configFilePaths: restore.configFilePaths ?? [],
      sources: Object.keys(restore.sources ?? {}),
    };
  }

  // NuGet writes a .nupkg.metadata file (containing the download source)
  // next to every package in the global packages folder. Reading it is the
  // only offline way to tell which feed a package actually came from.
  private async annotatePackageSources(
    project: Project,
    packagesPath: string | null,
  ): Promise<void> {
    if (!packagesPath) return;

    const sourceByPackage = new Map<string, Promise<string | null>>();
    const lookupSource = (name: string, version: string) => {
      const key = `${name.toLowerCase()}/${version.toLowerCase()}`;
      let pending = sourceByPackage.get(key);
      if (!pending) {
        pending = this.readNupkgSource(path.join(packagesPath, key));
        sourceByPackage.set(key, pending);
      }
      return pending;
    };

    const tasks: Promise<void>[] = [];
    const walk = (nodes: Package[]) => {
      for (const node of nodes) {
        if (node.type === 'Package' && node.actualVersion) {
          tasks.push(
            lookupSource(node.name, node.actualVersion).then((source) => {
              node.source = source;
            }),
          );
        }
        walk(node.references);
      }
    };
    for (const roots of Object.values(project.frameworkTrees)) walk(roots);

    await Promise.all(tasks);
  }

  private async readNupkgSource(packageDir: string): Promise<string | null> {
    try {
      const raw = await fs.readFile(
        path.join(packageDir, '.nupkg.metadata'),
        'utf-8',
      );
      const metadata: { source?: unknown } = JSON.parse(raw);
      return typeof metadata.source === 'string' && metadata.source !== ''
        ? metadata.source
        : null;
    } catch {
      return null;
    }
  }

  private normalizePath(p: string): string {
    return path.resolve(p).toLowerCase();
  }

  private buildProjectRefNameLookup(
    libraries: AssetsJson['libraries'],
    projectDir: string,
  ): Map<string, string> {
    const namesByPath = new Map<string, string>();

    for (const [key, info] of Object.entries(libraries)) {
      if (info.type !== 'project') continue;
      const relativePath = info.path ?? info.msbuildProject;
      if (!relativePath) continue;

      const name = key.split('/')[0];
      namesByPath.set(
        this.normalizePath(path.resolve(projectDir, relativePath)),
        name,
      );
    }

    return namesByPath;
  }

  private buildRecursiveNode(
    name: string,
    version: string,
    targetPackages: Record<
      string,
      { type?: string; dependencies?: Record<string, string> }
    >,
    isDirect: boolean,
  ): Package | null {
    const matchKey = Object.keys(targetPackages).find((key) =>
      key.startsWith(`${name}/`),
    );
    if (!matchKey) return null;

    const targetInfo = targetPackages[matchKey];
    const actualVersion = matchKey.split('/')[1];
    const cleanRequested = version.replace(/[[\]\s,()]/g, '').split('*')[0];

    const type: PackageType =
      targetInfo.type === 'project'
        ? 'Project'
        : targetInfo.type === 'framework'
          ? 'Framework'
          : 'Package';

    const isProject = type === 'Project';
    const hasConflict =
      !isProject && version !== '' && !actualVersion.startsWith(cleanRequested);

    const pkg: Package = {
      id: crypto.randomUUID(),
      name: name,
      referencedVersion: isProject ? null : version || actualVersion,
      actualVersion: isProject ? null : actualVersion,
      type,
      isDirect,
      hasConflict,
      source: null,
      references: [],
    };

    if (targetInfo.dependencies) {
      for (const [depName, depVersion] of Object.entries(
        targetInfo.dependencies,
      )) {
        const childNode = this.buildRecursiveNode(
          depName,
          depVersion,
          targetPackages,
          false,
        );
        if (childNode) pkg.references.push(childNode);
      }
    }

    return pkg;
  }
}
