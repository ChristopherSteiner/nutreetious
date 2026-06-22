import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSettingsModalStore } from '../../store/useSettingsModalStore';
import { AboutSettings } from './AboutSettings';
import { GeneralSettings } from './GeneralSettings';

const SECTIONS = [
  { id: 'general', labelKey: 'settings.sections.general' },
  { id: 'about', labelKey: 'settings.sections.about' },
] as const;

type SectionId = (typeof SECTIONS)[number]['id'];

export function SettingsModal() {
  const isOpen = useSettingsModalStore((state) => state.isOpen);
  const close = useSettingsModalStore((state) => state.close);
  const [activeSection, setActiveSection] = useState<SectionId>('general');
  const { t } = useTranslation();

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, close]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/70 backdrop-blur-sm">
      <button
        type="button"
        aria-label={t('settings.title')}
        className="absolute inset-0 cursor-default"
        onClick={close}
      />

      <div className="relative w-160 h-105 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl flex overflow-hidden">
        <aside className="w-44 border-r border-zinc-800 bg-zinc-950/50 p-2">
          <h2 className="px-2 py-2 text-xs font-semibold text-zinc-500 uppercase tracking-wide">
            {t('settings.title')}
          </h2>
          <nav className="space-y-0.5">
            {SECTIONS.map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => setActiveSection(section.id)}
                className={`w-full text-left px-2 py-1.5 rounded-md text-sm transition-colors ${
                  activeSection === section.id
                    ? 'bg-zinc-800 text-zinc-100'
                    : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200'
                }`}
              >
                {t(section.labelKey)}
              </button>
            ))}
          </nav>
        </aside>

        <div className="flex-1 flex flex-col">
          <div className="h-10 flex items-center justify-end px-3 border-b border-zinc-800">
            <button
              type="button"
              onClick={close}
              className="p-1 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 rounded-md transition-colors"
            >
              <X size={16} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {activeSection === 'general' && <GeneralSettings />}
            {activeSection === 'about' && <AboutSettings />}
          </div>
        </div>
      </div>
    </div>
  );
}
