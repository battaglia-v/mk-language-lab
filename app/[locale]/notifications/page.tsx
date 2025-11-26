import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { NotificationsInbox } from '@/components/notifications/NotificationsInbox';
import { ReminderSettingsCard } from '@/components/notifications/ReminderSettingsCard';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('notifications');
  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function NotificationsPage() {
  const t = await getTranslations('notifications');

  return (
    <div className="page-shell">
      <div className="page-shell-content section-container section-container-xl section-spacing-md space-y-6">
        <section data-testid="notifications-hero" className="glass-card rounded-3xl card-padding-lg md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-white md:text-3xl">{t('title')}</h1>
              <p className="text-sm text-slate-300">{t('description')}</p>
            </div>
          </div>
        </section>

        <ReminderSettingsCard dataTestId="reminder-settings" />

        <NotificationsInbox className="rounded-[32px]" dataTestId="notifications-feed" />
      </div>
    </div>
  );
}
