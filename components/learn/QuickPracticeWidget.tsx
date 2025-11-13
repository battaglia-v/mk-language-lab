'use client';

import { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { Sparkles, PlayCircle, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Dialog, DialogClose, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { trackEvent, AnalyticsEvents } from '@/lib/analytics';
import { CONFETTI_STYLES } from '@/components/learn/quick-practice/confetti';
import practiceE2EFixture from '@/data/practice-e2e.json';
import { QuickPracticeCompletionModal } from '@/components/learn/quick-practice/CompletionModal';
import { QuickPracticeGameOverModal } from '@/components/learn/quick-practice/GameOverModal';
import { QuickPracticeHeader } from '@/components/learn/quick-practice/Header';
import { QuickPracticePrompt } from '@/components/learn/quick-practice/Prompt';
import { QuickPracticeControls } from '@/components/learn/quick-practice/Controls';
import { useQuickPracticeSession } from '@/components/learn/quick-practice/useQuickPracticeSession';
import { ALL_CATEGORIES, SESSION_TARGET } from '@/components/learn/quick-practice/constants';
import { formatCategory } from '@/components/learn/quick-practice/utils';
import type { PracticeItem } from '@/components/learn/quick-practice/types';
import type { QuickPracticeSessionOptions } from '@/components/learn/quick-practice/useQuickPracticeSession';

type QuickPracticeWidgetProps = {
  title?: string;
  description?: string;
  className?: string;
  layout?: 'default' | 'compact';
};

const E2E_PRACTICE_PROMPTS = practiceE2EFixture as PracticeItem[];

export function QuickPracticeWidget({
  title,
  description,
  className,
  layout = 'default',
}: QuickPracticeWidgetProps) {
  const t = useTranslations('learn');
  const searchParams = useSearchParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const formRef = useRef<HTMLFormElement | null>(null);

  const fixtureKey = searchParams?.get('practiceFixture');
  const forcedPromptIdParam = searchParams?.get('practicePromptId');
  const promptsOverride = useMemo<PracticeItem[] | undefined>(() => {
    if (!fixtureKey) return undefined;
    if (fixtureKey === 'e2e') {
      return E2E_PRACTICE_PROMPTS;
    }
    return undefined;
  }, [fixtureKey]);
  const sessionOptions = useMemo<QuickPracticeSessionOptions | undefined>(() => {
    if (!promptsOverride && !forcedPromptIdParam) {
      return undefined;
    }
    return {
      prompts: promptsOverride,
      initialPromptId: forcedPromptIdParam ?? promptsOverride?.[0]?.id ?? null,
    };
  }, [forcedPromptIdParam, promptsOverride]);

  const {
    categories,
    category,
    setCategory,
    direction,
    setDirection,
    practiceMode,
    setPracticeMode,
    answer,
    setAnswer,
    feedback,
    revealedAnswer,
    totalAttempts,
    correctCount,
    sessionProgress,
    accuracy,
    hearts,
    isShaking,
    isSubmitting,
    isCelebrating,
    showCompletionModal,
    setShowCompletionModal,
    showGameOverModal,
    setShowGameOverModal,
    isClozeMode,
    hasAvailablePrompts,
    currentItem,
    clozeContext,
    clozeParts,
    handleCheck: submitAnswer,
    handleNext: nextPrompt,
    handleReveal: revealAnswer,
    handleReset: resetSession,
    handleContinue: continueSession,
    categoryButtonRef,
    categoryMenuRef,
    isCategoryMenuOpen,
    setIsCategoryMenuOpen,
    isActionMenuOpen,
    setIsActionMenuOpen,
    streak,
    xp,
    level,
  } = useQuickPracticeSession(sessionOptions);

  const promptLabel = isClozeMode
    ? t('practiceClozePromptLabel')
    : direction === 'mkToEn'
      ? t('practicePromptLabelMk')
      : t('practicePromptLabelEn');
  const placeholder = isClozeMode
    ? t('practiceClozePlaceholder')
    : direction === 'mkToEn'
      ? t('practicePlaceholderMk')
      : t('practicePlaceholderEn');
  const promptContent: ReactNode = (() => {
    if (!currentItem) {
      return '—';
    }
    if (isClozeMode && clozeContext && clozeParts) {
      return clozeParts.segments.reduce<ReactNode[]>((acc, segment, index) => {
        if (segment) {
          acc.push(
            <span key={`segment-${index}`} className="whitespace-pre-wrap">
              {segment}
            </span>
          );
        }
        if (index < clozeParts.segments.length - 1) {
          acc.push(
            <span
              key={`blank-${index}`}
              className="mx-1 inline-flex min-w-[72px] justify-center rounded-full border border-dashed border-border/60 bg-muted px-3 py-1 text-sm font-semibold uppercase tracking-wide text-muted-foreground"
            >
              ______
            </span>
          );
        }
        return acc;
      }, []);
    }
    return direction === 'mkToEn' ? currentItem.macedonian : currentItem.english;
  })();
  const clozeTranslation = isClozeMode ? clozeContext?.translation : null;
  const categoryValue = currentItem?.category ? formatCategory(currentItem.category) : t('practiceAllCategories');
  const categoryLabel = `${t('practiceCategoryLabel')}: ${categoryValue}`;

  const accuracyBadge = getAccuracyBadge(accuracy);
  const accuracyValueLabel = t('practiceAccuracy', { value: accuracy });
  const accuracyAccent: 'green' | 'gold' | 'red' =
    accuracy >= 90 ? 'green' : accuracy >= 70 ? 'gold' : 'red';
  const normalizedCorrect = Math.min(correctCount, SESSION_TARGET);
  const inlineProgressLabel = t('practiceInlineProgress', {
    current: normalizedCorrect,
    target: SESSION_TARGET,
    accuracy,
  });

  const isReady = Boolean(currentItem);

  // Helper function to get accuracy badge color and label
  function getAccuracyBadge(accuracyValue: number) {
    if (accuracyValue >= 90) {
      return {
        color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
        label: t('practiceAccuracyExcellent'),
      };
    } else if (accuracyValue >= 70) {
      return {
        color: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
        label: t('practiceAccuracyGood'),
      };
    }
    return {
      color: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
      label: t('practiceAccuracyNeedsWork'),
    };
  }

  // Progress based on correct answers (5 correct = 100%)
  const completionModalElement = (
    <QuickPracticeCompletionModal
      open={showCompletionModal}
      onOpenChange={setShowCompletionModal}
      correctCount={correctCount}
      totalAttempts={totalAttempts}
      accuracy={accuracy}
      sessionProgress={sessionProgress}
      onRestart={resetSession}
      onContinue={continueSession}
    />
  );
  const gameOverModalElement = (
    <QuickPracticeGameOverModal
      open={showGameOverModal}
      onOpenChange={setShowGameOverModal}
      onReset={resetSession}
      stats={{ correctCount, totalAttempts, accuracy }}
    />
  );
  const summarySubtitle = description ?? t('quickPracticeDescription');
  const isPrimaryDisabled = !isReady || !answer.trim() || isSubmitting;
  const headerTitle = title ?? t('quickPractice');
  const progressValueLabel = `${normalizedCorrect}/${SESSION_TARGET}`;
  const progressLabel = t('quickPractice');
  const categoryLabelText = t('practiceCategoryLabel');
  const clozeTranslationLabel = t('practiceClozeTranslationLabel');
  const toggleSettings = () => setShowSettings((prev) => !prev);

  const renderPracticeCard = (variant: 'default' | 'modal', extraClassName?: string) => {
    const isModalVariant = variant === 'modal';

    return (
      <div
        className={cn(
          'relative overflow-hidden transition-all duration-500',
          isModalVariant
            ? 'border border-border/40 rounded-2xl bg-gradient-to-br from-card/85 via-card/70 to-muted/40 backdrop-blur supports-[backdrop-filter]:backdrop-blur-xl shadow-2xl'
            : 'flex-1 flex flex-col',
          extraClassName
        )}
      >
        {isCelebrating && (
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/20 to-primary/0 opacity-90 animate-pulse"
            aria-hidden="true"
          />
        )}
        <span className="sr-only" aria-live="polite">
          {t('practiceProgressSummary', { count: totalAttempts })}
        </span>
        <span className="sr-only" aria-live="polite">
          {t('practiceProgressSummary', { count: correctCount })}
        </span>

        <QuickPracticeHeader
          title={headerTitle}
          summarySubtitle={summarySubtitle}
          isModalVariant={isModalVariant}
          isInputFocused={isInputFocused}
          streak={streak}
          hearts={hearts}
          level={level}
          xp={xp}
          sessionProgress={sessionProgress}
          progressValueLabel={progressValueLabel}
          progressLabel={progressLabel}
          accuracyBadgeLabel={accuracyBadge.label}
          accuracyValueLabel={accuracyValueLabel}
          accuracyAccent={accuracyAccent}
          categoryValue={categoryValue}
          categoryLabelText={categoryLabelText}
          inlineProgressLabel={inlineProgressLabel}
          onToggleSettings={toggleSettings}
        />

        <QuickPracticeControls
          isModalVariant={isModalVariant}
          isInputFocused={isInputFocused}
          setIsInputFocused={setIsInputFocused}
          showSettings={showSettings}
          categories={categories}
          category={category}
          setCategory={setCategory}
          categoryButtonRef={categoryButtonRef}
          categoryMenuRef={categoryMenuRef}
          isCategoryMenuOpen={isCategoryMenuOpen}
          setIsCategoryMenuOpen={setIsCategoryMenuOpen}
          direction={direction}
          setDirection={setDirection}
          practiceMode={practiceMode}
          setPracticeMode={setPracticeMode}
          answer={answer}
          setAnswer={setAnswer}
          placeholder={placeholder}
          isReady={isReady}
          hasAvailablePrompts={hasAvailablePrompts}
          onNextPrompt={nextPrompt}
          formRef={formRef}
          isPrimaryDisabled={isPrimaryDisabled}
          isSubmitting={isSubmitting}
          onSubmit={submitAnswer}
          isActionMenuOpen={isActionMenuOpen}
          setIsActionMenuOpen={setIsActionMenuOpen}
          onRevealAnswer={revealAnswer}
          onReset={resetSession}
          feedback={feedback}
          revealedAnswer={revealedAnswer}
          translate={t}
          isShaking={isShaking}
          isClozeMode={isClozeMode}
        >
          <QuickPracticePrompt
            label={promptLabel}
            content={promptContent}
            categoryLabel={categoryLabel}
            isClozeMode={isClozeMode}
            clozeTranslation={clozeTranslation}
            clozeTranslationLabel={clozeTranslationLabel}
            isInputFocused={isInputFocused}
            isModalVariant={isModalVariant}
          />
        </QuickPracticeControls>
      </div>
    );
  };

  // Track when modal is opened (only for compact layout)
  useEffect(() => {
    if (layout === 'compact' && isModalOpen) {
      trackEvent(AnalyticsEvents.PRACTICE_MODAL_OPENED, {
        direction,
        category: category === ALL_CATEGORIES ? 'all' : category,
        drillMode: practiceMode,
      });
    }
  }, [isModalOpen, direction, category, layout, practiceMode]);

  // Track when completion modal is viewed
  useEffect(() => {
    if (showCompletionModal) {
      trackEvent(AnalyticsEvents.PRACTICE_COMPLETION_MODAL_VIEWED, {
        direction,
        category: category === ALL_CATEGORIES ? 'all' : category,
        drillMode: practiceMode,
        correctCount,
        totalAttempts,
        accuracy,
      });
    }
  }, [showCompletionModal, direction, category, correctCount, totalAttempts, accuracy, practiceMode]);

  if (layout !== 'compact') {
    return (
      <>
        {renderPracticeCard('default', className)}
        {completionModalElement}
        {gameOverModalElement}
      </>
    );
  }

  return (
    <>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <Card
        className={cn(
          'relative h-full overflow-hidden rounded-2xl border border-border/40 bg-gradient-to-br from-primary/10 via-background/40 to-secondary/10 p-6 transition-all duration-300',
          className
        )}
      >
        <div className="space-y-6">
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-foreground md:text-2xl">
              {title ?? t('quickPractice')}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t('quickPracticeLaunchDescription')}
            </p>
          </div>

          {/* Mode Selector - visible before opening modal */}
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t('practiceModeLabel')}
            </span>
            <div className="flex w-full gap-2 rounded-xl border border-border/60 bg-background/60 p-1">
              <Button
                type="button"
                size="sm"
                variant={direction === 'mkToEn' ? 'default' : 'ghost'}
                onClick={() => setDirection('mkToEn')}
                className="flex-1"
              >
                {t('practiceModeMkToEn')}
              </Button>
              <Button
                type="button"
                size="sm"
                variant={direction === 'enToMk' ? 'default' : 'ghost'}
                onClick={() => setDirection('enToMk')}
                className="flex-1"
              >
                {t('practiceModeEnToMk')}
              </Button>
            </div>
          </div>

          {/* Progress Stats */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>{t('practiceProgressSummary', { count: totalAttempts })}</span>
            </div>
            {totalAttempts > 0 && (
              <span className="text-primary font-medium">
                {Math.round((correctCount / totalAttempts) * 100)}% {t('practiceAccuracy', { value: '' }).split(':')[0]}
              </span>
            )}
          </div>

          {/* Launch Button */}
          <DialogTrigger asChild>
            <Button type="button" size="lg" className="w-full btn-glow gap-3">
              <PlayCircle className="h-5 w-5" />
              {t('quickPracticeLaunch')}
            </Button>
          </DialogTrigger>
        </div>
      </Card>
      <DialogContent
        showCloseButton={false}
        className="h-[85vh] md:h-[90vh] max-h-[680px] md:max-h-[760px] w-[min(96vw,900px)] max-w-none border border-border/40 bg-background/95 p-0 shadow-2xl"
      >
        <div className="flex h-full flex-col overflow-hidden">
          <div className="flex items-center justify-between border-b border-border/40 px-6 py-4">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t('practiceModalTitle')}
              </p>
              <h3 className="text-lg font-semibold text-foreground">
                {title ?? t('quickPractice')}
              </h3>
            </div>
            <DialogClose asChild>
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-border/40 bg-background/60 text-muted-foreground transition hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                aria-label={t('practiceClose')}
              >
                <X className="h-5 w-5" />
              </button>
            </DialogClose>
          </div>
          <div className="flex-1 overflow-y-auto bg-gradient-to-br from-background via-background to-muted/20 p-4 sm:p-6 lg:p-8">
            {renderPracticeCard('modal')}
          </div>
        </div>
      </DialogContent>

        <style
          data-confetti
          dangerouslySetInnerHTML={{ __html: CONFETTI_STYLES }}
        />
      </Dialog>
      {completionModalElement}
      {gameOverModalElement}
    </>
  );
}
