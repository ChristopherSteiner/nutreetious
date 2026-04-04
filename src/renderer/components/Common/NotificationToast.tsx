// src/renderer/components/NotificationToast.tsx

import { AlertCircle, CheckCircle2, X } from 'lucide-react';
import { useNotificationStore } from '../../store';

export function NotificationToast() {
  const { notifications, remove } = useNotificationStore();

  return (
    <div className="fixed bottom-4 right-4 z-100 flex flex-col gap-2 w-80">
      {notifications.map((n) => (
        <div
          key={n.id}
          className="bg-zinc-900 border border-zinc-800 p-3 rounded-lg shadow-2xl flex items-start gap-3 animate-in slide-in-from-right-5 fade-in duration-300"
        >
          {n.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
          )}

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-zinc-100">{n.title}</p>
            {n.message && (
              <p className="text-xs text-zinc-400 mt-0.5">{n.message}</p>
            )}
          </div>

          <button
            type="button"
            onClick={() => remove(n.id)}
            className="text-zinc-600 hover:text-zinc-400 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
