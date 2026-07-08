import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { NugetTreeManager } from './NugetTreeManager';

async function parseProjectAssets(
  manager: NugetTreeManager,
  csprojPath: string,
) {
  const result = await manager.parseProjectAssets(csprojPath);
  if (!result.ok) throw new Error(`Expected ok result, got ${result.reason}`);
  return result.project;
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sampleCsprojPath = path.join(
  __dirname,
  '__fixtures__',
  'SampleProject',
  'SampleProject.csproj',
);

describe('NugetTreeManager', () => {
  describe('getAssetsPath', () => {
    it('joins the project directory with obj/project.assets.json', () => {
      const manager = new NugetTreeManager();

      expect(manager.getAssetsPath(sampleCsprojPath)).toBe(
        path.join(path.dirname(sampleCsprojPath), 'obj', 'project.assets.json'),
      );
    });
  });

  describe('parseProjectAssets', () => {
    it('reads the project name and path from the fixture', async () => {
      const manager = new NugetTreeManager();

      const project = await parseProjectAssets(manager, sampleCsprojPath);

      expect(project.projectName).toBe('SampleProject');
      expect(project.projectPath).toBe(
        'C:/Fake/SampleProject/SampleProject.csproj',
      );
    });

    it('builds one root per resolvable direct PackageReference and ProjectReference', async () => {
      const manager = new NugetTreeManager();

      const project = await parseProjectAssets(manager, sampleCsprojPath);
      const roots = project.frameworkTrees['net8.0'];

      // Ghost.Package has no matching entry under targets and is dropped.
      expect(roots.map((pkg) => pkg.name).sort()).toEqual([
        'Mismatched.Core',
        'Newtonsoft.Json',
        'Sample.ProjectRef',
        'Serilog',
      ]);
    });

    it('resolves a package whose requested version matches the actual version', async () => {
      const manager = new NugetTreeManager();

      const project = await parseProjectAssets(manager, sampleCsprojPath);
      const roots = project.frameworkTrees['net8.0'];
      const newtonsoft = roots.find((pkg) => pkg.name === 'Newtonsoft.Json');

      expect(newtonsoft).toMatchObject({
        name: 'Newtonsoft.Json',
        referencedVersion: '[13.0.3, )',
        actualVersion: '13.0.3',
        type: 'Package',
        isDirect: true,
        hasConflict: false,
        references: [],
      });
      expect(typeof newtonsoft?.id).toBe('string');
      expect(newtonsoft?.id.length).toBeGreaterThan(0);
    });

    it('flags a conflict when the resolved version differs from the requested range', async () => {
      const manager = new NugetTreeManager();

      const project = await parseProjectAssets(manager, sampleCsprojPath);
      const roots = project.frameworkTrees['net8.0'];
      const serilog = roots.find((pkg) => pkg.name === 'Serilog');

      expect(serilog?.actualVersion).toBe('2.5.0');
      expect(serilog?.hasConflict).toBe(true);
    });

    it('builds transitive dependencies with isDirect: false', async () => {
      const manager = new NugetTreeManager();

      const project = await parseProjectAssets(manager, sampleCsprojPath);
      const roots = project.frameworkTrees['net8.0'];
      const serilog = roots.find((pkg) => pkg.name === 'Serilog');

      expect(serilog?.references).toHaveLength(1);
      expect(serilog?.references[0]).toMatchObject({
        name: 'Serilog.Sinks.Console',
        actualVersion: '4.1.0',
        type: 'Package',
        isDirect: false,
        hasConflict: false,
        references: [],
      });
    });

    it('drops direct dependencies that have no matching entry in targets', async () => {
      const manager = new NugetTreeManager();

      const project = await parseProjectAssets(manager, sampleCsprojPath);
      const roots = project.frameworkTrees['net8.0'];

      expect(roots.find((pkg) => pkg.name === 'Ghost.Package')).toBeUndefined();
    });

    it('builds a ProjectReference as a Project-typed root, resolved by csproj basename', async () => {
      const manager = new NugetTreeManager();

      const project = await parseProjectAssets(manager, sampleCsprojPath);
      const roots = project.frameworkTrees['net8.0'];
      const projectRef = roots.find((pkg) => pkg.name === 'Sample.ProjectRef');

      expect(projectRef).toMatchObject({
        name: 'Sample.ProjectRef',
        referencedVersion: null,
        actualVersion: null,
        type: 'Project',
        isDirect: true,
        hasConflict: false,
      });
    });

    it("walks a ProjectReference's own package dependency as a Package node", async () => {
      const manager = new NugetTreeManager();

      const project = await parseProjectAssets(manager, sampleCsprojPath);
      const roots = project.frameworkTrees['net8.0'];
      const projectRef = roots.find((pkg) => pkg.name === 'Sample.ProjectRef');
      const newtonsoft = projectRef?.references.find(
        (pkg) => pkg.name === 'Newtonsoft.Json',
      );

      expect(newtonsoft).toMatchObject({
        name: 'Newtonsoft.Json',
        actualVersion: '13.0.3',
        type: 'Package',
        isDirect: false,
        hasConflict: false,
      });
    });

    it("recognizes a ProjectReference's own project dependency as a (transitive) Project node", async () => {
      const manager = new NugetTreeManager();

      const project = await parseProjectAssets(manager, sampleCsprojPath);
      const roots = project.frameworkTrees['net8.0'];
      const projectRef = roots.find((pkg) => pkg.name === 'Sample.ProjectRef');
      const nested = projectRef?.references.find(
        (pkg) => pkg.name === 'Nested.Project',
      );

      expect(nested).toMatchObject({
        name: 'Nested.Project',
        actualVersion: null,
        type: 'Project',
        isDirect: false,
        hasConflict: false,
        references: [],
      });
    });

    it('exposes the restore info recorded in the assets file', async () => {
      const manager = new NugetTreeManager();

      const project = await parseProjectAssets(manager, sampleCsprojPath);

      expect(project.restoreInfo).toMatchObject({
        assetsPath: manager.getAssetsPath(sampleCsprojPath),
        packagesPath: 'C:/Fake/packages',
        configFilePaths: [
          'C:/Fake/NuGet.Config',
          'C:/Users/Fake/AppData/Roaming/NuGet/NuGet.Config',
        ],
        sources: ['https://api.nuget.org/v3/index.json'],
      });
      expect(project.restoreInfo.restoredAt).not.toBeNull();
    });

    it('leaves the package source null when no .nupkg.metadata exists', async () => {
      const manager = new NugetTreeManager();

      const project = await parseProjectAssets(manager, sampleCsprojPath);
      const roots = project.frameworkTrees['net8.0'];
      const newtonsoft = roots.find((pkg) => pkg.name === 'Newtonsoft.Json');

      expect(newtonsoft?.source).toBeNull();
    });

    it('annotates packages with the feed recorded in .nupkg.metadata', async () => {
      const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'nutreetious-'));
      try {
        const projectDir = path.join(tempDir, 'SampleProject');
        const packagesDir = path.join(tempDir, 'packages');
        await fs.mkdir(path.join(projectDir, 'obj'), { recursive: true });

        const assets = JSON.parse(
          await fs.readFile(
            path.join(
              __dirname,
              '__fixtures__',
              'SampleProject',
              'obj',
              'project.assets.json',
            ),
            'utf-8',
          ),
        );
        assets.project.restore.packagesPath = packagesDir.replace(/\\/g, '/');
        await fs.writeFile(
          path.join(projectDir, 'obj', 'project.assets.json'),
          JSON.stringify(assets),
        );

        // The global packages folder stores everything lowercased.
        const metadataDir = path.join(packagesDir, 'newtonsoft.json', '13.0.3');
        await fs.mkdir(metadataDir, { recursive: true });
        await fs.writeFile(
          path.join(metadataDir, '.nupkg.metadata'),
          JSON.stringify({
            version: 2,
            contentHash: 'irrelevant',
            source: 'https://api.nuget.org/v3/index.json',
          }),
        );

        const manager = new NugetTreeManager();
        const project = await parseProjectAssets(
          manager,
          path.join(projectDir, 'SampleProject.csproj'),
        );
        const roots = project.frameworkTrees['net8.0'];

        expect(
          roots.find((pkg) => pkg.name === 'Newtonsoft.Json')?.source,
        ).toBe('https://api.nuget.org/v3/index.json');
        expect(roots.find((pkg) => pkg.name === 'Serilog')?.source).toBeNull();
      } finally {
        await fs.rm(tempDir, { recursive: true, force: true });
      }
    });

    it('resolves a ProjectReference whose package id differs from its csproj filename', async () => {
      // Mismatched.csproj sets <AssemblyName>Mismatched.Core</AssemblyName>,
      // so it shows up in targets/libraries as "Mismatched.Core", not
      // "Mismatched". The projectReferences entry still points at
      // Mismatched.csproj. Resolving by libraries[key].path (instead of
      // guessing the name from the csproj filename) is required to find it.
      const manager = new NugetTreeManager();

      const project = await parseProjectAssets(manager, sampleCsprojPath);
      const roots = project.frameworkTrees['net8.0'];
      const mismatched = roots.find((pkg) => pkg.name === 'Mismatched.Core');

      expect(mismatched).toMatchObject({
        name: 'Mismatched.Core',
        referencedVersion: null,
        actualVersion: null,
        type: 'Project',
        isDirect: true,
        hasConflict: false,
        references: [],
      });
    });
  });
});
