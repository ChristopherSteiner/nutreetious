export type PackageType = 'Project' | 'Package' | 'Framework';

export interface Package {
  id: string;
  name: string;
  // NuGet pins every ProjectReference to a placeholder version ("1.0.0")
  // in project.assets.json regardless of the referenced project's actual
  // <Version>. That value isn't meaningful, so project nodes carry null
  // here instead of a misleading version string.
  referencedVersion: string | null;
  actualVersion: string | null;
  type: PackageType;
  isDirect: boolean;
  hasConflict: boolean;
  // Feed URL (or local folder) the package was restored from, read from the
  // .nupkg.metadata file in the global packages folder. Null for projects,
  // frameworks, and packages whose metadata file is missing the source.
  source: string | null;
  references: Package[];
}
