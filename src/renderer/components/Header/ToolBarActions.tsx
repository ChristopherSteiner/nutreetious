import {
  ChevronsDownUp,
  ChevronsUpDown,
  RefreshCw,
  Settings,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useProjectStore } from '../../store/useProjectStore';
import { useSettingsModalStore } from '../../store/useSettingsModalStore';
import { NotificationToggleButton } from '../Notification/NotificationToggleButton';

export function ToolBarActions() {
  const { t } = useTranslation();
  const solutionPath = useProjectStore((state) => state.solutionPath);
  const isLoading = useProjectStore((state) => state.isLoading);
  const setProjectFromPath = useProjectStore(
    (state) => state.setProjectFromPath,
  );
  const hasProjects = useProjectStore((state) => state.projects.length > 0);
  const expandAll = useProjectStore((state) => state.expandAll);
  const collapseAll = useProjectStore((state) => state.collapseAll);
  const openSettings = useSettingsModalStore((state) => state.open);

  const handleRefreshClick = () => {
    if (solutionPath) setProjectFromPath(solutionPath);
  };

  return (
    <div className="flex items-center gap-1">
      <NotificationToggleButton />

      <div className="w-px h-4 bg-zinc-800 mx-1" />

      <button
        type="button"
        onClick={expandAll}
        disabled={!hasProjects}
        className="p-1.5 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 rounded-md transition-all active:scale-90 disabled:opacity-40 disabled:pointer-events-none"
        title={t('toolbar.expandAll')}
      >
        <ChevronsUpDown size={14} />
      </button>

      <button
        type="button"
        onClick={collapseAll}
        disabled={!hasProjects}
        className="p-1.5 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 rounded-md transition-all active:scale-90 disabled:opacity-40 disabled:pointer-events-none"
        title={t('toolbar.collapseAll')}
      >
        <ChevronsDownUp size={14} />
      </button>

      <div className="w-px h-4 bg-zinc-800 mx-1" />

      <button
        type="button"
        onClick={handleRefreshClick}
        disabled={!solutionPath || isLoading}
        className="p-1.5 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 rounded-md transition-all active:scale-90 disabled:opacity-40 disabled:pointer-events-none"
        title={t('toolbar.refreshAssets')}
      >
        <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
      </button>

      <div className="w-px h-4 bg-zinc-800 mx-1" />

      <button
        type="button"
        onClick={openSettings}
        className="p-1.5 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 rounded-md transition-all active:scale-90"
        title={t('toolbar.settings')}
      >
        <Settings size={16} />
      </button>
    </div>
  );
}
