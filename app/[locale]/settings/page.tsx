'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowLeft, Target, Bell, Globe, Palette, ChevronRight, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageContainer } from '@/components/layout';
import { cn } from '@/lib/utils';
import { clearAllLocalProgress } from '@/lib/local-storage-reset';

const DAILY_GOAL_OPTIONS = [10, 20, 30, 50];

export default function SettingsPage() {
  const locale = useLocale();
  const t = useTranslations('nav');

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

  const handleResetProgress = () => {
    clearAllLocalProgress();
    setShowResetConfirm(false);
    setResetComplete(true);
    setDailyGoal(20);
    setTimeout(() => setResetComplete(false), 3000);
  };

  const settingsGroups = [
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
              className={cn(
                'rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
                dailyGoal === goal
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted'
              )}
            >
              {goal}
            </button>
          ))}
        </div>
      ),
    },
    {
      title: 'Notifications',
      icon: Bell,
      description: 'Practice reminders',
      href: '#notifications',
      badge: t('comingSoon'),
    },
    {
      title: 'Language',
      icon: Globe,
      description: locale === 'mk' ? 'Македонски' : 'English',
      href: '#language',
    },
    {
      title: 'Appearance',
      icon: Palette,
      description: 'Dark mode enabled',
      href: '#appearance',
      badge: t('comingSoon'),
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
            <Link href={`/${locale}/more`}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">{t('settings', { default: 'Settings' })}</h1>
        </div>

        <div className="space-y-3">
          {settingsGroups.map((group) => {
            const Icon = group.icon;
            const content = (
              <div className="flex items-center gap-4 rounded-xl border border-border/40 bg-card p-4 transition-all hover:border-primary/40 hover:bg-muted/20">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted/30">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-foreground">{group.title}</p>
                    {group.badge && (
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase text-muted-foreground">
                        {group.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{group.description}</p>
                </div>
                {group.action ? (
                  group.action
                ) : (
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            );

            if (group.href) {
              return (
                <div key={group.title} className="cursor-not-allowed opacity-60">
                  {content}
                </div>
              );
            }

            return <div key={group.title}>{content}</div>;
          })}
        </div>

        {/* Reset Progress Section */}
        <div className="pt-6 border-t border-border/40">
          <div className="flex items-center gap-4 rounded-xl border border-destructive/20 bg-destructive/5 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10">
              <RotateCcw className="h-5 w-5 text-destructive" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground">Reset Progress</p>
              <p className="text-sm text-muted-foreground">Clear all local data and start fresh</p>
            </div>
            {!showResetConfirm ? (
              <Button
                variant="outline"
                size="sm"
                className="border-destructive/40 text-destructive hover:bg-destructive/10"
                onClick={() => setShowResetConfirm(true)}
              >
                Reset
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowResetConfirm(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleResetProgress}
                >
                  Confirm
                </Button>
              </div>
            )}
          </div>
          {resetComplete && (
            <p className="mt-2 text-sm text-emerald-500 text-center">Progress reset successfully!</p>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
