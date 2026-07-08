import { ChevronDown, FolderOpen, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FileProcessor } from '../../services';
import { useProjectStore } from '../../store/useProjectStore';
import { useUserSettingStore } from '../../store/useUserSettingStore';

// Stable fallback: an inline `?? []` would return a fresh reference on every
// store read and send useSyncExternalStore into an endless re-render loop.
const NO_RECENTS: string[] = [];

export function ProjectPicker() {
  const { t } = useTranslation();
  const projectName = useProjectStore((state) => state.solutionName);
  const selectProject = useProjectStore((state) => state.selectProject);
  const setProjectFromPath = useProjectStore(
    (state) => state.setProjectFromPath,
  );
  const recentSolutions = useUserSettingStore(
    (state) => state.settings?.recentSolutions ?? NO_RECENTS,
  );
  const removeRecentSolution = useUserSettingStore(
    (state) => state.removeRecentSolution,
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const hasRecents = recentSolutions.length > 0;

  useEffect(() => {
    if (!isDropdownOpen) return;

    const handlePointerDown = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsDropdownOpen(false);
    };

    window.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDropdownOpen]);

  const openRecent = (path: string) => {
    setIsDropdownOpen(false);
    setProjectFromPath(path);
  };

  return (
    <div ref={containerRef} className="relative flex items-stretch">
      <button
        type="button"
        onClick={selectProject}
        className={`flex items-center gap-2 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 transition-all active:scale-95 ${
          hasRecents ? 'rounded-l' : 'rounded'
        }`}
      >
        <FolderOpen size={14} className="text-blue-400" />
        <span className="text-xs font-medium">
          {projectName || t('projectPicker.selectPrompt')}
        </span>
      </button>

      {hasRecents && (
        <button
          type="button"
          onClick={() => setIsDropdownOpen((open) => !open)}
          aria-expanded={isDropdownOpen}
          title={t('projectPicker.recentSolutions')}
          className="flex items-center px-1 bg-zinc-800 hover:bg-zinc-700 border border-l-0 border-zinc-700 rounded-r text-zinc-400 transition-all"
        >
          <ChevronDown
            size={12}
            className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
          />
        </button>
      )}

      {isDropdownOpen && (
        <div className="absolute left-0 top-full mt-1 w-80 z-40 bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl py-1 overflow-hidden">
          <p className="text-[9px] font-black tracking-widest uppercase text-zinc-500 px-3 py-1.5">
            {t('projectPicker.recentSolutions')}
          </p>
          {recentSolutions.map((path) => (
            <div key={path} className="group flex items-center">
              <button
                type="button"
                onClick={() => openRecent(path)}
                className="flex-1 min-w-0 text-left px-3 py-1.5 hover:bg-zinc-800/60 transition-colors"
              >
                <span className="block text-xs font-medium text-zinc-200 truncate">
                  {FileProcessor.getFileName(path)}
                </span>
                <span className="block text-[10px] font-mono text-zinc-600 truncate">
                  {path}
                </span>
              </button>
              <button
                type="button"
                onClick={() => removeRecentSolution(path)}
                title={t('projectPicker.removeRecent')}
                className="p-1 mr-2 shrink-0 rounded text-zinc-600 hover:text-zinc-200 hover:bg-zinc-700/50 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-all"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
