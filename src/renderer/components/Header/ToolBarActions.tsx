import { RefreshCw, Settings } from 'lucide-react';
import { NotificationToggleButton } from '../Notification/NotificationToggleButton';

export function ToolBarActions() {
  // todo auslagern
  const handleSettingsClick = () => {
    console.log('Settings-Modal öffnen...');
  };
  return (
    <div className="flex items-center gap-1">
      <NotificationToggleButton />

      <div className="w-px h-4 bg-zinc-800 mx-1" />

      <button
        type="button"
        className="p-1.5 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 rounded-md transition-all active:scale-90"
        title="Refresh Assets"
      >
        <RefreshCw size={14} />
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
