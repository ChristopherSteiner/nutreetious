import type { Package } from './Package';

export interface Project {
  projectName: string;
  projectPath: string;
  frameworkTrees: {
    [framework: string]: Package[];
  };
}
