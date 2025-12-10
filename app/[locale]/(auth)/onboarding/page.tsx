'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { WebButton, WebCard } from '@mk/ui';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Briefcase,
  GraduationCap,
  Heart,
  MessageCircle,
  Plane,
  Check,
  Sparkles
} from 'lucide-react';
import { trackEvent, AnalyticsEvents } from '@/lib/analytics';

type Goal = 'conversation' | 'travel' | 'culture' | 'reading' | 'professional';
type Level = 'beginner' | 'intermediate' | 'advanced';

type WizardData = {
  goal: Goal | null;
  level: Level | null;
  dailyGoalMinutes: number;
  reminderWindows: string[];
};

const GOALS: { id: Goal; icon: React.ReactNode; title: string; description: string }[] = [
  {
    id: 'conversation',
    icon: <MessageCircle className="h-8 w-8" />,
    title: 'Conversation',
    description: 'Chat with locals and make friends',
  },
  {
    id: 'travel',
    icon: <Plane className="h-8 w-8" />,
    title: 'Travel',
    description: 'Navigate Macedonia with confidence',
  },
  {
    id: 'culture',
    icon: <Heart className="h-8 w-8" />,
    title: 'Culture',
    description: 'Connect with heritage and traditions',
  },
  {
    id: 'reading',
    icon: <BookOpen className="h-8 w-8" />,
    title: 'Reading',
    description: 'Enjoy books, news, and literature',
  },
  {
    id: 'professional',
    icon: <Briefcase className="h-8 w-8" />,
    title: 'Professional',
    description: 'Use Macedonian for work',
  },
];

const LEVELS: { id: Level; title: string; description: string }[] = [
  {
    id: 'beginner',
    title: 'Beginner',
    description: 'I\'m just starting out with Macedonian',
  },
  {
    id: 'intermediate',
    title: 'Intermediate',
    description: 'I can handle basic conversations',
  },
  {
    id: 'advanced',
    title: 'Advanced',
    description: 'I\'m fluent or near-fluent',
  },
];

const DAILY_GOALS = [5, 10, 15, 20, 30, 45, 60];

