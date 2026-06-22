import { BellOff, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNotificationStore, useUserSettingStore } from '../../store';
import { NotificationItem } from './NotificationItem';

export function NotificationDrawer() {
  const { t } = useTranslation();
  const { notifications, clearAll } = useNotificationStore();
  const { settings } = useUserSettingStore();
  const isDrawerOpen = settings?.windows.notificationDrawerOpen ?? false;

  if (!isDrawerOpen) return null;

  return (
    <aside className="w-80 border-l border-zinc-800 bg-zinc-950 flex flex-col h-full animate-in slide-in-from-right duration-300">
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
        <h2 className="text-sm font-semibold flex items-center gap-2">
          {t('notifications.title')}
          <span className="text-xs bg-zinc-800 px-2 py-0.5 rounded-full text-zinc-400">
            {notifications.length}
          </span>
        </h2>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={clearAll}
            className="p-1.5 hover:bg-zinc-800 rounded text-zinc-500 hover:text-red-400 transition-colors"
            title={t('notifications.clearAll')}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {notifications.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-zinc-600 gap-2">
            <BellOff size={32} strokeWidth={1} />
            <p className="text-xs">{t('notifications.empty')}</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
            />
          ))
        )}
      </div>
    </aside>
  );
}
