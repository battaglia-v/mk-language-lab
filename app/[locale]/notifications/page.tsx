import { Metadata } from 'next';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { ArrowLeft } from 'lucide-react';
import { NotificationsInbox } from '@/components/notifications/NotificationsInbox';
import { ReminderSettingsCard } from '@/components/notifications/ReminderSettingsCard';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('notifications');
  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function NotificationsPage({ params }: { params: Promise<{ locale: string }> }) {
  const t = await getTranslations('notifications');
  const navT = await getTranslations('nav');
  const { locale } = await params;

  return (
    <div className="page-shell">
      <div className="page-shell-content section-container section-container-xl section-spacing-md space-y-6">
        <section data-testid="notifications-hero" className="glass-card rounded-3xl card-padding-lg md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <Link
                href={`/${locale}/dashboard`}
                className="inline-flex items-center gap-2 rounded-full border border-border/60 px-3 py-1.5 text-xs text-slate-300"
                aria-label={navT('backToDashboard')}
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                {navT('backToDashboard')}
              </Link>
            </div>
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
