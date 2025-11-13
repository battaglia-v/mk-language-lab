import type {
  Dispatch,
  FormEvent,
  MouseEvent,
  PointerEvent,
  ReactNode,
  RefObject,
  SetStateAction,
} from 'react';
import { RefreshCcw, Eye, EllipsisVertical, Check, XCircle, ChevronDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { ALL_CATEGORIES } from '@/components/learn/quick-practice/constants';
import { formatCategory } from '@/components/learn/quick-practice/utils';
import type { PracticeDirection, PracticeDrillMode } from '@/components/learn/quick-practice/types';

type Translate = (key: string, values?: Record<string, string | number | Date>) => string;

export type QuickPracticeControlsProps = {
  children: ReactNode;
  isModalVariant: boolean;
  isInputFocused: boolean;
  setIsInputFocused: Dispatch<SetStateAction<boolean>>;
  showSettings: boolean;
  categories: string[];
  category: string;
  setCategory: Dispatch<SetStateAction<string>>;
  categoryButtonRef: RefObject<HTMLButtonElement | null>;
  categoryMenuRef: RefObject<HTMLDivElement | null>;
  isCategoryMenuOpen: boolean;
  setIsCategoryMenuOpen: Dispatch<SetStateAction<boolean>>;
  direction: PracticeDirection;
  setDirection: Dispatch<SetStateAction<PracticeDirection>>;
  practiceMode: PracticeDrillMode;
  setPracticeMode: Dispatch<SetStateAction<PracticeDrillMode>>;
  answer: string;
  setAnswer: Dispatch<SetStateAction<string>>;
  placeholder: string;
  isReady: boolean;
  hasAvailablePrompts: boolean;
  onNextPrompt: () => void;
  formRef: RefObject<HTMLFormElement | null>;
  isPrimaryDisabled: boolean;
  isSubmitting: boolean;
  onSubmit: () => Promise<void> | void;
  isActionMenuOpen: boolean;
  setIsActionMenuOpen: Dispatch<SetStateAction<boolean>>;
  onRevealAnswer: () => void;
  onReset: () => void;
  feedback: 'correct' | 'incorrect' | null;
  revealedAnswer: string;
  translate: Translate;
  isShaking: boolean;
  isClozeMode: boolean;
};

export function QuickPracticeControls({
  children,
  isModalVariant,
  isInputFocused,
  setIsInputFocused,
  showSettings,
  categories,
  category,
  setCategory,
  categoryButtonRef,
  categoryMenuRef,
  isCategoryMenuOpen,
  setIsCategoryMenuOpen,
  direction,
  setDirection,
  practiceMode,
  setPracticeMode,
  answer,
  setAnswer,
  placeholder,
  isReady,
  hasAvailablePrompts,
  onNextPrompt,
  formRef,
  isPrimaryDisabled,
  isSubmitting,
  onSubmit,
  isActionMenuOpen,
  setIsActionMenuOpen,
  onRevealAnswer,
  onReset,
  feedback,
  revealedAnswer,
  translate,
  isShaking,
  isClozeMode,
}: QuickPracticeControlsProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isPrimaryDisabled) {
      return;
    }
    void onSubmit();
  };

  const handleInstantSubmit = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.pointerType !== 'touch' || isPrimaryDisabled) {
      return;
    }
    event.preventDefault();
    const targetForm = formRef.current;
    if (targetForm) {
      if (typeof targetForm.requestSubmit === 'function') {
        targetForm.requestSubmit();
      } else {
        targetForm.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
      }
      return;
    }
    void onSubmit();
  };

  const handleButtonClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (isPrimaryDisabled) {
      return;
    }
    event.preventDefault();
    void onSubmit();
  };

  return (
    <div
      className={cn(
        'flex-1 flex flex-col space-y-2 md:space-y-4',
        isModalVariant ? 'px-6 pb-6 md:px-10 md:pb-10 lg:px-12' : 'pb-4 md:pb-6'
      )}
    >
      {!isInputFocused && (
        <div
          className={cn(
            'flex gap-2 md:gap-4',
            isModalVariant ? 'flex-col lg:flex-row lg:items-end lg:gap-6' : 'flex-col sm:flex-row sm:items-end',
            !showSettings && 'hidden md:flex'
          )}
        >
          <div className={cn('space-y-1.5', isModalVariant ? 'w-full lg:flex-1' : 'flex-1')}>
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {translate('practiceFilterLabel')}
            </span>
            <div className="relative">
              <button
                ref={categoryButtonRef}
                type="button"
                role="combobox"
                aria-label={translate('practiceFilterLabel')}
                aria-haspopup="listbox"
                aria-expanded={isCategoryMenuOpen}
                aria-controls="practice-category-options"
                className={cn(
                  'flex w-full items-center justify-between rounded-md border border-border/60 bg-background/80 px-3 py-2 text-sm font-medium text-foreground transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
                  isModalVariant && 'md:h-12 md:text-base',
                  isCategoryMenuOpen && 'ring-2 ring-ring/50'
                )}
                onClick={() => setIsCategoryMenuOpen((prev) => !prev)}
              >
                <span className="truncate">
                  {category === ALL_CATEGORIES ? translate('practiceAllCategories') : formatCategory(category)}
                </span>
                <ChevronDown className={cn('h-4 w-4 transition-transform', isCategoryMenuOpen && 'rotate-180')} />
              </button>
              {isCategoryMenuOpen && (
                <div
                  ref={categoryMenuRef}
                  id="practice-category-options"
                  role="listbox"
                  className="absolute z-20 mt-2 w-full rounded-md border border-border/40 bg-background/95 p-1 shadow-lg"
                >
                  {[ALL_CATEGORIES, ...categories].map((cat) => {
                    const isSelected = category === cat;
                    return (
                      <button
                        key={cat || 'all'}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        className={cn(
                          'flex w-full items-center justify-between rounded-sm px-3 py-1.5 text-left text-sm',
                          isSelected ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-muted'
                        )}
                        onClick={() => {
                          setCategory(cat);
                          setIsCategoryMenuOpen(false);
                        }}
                      >
                        <span>{cat === ALL_CATEGORIES ? translate('practiceAllCategories') : formatCategory(cat)}</span>
                        {isSelected && <Check className="h-4 w-4" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className={cn('space-y-1.5', isModalVariant ? 'w-full lg:w-auto' : 'sm:w-auto')}>
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {translate('practiceModeLabel')}
            </span>
            <div
              className={cn(
                'flex rounded-xl border border-border/60 bg-background/60 p-1',
                isModalVariant ? 'flex-col gap-3 lg:flex-row' : 'w-full sm:w-max'
              )}
            >
              <Button
                type="button"
                size="sm"
                variant={direction === 'mkToEn' ? 'default' : 'outline'}
                onClick={() => setDirection('mkToEn')}
                aria-pressed={direction === 'mkToEn'}
                className={cn(isModalVariant && 'md:h-10', 'px-2 text-xs')}
              >
                {translate('practiceModeMkToEn')}
              </Button>
              <Button
                type="button"
                size="sm"
                variant={direction === 'enToMk' ? 'default' : 'outline'}
                onClick={() => setDirection('enToMk')}
                aria-pressed={direction === 'enToMk'}
                className={cn(isModalVariant && 'md:h-10', 'px-2 text-xs')}
              >
                {translate('practiceModeEnToMk')}
              </Button>
            </div>
          </div>

          <div className={cn('space-y-1.5', isModalVariant ? 'w-full lg:w-auto' : 'sm:w-auto')}>
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {translate('practiceDrillModeLabel')}
            </span>
            <div
              className={cn(
                'flex rounded-xl border border-border/60 bg-background/60 p-1',
                isModalVariant ? 'flex-col gap-3 lg:flex-row' : 'w-full sm:w-max'
              )}
            >
              <Button
                type="button"
                size="sm"
                variant={practiceMode === 'flashcard' ? 'default' : 'outline'}
                onClick={() => setPracticeMode('flashcard')}
                aria-pressed={practiceMode === 'flashcard'}
                className={cn(isModalVariant && 'md:h-10', 'px-2 text-xs')}
              >
                {translate('practiceDrillModeFlashcard')}
              </Button>
              <Button
                type="button"
                size="sm"
                variant={practiceMode === 'cloze' ? 'default' : 'outline'}
                onClick={() => setPracticeMode('cloze')}
                aria-pressed={practiceMode === 'cloze'}
                className={cn(isModalVariant && 'md:h-10', 'px-2 text-xs')}
              >
                {translate('practiceDrillModeCloze')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {children}

      <form
        ref={formRef}
        className={cn('space-y-2 md:space-y-4', isInputFocused && 'space-y-1.5 pb-6 md:space-y-4 md:pb-0')}
        onSubmit={handleSubmit}
      >
        <div className="relative">
          <Input
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => {
              setTimeout(() => setIsInputFocused(false), 100);
            }}
            placeholder={placeholder}
            className={cn(
              'rounded-2xl border-2 border-slate-300 dark:border-slate-600 bg-[color:var(--surface-elevated)] text-slate-900 dark:text-white',
              'focus:border-[var(--brand-green)] focus:ring-4 focus:ring-[color:rgb(47_191_113_/_0.25)] transition-all duration-200',
              'font-medium placeholder:text-slate-400',
              isModalVariant ? 'h-14 text-xl' : isInputFocused ? 'h-11 text-base' : 'h-12 text-base md:h-14 md:text-lg',
              'pr-10'
            )}
            aria-label={placeholder}
            disabled={!isReady}
          />
          <button
            type="button"
            onClick={onNextPrompt}
            className="md:hidden absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-muted transition-colors"
            disabled={!hasAvailablePrompts}
            aria-label={translate('practiceSkipPrompt')}
          >
            <RefreshCcw className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        <div className="md:hidden flex flex-col gap-3">
          <Button
            type="button"
            size="lg"
            className={cn(
              'w-full text-base font-bold uppercase tracking-wide shadow-lg hover:shadow-xl transition-all duration-200',
              isInputFocused ? 'h-11' : 'h-14',
              'bg-[var(--brand-green)] hover:bg-[var(--brand-green-dark)] text-white border-b-4 border-[var(--brand-green-dark)] active:border-b-0 active:mt-1',
              'rounded-2xl hover:-translate-y-0.5 active:translate-y-0',
              'disabled:bg-slate-300 disabled:border-slate-400 disabled:text-slate-500 disabled:hover:translate-y-0',
              'flex items-center justify-center gap-2'
            )}
            disabled={isPrimaryDisabled}
            onPointerDown={handleInstantSubmit}
            onClick={handleButtonClick}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                {translate('practiceCheckingAnswer')}
              </>
            ) : (
              translate('checkAnswer')
            )}
          </Button>

          {!isInputFocused && (
            <div className="flex justify-end">
              <DropdownMenu open={isActionMenuOpen} onOpenChange={setIsActionMenuOpen}>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-9 w-9 rounded-full border border-border/50"
                    aria-label={translate('practiceMoreActions')}
                  >
                    <EllipsisVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 text-sm">
                  <DropdownMenuLabel className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {translate('practiceDrillModeLabel')}
                  </DropdownMenuLabel>
                  <DropdownMenuItem
                    onSelect={(event) => {
                      event.preventDefault();
                      setPracticeMode('flashcard');
                    }}
                  >
                    <span className="flex-1">{translate('practiceDrillModeFlashcard')}</span>
                    {practiceMode === 'flashcard' && <Check className="h-3.5 w-3.5 text-primary" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={(event) => {
                      event.preventDefault();
                      setPracticeMode('cloze');
                    }}
                  >
                    <span className="flex-1">{translate('practiceDrillModeCloze')}</span>
                    {practiceMode === 'cloze' && <Check className="h-3.5 w-3.5 text-primary" />}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={(event) => {
                      event.preventDefault();
                      onRevealAnswer();
                    }}
                    disabled={!isReady}
                  >
                    <Eye className="mr-2 h-3.5 w-3.5" />
                    {translate('practiceRevealAnswer')}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={(event) => {
                      event.preventDefault();
                      onReset();
                    }}
                  >
                    <RefreshCcw className="mr-2 h-3.5 w-3.5" />
                    {translate('practiceReset')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        <div className="hidden md:grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Button
            type="submit"
            size={isModalVariant ? 'lg' : 'default'}
            className={cn(
              'w-full gap-2 font-bold uppercase tracking-wide shadow-lg hover:shadow-xl transition-all duration-200',
              'bg-[var(--brand-green)] hover:bg-[var(--brand-green-dark)] text-white border-b-4 border-[var(--brand-green-dark)] active:border-b-0',
              'rounded-2xl hover:-translate-y-0.5 active:translate-y-0 h-12',
              'disabled:bg-slate-300 disabled:border-slate-400 disabled:text-slate-500 disabled:hover:translate-y-0',
              'flex items-center justify-center gap-2'
            )}
            disabled={isPrimaryDisabled}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                {translate('practiceCheckingAnswer')}
              </>
            ) : (
              translate('checkAnswer')
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            size={isModalVariant ? 'lg' : 'default'}
            onClick={onNextPrompt}
            className="w-full gap-2"
            disabled={!hasAvailablePrompts}
          >
            <RefreshCcw className="h-4 w-4" />
            {translate('nextPrompt')}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size={isModalVariant ? 'lg' : 'default'}
            onClick={onRevealAnswer}
            className="w-full gap-2"
            disabled={!isReady}
          >
            <Eye className="h-4 w-4" />
            {translate('practiceRevealAnswer')}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size={isModalVariant ? 'lg' : 'default'}
            onClick={onReset}
            className="w-full gap-2"
            disabled={!isReady && !answer}
          >
            {translate('practiceReset')}
          </Button>
        </div>
      </form>

      {feedback && isReady ? (
        <div
          className={cn(
            'rounded-2xl px-5 py-4 font-bold text-lg flex items-center gap-3 shadow-lg border-2',
            feedback === 'correct'
              ? 'bg-success-soft border-success-soft text-success-strong'
              : 'bg-error-soft border-error-soft text-error-strong',
            isShaking && feedback === 'incorrect' && 'animate-shake'
          )}
        >
          {feedback === 'correct' ? (
            <>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success-soft flex-shrink-0">
                <Check className="h-5 w-5 text-success-strong" />
              </div>
              <span>{translate('correctAnswer')}</span>
            </>
          ) : (
            <>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-error-soft flex-shrink-0">
                <XCircle className="h-5 w-5 text-error-strong" />
              </div>
              <span>{translate('incorrectAnswer', { answer: revealedAnswer })}</span>
            </>
          )}
        </div>
      ) : null}

      {!feedback && revealedAnswer ? (
        <div className="rounded-xl border border-border/40 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
          {translate('practiceAnswerRevealed', { answer: revealedAnswer })}
        </div>
      ) : null}

      {!hasAvailablePrompts && (
        <p className="text-sm text-muted-foreground">
          {isClozeMode ? translate('practiceClozeUnavailable') : translate('practiceEmptyCategory')}
        </p>
      )}
    </div>
  );
}
