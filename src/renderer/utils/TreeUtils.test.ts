import { describe, expect, it } from 'vitest';
import type { Package } from '../../common/tree';
import {
  applyTreeFilters,
  collectConflicts,
  filterConflictChains,
  filterOutProjectNodes,
  findDependencyPaths,
} from './TreeUtils';

function pkg(name: string, overrides: Partial<Package> = {}): Package {
  return {
    id: crypto.randomUUID(),
    name,
    referencedVersion: '1.0.0',
    actualVersion: '1.0.0',
    type: 'Package',
    isDirect: false,
    hasConflict: false,
    source: null,
    references: [],
    ...overrides,
  };
}

describe('filterOutProjectNodes', () => {
  it('removes project nodes including their whole subtree', () => {
    const roots = [
      pkg('My.Project', {
        type: 'Project',
        references: [pkg('Carried.Package')],
      }),
      pkg('Direct.Package'),
    ];

    const result = filterOutProjectNodes(roots);

    expect(result.map((n) => n.name)).toEqual(['Direct.Package']);
  });
});

describe('filterConflictChains', () => {
  it('keeps the chain leading to a conflict and prunes clean branches', () => {
    const roots = [
      pkg('Root.A', {
        references: [
          pkg('Clean.Child'),
          pkg('Conflicted.Child', { hasConflict: true }),
        ],
      }),
      pkg('Root.B', { references: [pkg('Clean.Grandchild')] }),
    ];

    const result = filterConflictChains(roots);

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Root.A');
    expect(result[0].references.map((n) => n.name)).toEqual([
      'Conflicted.Child',
    ]);
  });
});

describe('collectConflicts', () => {
  it('deduplicates identical conflicts appearing in multiple chains', () => {
    const conflicted = () =>
      pkg('Serilog', {
        hasConflict: true,
        referencedVersion: '[2.0.0, )',
        actualVersion: '2.5.0',
      });
    const roots = [
      pkg('Root.A', { references: [conflicted()] }),
      pkg('Root.B', { references: [conflicted()] }),
    ];

    expect(collectConflicts(roots).size).toBe(1);
  });
});

describe('findDependencyPaths', () => {
  it('finds every root-to-target chain', () => {
    const roots = [
      pkg('Root.A', {
        references: [pkg('Middle', { references: [pkg('Target')] })],
      }),
      pkg('Root.B', { references: [pkg('Target')] }),
    ];

    const { paths, truncated } = findDependencyPaths(roots, 'Target');

    expect(truncated).toBe(false);
    expect(paths.map((path) => path.map((n) => n.name))).toEqual([
      ['Root.A', 'Middle', 'Target'],
      ['Root.B', 'Target'],
    ]);
  });

  it('stops and reports truncation at the limit', () => {
    const roots = Array.from({ length: 5 }, (_, i) =>
      pkg(`Root.${i}`, { references: [pkg('Target')] }),
    );

    const { paths, truncated } = findDependencyPaths(roots, 'Target', 3);

    expect(paths).toHaveLength(3);
    expect(truncated).toBe(true);
  });
});

describe('applyTreeFilters', () => {
  it('combines project filter, conflict filter and search query', () => {
    const roots = [
      pkg('My.Project', {
        type: 'Project',
        references: [pkg('Project.Conflict', { hasConflict: true })],
      }),
      pkg('Root.A', {
        references: [pkg('Serilog.Sinks.Console', { hasConflict: true })],
      }),
      pkg('Root.B', { references: [pkg('Serilog.Sinks.File')] }),
    ];

    const result = applyTreeFilters(roots, {
      query: 'serilog',
      hideProjectReferences: true,
      conflictsOnly: true,
    });

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Root.A');
    expect(result[0].references.map((n) => n.name)).toEqual([
      'Serilog.Sinks.Console',
    ]);
  });
});
