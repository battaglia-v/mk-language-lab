'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowLeft, Target, RotateCcw, Languages } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PageContainer } from '@/components/layout';
import { cn } from '@/lib/utils';
import { clearAllLocalProgress } from '@/lib/local-storage-reset';

const DAILY_GOAL_OPTIONS = [10, 20, 30, 50];

export default function SettingsPage() {
  const locale = useLocale();
  const t = useTranslations('nav');
  const router = useRouter();
  const pathname = usePathname();

  const [dailyGoal, setDailyGoal] = useState(20);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('mk-daily-goal');
    if (stored) {
      setDailyGoal(parseInt(stored, 10));
    }
  }, []);

  const handleGoalChange = (goal: number) => {
    setDailyGoal(goal);
    localStorage.setItem('mk-daily-goal', String(goal));
  };

  const handleLanguageChange = (newLocale: string) => {
    // Replace the locale in the current path
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    // Store preference in localStorage
    localStorage.setItem('mk-preferred-locale', newLocale);
    // Set cookie for next-intl to persist across sessions (1 year expiry)
    document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=31536000;SameSite=Lax`;
    router.push(newPath);
  };

  const handleResetProgress = () => {
    clearAllLocalProgress();
    setShowResetConfirm(false);
    setResetComplete(true);
    setDailyGoal(20);
    setTimeout(() => setResetComplete(false), 3000);
  };

  const settingsGroups = [
    {
      title: 'Language',
      icon: Languages,
      description: 'Choose your preferred language',
      action: (
        <div className="flex gap-2">
          <button
            onClick={() => handleLanguageChange('en')}
            data-testid="settings-language-en"
            className={cn(
              'rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
              locale === 'en'
                ? 'bg-primary text-black'
                : 'bg-muted/50 text-muted-foreground hover:bg-muted'
            )}
          >
            English
          </button>
          <button
            onClick={() => handleLanguageChange('mk')}
            data-testid="settings-language-mk"
            className={cn(
              'rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
              locale === 'mk'
                ? 'bg-primary text-black'
                : 'bg-muted/50 text-muted-foreground hover:bg-muted'
            )}
          >
            Македонски
          </button>
        </div>
      ),
    },
    {
      title: 'Daily Goal',
      icon: Target,
      description: 'Set your daily XP target',
      action: (
        <div className="flex gap-2">
          {DAILY_GOAL_OPTIONS.map((goal) => (
            <button
              key={goal}
              onClick={() => handleGoalChange(goal)}
              data-testid={`settings-daily-goal-${goal}`}
              className={cn(
                'rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
                dailyGoal === goal
                  ? 'bg-primary text-black'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted'
              )}
            >
              {goal}
            </button>
          ))}
        </div>
      ),
    },
  ];

  return (
    <PageContainer size="md" className="pb-24 sm:pb-6">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full"
          >
            <Link href={`/${locale}/more`} data-testid="settings-back-to-more">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">{t('settings', { default: 'Settings' })}</h1>
        </div>

        <div className="space-y-3">
          {settingsGroups.map((group) => {
            const Icon = group.icon;
            return (
              <div key={group.title} className="rounded-xl border border-border/40 bg-card p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted/30">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{group.title}</p>
                    <p className="text-sm text-muted-foreground">{group.description}</p>
                  </div>
                </div>
                <div className="pl-13">
                  {group.action}
                </div>
              </div>
            );
          })}
        </div>

        {/* Reset Progress Section */}
        <div className="pt-6 border-t border-border/40">
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4">
            <div className="flex items-start gap-3 mb-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10">
                <RotateCcw className="h-5 w-5 text-destructive" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">Reset Progress</p>
                <p className="text-sm text-muted-foreground">Clear all local data and start fresh</p>
              </div>
            </div>
            <div className="pl-13 flex justify-end">
              {!showResetConfirm ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-destructive/40 text-destructive hover:bg-destructive/10"
                  onClick={() => setShowResetConfirm(true)}
                  data-testid="settings-reset-open"
                >
                  Reset
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowResetConfirm(false)}
                    data-testid="settings-reset-cancel"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleResetProgress}
                    data-testid="settings-reset-confirm"
                  >
                    Confirm
                  </Button>
                </div>
              )}
            </div>
          </div>
          {resetComplete && (
            <p className="mt-2 text-sm text-emerald-500 text-center">Progress reset successfully!</p>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
