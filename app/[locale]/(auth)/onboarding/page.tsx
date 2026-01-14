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
  Heart,
  MessageCircle,
  Plane,
  Check,
  Sparkles,
  Clock,
  Rocket
} from 'lucide-react';
import { trackEvent, AnalyticsEvents } from '@/lib/analytics';
import { PageContainer } from '@/components/layout';

type Goal = 'conversation' | 'travel' | 'culture' | 'reading' | 'professional';
type Level = 'beginner' | 'intermediate' | 'advanced';
type TranslationLanguage = 'en' | 'sr' | 'bg' | 'ru' | 'de';

type WizardData = {
  goal: Goal | null;
  level: Level | null;
  translationLanguage: TranslationLanguage;
  dailyGoalMinutes: number;
  reminderWindows: string[];
};

const GOALS: { id: Goal; icon: React.ReactNode; title: string; description: string }[] = [
  {
    id: 'conversation',
    icon: <MessageCircle className="h-7 w-7" />,
    title: 'Conversation',
    description: 'Chat with locals and make friends',
  },
  {
    id: 'travel',
    icon: <Plane className="h-7 w-7" />,
    title: 'Travel',
    description: 'Navigate Macedonia with confidence',
  },
  {
    id: 'culture',
    icon: <Heart className="h-7 w-7" />,
    title: 'Culture',
    description: 'Connect with heritage and traditions',
  },
  {
    id: 'reading',
    icon: <BookOpen className="h-7 w-7" />,
    title: 'Reading',
    description: 'Enjoy books, news, and literature',
  },
  {
    id: 'professional',
    icon: <Briefcase className="h-7 w-7" />,
    title: 'Professional',
    description: 'Use Macedonian for work',
  },
];

const LEVELS: { id: Level; label: string }[] = [
  { id: 'beginner', label: 'New' },
  { id: 'intermediate', label: 'Some' },
  { id: 'advanced', label: 'Fluent' },
];

const TRANSLATION_LANGUAGES: { id: TranslationLanguage; label: string; native: string }[] = [
  { id: 'en', label: 'English', native: 'English' },
  { id: 'sr', label: 'Serbian', native: 'Српски' },
  { id: 'bg', label: 'Bulgarian', native: 'Български' },
  { id: 'ru', label: 'Russian', native: 'Русский' },
  { id: 'de', label: 'German', native: 'Deutsch' },
];

