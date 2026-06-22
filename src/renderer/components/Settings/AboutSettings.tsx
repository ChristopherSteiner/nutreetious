import { ExternalLink } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { AppInfo } from '../../../common/app';

export function AboutSettings() {
  const { t } = useTranslation();
  const [appInfo, setAppInfo] = useState<AppInfo | null>(null);

  useEffect(() => {
    window.electronAPI.getAppInfo().then(setAppInfo);
  }, []);

  if (!appInfo) return null;

  const rows: [string, string][] = [
    [t('settings.about.version'), appInfo.version],
    ['Electron', appInfo.electron],
    ['Node.js', appInfo.node],
    ['Chromium', appInfo.chrome],
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-zinc-200">
        {t('settings.about.title')}
      </h3>

      <div className="rounded-md border border-zinc-800 divide-y divide-zinc-800 overflow-hidden">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="flex items-center justify-between px-3 py-2 bg-zinc-800/40"
          >
            <span className="text-sm text-zinc-300">{label}</span>
            <span className="text-sm font-mono text-zinc-400">{value}</span>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => window.electronAPI.openExternal(appInfo.repositoryUrl)}
        className="flex items-center gap-1.5 text-sm text-sky-400 hover:text-sky-300 transition-colors"
      >
        {t('settings.about.viewOnGitHub')}
        <ExternalLink size={13} />
      </button>
    </div>
  );
}
