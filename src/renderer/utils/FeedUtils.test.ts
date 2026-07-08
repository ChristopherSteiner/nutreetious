import { describe, expect, it } from 'vitest';
import { getFeedDisplayName } from './FeedUtils';

describe('getFeedDisplayName', () => {
  it('shortens the official nuget.org v3 endpoint', () => {
    expect(getFeedDisplayName('https://api.nuget.org/v3/index.json')).toBe(
      'nuget.org',
    );
  });

  it('extracts the feed name from an Azure DevOps packaging URL', () => {
    expect(
      getFeedDisplayName(
        'https://pkgs.dev.azure.com/my-org/_packaging/MyFeed/nuget/v3/index.json',
      ),
    ).toBe('MyFeed');
  });

  it('falls back to the hostname for other remote feeds', () => {
    expect(
      getFeedDisplayName('https://nuget.company.example/v3/index.json'),
    ).toBe('nuget.company.example');
  });

  it('uses the folder name for local feeds', () => {
    expect(getFeedDisplayName('C:\\Feeds\\LocalPackages')).toBe(
      'LocalPackages',
    );
    expect(getFeedDisplayName('//fileserver/share/nuget')).toBe('nuget');
  });
});
