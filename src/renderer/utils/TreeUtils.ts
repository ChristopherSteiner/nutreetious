// src/renderer/utils/treeUtils.ts
import type { Package } from '../../common/tree';

export interface TreeFilterOptions {
  query: string;
  hideProjectReferences: boolean;
  conflictsOnly: boolean;
}

export function filterTree(nodes: Package[], query: string): Package[] {
  if (!query) return nodes;

  const lowerQuery = query.toLowerCase();

  return nodes.reduce((acc: Package[], node) => {
    const matchesSelf = node.name.toLowerCase().includes(lowerQuery);

    const filteredChildren = node.references
      ? filterTree(node.references, query)
      : [];

    if (matchesSelf || filteredChildren.length > 0) {
      acc.push({
        ...node,
        references: matchesSelf ? node.references : filteredChildren,
      });
    }

    return acc;
  }, []);
}

export function filterOutProjectNodes(nodes: Package[]): Package[] {
  return nodes
    .filter((node) => node.type !== 'Project')
    .map((node) =>
      node.references.length > 0
        ? { ...node, references: filterOutProjectNodes(node.references) }
        : node,
    );
}

// Keeps only the chains that lead to a version conflict, so every visible
// node is either conflicted itself or an ancestor of a conflicted node.
export function filterConflictChains(nodes: Package[]): Package[] {
  return nodes.reduce((acc: Package[], node) => {
    const conflictedChildren = filterConflictChains(node.references);

    if (node.hasConflict || conflictedChildren.length > 0) {
      acc.push({ ...node, references: conflictedChildren });
    }

    return acc;
  }, []);
}

export function collectConflicts(
  nodes: Package[],
  conflicts: Set<string> = new Set(),
): Set<string> {
  for (const node of nodes) {
    if (node.hasConflict) {
      conflicts.add(
        `${node.name}|${node.referencedVersion}|${node.actualVersion}`,
      );
    }
    collectConflicts(node.references, conflicts);
  }
  return conflicts;
}

export function applyTreeFilters(
  nodes: Package[],
  options: TreeFilterOptions,
): Package[] {
  let result = nodes;
  if (options.hideProjectReferences) result = filterOutProjectNodes(result);
  if (options.conflictsOnly) result = filterConflictChains(result);
  if (options.query) result = filterTree(result, options.query);
  return result;
}

export const MAX_DEPENDENCY_PATHS = 200;

export interface DependencyPathsResult {
  paths: Package[][];
  truncated: boolean;
}

// Collects every root-to-target chain for the given package name (all
// versions), so the user can see why a package ended up in the tree.
export function findDependencyPaths(
  roots: Package[],
  targetName: string,
  limit: number = MAX_DEPENDENCY_PATHS,
): DependencyPathsResult {
  const paths: Package[][] = [];
  let truncated = false;

  const walk = (node: Package, trail: Package[]) => {
    if (paths.length >= limit) {
      truncated = true;
      return;
    }
    const nextTrail = [...trail, node];
    if (node.name === targetName) paths.push(nextTrail);
    for (const child of node.references) walk(child, nextTrail);
  };

  for (const root of roots) walk(root, []);
  return { paths, truncated };
}