export default function OnboardingPage() {
  const router = useRouter();
  const locale = useLocale();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [data, setData] = useState<WizardData>({
    goal: null,
    level: null,
    dailyGoalMinutes: 20,
    reminderWindows: [],
  });

  // Track onboarding started
  useEffect(() => {
    trackEvent(AnalyticsEvents.ONBOARDING_STARTED);
  }, []);

  const handleGoalSelect = (goal: Goal) => {
    setData({ ...data, goal });
    trackEvent(AnalyticsEvents.ONBOARDING_GOAL_SELECTED, { goal });
  };

  const handleLevelSelect = (level: Level) => {
    setData({ ...data, level });
    trackEvent(AnalyticsEvents.ONBOARDING_LEVEL_SELECTED, { level });
  };

  const handleDailyGoalSelect = (minutes: number) => {
    setData({ ...data, dailyGoalMinutes: minutes });
    trackEvent(AnalyticsEvents.ONBOARDING_DAILY_GOAL_SELECTED, { minutes });
  };

  const handleNext = () => {
    if (step === 1 && !data.goal) return;
    if (step === 2 && !data.level) return;
    if (step < 3) {
      trackEvent(AnalyticsEvents.ONBOARDING_STEP_COMPLETED, { step });
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    if (!data.goal || !data.level) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/missions/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goal: data.goal,
          level: data.level,
          dailyGoalMinutes: data.dailyGoalMinutes,
          reminderWindows: data.reminderWindows,
          questSeeds: [],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to setup mission');
      }

      // Track completion
      trackEvent(AnalyticsEvents.ONBOARDING_COMPLETED, {
        goal: data.goal,
        level: data.level,
        dailyGoalMinutes: data.dailyGoalMinutes,
      });

      // Redirect to home page
      router.push(`/${locale}`);
    } catch (error) {
      console.error('Failed to setup mission', error);
      trackEvent(AnalyticsEvents.ONBOARDING_FAILED, {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      setIsSubmitting(false);
    }
  };

  const canProceed =
    (step === 1 && data.goal) ||
    (step === 2 && data.level) ||
    step === 3;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--brand-red,#e63946)]/5 via-white to-[var(--brand-plum,#7a4988)]/5">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-3 pb-24 pt-10 sm:px-5 sm:pb-16 sm:pt-12 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center justify-center gap-2 text-[var(--brand-red,#e63946)]">
            <Sparkles className="h-6 w-6" />
            <span className="text-sm font-semibold uppercase tracking-[0.3em]">Welcome</span>
          </div>
          <h1 className="text-4xl font-semibold text-foreground md:text-5xl">
            Let&apos;s set up your mission
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Answer three quick questions to personalize your learning journey
          </p>
        </div>

        {/* Progress indicator */}
        <div className="mb-8 flex items-center justify-center gap-2">
          {[1, 2, 3].map((num) => (
            <div
              key={num}
              className={`h-2 w-20 rounded-full transition-colors ${
                num === step
                  ? 'bg-[var(--brand-red,#e63946)]'
                  : num < step
                    ? 'bg-[var(--brand-gold,#f4a261)]'
                    : 'bg-border/50'
              }`}
            />
          ))}
        </div>

        {/* Step content */}
        <WebCard style={{ padding: 48 }}>
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-foreground">
                  What&apos;s your main goal?
                </h2>
                <p className="mt-2 text-muted-foreground">
                  Choose what matters most to you
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {GOALS.map((goal) => (
                  <button
                    key={goal.id}
                    type="button"
                    onClick={() => handleGoalSelect(goal.id)}
                    className={`relative rounded-2xl border-2 p-6 text-left transition-all hover:border-[var(--brand-red,#e63946)] ${
                      data.goal === goal.id
                        ? 'border-[var(--brand-red,#e63946)] bg-[var(--brand-red,#e63946)]/5'
                        : 'border-border/40'
                    }`}
                  >
                    {data.goal === goal.id && (
                      <div className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--brand-red,#e63946)] text-white">
                        <Check className="h-4 w-4" />
                      </div>
                    )}
                    <div className="mb-3 text-[var(--brand-red,#e63946)]">{goal.icon}</div>
                    <h3 className="text-lg font-semibold text-foreground">{goal.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{goal.description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-foreground">
                  What&apos;s your current level?
                </h2>
                <p className="mt-2 text-muted-foreground">
                  Be honest — we&apos;ll adjust the difficulty
                </p>
              </div>

              <div className="space-y-4">
                {LEVELS.map((level) => (
                  <button
                    key={level.id}
                    type="button"
                    onClick={() => handleLevelSelect(level.id)}
                    className={`relative w-full rounded-2xl border-2 p-6 text-left transition-all hover:border-[var(--brand-red,#e63946)] ${
                      data.level === level.id
                        ? 'border-[var(--brand-red,#e63946)] bg-[var(--brand-red,#e63946)]/5'
                        : 'border-border/40'
                    }`}
                  >
                    {data.level === level.id && (
                      <div className="absolute right-6 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--brand-red,#e63946)] text-white">
                        <Check className="h-4 w-4" />
                      </div>
                    )}
                    <div className="pr-8">
                      <h3 className="text-lg font-semibold text-foreground">{level.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{level.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-foreground">
                  Set your daily goal
                </h2>
                <p className="mt-2 text-muted-foreground">
                  How many minutes can you commit per day?
                </p>
              </div>

              <div className="grid grid-cols-4 gap-3 md:grid-cols-7">
                {DAILY_GOALS.map((minutes) => (
                  <button
                    key={minutes}
                    type="button"
                    onClick={() => handleDailyGoalSelect(minutes)}
                    className={`rounded-2xl border-2 py-4 text-center transition-all hover:border-[var(--brand-red,#e63946)] ${
                      data.dailyGoalMinutes === minutes
                        ? 'border-[var(--brand-red,#e63946)] bg-[var(--brand-red,#e63946)] text-white'
                        : 'border-border/40 text-foreground'
                    }`}
                  >
                    <div className="text-2xl font-bold">{minutes}</div>
                    <div className="text-xs">min</div>
                  </button>
                ))}
              </div>

              <div className="rounded-2xl border border-border/40 bg-muted/20 p-6">
                <div className="flex items-start gap-4">
                  <GraduationCap className="h-6 w-6 flex-shrink-0 text-[var(--brand-gold,#f4a261)]" />
                  <div>
                    <h4 className="font-semibold text-foreground">You&apos;re all set!</h4>
                    <p className="mt-1 text-sm text-muted-foreground">
                      We&apos;ll create your personalized mission based on your{' '}
                      <strong className="text-[var(--brand-red,#e63946)]">{data.goal}</strong> goal at a{' '}
                      <strong className="text-[var(--brand-red,#e63946)]">{data.level}</strong> level. You can
                      adjust reminders and settings later.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </WebCard>

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between gap-4">
          <WebButton
            variant="ghost"
            onClick={handleBack}
            disabled={step === 1 || isSubmitting}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </WebButton>

          <WebButton
            onClick={handleNext}
            disabled={!canProceed || isSubmitting}
          >
            {isSubmitting ? (
              'Setting up...'
            ) : step === 3 ? (
              'Complete setup'
            ) : (
              <>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </WebButton>
        </div>
      </div>
    </div>
  );
}
