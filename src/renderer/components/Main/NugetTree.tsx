import {
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Package as PackageIcon,
} from 'lucide-react';
import type { KeyboardEvent } from 'react';
import { type NodeRendererProps, Tree } from 'react-arborist';
import type { Package } from '../../../common/Tree';

interface Props {
  data: Package[];
}

export const NugetTree = ({ data }: Props) => {
  const rowHeight = 32;
  const treeHeight = 500;

  return (
    <div className="w-full h-auto overflow-visible">
      <div
        className="rounded-lg border border-zinc-900 bg-zinc-950/30 overflow-hidden transition-colors group-hover/tree:border-zinc-800"
        style={{ height: treeHeight }}
      >
        <Tree
          initialData={data}
          disableDrag={true}
          disableDrop={true}
          openByDefault={true}
          width="100%"
          height={treeHeight}
          indent={20}
          rowHeight={rowHeight}
          childrenAccessor={(pkg) => pkg.references}
          idAccessor={(pkg) => pkg.id}
          className="scrollbar-hide selection:bg-sky-500/30"
        >
          {Node}
        </Tree>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-zinc-950/80 to-transparent pointer-events-none opacity-100 transition-opacity rounded-b-lg" />
    </div>
  );
};

function Node({ node, style, dragHandle }: NodeRendererProps<Package>) {
  const pkg = node.data;

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      node.toggle();
    }
  };

  return (
    <div
      style={style}
      ref={dragHandle}
      className="flex items-center group cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-sky-500 rounded-md"
      onClick={() => node.toggle()}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="treeitem"
      aria-expanded={node.isOpen}
    >
      <span className="w-5 h-5 flex items-center justify-center shrink-0">
        {node.data.references.length > 0 &&
          (node.isOpen ? (
            <ChevronDown size={14} />
          ) : (
            <ChevronRight size={14} />
          ))}
      </span>

      <div
        className={`flex items-center gap-2 px-2 py-1 rounded-md w-full transition-colors
        ${pkg.hasConflict ? 'bg-amber-500/10 text-amber-500' : 'group-hover:bg-zinc-800/50 text-zinc-300'}`}
      >
        <PackageIcon
          size={14}
          className={pkg.type === 'Project' ? 'text-sky-500' : 'text-zinc-500'}
        />

        <span className="text-sm font-medium truncate flex-1 leading-tight">
          {pkg.name}
        </span>

        <div className="text-[10px] font-mono flex gap-2 items-center shrink-0">
          {pkg.hasConflict && (
            <span className="flex items-center gap-1 text-amber-500 bg-amber-500/20 px-1.5 py-0.5 rounded border border-amber-500/20">
              <AlertTriangle size={10} /> {pkg.referencedVersion}
            </span>
          )}
          <span className="opacity-50">v{pkg.actualVersion}</span>
        </div>
      </div>
    </div>
  );
}