// Simplified daily goals - just 3 options for quick selection
const DAILY_GOALS: { minutes: number; label: string; description: string }[] = [
  { minutes: 5, label: 'Casual', description: '5 min/day' },
  { minutes: 10, label: 'Regular', description: '10 min/day' },
  { minutes: 15, label: 'Serious', description: '15 min/day' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const locale = useLocale();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [data, setData] = useState<WizardData>({
    goal: null,
    level: null,
    translationLanguage: 'en',
    dailyGoalMinutes: 10,
    reminderWindows: [],
  });

  // Track onboarding started
  useEffect(() => {
    trackEvent(AnalyticsEvents.ONBOARDING_STARTED);
  }, []);

  const handleGoalSelect = (goal: Goal) => {
    // When selecting a goal, auto-set beginner level if not already set
    const newData = { 
      ...data, 
      goal,
      level: data.level || 'beginner' as Level 
    };
    setData(newData);
    trackEvent(AnalyticsEvents.ONBOARDING_GOAL_SELECTED, { goal });
  };

  const handleLevelSelect = (goalId: Goal, level: Level) => {
    setData({ ...data, goal: goalId, level });
    trackEvent(AnalyticsEvents.ONBOARDING_LEVEL_SELECTED, { level });
  };

  const handleDailyGoalSelect = (minutes: number) => {
    setData({ ...data, dailyGoalMinutes: minutes });
    trackEvent(AnalyticsEvents.ONBOARDING_DAILY_GOAL_SELECTED, { minutes });
  };

  const handleTranslationLanguageSelect = (lang: TranslationLanguage) => {
    setData({ ...data, translationLanguage: lang });
    trackEvent(AnalyticsEvents.ONBOARDING_STEP_COMPLETED, { step: 2, translationLanguage: lang });
  };

  const handleNext = () => {
    if (step === 1 && (!data.goal || !data.level)) return;
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

      // Save translation language preference to localStorage
      // (Will be migrated to database in future update)
      if (typeof window !== 'undefined') {
        localStorage.setItem('mk-translation-language', data.translationLanguage);
      }

      // Track completion
      trackEvent(AnalyticsEvents.ONBOARDING_COMPLETED, {
        goal: data.goal,
        level: data.level,
        dailyGoalMinutes: data.dailyGoalMinutes,
        translationLanguage: data.translationLanguage,
      });

      // Redirect to home page (dashboard) - goal is reflected there
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
    (step === 1 && data.goal && data.level) ||
    step === 2 ||
    step === 3;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--brand-red,#e63946)]/5 via-white to-[var(--brand-plum,#7a4988)]/5">
      <PageContainer size="lg" className="flex flex-col gap-6 pb-24 pt-10 sm:pb-16 sm:pt-12">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="mb-4 inline-flex items-center justify-center gap-2 text-[var(--brand-red,#e63946)]">
            <Sparkles className="h-6 w-6" />
            <span className="text-sm font-semibold uppercase tracking-[0.3em]">Welcome</span>
          </div>
          <h1 className="text-3xl font-semibold text-foreground sm:text-4xl md:text-5xl">
            {step === 1 ? "What's your goal?" : step === 2 ? "Your language" : "Set your pace"}
          </h1>
          <p className="mt-3 text-base text-muted-foreground sm:text-lg">
            {step === 1
              ? "Pick a goal and your experience level"
              : step === 2
                ? "Which language do you want translations in?"
                : "How much time can you commit each day?"
            }
          </p>
        </div>

        {/* Progress indicator - 3 steps now */}
        <div className="mb-6 flex items-center justify-center gap-3">
          {[1, 2, 3].map((num) => (
            <div
              key={num}
              className={`h-2 w-24 rounded-full transition-colors ${
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
        <WebCard style={{ padding: '32px 24px' }}>
          {/* Step 1: Goal + Level Combined */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {GOALS.map((goal) => {
                  const isSelected = data.goal === goal.id;
                  return (
                    <div
                      key={goal.id}
                      className={`relative rounded-2xl border-2 transition-all ${
                        isSelected
                          ? 'border-[var(--brand-red,#e63946)] bg-[var(--brand-red,#e63946)]/5'
                          : 'border-border/40 hover:border-[var(--brand-red,#e63946)]/50'
                      }`}
                    >
                      {/* Goal selection button */}
                      <button
                        type="button"
                        onClick={() => handleGoalSelect(goal.id)}
                        className="w-full p-4 text-left"
                        data-testid={`onboarding-goal-${goal.id}`}
                      >
                        {isSelected && (
                          <div className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--brand-red,#e63946)] text-white">
                            <Check className="h-3 w-3" />
                          </div>
                        )}
                        <div className="mb-2 text-[var(--brand-red,#e63946)]">{goal.icon}</div>
                        <h3 className="text-base font-semibold text-foreground">{goal.title}</h3>
                        <p className="mt-0.5 text-xs text-muted-foreground">{goal.description}</p>
                      </button>
                      
                      {/* Inline level selector - shows when goal is selected */}
                      {isSelected && (
                        <div className="border-t border-border/30 px-3 py-2">
                          <p className="mb-2 text-xs font-medium text-muted-foreground">Experience level:</p>
                          <div className="flex gap-1">
                            {LEVELS.map((level) => (
                              <button
                                key={level.id}
                                type="button"
                                onClick={() => handleLevelSelect(goal.id, level.id)}
                                className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-all ${
                                  data.level === level.id
                                    ? 'bg-[var(--brand-red,#e63946)] text-white'
                                    : 'bg-muted/50 text-foreground hover:bg-muted'
                                }`}
                                data-testid={`onboarding-level-${goal.id}-${level.id}`}
                              >
                                {level.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 2: Translation Language */}
          {step === 2 && (
            <div className="space-y-4">
              <p className="text-center text-sm text-muted-foreground mb-4">
                Translations will appear in this language when learning Macedonian
              </p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {TRANSLATION_LANGUAGES.map((lang) => {
                  const isSelected = data.translationLanguage === lang.id;
                  return (
                    <button
                      key={lang.id}
                      type="button"
                      onClick={() => handleTranslationLanguageSelect(lang.id)}
                      className={`relative flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition-all ${
                        isSelected
                          ? 'border-[var(--brand-red,#e63946)] bg-[var(--brand-red,#e63946)]/5'
                          : 'border-border/40 hover:border-[var(--brand-red,#e63946)]/50'
                      }`}
                      data-testid={`onboarding-translation-${lang.id}`}
                    >
                      {isSelected && (
                        <div className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--brand-red,#e63946)] text-white">
                          <Check className="h-3 w-3" />
                        </div>
                      )}
                      <div>
                        <h3 className="text-base font-semibold text-foreground">{lang.label}</h3>
                        <p className="text-sm text-muted-foreground">{lang.native}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3: Daily Goal + Start CTA */}
          {step === 3 && (
            <div className="space-y-6">
              {/* Daily goal options */}
              <div className="grid grid-cols-3 gap-3">
                {DAILY_GOALS.map((option) => (
                  <button
                    key={option.minutes}
                    type="button"
                    onClick={() => handleDailyGoalSelect(option.minutes)}
                    className={`relative flex flex-col items-center rounded-2xl border-2 p-4 transition-all ${
                      data.dailyGoalMinutes === option.minutes
                        ? 'border-[var(--brand-red,#e63946)] bg-[var(--brand-red,#e63946)] text-white'
                        : 'border-border/40 text-foreground hover:border-[var(--brand-red,#e63946)]/50'
                    }`}
                    data-testid={`onboarding-daily-goal-${option.minutes}`}
                  >
                    <Clock className={`mb-2 h-6 w-6 ${
                      data.dailyGoalMinutes === option.minutes ? 'text-white' : 'text-[var(--brand-gold,#f4a261)]'
                    }`} />
                    <span className="text-lg font-bold">{option.label}</span>
                    <span className={`text-xs ${
                      data.dailyGoalMinutes === option.minutes ? 'text-white/80' : 'text-muted-foreground'
                    }`}>
                      {option.description}
                    </span>
                    {data.dailyGoalMinutes === option.minutes && (
                      <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[var(--brand-red,#e63946)]">
                        <Check className="h-3 w-3" />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {/* Summary card */}
              <div className="rounded-2xl border border-[var(--brand-gold,#f4a261)]/30 bg-[var(--brand-gold,#f4a261)]/5 p-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[var(--brand-gold,#f4a261)]/20">
                    <Rocket className="h-5 w-5 text-[var(--brand-gold,#f4a261)]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Ready to start!</h4>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Your <strong className="text-[var(--brand-red,#e63946)]">{data.goal}</strong> journey 
                      begins with <strong className="text-[var(--brand-red,#e63946)]">{data.dailyGoalMinutes} minutes</strong> a day. 
                      Let&apos;s go!
                    </p>
                  </div>
                </div>
              </div>

              {/* Start First Lesson CTA */}
              <WebButton
                onClick={handleNext}
                disabled={isSubmitting}
                className="w-full py-4 text-lg"
                data-testid="onboarding-start"
              >
                {isSubmitting ? (
                  'Setting up...'
                ) : (
                  <>
                    <Rocket className="mr-2 h-5 w-5" />
                    Start Your First Lesson
                  </>
                )}
              </WebButton>
            </div>
          )}
        </WebCard>

        {/* Navigation - 3 steps */}
        <div className="mt-4 flex items-center justify-between gap-4">
          <WebButton
            variant="ghost"
            onClick={handleBack}
            disabled={step === 1 || isSubmitting}
            data-testid="onboarding-back"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </WebButton>

          {(step === 1 || step === 2) && (
            <WebButton
              onClick={handleNext}
              disabled={!canProceed || isSubmitting}
              data-testid="onboarding-next"
            >
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </WebButton>
          )}
        </div>
      </PageContainer>
    </div>
  );
}
