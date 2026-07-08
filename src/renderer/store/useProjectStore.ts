import { create } from 'zustand';
import type { Project } from '../../common/tree';
import i18n from '../i18n';
import { SolutionParser } from '../services';
import { FileProcessor } from '../services/FileProcessor';
import { useNotificationStore } from './useNotificationStore';
import { useUserSettingStore } from './useUserSettingStore';

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : i18n.t('notifications.unexpectedError');
}

function notifyAssetsNotFound(assetsPath: string) {
  useNotificationStore.getState().add({
    title: i18n.t('notifications.loadingFailed'),
    message: i18n.t('notifications.assetsNotFound', { path: assetsPath }),
    type: 'error',
  });
}

export interface TreeCommand {
  mode: 'expand' | 'collapse';
  seq: number;
}

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
  showConflictsOnly: boolean;
  toggleShowConflictsOnly: () => void;
  treeCommand: TreeCommand | null;
  expandAll: () => void;
  collapseAll: () => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  solutionPath: null,
  solutionName: null,
  projects: [],
  isLoading: false,
  searchQuery: '',
  showConflictsOnly: false,
  treeCommand: null,

  selectProject: async () => {
    try {
      const path = await window.electronAPI.openFileDialog();
      if (path) {
        await get().setProjectFromPath(path);
      }
    } catch (error: unknown) {
      useNotificationStore.getState().add({
        title: i18n.t('notifications.systemError'),
        message: getErrorMessage(error),
        type: 'error',
      });
    }
  },

  setProjectFromPath: async (path: string) => {
    if (!FileProcessor.isValidProjectFile(path)) {
      useNotificationStore.getState().add({
        title: i18n.t('notifications.invalidFile'),
        message: i18n.t('notifications.invalidFileMessage'),
        type: 'error',
      });
      return;
    }

    set({ isLoading: true, projects: [] });

    try {
      const name = FileProcessor.getFileName(path);
      const normalizedPath = path.replace(/\\/g, '/');

      if (normalizedPath.endsWith('.csproj')) {
        const result =
          await window.electronAPI.parseProjectAssets(normalizedPath);

        if (!result.ok) {
          notifyAssetsNotFound(result.assetsPath);
          return;
        }

        set({
          solutionPath: normalizedPath,
          solutionName: name,
          projects: [result.project],
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

        const results = await Promise.all(
          relativeProjectPaths.map((relPath) =>
            window.electronAPI.parseProjectAssets(`${slnDir}/${relPath}`),
          ),
        );

        const loadedProjects: Project[] = [];
        for (const result of results) {
          if (result.ok) loadedProjects.push(result.project);
          else notifyAssetsNotFound(result.assetsPath);
        }

        set({
          solutionPath: normalizedPath,
          solutionName: name,
          projects: loadedProjects,
        });
      }

      if (get().projects.length > 0) {
        useUserSettingStore.getState().addRecentSolution(normalizedPath);
        useNotificationStore.getState().add({
          title: i18n.t('notifications.success'),
          message: i18n.t('notifications.loadedMessage', {
            name,
            count: get().projects.length,
          }),
          type: 'success',
        });
      }
    } catch (error: unknown) {
      useNotificationStore.getState().add({
        title: i18n.t('notifications.loadingFailed'),
        message: getErrorMessage(error),
        type: 'error',
      });
    } finally {
      set({ isLoading: false });
    }
  },

  setIsLoading: (loading: boolean) => set({ isLoading: loading }),

  setSearchQuery: (query: string) => set({ searchQuery: query }),

  toggleShowConflictsOnly: () =>
    set((state) => ({ showConflictsOnly: !state.showConflictsOnly })),

  expandAll: () =>
    set((state) => ({
      treeCommand: { mode: 'expand', seq: (state.treeCommand?.seq ?? 0) + 1 },
    })),

  collapseAll: () =>
    set((state) => ({
      treeCommand: { mode: 'collapse', seq: (state.treeCommand?.seq ?? 0) + 1 },
    })),
}));
