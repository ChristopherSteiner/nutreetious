import { create } from 'zustand';
import { FileProcessor } from '../services/FileProcessor';
import { useNotificationStore } from './useNotificationStore';

interface ProjectState {
  projectPath: string | null;
  projectName: string | null;
  isLoading: boolean;
  selectProject: () => Promise<void>;
  setProjectFromPath: (path: string) => void;
  setIsLoading: (loading: boolean) => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projectPath: null,
  projectName: null,
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

    set({ isLoading: true });
    try {
      const name = FileProcessor.getFileName(path);

      // Hier kommt morgen deine "Spoiler-Logik" rein (Assets finden etc.)
      set({ projectPath: path, projectName: name });

      // todo: Hier kommt der Aufruf an den FileProcessor Service!
      // Wir simulieren das kurz, damit du das Overlay siehst:
      await new Promise((r) => setTimeout(r, 500));
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
