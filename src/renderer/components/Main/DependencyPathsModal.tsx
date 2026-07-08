import {
  ChevronRight,
  FolderCode,
  Package as PackageIcon,
  Route,
  X,
} from 'lucide-react';
import { Fragment, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { Package } from '../../../common/tree';
import { useDependencyPathsStore } from '../../store/useDependencyPathsStore';
import { findDependencyPaths, MAX_DEPENDENCY_PATHS } from '../../utils';

function PathChip({ pkg, isTarget }: { pkg: Package; isTarget: boolean }) {
  const colorClasses = pkg.hasConflict
    ? 'border-amber-500/30 bg-amber-500/10 text-amber-400'
    : isTarget
      ? 'border-sky-500/40 bg-sky-500/10 text-sky-300'
      : 'border-zinc-800 bg-zinc-800/50 text-zinc-300';

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded border text-xs ${colorClasses}`}
    >
      {pkg.type === 'Project' ? (
        <FolderCode size={11} className="shrink-0" />
      ) : (
        <PackageIcon size={11} className="shrink-0" />
      )}
      <span className="font-medium">{pkg.name}</span>
      {pkg.actualVersion && (
        <span className="font-mono text-[10px] opacity-70">
          v{pkg.actualVersion}
        </span>
      )}
    </span>
  );
}

export function DependencyPathsModal() {
  const { t } = useTranslation();
  const target = useDependencyPathsStore((state) => state.target);
  const close = useDependencyPathsStore((state) => state.close);

  useEffect(() => {
    if (!target) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [target, close]);

  const result = useMemo(
    () =>
      target ? findDependencyPaths(target.roots, target.packageName) : null,
    [target],
  );

  if (!target || !result) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/70 backdrop-blur-sm">
      <button
        type="button"
        aria-label={t('paths.title')}
        className="absolute inset-0 cursor-default"
        onClick={close}
      />

      <div className="relative w-2xl max-w-[90vw] max-h-[70vh] bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl flex flex-col overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800 shrink-0">
          <div className="bg-sky-500/10 p-1.5 rounded">
            <Route size={14} className="text-sky-500" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-bold text-zinc-100 truncate">
              {t('paths.title')}{' '}
              <span className="text-sky-400">{target.packageName}</span>
            </h2>
            <p className="text-[10px] text-zinc-500 font-mono truncate">
              {target.projectName} · {target.framework}
            </p>
          </div>
          <button
            type="button"
            onClick={close}
            className="p-1 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 rounded-md transition-colors shrink-0"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-2">
          {result.paths.map((path) => (
            <div
              key={path.map((pkg) => pkg.id).join('>')}
              className="flex flex-wrap items-center gap-1.5 py-2 border-b border-zinc-800/60 last:border-0"
            >
              {path.map((pkg, index) => (
                <Fragment key={pkg.id}>
                  {index > 0 && (
                    <ChevronRight
                      size={11}
                      className="text-zinc-600 shrink-0"
                    />
                  )}
                  <PathChip pkg={pkg} isTarget={index === path.length - 1} />
                </Fragment>
              ))}
            </div>
          ))}
        </div>

        <div className="px-4 py-2 border-t border-zinc-800 shrink-0 flex items-center gap-3">
          <span className="text-[10px] text-zinc-500">
            {t('paths.count', { count: result.paths.length })}
          </span>
          {result.truncated && (
            <span className="text-[10px] text-amber-500">
              {t('paths.truncated', { count: MAX_DEPENDENCY_PATHS })}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
