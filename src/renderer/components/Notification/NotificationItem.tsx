import { Check, ChevronDown, ChevronUp, Copy } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Notification } from '../../store/useNotificationStore';
import { formatTimestamp } from '../../utils';

export function NotificationItem({
  notification,
}: {
  notification: Notification;
}) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const isLong = (notification.message?.length ?? 0) > 90;

  const handleCopy = async () => {
    const text = notification.message
      ? `${notification.title}\n${notification.message}`
      : notification.title;
    await navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 1500);
  };

  return (
    <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 group relative">
      <div className="flex justify-between items-start mb-1">
        <span
          className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
            notification.type === 'error'
              ? 'bg-red-500/10 text-red-500'
              : 'bg-emerald-500/10 text-emerald-500'
          }`}
        >
          {notification.type}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-zinc-500 font-mono">
            {formatTimestamp(notification.timestamp)}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-zinc-200 transition-all"
            title={t('notifications.copy')}
          >
            {isCopied ? (
              <Check size={12} className="text-emerald-500" />
            ) : (
              <Copy size={12} />
            )}
          </button>
        </div>
      </div>
      <p className="text-sm font-medium text-zinc-200 leading-tight">
        {notification.title}
      </p>
      {notification.message && (
        <>
          <p
            className={`text-xs text-zinc-500 mt-1 whitespace-pre-wrap wrap-break-word ${
              isExpanded ? '' : 'line-clamp-2'
            }`}
          >
            {notification.message}
          </p>
          {isLong && (
            <button
              type="button"
              onClick={() => setIsExpanded((prev) => !prev)}
              className="flex items-center gap-0.5 text-[10px] text-sky-400 hover:text-sky-300 mt-1 transition-colors"
            >
              {isExpanded ? (
                <>
                  {t('notifications.showLess')}
                  <ChevronUp size={11} />
                </>
              ) : (
                <>
                  {t('notifications.showMore')}
                  <ChevronDown size={11} />
                </>
              )}
            </button>
          )}
        </>
      )}
    </div>
  );
}
