import { create } from 'zustand';
import { FileProcessor } from '../services/FileProcessor';

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
    const path = await window.electronAPI.openFileDialog();
    if (path) {
      // Wir nutzen einfach die andere Action, um Code-Duplizierung zu vermeiden
      await get().setProjectFromPath(path);
    }
  },

  setProjectFromPath: async (path: string) => {
    if (!FileProcessor.isValidProjectFile(path)) {
      alert('Invalid file type!'); // Oder ein schönerer Toast
      return;
    }

    set({ isLoading: true });
    const name = FileProcessor.getFileName(path);

    // Hier kommt morgen deine "Spoiler-Logik" rein (Assets finden etc.)
    set({ projectPath: path, projectName: name });

    // todo: Hier kommt der Aufruf an den FileProcessor Service!
    // Wir simulieren das kurz, damit du das Overlay siehst:
    await new Promise((r) => setTimeout(r, 500));
    set({ isLoading: false });
  },

  setIsLoading: (loading: boolean) => set({ isLoading: loading }),
}));
