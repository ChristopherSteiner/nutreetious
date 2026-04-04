import { ProjectPicker } from './ProjectPicker';
import { SearchBar } from './SearchBar';
import { ToolBarActions } from './ToolBarActions';

export function ToolBar() {
  return (
    <div 
      className="h-12 border-b border-zinc-800 bg-zinc-900/50 flex items-center px-3 justify-between"
      style={{ WebkitAppRegion: 'no-drag' }}
    >
      <div className="flex-1 flex items-center shrink-0">
        <ProjectPicker path='' onOpen={() => {}} />
      </div>

      <div className="flex-2 flex justify-center max-w-md">
        <SearchBar />
      </div>

      <div className="flex-1 flex justify-end items-center">
        <ToolBarActions />
      </div>
    </div>
  );
}