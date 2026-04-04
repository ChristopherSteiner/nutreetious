import { TreePine } from 'lucide-react';
import { WindowControls } from './WindowControls';

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

        <span className="text-[17px] font-extrabold text-zinc-50 tracking-tight antialiased">
          NuTreetious
        </span>
      </div>

      <div
        className="h-full flex items-start"
        style={{ WebkitAppRegion: 'no-drag' }}
      >
        <WindowControls />
      </div>
    </div>
  );
}
