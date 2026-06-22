import { FileCheck, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function Overlay({
  isDragging,
  isLoading,
}: {
  isDragging: boolean;
  isLoading: boolean;
}) {
  const { t } = useTranslation();

  if (!isDragging && !isLoading) return null;

  return (
    <div className="absolute inset-0 z-50 pointer-events-none flex flex-col items-center justify-center bg-zinc-950/60 backdrop-blur-sm border-2 border-dashed border-zinc-700 m-2 rounded-xl transition-all">
      {isLoading ? (
        <>
          <Loader2 className="w-10 h-10 text-brand-blue animate-spin mb-2" />
          <p className="text-sm font-medium text-zinc-300">
            {t('overlay.digesting')}
          </p>
        </>
      ) : (
        <>
          <div className="p-4 bg-zinc-800 rounded-full mb-4 shadow-xl">
            <FileCheck className="w-8 h-8 text-emerald-400" />
          </div>
          <p className="text-lg font-semibold text-white">
            {t('overlay.dropToAnalyze')}
          </p>
          <p className="text-xs text-zinc-400">{t('overlay.supportedFiles')}</p>
        </>
      )}
    </div>
  );
}
