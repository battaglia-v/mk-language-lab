import { Dispatch, FormEvent, PointerEvent, RefObject, SetStateAction, useRef, useState } from 'react';
import { RefreshCcw, Eye, Settings, Check, XCircle, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { PracticeDirection, PracticeDrillMode, PracticeDifficultyId, PracticeDifficultyPreset } from '@/components/learn/quick-practice/types';

type Translate = (key: string, values?: Record<string, string | number | Date>) => string;

export type QuickPracticeControlsProps = {
  isModalVariant: boolean;
  isInputFocused: boolean;
  setIsInputFocused: Dispatch<SetStateAction<boolean>>;
  direction: PracticeDirection;
  setDirection: Dispatch<SetStateAction<PracticeDirection>>;
  practiceMode: PracticeDrillMode;
  setPracticeMode: Dispatch<SetStateAction<PracticeDrillMode>>;
  difficulty: PracticeDifficultyId;
  setDifficulty: Dispatch<SetStateAction<PracticeDifficultyId>>;
  difficultyOptions: PracticeDifficultyPreset[];
  difficultyLabelText: string;
  answer: string;
  setAnswer: Dispatch<SetStateAction<string>>;
  placeholder: string;
  isReady: boolean;
  hasAvailablePrompts: boolean;
  isLoadingPrompts?: boolean;
  onNextPrompt: () => void;
  formRef: RefObject<HTMLFormElement | null>;
  isPrimaryDisabled: boolean;
  isSubmitting: boolean;
  onSubmit: () => Promise<void> | void;
  onRevealAnswer: () => void;
  onReset: () => void;
  feedback: 'correct' | 'incorrect' | null;
  revealedAnswer: string;
  translate: Translate;
  isShaking: boolean;
  isClozeMode: boolean;
  promptNotice?: string | null;
};

export function QuickPracticeControls({
  isModalVariant,
  isInputFocused,
  setIsInputFocused,
  direction,
  setDirection,
  practiceMode,
  setPracticeMode,
  difficulty,
  setDifficulty,
  difficultyOptions,
  difficultyLabelText,
  answer,
  setAnswer,
  placeholder,
  isReady,
  hasAvailablePrompts,
  isLoadingPrompts,
  onNextPrompt,
  formRef,
  isPrimaryDisabled,
  isSubmitting,
  onSubmit,
  onRevealAnswer,
  onReset,
  feedback,
  revealedAnswer,
  translate,
  isShaking,
  isClozeMode,
  promptNotice,
}: QuickPracticeControlsProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const focusInput = () => {
    if (inputRef.current) {
      inputRef.current.focus({ preventScroll: true });
      setIsInputFocused(true);
    }
  };

  const submitIfReady = async () => {
    if (isPrimaryDisabled) return;
    try {
      await Promise.resolve(onSubmit());
    } finally {
      focusInput();
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submitIfReady();
  };

  const handleTouchSubmit = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.pointerType !== 'touch') return;
    event.preventDefault();
    submitIfReady();
  };

  return (
    <div className={cn('flex flex-col gap-4', isModalVariant ? 'px-6 pb-4 md:px-10 md:pb-6 lg:px-12' : 'px-2 sm:px-4 pb-5')}>
      <form ref={formRef} className="space-y-3" onSubmit={handleSubmit}>
        <div
          className={cn(
            'rounded-3xl border border-white/10 bg-white/6 px-4 py-4 shadow-[0_14px_30px_rgba(0,0,0,0.26)] transition-all duration-200',
            isShaking && 'ring-2 ring-[var(--brand-red)]/40',
            isInputFocused && 'border-primary/50 ring-2 ring-primary/25 bg-white/8'
          )}
        >
          <Input
            ref={inputRef}
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setTimeout(() => setIsInputFocused(false), 100)}
            placeholder={placeholder}
            className="h-auto min-h-[60px] border-0 bg-transparent px-1 text-lg font-semibold placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:outline-none md:text-xl"
            aria-label={placeholder}
            disabled={!isReady}
          />
        </div>

        <div className="space-y-2">
          <Button
            type="submit"
            size="lg"
            className="w-full rounded-2xl bg-gradient-to-r from-primary to-primary/90 py-3.5 text-base font-semibold shadow-[0_14px_28px_rgba(0,0,0,0.28)]"
            disabled={isPrimaryDisabled}
            onPointerDown={handleTouchSubmit}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                {translate('practiceCheckingAnswer')}
              </>
            ) : (
              translate('checkAnswer')
            )}
          </Button>

          <div className="flex flex-wrap items-center gap-2">
            {hasAvailablePrompts && (
              <Button
                type="button"
                variant="secondary"
                size="lg"
                onClick={onNextPrompt}
                className="flex-1 min-w-[120px] rounded-2xl bg-white/8 text-foreground"
              >
                <RefreshCcw className="mr-2 h-4 w-4" />
                {translate('nextPrompt')}
              </Button>
            )}

            {isReady && (
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={onRevealAnswer}
                className="flex-1 min-w-[100px] rounded-2xl"
              >
                <Eye className="mr-2 h-4 w-4" />
                {translate('practiceRevealAnswer')}
              </Button>
            )}

            <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
              <DialogTrigger asChild>
                <Button type="button" variant="outline" size="icon" className="h-11 w-11 flex-shrink-0 rounded-xl" aria-label="Open practice settings">
                  <Settings className="h-4 w-4" aria-hidden="true" />
                </Button>
              </DialogTrigger>
            <DialogContent className="max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Practice Settings</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">{difficultyLabelText}</h3>
                  <div className="space-y-1.5">
                    {difficultyOptions.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        className={cn(
                          'w-full rounded-lg border px-3 py-2 text-left text-sm transition',
                          preset.id === difficulty
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border/50 hover:border-primary/40'
                        )}
                        onClick={() => setDifficulty(preset.id)}
                      >
                        <p className="font-semibold">{preset.label}</p>
                        <p className="text-xs text-muted-foreground">{preset.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">{translate('practiceModeLabel')}</h3>
                  <div className="space-y-1.5">
                    <Button
                      type="button"
                      variant={direction === 'mkToEn' ? 'default' : 'outline'}
                      onClick={() => setDirection('mkToEn')}
                      className="w-full justify-start"
                    >
                      {translate('practiceModeMkToEn')}
                    </Button>
                    <Button
                      type="button"
                      variant={direction === 'enToMk' ? 'default' : 'outline'}
                      onClick={() => setDirection('enToMk')}
                      className="w-full justify-start"
                    >
                      {translate('practiceModeEnToMk')}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">{translate('practiceDrillModeLabel')}</h3>
                  <div className="space-y-1.5">
                    <Button
                      type="button"
                      variant={practiceMode === 'flashcard' ? 'default' : 'outline'}
                      onClick={() => setPracticeMode('flashcard')}
                      className="w-full justify-start"
                    >
                      {translate('practiceDrillModeFlashcard')}
                    </Button>
                    <Button
                      type="button"
                      variant={practiceMode === 'cloze' ? 'default' : 'outline'}
                      onClick={() => setPracticeMode('cloze')}
                      className="w-full justify-start"
                    >
                      {translate('practiceDrillModeCloze')}
                    </Button>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    onReset();
                    setIsSettingsOpen(false);
                  }}
                  disabled={!isReady && !answer}
                  className="w-full"
                >
                  {translate('practiceReset')}
                </Button>
              </div>
            </DialogContent>
            </Dialog>
          </div>
        </div>
      </form>

      {promptNotice && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm dark:border-amber-900/60 dark:bg-amber-950/40">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 text-amber-500" />
          <span className="text-amber-900 dark:text-amber-200">{promptNotice}</span>
        </div>
      )}

      {feedback && isReady && (
        <div
          className={cn(
            'flex items-start gap-2 rounded-lg border-2 px-3 py-2',
            feedback === 'correct' ? 'border-green-500/50 bg-green-50 dark:bg-green-950/30' : 'border-red-500/50 bg-red-50 dark:bg-red-950/30',
            isShaking && feedback === 'incorrect' && 'animate-shake'
          )}
        >
          <div className={cn('flex h-7 w-7 items-center justify-center rounded-full', feedback === 'correct' ? 'bg-green-500/20' : 'bg-red-500/20')}>
            {feedback === 'correct' ? <Check className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-red-600" />}
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold">
              {feedback === 'correct' ? translate('correctAnswer') : translate('incorrectAnswer', { answer: revealedAnswer })}
            </p>
          </div>
        </div>
      )}

      {!feedback && revealedAnswer && (
        <div className="rounded-lg border border-border/40 bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
          {translate('practiceAnswerRevealed', { answer: revealedAnswer })}
        </div>
      )}

      {!hasAvailablePrompts && !isLoadingPrompts && !promptNotice && (
        <p className="text-sm text-muted-foreground">
          {isClozeMode ? translate('practiceClozeUnavailable') : translate('practiceEmptyCategory')}
        </p>
      )}
    </div>
  );
}
