export type PackageType = 'Project' | 'Package' | 'Framework' | 'Transitive';

export interface Package {
  id: string;
  name: string;
  referencedVersion: string;
  actualVersion: string;
  type: PackageType;
  hasConflict: boolean;
  references: Package[];
}
