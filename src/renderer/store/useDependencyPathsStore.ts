import { create } from 'zustand';
import type { Package } from '../../common/tree';

export interface DependencyPathsTarget {
  packageName: string;
  projectName: string;
  framework: string;
  // Unfiltered roots of the framework tree the node lives in, so the paths
  // stay truthful even while view filters are active.
  roots: Package[];
}

interface DependencyPathsState {
  target: DependencyPathsTarget | null;
  open: (target: DependencyPathsTarget) => void;
  close: () => void;
}

export const useDependencyPathsStore = create<DependencyPathsState>((set) => ({
  target: null,
  open: (target) => set({ target }),
  close: () => set({ target: null }),
}));
