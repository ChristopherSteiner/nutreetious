import { ProjectPicker } from './ProjectPicker';
import { SearchBar } from './SearchBar';
import { ToolBarActions } from './ToolBarActions';

export function ToolBar() {
  return (
    <div 
      className="h-12 border-b border-zinc-800 bg-zinc-900 grid grid-cols-3 items-center px-4 w-full"
      style={{ WebkitAppRegion: 'no-drag' }}
    >
      {/* Spalte 1: Linksbündig */}
      <div className="flex justify-start">
        <ProjectPicker path='' onOpen={() => {}} />
      </div>

      {/* Spalte 2: Exakt in der Mitte des Windows */}
      <div className="flex justify-center">
        <div className="w-full max-w-md">
          <SearchBar />
        </div>
      </div>

      {/* Spalte 3: Rechtsbündig */}
      <div className="flex justify-end">
        <ToolBarActions />
      </div>
    </div>
  );
}