import { ProjectPicker } from './ProjectPicker';
import { SearchBar } from './SearchBar';

export function Header() {
  return (
    <header className="flex h-14 items-center justify-between px-4 bg-zinc-900 border-b border-zinc-800 select-none">
      <div className="flex items-center gap-6">
        <h1 className="text-sm font-bold tracking-widest uppercase text-zinc-500">NuTreetious</h1>
        <ProjectPicker path="C:/path/to/assets.json" onOpen={() => {}} />
      </div>
      <SearchBar />
    </header>
  );
}