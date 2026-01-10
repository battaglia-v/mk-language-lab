import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
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

  return (
    <div className="page-shell">
      <div className="page-shell-content section-container section-container-xl section-spacing-md space-y-6">
        <section data-testid="profile-hero" className="glass-card rounded-3xl card-padding-lg md:p-8">
          <div className="flex flex-col gap-3 sm:gap-4">
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
