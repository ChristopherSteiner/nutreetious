import {
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Package as PackageIcon,
} from 'lucide-react';
import type { Package } from '../../../common/tree';
import { HighlightText } from '../Common';

interface TreeNodeProps {
  node: {
    pkg: Package;
    depth: number;
    isExpanded: boolean;
    hasChildren: boolean;
  };
  searchQuery: string;
  onToggle: (id: string) => void;
}

export function TreeNode({ node, searchQuery, onToggle }: TreeNodeProps) {
  const tooltipText = node.pkg.hasConflict
    ? `Requested: ${node.pkg.referencedVersion} | Resolved: ${node.pkg.actualVersion}`
    : `Version: ${node.pkg.actualVersion}`;

  return (
    <button
      type="button"
      onClick={() => node.hasChildren && onToggle(node.pkg.id)}
      title={tooltipText}
      className={`flex items-center gap-2 px-4 py-1 w-full hover:bg-zinc-800/40 select-none text-left outline-none focus-visible:bg-zinc-800/60 ${
        node.pkg.hasConflict ? 'text-amber-500' : 'text-zinc-300'
      }`}
      style={{ paddingLeft: `${node.depth * 20 + 16}px` }}
    >
      <div className="w-4 h-4 flex items-center justify-center shrink-0">
        {node.hasChildren &&
          (node.isExpanded ? (
            <ChevronDown size={14} />
          ) : (
            <ChevronRight size={14} />
          ))}
      </div>
      <PackageIcon
        size={14}
        className={
          node.pkg.type === 'Package' ? 'text-sky-500' : 'text-zinc-500'
        }
      />
      <span
        className={`text-sm font-medium truncate flex-1 ${
          node.pkg.hasConflict
            ? 'text-amber-500'
            : node.pkg.type === 'Transitive'
              ? 'text-zinc-400'
              : 'text-zinc-100'
        }`}
      >
        <HighlightText text={node.pkg.name} query={searchQuery} />
      </span>
      <div className="text-[10px] font-mono flex gap-2 shrink-0 opacity-80">
        {node.pkg.hasConflict && (
          <span className="bg-amber-500/20 px-1 rounded border border-amber-500/20 flex items-center gap-1">
            <AlertTriangle size={10} /> {node.pkg.referencedVersion}
          </span>
        )}
        <span>v{node.pkg.actualVersion}</span>
      </div>
    </button>
  );
}
