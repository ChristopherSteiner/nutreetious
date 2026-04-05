import { Bell, BellDot } from 'lucide-react';
import { useNotificationStore } from '../../store';

export function NotificationToggleButton() {
  const { notifications, toggleDrawer, isDrawerOpen } = useNotificationStore();
  const hasNotifications = notifications.length > 0;

  const getButtonStyles = () => {
    if (isDrawerOpen) {
      return 'text-sky-400 bg-sky-400/10 shadow-[0_0_10px_rgba(56,189,248,0.2)] border-sky-400/20';
    }
    if (hasNotifications) {
      return 'text-emerald-500 bg-emerald-500/10 border-transparent';
    }

    return 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 border-transparent';
  };

  return (
    <button
      type="button"
      onClick={toggleDrawer}
      className={`p-1.5 rounded-md border transition-all active:scale-95 relative group ${getButtonStyles()}`}
      title="Notifications"
    >
      {hasNotifications ? <BellDot size={16} /> : <Bell size={16} />}

      {hasNotifications && !isDrawerOpen && (
        <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-emerald-500 rounded-full border border-zinc-900 animate-pulse" />
      )}
    </button>
  );
}
