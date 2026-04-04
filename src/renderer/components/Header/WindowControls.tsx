import { X, Minus, Square } from 'lucide-react';
import { WindowService } from '../../services/WindowService';

export function WindowControls() {
  return (
    <div className="flex items-center" style={{ WebkitAppRegion: 'no-drag' }}>
      <button 
        onClick={() => WindowService.minimize()}
        className="p-2 hover:bg-zinc-800 text-zinc-500 hover:text-zinc-200 transition-colors"
      >
        <Minus size={20} strokeWidth={2} />
      </button>

      <button 
        onClick={() => WindowService.maximize()}
        className="p-2 hover:bg-zinc-800 text-zinc-500 hover:text-zinc-200 transition-colors"
      >
        <Square size={16} strokeWidth={2}/>
      </button>

      <button 
        onClick={() => WindowService.close()}
        className="p-2 hover:bg-red-600 text-zinc-500 hover:text-white transition-colors"
      >
        <X size={22} strokeWidth={2} />
      </button>
    </div>
  );
}