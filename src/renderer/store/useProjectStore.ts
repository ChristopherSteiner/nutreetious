import { create } from 'zustand';
import type { Project } from '../../common/Tree';
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
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  solutionPath: null,
  solutionName: null,
  projects: [],
  isLoading: false,

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

      if (path.endsWith('.csproj')) {
        const projectData = await window.electronAPI.parseProjectAssets(path);

        set({
          solutionPath: path,
          solutionName: name,
          projects: [projectData], // Als Array speichern
        });

        console.log('Loaded project data:', projectData);
      } else {
        // TODO: Hier kommt später die Logik für .sln / .slnx
        // 1. Alle .csproj Pfade aus der .sln extrahieren
        // 2. Über alle Pfade loopen und parseProjectAssets aufrufen
        set({ solutionPath: path, solutionName: name, projects: [] });
      }

      useNotificationStore.getState().add({
        title: 'Project Loaded',
        message: `Successfully loaded project: ${name}`,
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
}));
