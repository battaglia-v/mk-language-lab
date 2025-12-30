'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Trophy, Clock, Target, Flame, ArrowRight, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageContainer } from '@/components/layout';

export default function ResultsPage() {
  const t = useTranslations('practiceHub');
  const locale = useLocale();
  const searchParams = useSearchParams();

  const reviewed = parseInt(searchParams.get('reviewed') || '0', 10);
  const correct = parseInt(searchParams.get('correct') || '0', 10);
  const streak = parseInt(searchParams.get('streak') || '0', 10);
  const duration = parseInt(searchParams.get('duration') || '0', 10);
  const xp = parseInt(searchParams.get('xp') || '0', 10);
  const deckType = searchParams.get('deck') || 'curated';

  const accuracy = reviewed > 0 ? Math.round((correct / reviewed) * 100) : 0;
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;

  return (
    <PageContainer size="sm" className="flex flex-col items-center justify-center min-h-[70vh] gap-6 py-8">
      {/* Celebration Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-amber-500/20 mb-4">
          <Trophy className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-foreground">
          {t('drills.sessionComplete', { default: 'Session Complete!' })}
        </h1>
        <p className="text-muted-foreground">
          {t('drills.sessionSummaryDesc', { default: "Great work! Here's how you did:" })}
        </p>
      </div>

      {/* XP Earned */}
      {xp > 0 && (
        <div className="glass-card rounded-2xl p-6 text-center w-full max-w-xs">
          <p className="text-5xl font-bold text-primary">+{xp}</p>
          <p className="text-sm text-muted-foreground mt-1">XP {t('drills.earned', { default: 'Earned' })}</p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
        <StatCard icon={Target} value={`${accuracy}%`} label={t('drills.accuracyLabel', { default: 'Accuracy' })} color="emerald" />
        <StatCard icon={Trophy} value={reviewed.toString()} label={t('drills.cardsReviewed', { default: 'Cards' })} color="primary" />
        <StatCard icon={Flame} value={streak.toString()} label={t('drills.bestStreak', { default: 'Best Streak' })} color="amber" />
        <StatCard icon={Clock} value={`${minutes}:${String(seconds).padStart(2, '0')}`} label={t('drills.timeSpent', { default: 'Time' })} color="blue" />
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 w-full max-w-sm mt-4">
        <Button asChild size="lg" className="w-full min-h-[52px] rounded-xl">
          <Link href={`/${locale}/practice/session?deck=${deckType}`}>
            <RotateCcw className="h-5 w-5 mr-2" />
            {t('drills.startNew', { default: 'Practice Again' })}
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="w-full min-h-[52px] rounded-xl">
          <Link href={`/${locale}/practice`}>
            <ArrowRight className="h-5 w-5 mr-2" />
            {t('drills.backToHub', { default: 'Back to Practice' })}
          </Link>
        </Button>
        <Button asChild variant="ghost" size="lg" className="w-full min-h-[52px] rounded-xl">
          <Link href={`/${locale}/learn`}>
            {t('drills.goHome', { default: 'Go Home' })}
          </Link>
        </Button>
      </div>
    </PageContainer>
  );
}

function StatCard({ icon: Icon, value, label, color }: { icon: typeof Trophy; value: string; label: string; color: string }) {
  const colorClasses: Record<string, string> = {
    primary: 'text-primary bg-primary/10',
    emerald: 'text-emerald-400 bg-emerald-500/10',
    amber: 'text-amber-400 bg-amber-500/10',
    blue: 'text-blue-400 bg-blue-500/10',
  };
  return (
    <div className="glass-card rounded-xl p-4 text-center">
      <div className={`inline-flex h-10 w-10 items-center justify-center rounded-full ${colorClasses[color]} mb-2`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
