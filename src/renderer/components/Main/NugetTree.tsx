import {
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Package as PackageIcon,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Virtuoso } from 'react-virtuoso';
import type { Package } from '../../../common/Tree';

interface Props {
  data: Package[];
}

interface FlatNode {
  pkg: Package;
  depth: number;
  isExpanded: boolean;
  hasChildren: boolean;
}

export const NugetTree = ({ data }: Props) => {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const hasInitialExpanded = useRef(false);

  const flattenedData = useMemo(() => {
    const flat: FlatNode[] = [];
    const traverse = (nodes: Package[], depth = 0) => {
      for (const node of nodes) {
        const isExpanded = expandedIds.has(node.id);
        const children = node.references ?? []; // Sicherer Fallback statt !
        const hasChildren = children.length > 0;

        flat.push({ pkg: node, depth, isExpanded, hasChildren });

        if (hasChildren && isExpanded) {
          traverse(children, depth + 1);
        }
      }
    };
    traverse(data);
    return flat;
  }, [data, expandedIds]);

  useEffect(() => {
    if (data.length > 0 && !hasInitialExpanded.current) {
      const allIds = new Set<string>();
      const collect = (nodes: Package[]) => {
        nodes.forEach((n) => {
          allIds.add(n.id);
          const refs = n.references ?? [];
          if (refs.length > 0) collect(refs);
        });
      };
      collect(data);
      setExpandedIds(allIds);
      hasInitialExpanded.current = true;
    }
  }, [data]);

  const toggleNode = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="w-full rounded-lg border border-zinc-900 bg-zinc-950/30 overflow-hidden relative">
      <div
        className="h-150"
        style={{
          WebkitMaskImage:
            'linear-gradient(to top, transparent 0%, black 15%, black 100%)', // Oben hart, unten weich
          maskImage:
            'linear-gradient(to top, transparent 0%, black 15%, black 100%)', // Oben hart, unten weich
        }}
      >
        <Virtuoso
          style={{ height: '100%' }}
          data={flattenedData}
          className="scrollbar-hide"
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
                  node.pkg.type === 'Project' ? 'text-sky-500' : 'text-zinc-500'
                }
              />

              <span className="text-sm font-medium truncate flex-1">
                {node.pkg.name}
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
