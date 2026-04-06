import { ChevronDown, ChevronRight, LayoutGrid } from 'lucide-react';
import { useState } from 'react';
import type { Project } from '../../../common/Tree';
import { useProjectStore } from '../../store/useProjectStore';
import { NugetTree } from './NugetTree';

export function TreeContainer() {
  const { solutionPath, solutionName, projects, isLoading } = useProjectStore();

  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-zinc-950/50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-sky-500/20 border-t-sky-500 rounded-full animate-spin" />
          <p className="text-zinc-500 text-sm animate-pulse font-medium">
            Digesting...
          </p>
        </div>
      </div>
    );
  }

  if (!solutionPath) {
    return (
      <div className="h-full w-full p-6">
        <div className="h-full w-full flex items-center justify-center border-2 border-dashed border-zinc-800 rounded-xl bg-zinc-900/10">
          <p className="text-zinc-500 italic text-sm text-center leading-relaxed">
            No project loaded.
            <br />
            Drag a .sln or .csproj file here to start.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col bg-zinc-950 overflow-hidden">
      <div className="px-6 py-4 border-b border-zinc-900 bg-zinc-900/20 shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-sky-500/10 p-1.5 rounded">
            <LayoutGrid size={16} className="text-sky-500" />
          </div>
          <h1
            className="text-sm font-bold text-zinc-200 truncate"
            title={solutionPath}
          >
            {solutionName}
          </h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-12">
        {projects.map((project) => (
          <ProjectSection key={project.projectPath} project={project} />
        ))}
      </div>
    </div>
  );
}

function ProjectSection({ project }: { project: Project }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <article className="flex flex-col">
      <button
        type="button"
        className="w-full mb-4 cursor-pointer group flex items-start gap-2 text-left outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50 rounded-md py-1"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <div className="mt-1 text-zinc-500 group-hover:text-zinc-300 transition-colors shrink-0">
          {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-semibold text-zinc-100 group-hover:text-sky-400 transition-colors leading-tight">
            {project.projectName}
          </h2>
          <p className="text-[10px] text-zinc-600 font-mono mt-1 truncate">
            {project.projectPath}
          </p>
        </div>
      </button>

      {isOpen && (
        <div className="space-y-8 ml-3 border-l border-zinc-900 pl-6 py-2 animate-in fade-in slide-in-from-top-1 duration-200">
          {Object.entries(project.frameworkTrees).map(([framework, roots]) => (
            <section key={framework} className="relative">
              <div className="absolute -left-[28.5px] top-2 w-1.5 h-1.5 rounded-full bg-zinc-800 border border-zinc-950" />

              <div className="flex items-center gap-3 mb-4">
                <span className="text-[9px] font-black tracking-widest uppercase text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                  {framework}
                </span>
                <div className="h-px flex-1 bg-linear-to-r from-zinc-800 to-transparent" />
              </div>

              <div className="rounded-md overflow-hidden">
                <NugetTree data={roots} />
              </div>
            </section>
          ))}
        </div>
      )}
    </article>
  );
}
