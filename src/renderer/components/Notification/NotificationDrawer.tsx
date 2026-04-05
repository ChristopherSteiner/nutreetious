import { BellOff, Trash2, X } from 'lucide-react';
import { useNotificationStore } from '../../store';
import { formatTimestamp } from '../../utils';

export function NotificationDrawer() {
  const { notifications, isDrawerOpen, clearAll } = useNotificationStore();

  if (!isDrawerOpen) return null;

  return (
    <aside className="w-80 border-l border-zinc-800 bg-zinc-950 flex flex-col h-full animate-in slide-in-from-right duration-300">
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
        <h2 className="text-sm font-semibold flex items-center gap-2">
          Notifications
          <span className="text-xs bg-zinc-800 px-2 py-0.5 rounded-full text-zinc-400">
            {notifications.length}
          </span>
        </h2>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={clearAll}
            className="p-1.5 hover:bg-zinc-800 rounded text-zinc-500 hover:text-red-400 transition-colors"
            title="Alle löschen"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {notifications.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-zinc-600 gap-2">
            <BellOff size={32} strokeWidth={1} />
            <p className="text-xs">No new notifications</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 group relative"
            >
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
                <span className="text-[10px] text-zinc-500 font-mono">
                  {formatTimestamp(notification.timestamp)}
                </span>
              </div>
              <p className="text-sm font-medium text-zinc-200 leading-tight">
                {notification.title}
              </p>
              {notification.message && (
                <p className="text-xs text-zinc-500 mt-1 line-clamp-2">
                  {notification.message}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
