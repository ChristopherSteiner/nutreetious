export const NUGET_ORG_LABEL = 'nuget.org';

// Shortens a feed URL/path to something that fits a tree-row badge:
// nuget.org's v3 endpoint → "nuget.org", Azure DevOps feeds → the feed name,
// other remote feeds → their hostname, local folders → the folder name.
export function getFeedDisplayName(source: string): string {
  if (/^https?:\/\//i.test(source)) {
    try {
      const url = new URL(source);
      if (url.hostname === 'api.nuget.org') return NUGET_ORG_LABEL;
      const packagingMatch = url.pathname.match(/\/_packaging\/([^/]+)\//i);
      if (packagingMatch) return decodeURIComponent(packagingMatch[1]);
      return url.hostname;
    } catch {
      return source;
    }
  }

  const segments = source.split(/[\\/]/).filter(Boolean);
  return segments[segments.length - 1] ?? source;
}
