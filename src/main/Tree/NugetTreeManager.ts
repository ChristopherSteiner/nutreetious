// src/main/services/NugetTreeManager.ts
import fs from 'node:fs/promises';
import path from 'node:path';
import type { Package, PackageType, Project } from '../../common/Tree';

interface AssetsJson {
  project: {
    restore: { projectName: string; projectPath: string };
    frameworks: Record<
      string,
      { dependencies?: Record<string, { version: string; target: string }> }
    >;
  };
  targets: Record<
    string,
    Record<string, { dependencies?: Record<string, string> }>
  >;
  libraries: Record<string, unknown>;
}

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
          'Package',
        );
        if (node) roots.push(node);
      }
      frameworkTrees[frameworkName] = roots;
    }

    return { projectName, projectPath, frameworkTrees };
  }

  private buildRecursiveNode(
    name: string,
    version: string,
    targetPackages: Record<string, { dependencies?: Record<string, string> }>,
    type: PackageType,
  ): Package | null {
    const matchKey = Object.keys(targetPackages).find((key) =>
      key.startsWith(`${name}/`),
    );
    if (!matchKey) return null;

    const targetInfo = targetPackages[matchKey];
    const actualVersion = matchKey.split('/')[1];
    const cleanRequested = version.replace(/[[\]\s,()]/g, '').split('*')[0];

    const hasConflict =
      version !== '' && !actualVersion.startsWith(cleanRequested);

    const pkg: Package = {
      id: crypto.randomUUID(),
      name: name,
      referencedVersion: version || actualVersion,
      actualVersion: actualVersion,
      type: type,
      hasConflict: hasConflict,
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
          'Transitive',
        );
        if (childNode) pkg.references.push(childNode);
      }
    }

    return pkg;
  }
}
