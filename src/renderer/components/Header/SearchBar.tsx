import { Search, X } from 'lucide-react';
import { useProjectStore } from '../../store';

export function SearchBar() {
  const { searchQuery, setSearchQuery } = useProjectStore();

  return (
    <div className="relative group w-64">
      <Search
        size={14}
        className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${
          searchQuery
            ? 'text-sky-400'
            : 'text-zinc-500 group-focus-within:text-sky-400'
        }`}
      />

      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search dependencies..."
        className="h-8 w-full bg-zinc-800/50 border border-zinc-700 rounded-md pl-9 pr-8 text-xs text-zinc-200 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20 transition-all placeholder:text-zinc-600"
      />

      {searchQuery && (
        <button
          type="button"
          onClick={() => setSearchQuery('')}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-zinc-700/50 text-zinc-500 hover:text-zinc-300 transition-colors"
          title="Clear search"
        >
          <X size={12} />
        </button>
      )}
    </div>
  );
}
