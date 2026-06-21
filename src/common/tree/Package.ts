export type PackageType = 'Project' | 'Package' | 'Framework';

export interface Package {
  id: string;
  name: string;
  referencedVersion: string;
  actualVersion: string;
  type: PackageType;
  isDirect: boolean;
  hasConflict: boolean;
  references: Package[];
}
