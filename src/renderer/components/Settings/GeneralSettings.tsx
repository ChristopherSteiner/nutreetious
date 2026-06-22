import { useTranslation } from 'react-i18next';
import { useUserSettingStore } from '../../store/useUserSettingStore';

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'de', label: 'Deutsch' },
];

export function GeneralSettings() {
  const { t, i18n } = useTranslation();
  const settings = useUserSettingStore((state) => state.settings);
  const setLanguage = useUserSettingStore((state) => state.setLanguage);

  const language = settings?.appearance.language ?? 'en';

  const handleLanguageChange = (value: string) => {
    setLanguage(value);
    i18n.changeLanguage(value);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-zinc-200">
        {t('settings.general.title')}
      </h3>

      <div className="flex items-center justify-between gap-4">
        <span className="text-sm text-zinc-300">
          {t('settings.general.language')}
        </span>
        <select
          value={language}
          onChange={(e) => handleLanguageChange(e.target.value)}
          className="w-40 bg-zinc-800 border border-zinc-700 rounded-md text-sm text-zinc-200 pl-3 pr-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.value} value={lang.value}>
              {lang.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
