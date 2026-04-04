import { WindowControls } from './WindowControls';
import { TreePine } from 'lucide-react';

export function TitleBar() {
  return (
    <div 
      className="h-12 flex items-center justify-between bg-[#09090b] select-none border-b border-zinc-900"
      style={{ WebkitAppRegion: 'drag' }}
    >
      <div className="flex items-center gap-3 px-4">
        <div className="bg-blue-500/10 p-1.5 rounded-md border border-blue-500/20">
          <TreePine size={18} className="text-blue-400" strokeWidth={2.5} />
        </div>
        
        <span className="text-base font-bold text-zinc-50 tracking-tight">
          NuTreetious
        </span>
      </div>

      <div className="h-full" style={{ WebkitAppRegion: 'no-drag' }}>
        <WindowControls />
      </div>
    </div>
  );
}