import type { Package } from './Package';
import type { RestoreInfo } from './RestoreInfo';

export interface Project {
  projectName: string;
  projectPath: string;
  restoreInfo: RestoreInfo;
  frameworkTrees: {
    [framework: string]: Package[];
  };
}
