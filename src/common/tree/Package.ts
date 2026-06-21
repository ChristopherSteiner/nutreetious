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
  references: Package[];
}
