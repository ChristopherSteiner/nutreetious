import { Search } from 'lucide-react';

export function SearchBar() {
  return (
    <div className="relative group">
      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-blue-400 transition-colors" />
      <input 
        type="text" 
        placeholder="Search dependencies..."
        className="h-8 w-full bg-zinc-800/50 border border-zinc-700 rounded-md pl-9 pr-4 text-xs text-zinc-200 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all placeholder:text-zinc-600"
      />
    </div>
  );
}