import { RefreshCw, Settings } from 'lucide-react';
import { useProjectStore } from '../../store/useProjectStore';
import { NotificationToggleButton } from '../Notification/NotificationToggleButton';

export function ToolBarActions() {
  const solutionPath = useProjectStore((state) => state.solutionPath);
  const isLoading = useProjectStore((state) => state.isLoading);
  const setProjectFromPath = useProjectStore(
    (state) => state.setProjectFromPath,
  );

  // todo auslagern
  const handleSettingsClick = () => {
    console.log('Settings-Modal öffnen...');
  };

  const handleRefreshClick = () => {
    if (solutionPath) setProjectFromPath(solutionPath);
  };

  return (
    <div className="flex items-center gap-1">
      <NotificationToggleButton />

      <div className="w-px h-4 bg-zinc-800 mx-1" />

      <button
        type="button"
        onClick={handleRefreshClick}
        disabled={!solutionPath || isLoading}
        className="p-1.5 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 rounded-md transition-all active:scale-90 disabled:opacity-40 disabled:pointer-events-none"
        title="Refresh Assets"
      >
        <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
      </button>

      <div className="w-px h-4 bg-zinc-800 mx-1" />

      <button
        type="button"
        onClick={handleSettingsClick}
        className="p-1.5 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 rounded-md transition-all active:scale-90"
        title="Settings"
      >
        <Settings size={16} />
      </button>
    </div>
  );
}
