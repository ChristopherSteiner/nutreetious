import {
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Package as PackageIcon,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Virtuoso } from 'react-virtuoso';
import type { Package } from '../../../common/Tree';
import { useProjectStore } from '../../store';
import { filterTree } from '../../utils';
import { HighlightText } from '../Common';

interface Props {
  data: Package[];
}

interface FlatNode {
  pkg: Package;
  depth: number;
  isExpanded: boolean;
  hasChildren: boolean;
}

const getAllCollapsibleIds = (nodes: Package[]) => {
  const ids = new Set<string>();
  const collect = (list: Package[]) => {
    list.forEach((n) => {
      if (n.references && n.references.length > 0) {
        ids.add(n.id);
        collect(n.references);
      }
    });
  };
  collect(nodes);
  return ids;
};

export const NugetTree = ({ data }: Props) => {
  const searchQuery = useProjectStore((state) => state.searchQuery);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [isAtBottom, setIsAtBottom] = useState(false);
  const lastDataRef = useRef<Package[] | null>(null);

  const filteredPackages = useMemo(
    () => filterTree(data, searchQuery),
    [data, searchQuery],
  );

  useEffect(() => {
    if (searchQuery.length > 0) {
      setExpandedIds(getAllCollapsibleIds(filteredPackages));
    } else {
      setExpandedIds(getAllCollapsibleIds(data));
    }

    if (data !== lastDataRef.current) {
      lastDataRef.current = data;
    }
  }, [data, searchQuery, filteredPackages]);

  const flattenedData = useMemo(() => {
    const flat: FlatNode[] = [];
    const traverse = (nodes: Package[], depth = 0) => {
      for (const node of nodes) {
        const isExpanded = expandedIds.has(node.id);
        const children = node.references ?? [];
        const hasChildren = children.length > 0;
        flat.push({ pkg: node, depth, isExpanded, hasChildren });
        if (hasChildren && isExpanded) traverse(children, depth + 1);
      }
    };
    traverse(filteredPackages);
    return flat;
  }, [filteredPackages, expandedIds]);

  const toggleNode = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const maskStyle = useMemo(
    () => ({
      WebkitMaskImage: isAtBottom
        ? 'none'
        : 'linear-gradient(to top, transparent 0%, black 15%, black 100%)',
      maskImage: isAtBottom
        ? 'none'
        : 'linear-gradient(to top, transparent 0%, black 15%, black 100%)',
    }),
    [isAtBottom],
  );

  return (
    <div className="w-full rounded-lg border border-zinc-900 bg-zinc-950/30 overflow-hidden relative">
      <div className="h-150" style={maskStyle}>
        <Virtuoso
          style={{ height: '100%' }}
          data={flattenedData}
          className="scrollbar-hide"
          atBottomStateChange={(atBottom) => setIsAtBottom(atBottom)}
          itemContent={(_index, node) => (
            <button
              type="button"
              onClick={() => node.hasChildren && toggleNode(node.pkg.id)}
              className={`flex items-center gap-2 px-4 py-1 w-full hover:bg-zinc-800/40 select-none text-left outline-none focus-visible:bg-zinc-800/60
                ${node.pkg.hasConflict ? 'text-amber-500' : 'text-zinc-300'}`}
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
          )}
        />
      </div>
    </div>
  );
};
