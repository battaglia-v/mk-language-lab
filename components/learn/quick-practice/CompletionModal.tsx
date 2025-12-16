import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { RefreshCcw, RotateCcw, Trophy, Sparkles, TrendingUp, Star } from 'lucide-react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SESSION_TARGET } from '@mk/practice';
import { brandColors } from '@mk/tokens';
import { Badge } from '@/components/ui/badge';
import type { QuickPracticeTalisman } from '@/components/learn/quick-practice/types';
import {
  recordCompletedSession,
  shouldShowReviewPrompt,
  triggerReviewFlow,
  markReviewGiven,
} from '@/lib/in-app-review';

/**
 * Get an encouraging message based on session performance
 */
function getEncouragementMessage(
  accuracy: number,
  correctCount: number,
  t: (key: string, values?: Record<string, string | number>) => string
): { message: string; icon: React.ReactNode } {
  if (accuracy === 100) {
    return {
      message: t('sessionEndPerfectAccuracy'),
      icon: <Trophy className="h-4 w-4 text-yellow-500" />,
    };
  }
  if (accuracy >= 80) {
    return {
      message: t('sessionEndGoodAccuracy'),
      icon: <TrendingUp className="h-4 w-4 text-green-500" />,
    };
  }
  return {
    message: t('sessionEndKeepPracticing'),
    icon: <Sparkles className="h-4 w-4 text-blue-500" />,
  };
}

type CompletionModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  correctCount: number;
  totalAttempts: number;
  accuracy: number;
  sessionProgress: number;
  onRestart: () => void;
  onContinue: () => void;
  onReviewMistakes?: () => void;
  wrongAnswerCount?: number;
  difficultyLabel: string;
  difficultyDescription: string;
  talismans: QuickPracticeTalisman[];
  talismanMultiplier: number;
  talismansEmptyLabel: string;
};

const ACCURACY_BADGES = [
  { threshold: 90, labelKey: 'practiceAccuracyExcellent', color: 'bg-success-soft border-success-soft text-success-strong' },
  { threshold: 70, labelKey: 'practiceAccuracyGood', color: 'bg-surface-gold border-accent-gold text-brand-secondary' },
  { threshold: 0, labelKey: 'practiceAccuracyNeedsWork', color: 'bg-error-soft border-error-soft text-error-strong' },
];

function getAccuracyBadge(accuracy: number) {
  return ACCURACY_BADGES.find((badge) => accuracy >= badge.threshold) ?? ACCURACY_BADGES[2];
}

