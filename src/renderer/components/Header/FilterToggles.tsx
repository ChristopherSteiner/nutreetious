import { AlertTriangle, FolderX } from 'lucide-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useProjectStore } from '../../store/useProjectStore';
import { useUserSettingStore } from '../../store/useUserSettingStore';
import { collectConflicts, filterOutProjectNodes } from '../../utils';

const ACTIVE_SKY =
  'text-sky-400 bg-sky-400/10 border-sky-400/20 shadow-[0_0_10px_rgba(56,189,248,0.2)]';
const ACTIVE_AMBER =
  'text-amber-400 bg-amber-400/10 border-amber-400/20 shadow-[0_0_10px_rgba(251,191,36,0.2)]';
const INACTIVE =
  'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 border-transparent';

export function FilterToggles() {
  const { t } = useTranslation();
  const projects = useProjectStore((state) => state.projects);
  const showConflictsOnly = useProjectStore((state) => state.showConflictsOnly);
  const toggleShowConflictsOnly = useProjectStore(
    (state) => state.toggleShowConflictsOnly,
  );
  const hideProjectReferences = useUserSettingStore(
    (state) => state.settings?.filters.hideProjectReferences ?? false,
  );
  const toggleHideProjectReferences = useUserSettingStore(
    (state) => state.toggleHideProjectReferences,
  );

  // Scoped to the current tree mode so the badge always matches what the
  // conflicts-only toggle will reveal (hidden project refs don't count).
  const conflictCount = useMemo(() => {
    const conflicts = new Set<string>();
    for (const project of projects) {
      for (const roots of Object.values(project.frameworkTrees)) {
        const visibleRoots = hideProjectReferences
          ? filterOutProjectNodes(roots)
          : roots;
        collectConflicts(visibleRoots, conflicts);
      }
    }
    return conflicts.size;
  }, [projects, hideProjectReferences]);

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={toggleHideProjectReferences}
        aria-pressed={hideProjectReferences}
        title={t(
          hideProjectReferences
            ? 'toolbar.showProjectRefs'
            : 'toolbar.hideProjectRefs',
        )}
        className={`p-1.5 rounded-md border transition-all active:scale-95 ${
          hideProjectReferences ? ACTIVE_SKY : INACTIVE
        }`}
      >
        <FolderX size={14} />
      </button>

      <button
        type="button"
        onClick={toggleShowConflictsOnly}
        aria-pressed={showConflictsOnly}
        title={t('toolbar.conflictsOnly')}
        className={`p-1.5 rounded-md border transition-all active:scale-95 relative ${
          showConflictsOnly ? ACTIVE_AMBER : INACTIVE
        }`}
      >
        <AlertTriangle size={14} />
        {conflictCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-3.5 px-0.5 py-px rounded-full bg-amber-500 text-zinc-950 text-[9px] font-bold leading-tight text-center border border-zinc-900">
            {conflictCount}
          </span>
        )}
      </button>
    </div>
  );
}
