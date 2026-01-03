'use client';

import { useTranslations } from 'next-intl';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
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

type NotificationsInboxProps = {
  className?: string;
  dataTestId?: string;
};

export function NotificationsInbox({ className, dataTestId }: NotificationsInboxProps) {
  const t = useTranslations('notifications');
  const queryClient = useQueryClient();

  const { data, isLoading, isFetching, error, refetch } = useQuery<{ notifications: Notification[] }>({
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

  const notifications = data?.notifications || [];
  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const cardClasses = cn(
    'glass-card border border-white/10 card-padding-lg md:p-8 text-white space-y-6',
    className
  );

  if (isLoading) {
    return (
      <section className={cardClasses} data-testid={dataTestId}>
        <div className="space-y-2">
          <div className="h-6 w-32 rounded-full bg-white/10" />
          <div className="h-4 w-40 rounded-full bg-white/5" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={`notifications-skeleton-${index}`} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-white/10" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/2 rounded-full bg-white/10" />
                  <div className="h-3 w-3/4 rounded-full bg-white/5" />
                  <div className="h-3 w-1/3 rounded-full bg-white/5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className={cardClasses} data-testid={dataTestId}>
        <div className="rounded-2xl border border-destructive/40 bg-destructive/10 p-6 text-sm text-red-100">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-white">{t('error.title')}</h2>
              <p className="mt-1 text-red-100/90">{t('error.generic')}</p>
            </div>
            <Button
              size="sm"
              variant="secondary"
              className="rounded-full bg-white/10 text-white hover:bg-white/20"
              onClick={() => void refetch()}
              disabled={isFetching}
              data-testid="notifications-retry"
            >
              {t('error.cta')}
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={cardClasses} data-testid={dataTestId}>
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
          {t('subtitle', { count: unreadCount })}
        </p>
        <p className="text-sm text-slate-300">{t('description')}</p>
      </div>

      {notifications.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/20 bg-white/5 p-10 text-center text-slate-200">
          <div className="text-4xl mb-3">📬</div>
          <h2 className="text-xl font-semibold text-white">{t('empty.title')}</h2>
          <p className="mt-2 text-slate-300">{t('empty.description')}</p>
          <div className="mt-5 flex justify-center">
            <Button
              variant="secondary"
              className="rounded-full border-white/20 bg-white/10 text-white hover:bg-white/20"
              onClick={() => void refetch()}
              disabled={isFetching}
              data-testid="notifications-refresh"
            >
              {t('empty.cta')}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3" data-testid="notifications-list">
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkAsRead={handleMarkAsRead}
            />
          ))}
        </div>
      )}
    </section>
  );
}
