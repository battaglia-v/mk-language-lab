import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { NotificationsInbox } from '@/components/notifications/NotificationsInbox';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('notifications');
  return {
    title: t('title'),
    description: t('description'),
  };
}

export default function NotificationsPage() {
  return <NotificationsInbox />;
}
