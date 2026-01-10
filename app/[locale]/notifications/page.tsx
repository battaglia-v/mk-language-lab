import { Metadata } from 'next';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { NotificationsInbox } from '@/components/notifications/NotificationsInbox';
import { ReminderSettingsCard } from '@/components/notifications/ReminderSettingsCard';
import { PageContainer } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { auth } from '@/lib/auth';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('notifications');
  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function NotificationsPage({ params }: { params: Promise<{ locale: string }> }) {
  const t = await getTranslations('notifications');
  const { locale } = await params;
  const session = await auth().catch(() => null);

  return (
    <PageContainer size="xl" className="flex flex-col gap-5 pb-24 pt-6 sm:gap-6 sm:pb-10 sm:pt-8">
      <section data-testid="notifications-hero" className="glass-card rounded-3xl card-padding-lg md:p-8">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white md:text-3xl">{t('title')}</h1>
          <p className="text-sm text-slate-300">{t('description')}</p>
        </div>
      </section>

      {!session?.user ? (
        <section className="glass-card rounded-3xl border border-border/60 p-6 md:p-8" data-testid="notifications-sign-in">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary/70">{t('signIn.title')}</p>
          <h2 className="mt-2 text-2xl font-bold text-white md:text-3xl">{t('signIn.subtitle')}</h2>
          <p className="mt-3 max-w-2xl text-sm text-slate-300">{t('signIn.body')}</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button asChild size="lg" className="px-6">
              <Link
                href={`/${locale}/sign-in?callbackUrl=/${locale}/notifications`}
                data-testid="notifications-sign-in"
              >
                {t('signIn.cta')}
              </Link>
            </Button>
            <Button asChild variant="ghost" size="lg" className="px-6 text-slate-200">
              <Link href={`/${locale}`} data-testid="notifications-back-home">
                {t('signIn.secondary')}
              </Link>
            </Button>
          </div>
        </section>
      ) : (
        <>
          <ReminderSettingsCard dataTestId="reminder-settings" />
          <NotificationsInbox className="rounded-[32px]" dataTestId="notifications-feed" />
        </>
      )}
    </PageContainer>
  );
}
