'use client';

import { useTranslations } from 'next-intl';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { NotificationItem } from './NotificationItem';

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

export function NotificationsInbox() {
  const t = useTranslations('notifications');
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery<{ notifications: Notification[] }>({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await fetch('/api/notifications');
      if (!res.ok) throw new Error('Failed to fetch notifications');
      return res.json();
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const res = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to mark as read');
      return res.json();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const handleMarkAsRead = (id: string) => {
    markAsReadMutation.mutate(id);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="h-24 bg-gray-200 rounded" />
          <div className="h-24 bg-gray-200 rounded" />
          <div className="h-24 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-red-800 font-semibold mb-2">{t('error.title')}</h2>
          <p className="text-red-600">{t('error.generic')}</p>
        </div>
      </div>
    );
  }

  const notifications = data?.notifications || [];
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
        <p className="text-gray-600 mt-2">
          {t('subtitle', { count: unreadCount })}
        </p>
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <div className="text-6xl mb-4">📬</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {t('empty.title')}
          </h2>
          <p className="text-gray-600">{t('empty.description')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkAsRead={handleMarkAsRead}
            />
          ))}
        </div>
      )}
    </div>
  );
}
