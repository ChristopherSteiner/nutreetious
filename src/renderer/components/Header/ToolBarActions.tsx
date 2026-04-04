import { RefreshCw, Settings } from 'lucide-react';

export function ToolBarActions() {
  const handleSettingsClick = () => {
    console.log('Settings-Modal öffnen...');
  };

  return (
    <div className="flex items-center gap-1">
      {/* Optional: Ein Refresh-Button ist bei Assets-Files oft nützlich */}
      <button
        className="p-1.5 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 rounded-md transition-all active:scale-90"
        title="Refresh Assets"
      >
        <RefreshCw size={14} />
      </button>
      <div className="w-[1px] h-4 bg-zinc-800 mx-1" /> {/* Kleiner Trenner */}
      <button
        onClick={handleSettingsClick}
        className="p-1.5 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 rounded-md transition-all active:scale-90"
        title="Settings"
      >
        <Settings size={16} />
      </button>
    </div>
  );
}
