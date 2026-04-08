import { ProjectPicker } from './ProjectPicker';
import { SearchBar } from './SearchBar';
import { ToolBarActions } from './ToolBarActions';

export function ToolBar() {
  return (
    <div
      className="h-12 border-b border-zinc-800 bg-zinc-900 grid grid-cols-3 items-center px-4 w-full"
      style={{ WebkitAppRegion: 'no-drag' }}
    >
      <div className="flex justify-start">
        <ProjectPicker />
      </div>

      <div className="flex justify-center">
        <div className="w-full max-w-md">
          <SearchBar />
        </div>
      </div>

      <div className="flex justify-end">
        <ToolBarActions />
      </div>
    </div>
  );
}
