import { FolderOpen } from 'lucide-react';
import { useProjectStore } from '../../store/useProjectStore';

export function ProjectPicker() {
  const projectName = useProjectStore((state) => state.solutionName);
  const selectProject = useProjectStore((state) => state.selectProject);

  return (
    <button
      type="button"
      onClick={selectProject}
      className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded text-zinc-300 transition-all active:scale-95"
    >
      <FolderOpen size={14} className="text-blue-400" />
      <span className="text-xs font-medium">
        {projectName || 'Select solution or project...'}
      </span>
    </button>
  );
}
