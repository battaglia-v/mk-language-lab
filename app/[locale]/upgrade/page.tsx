import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface UpgradePageProps {
  params: Promise<{ locale: string }>;
}

export default async function UpgradePage({ params }: UpgradePageProps) {
  const { locale } = await params;

  return (
    <div className="page-shell">
      <div className="page-shell-content section-container section-container-xl section-spacing-md space-y-6 text-white">
        <section data-testid="upgrade-hero" className="glass-card rounded-3xl p-6 md:p-8 text-center">
          <header className="page-header mx-auto">
            <div className="page-header-content">
              <p className="page-header-badge">Upgrade</p>
              <h1 className="page-header-title">MK Language Lab is free for launch</h1>
              <p className="page-header-subtitle mx-auto">
                Pro subscriptions are coming later. For now, enjoy full access for free.
              </p>
            </div>
          </header>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild data-testid="upgrade-back-to-learn">
              <Link href={`/${locale}/learn`}>Go to Learn</Link>
            </Button>
            <Button asChild variant="outline" data-testid="upgrade-back-home">
              <Link href={`/${locale}`}>Back to Home</Link>
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
