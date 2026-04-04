import { useProjectStore } from '../../store/useProjectStore';
// Später: import { TreeView } from './TreeView';

export function TreeContainer() {
  const projectPath = useProjectStore((state) => state.projectPath);

  if (!projectPath) {
    return (
      // h-full sorgt dafür, dass die Zone so hoch ist wie das MainWindow
      <div className="h-full w-full flex items-center justify-center border-2 border-dashed border-zinc-800 rounded-xl bg-zinc-900/10">
        <p className="text-zinc-500 italic text-sm text-center">
          No project loaded.
          <br />
          Drag a .sln or .csproj file here to start.
        </p>
      </div>
    );
  }

  return <div className="h-full w-full">{/* Dein Tree-Content */}</div>;
}
