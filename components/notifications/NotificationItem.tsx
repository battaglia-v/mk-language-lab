import Link from 'next/link';
import { useTranslations } from 'next-intl';

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
      className={`bg-white rounded-lg shadow-sm p-4 border-l-4 ${
        notification.isRead
          ? 'border-gray-300 opacity-75'
          : 'border-blue-500'
      }`}
    >
      <div className="flex items-start gap-4">
        <div className="text-3xl flex-shrink-0">{icon}</div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-gray-900">{notification.title}</h3>
            {!notification.isRead && (
              <button
                onClick={() => onMarkAsRead(notification.id)}
                className="text-sm text-blue-600 hover:text-blue-700 whitespace-nowrap"
              >
                {t('markRead')}
              </button>
            )}
          </div>

          <p className="text-gray-600 mt-1">{notification.body}</p>

          <div className="flex items-center gap-4 mt-3">
            <span className="text-xs text-gray-500">{timeAgo}</span>

            {notification.actionUrl && (
              <Link
                href={notification.actionUrl}
                className="text-sm text-blue-600 hover:text-blue-700"
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
