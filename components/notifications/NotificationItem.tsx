import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

type Notification = {
  id: string;
  type: string;
  title: string;
  body: string;
  actionUrl: string | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
};

type NotificationItemProps = {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
};

export function NotificationItem({ notification, onMarkAsRead }: NotificationItemProps) {
  const t = useTranslations('notifications');

  const typeIcons: Record<string, string> = {
    streak_warning: '🔥',
    quest_invite: '🎯',
    admin_note: '📢',
    friend_activity: '👥',
  };

  const icon = typeIcons[notification.type] || '📬';
  const timeAgo = formatTimeAgo(notification.createdAt);

  return (
    <div
      className={cn(
        'rounded-2xl border px-4 py-5 text-white transition hover:-translate-y-0.5',
        notification.isRead
          ? 'border-white/10 bg-white/5 opacity-80'
          : 'border-primary/40 bg-primary/10 shadow-[0_10px_35px_rgba(0,0,0,0.45)]'
      )}
      data-testid="notification-item"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-2xl">{icon}</div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-white">{notification.title}</h3>
            {!notification.isRead && (
              <button
                onClick={() => onMarkAsRead(notification.id)}
                className="text-xs font-semibold uppercase tracking-wide text-primary hover:text-primary/80"
              >
                {t('markRead')}
              </button>
            )}
          </div>

          <p className="mt-1 text-sm text-slate-200">{notification.body}</p>

          <div className="flex items-center gap-4 mt-3">
            <span className="text-xs text-slate-400">{timeAgo}</span>

            {notification.actionUrl && (
              <Link
                href={notification.actionUrl}
                className="text-sm font-semibold text-primary hover:text-primary/80"
              >
                {t('viewAction')} →
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function formatTimeAgo(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
}
