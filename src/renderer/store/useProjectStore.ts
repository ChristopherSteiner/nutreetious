import { create } from 'zustand';
import type { Project } from '../../common/Tree';
import { SolutionParser } from '../services';
import { FileProcessor } from '../services/FileProcessor';
import { useNotificationStore } from './useNotificationStore';

interface ProjectState {
  solutionPath: string | null;
  solutionName: string | null;
  projects: Project[];
  isLoading: boolean;
  selectProject: () => Promise<void>;
  setProjectFromPath: (path: string) => void;
  setIsLoading: (loading: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  solutionPath: null,
  solutionName: null,
  projects: [],
  isLoading: false,
  searchQuery: '',

  selectProject: async () => {
    try {
      const path = await window.electronAPI.openFileDialog();
      if (path) {
        await get().setProjectFromPath(path);
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'An unexpected error occurred';

      useNotificationStore.getState().add({
        title: 'System Error',
        message: errorMessage,
        type: 'error',
      });
    }
  },

  setProjectFromPath: async (path: string) => {
    if (!FileProcessor.isValidProjectFile(path)) {
      useNotificationStore.getState().add({
        title: 'Invalid File',
        message: 'Please drop a .sln, .slnx or .csproj file.',
        type: 'error',
      });
      return;
    }

    set({ isLoading: true, projects: [] });

    try {
      const name = FileProcessor.getFileName(path);
      const normalizedPath = path.replace(/\\/g, '/');

      if (normalizedPath.endsWith('.csproj')) {
        const projectData =
          await window.electronAPI.parseProjectAssets(normalizedPath);
        set({
          solutionPath: normalizedPath,
          solutionName: name,
          projects: [projectData],
        });
      } else {
        const slnContent = await window.electronAPI.readFile(normalizedPath);
        const relativeProjectPaths = await SolutionParser.getProjectPaths(
          normalizedPath,
          slnContent,
        );

        const slnDir = normalizedPath.substring(
          0,
          normalizedPath.lastIndexOf('/'),
        );

        const projectPromises = relativeProjectPaths.map(async (relPath) => {
          const absoluteProjectPath = `${slnDir}/${relPath}`;
          return window.electronAPI.parseProjectAssets(absoluteProjectPath);
        });

        const loadedProjects: Project[] = await Promise.all(projectPromises);

        set({
          solutionPath: normalizedPath,
          solutionName: name,
          projects: loadedProjects.filter((project) => project !== null),
        });
      }

      useNotificationStore.getState().add({
        title: 'Success',
        message: `${name} with ${get().projects.length} project(s) loaded.`,
        type: 'success',
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'An unexpected error occurred';
      useNotificationStore.getState().add({
        title: 'Loading Failed',
        message: errorMessage,
        type: 'error',
      });
    } finally {
      set({ isLoading: false });
    }
  },

  setIsLoading: (loading: boolean) => set({ isLoading: loading }),

  setSearchQuery: (query: string) => set({ searchQuery: query }),
}));
