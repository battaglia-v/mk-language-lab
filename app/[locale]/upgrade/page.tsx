import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { Check, Crown, Sparkles, BookOpen, Zap, Shield, Infinity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageContainer } from '@/components/layout';
import { FEATURES } from '@/lib/entitlements';
import { SubscribeButton } from '@/components/subscription/SubscribeButton';

interface UpgradePageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ from?: string }>;
}

const FEATURE_ICONS: Record<string, React.ReactNode> = {
  unlimited_practice: <Infinity className="h-4 w-4" />,
  custom_decks: <Zap className="h-4 w-4" />,
  reading_challenge_full: <BookOpen className="h-4 w-4" />,
  native_audio: <Sparkles className="h-4 w-4" />,
  advanced_grammar: <BookOpen className="h-4 w-4" />,
  offline_content: <Shield className="h-4 w-4" />,
};

export default async function UpgradePage({ params, searchParams }: UpgradePageProps) {
  const { locale } = await params;
  const { from } = await searchParams;
  const safeFrom = typeof from === 'string' && from.startsWith('/') ? from : undefined;
  const t = await getTranslations('upgrade');
  const proFeatures = FEATURES.filter((feature) => feature.requiresPro);

  return (
    <PageContainer size="lg" className="flex flex-col gap-6 pb-24 sm:pb-10 pt-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/20 mx-auto">
          <Crown className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold">
          {t('title', { default: 'Upgrade to Pro' })}
        </h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          {t('subtitle', { default: 'Unlock the full Macedonian learning experience with unlimited access to all features.' })}
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid gap-4 md:grid-cols-2 max-w-2xl mx-auto w-full">
        {/* Monthly Plan */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {t('monthly', { default: 'Monthly' })}
              <Badge variant="outline">{t('flexible', { default: 'Flexible' })}</Badge>
            </CardTitle>
            <CardDescription>
              {t('monthlyDesc', { default: 'Perfect for trying out Pro features' })}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold">$4.99</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <SubscribeButton
              productId="pro_monthly"
              locale={locale}
              from={safeFrom}
              className="w-full"
              size="lg"
            >
              {t('subscribe', { default: 'Subscribe' })}
            </SubscribeButton>
          </CardContent>
        </Card>

        {/* Yearly Plan */}
        <Card className="border-primary/50 bg-primary/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg">
            {t('bestValue', { default: 'BEST VALUE' })}
          </div>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {t('yearly', { default: 'Yearly' })}
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                {t('save40', { default: 'Save 40%' })}
              </Badge>
            </CardTitle>
            <CardDescription>
              {t('yearlyDesc', { default: 'Best for committed learners' })}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold">$35.99</span>
              <span className="text-muted-foreground">/year</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {t('yearlyPricePerMonth', { default: 'Just $3/month' })}
            </p>
            <SubscribeButton
              productId="pro_yearly"
              locale={locale}
              from={safeFrom}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              size="lg"
            >
              {t('subscribe', { default: 'Subscribe' })}
            </SubscribeButton>
          </CardContent>
        </Card>
      </div>

      {/* Features List */}
      <Card className="max-w-2xl mx-auto w-full">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            {t('whatYouGet', { default: 'What you get with Pro' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-3 sm:grid-cols-2">
            {proFeatures.map((feature) => (
              <li key={feature.id} className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 shrink-0">
                  {FEATURE_ICONS[feature.id] || <Check className="h-4 w-4" />}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-foreground">{feature.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{feature.description}</div>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Free vs Pro Comparison */}
      <Card className="max-w-2xl mx-auto w-full">
        <CardHeader>
          <CardTitle className="text-lg">
            {t('comparison', { default: 'Free vs Pro' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-sm font-medium border-b border-border/50 pb-3">
              <div>{t('feature', { default: 'Feature' })}</div>
              <div className="text-center">{t('free', { default: 'Free' })}</div>
              <div className="text-center text-primary">{t('pro', { default: 'Pro' })}</div>
            </div>
            <ComparisonRow
              feature={t('practiceSessionsLabel', { default: 'Practice sessions' })}
              free="3/day"
              pro={t('unlimited', { default: 'Unlimited' })}
            />
            <ComparisonRow
              feature={t('readingChallenge', { default: '30-Day Challenge' })}
              free={t('first5Days', { default: 'First 5 days' })}
              pro={t('allDays', { default: 'All 30 days' })}
            />
            <ComparisonRow
              feature={t('customDecks', { default: 'Custom decks' })}
              free="1"
              pro={t('unlimited', { default: 'Unlimited' })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Back Link */}
      <div className="text-center">
        <Button asChild variant="ghost">
          <Link href={safeFrom || `/${locale}/learn`}>
            {t('maybeLater', { default: 'Maybe later' })}
          </Link>
        </Button>
      </div>

      {/* Trust Badges */}
      <div className="text-center text-sm text-muted-foreground space-y-2">
        <p>{t('cancelAnytime', { default: 'Cancel anytime. No questions asked.' })}</p>
        <p>{t('securePayment', { default: 'Secure payment via Google Play or Stripe' })}</p>
      </div>
    </PageContainer>
  );
}

function ComparisonRow({
  feature,
  free,
  pro,
}: {
  feature: string;
  free: React.ReactNode;
  pro: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-3 gap-4 text-sm py-2 border-b border-border/30 last:border-0">
      <div className="text-muted-foreground">{feature}</div>
      <div className="text-center">{free}</div>
      <div className="text-center text-primary font-medium">{pro}</div>
    </div>
  );
}
