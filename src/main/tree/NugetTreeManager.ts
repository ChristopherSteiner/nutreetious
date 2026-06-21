// src/main/services/NugetTreeManager.ts
import fs from 'node:fs/promises';
import path from 'node:path';
import type {
  AssetsJson,
  Package,
  PackageType,
  Project,
} from '../../common/tree';

export class NugetTreeManager {
  public getAssetsPath(csprojPath: string): string {
    const projectDir = path.dirname(csprojPath);
    return path.join(projectDir, 'obj', 'project.assets.json');
  }

  async parseProjectAssets(csprojPath: string): Promise<Project> {
    const assetsPath = this.getAssetsPath(csprojPath);
    const rawData = await fs.readFile(assetsPath, 'utf-8');
    const data: AssetsJson = JSON.parse(rawData);

    const { projectName, projectPath } = data.project.restore;
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

    return { projectName, projectPath, frameworkTrees };
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
