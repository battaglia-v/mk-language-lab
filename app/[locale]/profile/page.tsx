import { Metadata } from 'next';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProfileDashboard } from '@/components/profile/ProfileDashboard';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('profile');
  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function ProfilePage({ params }: { params: Promise<{ locale: string }> }) {
  const t = await getTranslations('profile');
  const navT = await getTranslations('nav');
  const { locale } = await params;

  return (
    <div className="page-shell">
      <div className="page-shell-content section-container section-container-xl section-spacing-md space-y-6">
        <section data-testid="profile-hero" className="glass-card rounded-3xl card-padding-lg md:p-8">
          <div className="flex flex-col gap-3 sm:gap-4">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="inline-flex min-h-[44px] w-fit items-center gap-2 rounded-full border border-border/60 px-4 text-sm text-muted-foreground"
            >
              <Link href={`/${locale}/learn`} aria-label={navT('backToDashboard')} data-testid="profile-back-to-learn">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                {navT('backToDashboard')}
              </Link>
            </Button>
            <header className="page-header">
              <div className="page-header-content">
                <p className="page-header-badge">{t('title')}</p>
                <h1 className="page-header-title">{t('description')}</h1>
                <p className="page-header-subtitle">
                  Track your streak, XP, and badges across every device.
                </p>
              </div>
            </header>
          </div>
        </section>

        <ProfileDashboard className="space-y-6" dataTestId="profile-dashboard" />
      </div>
    </div>
  );
}
