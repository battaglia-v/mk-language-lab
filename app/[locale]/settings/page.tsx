'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowLeft, Target, RotateCcw, Languages, Loader2, Sun, Moon } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { PageContainer } from '@/components/layout';
import { cn } from '@/lib/utils';
import { clearAllLocalProgress } from '@/lib/local-storage-reset';
import { useTheme } from '@/components/providers/ThemeProvider';

const DAILY_GOAL_OPTIONS = [10, 20, 30, 50];

export default function SettingsPage() {
  const locale = useLocale();
  const t = useTranslations('nav');
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const { theme, setTheme, resolvedTheme } = useTheme();

  const [dailyGoal, setDailyGoal] = useState(20);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [mounted, setMounted] = useState(false);

  const isSignedIn = status === 'authenticated' && !!session?.user;

  // Prevent hydration mismatch for theme
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load settings from API (signed in) or localStorage (anonymous)
  useEffect(() => {
    const loadSettings = async () => {
      if (status === 'loading') return;

      if (isSignedIn) {
        try {
          const response = await fetch('/api/user/settings');
          if (response.ok) {
            const data = await response.json();
            setDailyGoal(data.dailyGoal ?? 20);
            // Also sync to localStorage for consistency
            localStorage.setItem('mk-daily-goal', String(data.dailyGoal ?? 20));
          }
        } catch (error) {
          console.error('Failed to load settings:', error);
          // Fall back to localStorage
          const stored = localStorage.getItem('mk-daily-goal');
          if (stored) setDailyGoal(parseInt(stored, 10));
        }
      } else {
        // Anonymous user - use localStorage
        const stored = localStorage.getItem('mk-daily-goal');
        if (stored) setDailyGoal(parseInt(stored, 10));
      }
      setIsLoading(false);
    };

    loadSettings();
  }, [status, isSignedIn]);

  // Save settings to API (signed in) or localStorage (anonymous)
  const saveSettings = useCallback(async (settings: { locale?: string; dailyGoal?: number }) => {
    // Always save to localStorage for immediate effect
    if (settings.dailyGoal !== undefined) {
      localStorage.setItem('mk-daily-goal', String(settings.dailyGoal));
    }
    if (settings.locale !== undefined) {
      localStorage.setItem('mk-preferred-locale', settings.locale);
      document.cookie = `NEXT_LOCALE=${settings.locale};path=/;max-age=31536000;SameSite=Lax`;
    }

    // If signed in, also persist to database
    if (isSignedIn) {
      setIsSaving(true);
      try {
        await fetch('/api/user/settings', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(settings),
        });
      } catch (error) {
        console.error('Failed to save settings to database:', error);
      } finally {
        setIsSaving(false);
      }
    }
  }, [isSignedIn]);

  const handleGoalChange = (goal: number) => {
    setDailyGoal(goal);
    saveSettings({ dailyGoal: goal });
  };

  const handleLanguageChange = (newLocale: string) => {
    // Save to database first, then navigate
    saveSettings({ locale: newLocale });
    // Replace the locale in the current path
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPath);
  };

  const handleResetProgress = () => {
    clearAllLocalProgress();
    setShowResetConfirm(false);
    setResetComplete(true);
    setDailyGoal(20);
    setTimeout(() => setResetComplete(false), 3000);
  };

  const currentTheme = mounted ? (resolvedTheme || theme || 'dark') : 'dark';

  const settingsGroups = [
    {
      title: t('theme', { default: 'Theme' }),
      icon: currentTheme === 'dark' ? Moon : Sun,
      description: t('themeDesc', { default: 'Choose light or dark mode' }),
      action: (
        <div className="flex gap-2">
          <button
            onClick={() => setTheme('light')}
            data-testid="settings-theme-light"
            className={cn(
              'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
              currentTheme === 'light'
                ? 'bg-primary text-black'
                : 'bg-muted/50 text-muted-foreground hover:bg-muted'
            )}
          >
            <Sun className="h-4 w-4" />
            {t('themeLight', { default: 'Light' })}
          </button>
          <button
            onClick={() => setTheme('dark')}
            data-testid="settings-theme-dark"
            className={cn(
              'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
              currentTheme === 'dark'
                ? 'bg-primary text-black'
                : 'bg-muted/50 text-muted-foreground hover:bg-muted'
            )}
          >
            <Moon className="h-4 w-4" />
            {t('themeDark', { default: 'Dark' })}
          </button>
        </div>
      ),
    },
    {
      title: t('language', { default: 'Language' }),
      icon: Languages,
      description: t('languageDesc', { default: 'Choose your preferred language' }),
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
      title: t('dailyGoal', { default: 'Daily Goal' }),
      icon: Target,
      description: t('dailyGoalDesc', { default: 'Set your daily XP target' }),
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

  if (isLoading) {
    return (
      <PageContainer size="md" className="pb-24 sm:pb-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </PageContainer>
    );
  }

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
          {isSaving && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground ml-auto" />
          )}
        </div>

        {/* Signed in indicator */}
        {isSignedIn && (
          <div className="rounded-lg bg-primary/10 border border-primary/20 px-4 py-2 text-sm text-primary">
            Settings will sync across devices when signed in as {session?.user?.email}
          </div>
        )}

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