export function QuickPracticeCompletionModal({
  open,
  onOpenChange,
  correctCount,
  totalAttempts,
  accuracy,
  sessionProgress,
  onRestart,
  onContinue,
  onReviewMistakes,
  wrongAnswerCount = 0,
  difficultyLabel,
  difficultyDescription,
  talismans,
  talismanMultiplier,
  talismansEmptyLabel,
}: CompletionModalProps) {
  const t = useTranslations('learn');
  const badge = getAccuracyBadge(accuracy);
  const bonusPercent = Math.round((talismanMultiplier - 1) * 100);
  const hasWrongAnswers = wrongAnswerCount > 0 && onReviewMistakes;
  const encouragement = getEncouragementMessage(accuracy, correctCount, t);

  const [showReviewPrompt, setShowReviewPrompt] = useState(false);
  const [reviewFlowTriggered, setReviewFlowTriggered] = useState(false);

  // Record session completion and check if we should show review prompt
  useEffect(() => {
    if (!open) {
      setShowReviewPrompt(false);
      setReviewFlowTriggered(false);
      return;
    }

    // Record this session
    recordCompletedSession({
      accuracy,
      correctCount,
      totalAttempts,
      hadErrors: wrongAnswerCount > 0,
    });

    // Check if we should show review prompt
    const shouldShow = shouldShowReviewPrompt({
      accuracy,
      hadErrors: wrongAnswerCount > 0,
    });

    setShowReviewPrompt(shouldShow);
  }, [open, accuracy, correctCount, totalAttempts, wrongAnswerCount]);

  // Handle review button click
  const handleReviewClick = async () => {
    setReviewFlowTriggered(true);
    await triggerReviewFlow();
    markReviewGiven();
    setShowReviewPrompt(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-lg">
          <div className="confetti-container">
            {[...Array(30)].map((_, i) => (
              <div
                key={i}
                className="confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  backgroundColor: [
                    brandColors.green,
                    brandColors.gold,
                    brandColors.red,
                    brandColors.plum,
                    '#0ea5e9',
                  ][Math.floor(Math.random() * 5)],
                }}
              />
            ))}
          </div>
        </div>

        <DialogHeader className="relative z-10">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-secondary/20">
            <Trophy className="h-8 w-8 text-primary" />
          </div>
          <DialogTitle className="text-center text-2xl">{t('practiceSessionCompleteTitle')}</DialogTitle>
          <DialogDescription className="text-center">
            {t('practiceSessionCompleteMessage', { target: SESSION_TARGET })}
          </DialogDescription>
          {/* Encouragement message based on performance */}
          <div className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-muted/50 px-4 py-2.5">
            {encouragement.icon}
            <span className="text-sm font-medium text-foreground">{encouragement.message}</span>
          </div>
        </DialogHeader>

        {/* In-App Review Prompt - shown after positive sessions */}
        {showReviewPrompt && !reviewFlowTriggered && (
          <div className="relative z-10 mx-4 mt-4 animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
            <div className="rounded-xl border border-primary/30 bg-gradient-to-br from-primary/10 to-secondary/10 p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 rounded-full bg-primary/20 p-2">
                  <Star className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 space-y-2">
                  <h4 className="text-sm font-semibold text-foreground">{t('reviewPromptTitle')}</h4>
                  <p className="text-xs text-muted-foreground">{t('reviewPromptMessage')}</p>
                  <div className="flex gap-2 pt-1">
                    <Button size="sm" onClick={handleReviewClick} className="flex-1 gap-1.5">
                      <Star className="h-3.5 w-3.5" />
                      {t('reviewPromptYes')}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setShowReviewPrompt(false)} className="flex-1">
                      {t('reviewPromptLater')}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="relative z-10 space-y-4 py-4">
          <div className="rounded-xl border border-border/40 bg-muted/30 p-4">
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {t('practiceSessionCompleteStats')}
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t('practiceSessionCompleteCorrect')}</span>
                <span className="text-lg font-bold text-primary">{correctCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t('practiceSessionCompleteTotalAttempts')}</span>
                <span className="text-lg font-bold">{totalAttempts}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t('practiceSessionCompleteAccuracy')}</span>
                <span className={cn('inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-bold', badge.color)}>
                  {accuracy}% • {t(badge.labelKey)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 px-1 pb-4">
          <div className="h-2 w-full overflow-hidden rounded-full bg-border/40">
            <div
              role="progressbar"
              aria-valuenow={sessionProgress}
              aria-valuemin={0}
              aria-valuemax={100}
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${sessionProgress}%` }}
            />
          </div>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            {t('practiceProgressSummary', { count: totalAttempts })}
          </p>
          {/* Streak hint */}
          <p className="mt-1.5 text-center text-xs text-muted-foreground/80 italic">
            {t('sessionEndStreakHint')}
          </p>
        </div>

        <div className="relative z-10 space-y-2 rounded-xl border border-border/40 bg-muted/30 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {t('practiceDifficultyLabel')}
            </span>
            <span className="text-sm font-semibold text-foreground">{difficultyLabel}</span>
          </div>
          <p className="text-xs text-muted-foreground">{difficultyDescription}</p>
          <div className="mt-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {t('practiceTalismansLabel')}
              </span>
              {bonusPercent > 0 ? (
                <span className="text-xs font-semibold text-primary">
                  {t('practiceTalismanMultiplier', { value: bonusPercent })}
                </span>
              ) : null}
            </div>
            {talismans.length ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {talismans.map((talisman) => (
                  <Badge key={talisman.id} variant="secondary" className="text-xs">
                    {talisman.title}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-xs text-muted-foreground">{talismansEmptyLabel}</p>
            )}
          </div>
        </div>

        <DialogFooter className="relative z-10 flex-col gap-2 sm:flex-col">
          {hasWrongAnswers && (
            <Button onClick={onReviewMistakes} variant="secondary" size="lg" className="w-full gap-2">
              <RotateCcw className="h-4 w-4" />
              {t('practiceReviewMistakes', { count: wrongAnswerCount })}
            </Button>
          )}
          <Button onClick={onRestart} size="lg" className="w-full gap-2">
            <RefreshCcw className="h-4 w-4" />
            {t('practiceStartNewSession')}
          </Button>
          <Button onClick={onContinue} variant="ghost" size="lg" className="w-full">
            {t('practiceContinueLearning')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
