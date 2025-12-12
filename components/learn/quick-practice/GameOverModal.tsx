import { useTranslations } from 'next-intl';
import { Heart, RefreshCcw, RotateCcw } from 'lucide-react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const ACCURACY_BADGES = [
  { threshold: 90, labelKey: 'practiceAccuracyExcellent', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
  { threshold: 70, labelKey: 'practiceAccuracyGood', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
  { threshold: 0, labelKey: 'practiceAccuracyNeedsWork', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
];

const getAccuracyBadge = (accuracy: number) =>
  ACCURACY_BADGES.find((badge) => accuracy >= badge.threshold) ?? ACCURACY_BADGES[2];

type GameOverModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReset: () => void;
  onReviewMistakes?: () => void;
  wrongAnswerCount?: number;
  stats: {
    correctCount: number;
    totalAttempts: number;
    accuracy: number;
  };
};

export function QuickPracticeGameOverModal({ open, onOpenChange, onReset, onReviewMistakes, wrongAnswerCount = 0, stats }: GameOverModalProps) {
  const t = useTranslations('learn');
  const badge = getAccuracyBadge(stats.accuracy);
  const hasWrongAnswers = wrongAnswerCount > 0 && onReviewMistakes;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[rgba(215,38,61,0.2)] to-[rgba(215,38,61,0.1)] text-[var(--brand-red)]">
            <Heart className="h-8 w-8" />
          </div>
          <DialogTitle className="text-center text-2xl">{t('practiceGameOverTitle')}</DialogTitle>
          <DialogDescription className="text-center">
            {t('practiceGameOverSubtitle')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="rounded-xl border border-border/40 bg-muted/30 p-4">
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {t('practiceSessionCompleteStats')}
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t('practiceSessionCompleteCorrect')}</span>
                <span className="text-lg font-bold text-primary">{stats.correctCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t('practiceSessionCompleteTotalAttempts')}</span>
                <span className="text-lg font-bold">{stats.totalAttempts}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t('practiceSessionCompleteAccuracy')}</span>
                <span className={cn('inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-bold', badge.color)}>
                  {stats.accuracy}% • {t(badge.labelKey)}
                </span>
              </div>
            </div>
          </div>
          <p className="text-center text-sm text-muted-foreground">{t('practiceGameOverHint')}</p>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          {hasWrongAnswers && (
            <Button onClick={onReviewMistakes} variant="secondary" className="w-full gap-2">
              <RotateCcw className="h-4 w-4" />
              {t('practiceReviewMistakes', { count: wrongAnswerCount })}
            </Button>
          )}
          <Button onClick={onReset} className="w-full gap-2">
            <RefreshCcw className="h-4 w-4" />
            {t('practiceTryAgain')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
