import {
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  FolderCode,
  Package as PackageIcon,
  Route,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Package } from '../../../common/tree';
import { getFeedDisplayName, NUGET_ORG_LABEL } from '../../utils';
import { HighlightText } from '../Common';

// nuget.org is the boring default and stays muted; packages from any other
// feed (private/company feeds, local folders) get a tinted badge so they
// stand out while scanning the tree.
function FeedBadge({ source }: { source: string }) {
  const label = getFeedDisplayName(source);
  const isNugetOrg = label === NUGET_ORG_LABEL;

  return (
    <span
      title={source}
      className={`px-1 rounded border max-w-32 truncate ${
        isNugetOrg
          ? 'bg-zinc-800/60 border-zinc-700/40 text-zinc-500'
          : 'bg-teal-500/10 border-teal-500/20 text-teal-400'
      }`}
    >
      {label}
    </span>
  );
}

interface TreeNodeProps {
  node: {
    pkg: Package;
    depth: number;
    isExpanded: boolean;
    hasChildren: boolean;
  };
  searchQuery: string;
  onToggle: (id: string) => void;
  onShowPaths: (pkg: Package) => void;
}

export function TreeNode({
  node,
  searchQuery,
  onToggle,
  onShowPaths,
}: TreeNodeProps) {
  const { t } = useTranslation();
  const baseTooltip = node.pkg.hasConflict
    ? t('tree.requestedResolved', {
        requested: node.pkg.referencedVersion,
        resolved: node.pkg.actualVersion,
      })
    : node.pkg.actualVersion
      ? t('tree.version', { version: node.pkg.actualVersion })
      : t('tree.projectReference');
  const tooltipText = node.pkg.source
    ? `${baseTooltip}\n${t('tree.source', { source: node.pkg.source })}`
    : baseTooltip;

  return (
    <div className="group flex items-center w-full hover:bg-zinc-800/40 focus-within:bg-zinc-800/60">
      <button
        type="button"
        onClick={() => node.hasChildren && onToggle(node.pkg.id)}
        title={tooltipText}
        className={`flex items-center gap-2 pr-2 py-1 flex-1 min-w-0 select-none text-left outline-none ${
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
        {node.pkg.type === 'Project' ? (
          <FolderCode
            size={14}
            className={node.pkg.isDirect ? 'text-violet-400' : 'text-zinc-500'}
          />
        ) : (
          <PackageIcon
            size={14}
            className={
              node.pkg.isDirect && node.pkg.type === 'Package'
                ? 'text-sky-500'
                : 'text-zinc-500'
            }
          />
        )}
        <span
          className={`text-sm font-medium truncate flex-1 ${
            node.pkg.hasConflict
              ? 'text-amber-500'
              : !node.pkg.isDirect
                ? 'text-zinc-400'
                : 'text-zinc-100'
          }`}
        >
          <HighlightText text={node.pkg.name} query={searchQuery} />
        </span>
        <div className="text-[10px] font-mono flex items-center gap-2 shrink-0 opacity-80">
          {node.pkg.isDirect && node.pkg.source && (
            <FeedBadge source={node.pkg.source} />
          )}
          {node.pkg.hasConflict && (
            <span className="bg-amber-500/20 px-1 rounded border border-amber-500/20 flex items-center gap-1">
              <AlertTriangle size={10} /> {node.pkg.referencedVersion}
            </span>
          )}
          {node.pkg.actualVersion && <span>v{node.pkg.actualVersion}</span>}
        </div>
      </button>

      <button
        type="button"
        onClick={() => onShowPaths(node.pkg)}
        title={t('tree.showPaths')}
        className="p-1 mr-2 shrink-0 rounded-md text-zinc-500 hover:text-sky-400 hover:bg-zinc-700/50 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 outline-none focus-visible:ring-1 focus-visible:ring-sky-500/50 transition-all"
      >
        <Route size={12} />
      </button>
    </div>
  );
}
