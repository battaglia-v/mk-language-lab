import { Metadata } from 'next';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { ArrowLeft } from 'lucide-react';
import { ProfileDashboard } from '@/components/profile/ProfileDashboard';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('profile');
  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function ProfilePage() {
  const t = await getTranslations('profile');
  const navT = await getTranslations('nav');

  return (
    <div className="page-shell">
      <div className="page-shell-content section-container section-container-xl section-spacing-md space-y-6">
        <section data-testid="profile-hero" className="glass-card rounded-3xl p-6 md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="../translate"
                className="inline-flex items-center gap-2 rounded-full border border-border/60 px-3 py-1.5 text-xs text-slate-300"
                aria-label={navT('backToDashboard')}
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                {navT('backToDashboard')}
              </Link>
            </div>
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary/80">{t('title')}</p>
              <h1 className="text-3xl font-bold text-white md:text-4xl">{t('description')}</h1>
              <p className="text-sm text-slate-300">
                Track your streak, quests, and badges across every device with the new glass dashboard.
              </p>
            </div>
          </div>
        </section>

        <ProfileDashboard className="space-y-6" dataTestId="profile-dashboard" />
      </div>
    </div>
  );
}
