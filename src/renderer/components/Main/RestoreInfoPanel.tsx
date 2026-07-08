import {
  ChevronDown,
  ChevronRight,
  FileCog,
  FolderOpen,
  Globe,
  HardDrive,
  Info,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Package, Project } from '../../../common/tree';
import { formatDateTime } from '../../utils';

const isRemoteSource = (source: string) => /^https?:\/\//i.test(source);

// Counts unique name/version pairs per feed so each source row can show how
// many of the project's packages actually came from it.
function countPackagesBySource(project: Project): Map<string, number> {
  const packagesBySource = new Map<string, Set<string>>();

  const walk = (nodes: Package[]) => {
    for (const node of nodes) {
      if (node.type === 'Package' && node.actualVersion && node.source) {
        let packages = packagesBySource.get(node.source);
        if (!packages) {
          packages = new Set();
          packagesBySource.set(node.source, packages);
        }
        packages.add(`${node.name}/${node.actualVersion}`);
      }
      walk(node.references);
    }
  };
  for (const roots of Object.values(project.frameworkTrees)) walk(roots);

  return new Map(
    [...packagesBySource].map(([source, packages]) => [source, packages.size]),
  );
}

function InfoRow({
  icon,
  text,
  badge,
  revealPath,
  revealTitle,
}: {
  icon: React.ReactNode;
  text: string;
  badge?: string;
  revealPath?: string;
  revealTitle?: string;
}) {
  return (
    <div className="group/row flex items-center gap-2 px-2 py-1 rounded hover:bg-zinc-800/40">
      <span className="text-zinc-500 shrink-0">{icon}</span>
      <span
        className="text-[11px] font-mono text-zinc-400 truncate flex-1"
        title={text}
      >
        {text}
      </span>
      {badge && (
        <span className="text-[9px] font-mono text-zinc-500 bg-zinc-800 border border-zinc-700/50 px-1.5 py-0.5 rounded shrink-0">
          {badge}
        </span>
      )}
      {revealPath && (
        <button
          type="button"
          onClick={() => window.electronAPI.revealInFolder(revealPath)}
          title={revealTitle}
          className="p-1 shrink-0 rounded text-zinc-600 hover:text-sky-400 hover:bg-zinc-700/50 opacity-0 group-hover/row:opacity-100 focus-visible:opacity-100 outline-none transition-all"
        >
          <FolderOpen size={11} />
        </button>
      )}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[9px] font-black tracking-widest uppercase text-zinc-500 px-2 mb-1">
      {children}
    </p>
  );
}

export function RestoreInfoPanel({ project }: { project: Project }) {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const { restoreInfo } = project;

  const packageCountBySource = useMemo(
    () => countPackagesBySource(project),
    [project],
  );

  // Feeds seen on packages but missing from the configured sources (e.g.
  // after a feed was removed from nuget.config) still deserve a row.
  const sources = useMemo(() => {
    const known = new Set(restoreInfo.sources);
    const extras = [...packageCountBySource.keys()].filter(
      (source) => !known.has(source),
    );
    return [...restoreInfo.sources, ...extras];
  }, [restoreInfo.sources, packageCountBySource]);

  const restoredAtLabel = restoreInfo.restoredAt
    ? formatDateTime(restoreInfo.restoredAt, i18n.language)
    : null;

  return (
    <div className="mb-6 rounded-lg border border-zinc-900 bg-zinc-900/20 overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-zinc-800/30 transition-colors outline-none focus-visible:bg-zinc-800/40"
      >
        <Info size={13} className="text-sky-500 shrink-0" />
        <span className="text-xs font-semibold text-zinc-300">
          {t('restoreInfo.title')}
        </span>
        <span className="text-[10px] text-zinc-500">
          {t('restoreInfo.summary', {
            feeds: sources.length,
            configs: restoreInfo.configFilePaths.length,
          })}
        </span>
        {restoredAtLabel && (
          <span className="text-[10px] text-zinc-600 font-mono ml-auto mr-2">
            {t('restoreInfo.restoredAt', { date: restoredAtLabel })}
          </span>
        )}
        <span
          className={`text-zinc-500 shrink-0 ${restoredAtLabel ? '' : 'ml-auto'}`}
        >
          {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </span>
      </button>

      {isOpen && (
        <div className="px-2 pb-3 pt-1 space-y-3 border-t border-zinc-900 animate-in fade-in slide-in-from-top-1 duration-200">
          <div>
            <SectionLabel>{t('restoreInfo.feeds')}</SectionLabel>
            {sources.map((source) => (
              <InfoRow
                key={source}
                icon={
                  isRemoteSource(source) ? (
                    <Globe size={11} />
                  ) : (
                    <HardDrive size={11} />
                  )
                }
                text={source}
                badge={t('restoreInfo.packageCount', {
                  count: packageCountBySource.get(source) ?? 0,
                })}
                revealPath={isRemoteSource(source) ? undefined : source}
                revealTitle={t('restoreInfo.reveal')}
              />
            ))}
          </div>

          <div>
            <SectionLabel>{t('restoreInfo.configs')}</SectionLabel>
            {restoreInfo.configFilePaths.length > 0 ? (
              restoreInfo.configFilePaths.map((configPath) => (
                <InfoRow
                  key={configPath}
                  icon={<FileCog size={11} />}
                  text={configPath}
                  revealPath={configPath}
                  revealTitle={t('restoreInfo.reveal')}
                />
              ))
            ) : (
              <p className="text-[11px] text-zinc-600 px-2">
                {t('restoreInfo.noConfigs')}
              </p>
            )}
          </div>

          <div>
            <SectionLabel>{t('restoreInfo.paths')}</SectionLabel>
            {restoreInfo.packagesPath && (
              <InfoRow
                icon={<HardDrive size={11} />}
                text={restoreInfo.packagesPath}
                badge={t('restoreInfo.packagesFolder')}
                revealPath={restoreInfo.packagesPath}
                revealTitle={t('restoreInfo.reveal')}
              />
            )}
            <InfoRow
              icon={<FileCog size={11} />}
              text={restoreInfo.assetsPath}
              badge={t('restoreInfo.assetsFile')}
              revealPath={restoreInfo.assetsPath}
              revealTitle={t('restoreInfo.reveal')}
            />
          </div>
        </div>
      )}
    </div>
  );
}
