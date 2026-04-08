// src/renderer/utils/treeUtils.ts
import type { Package } from '../../common/tree';

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
