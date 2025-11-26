import { Dispatch, FormEvent, PointerEvent, ReactNode, RefObject, SetStateAction, useState } from 'react';
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
import type {
  PracticeDirection,
  PracticeDrillMode,
  PracticeDifficultyId,
  PracticeDifficultyPreset,
} from '@/components/learn/quick-practice/types';

type Translate = (key: string, values?: Record<string, string | number | Date>) => string;

type PanelId = 'difficulty' | 'direction' | 'mode';

export type QuickPracticeControlsProps = {
  isModalVariant: boolean;
  isInputFocused: boolean;
  setIsInputFocused: Dispatch<SetStateAction<boolean>>;
  categories: string[];
  category: string;
  setCategory: Dispatch<SetStateAction<string>>;
  direction: PracticeDirection;
  setDirection: Dispatch<SetStateAction<PracticeDirection>>;
  practiceMode: PracticeDrillMode;
  setPracticeMode: Dispatch<SetStateAction<PracticeDrillMode>>;
  difficulty: PracticeDifficultyId;
  setDifficulty: Dispatch<SetStateAction<PracticeDifficultyId>>;
  difficultyOptions: PracticeDifficultyPreset[];
  difficultyLabelText: string;
  selectedDifficultyLabel: string;
  selectedDifficultyDescription: string;
  categoryLabelText: string;
  categoryValue: string;
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
  isModalVariant,
  isInputFocused,
  setIsInputFocused,
  categories,
  category,
  setCategory,
  direction,
  setDirection,
  practiceMode,
  setPracticeMode,
  difficulty,
  setDifficulty,
  difficultyOptions,
  difficultyLabelText,
  selectedDifficultyLabel,
  selectedDifficultyDescription,
  categoryLabelText,
  categoryValue,
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
  const [activePanel, setActivePanel] = useState<PanelId | null>(null);
  const [isFiltersDrawerOpen, setIsFiltersDrawerOpen] = useState(false);

  const submitIfReady = () => {
    if (isPrimaryDisabled) {
      return;
    }

    void onSubmit();
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submitIfReady();
  };

  const handleTouchSubmit = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.pointerType !== 'touch') {
      return;
    }

    event.preventDefault();
    submitIfReady();
  };

  const togglePanel = (panel: PanelId) => {
    setActivePanel((prev) => (prev === panel ? null : panel));
  };

  return (
    <>
      <div
        className={cn(
          'flex flex-col gap-4',
          isModalVariant ? 'px-6 pb-6 md:px-10 md:pb-10 lg:px-12' : 'pb-4 md:pb-6'
        )}
      >
        <form
          ref={formRef}
          className={cn('space-y-3 md:space-y-4', isInputFocused && 'space-y-2 pb-4 md:pb-0')}
          onSubmit={handleSubmit}
        >
          <div
            className={cn(
              'rounded-3xl border border-border/60 bg-background/80 p-3 shadow-inner transition-all duration-200 md:p-4',
              isShaking && 'ring-2 ring-[var(--brand-red)]/40'
            )}
          >
            <Input
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => {
                setTimeout(() => setIsInputFocused(false), 100);
              }}
              placeholder={placeholder}
              className={cn(
                'h-auto min-h-[48px] border-0 bg-transparent px-0 text-base font-medium text-foreground placeholder:text-muted-foreground md:text-lg',
                'focus-visible:ring-0 focus-visible:outline-none'
              )}
              aria-label={placeholder}
              disabled={!isReady}
            />
            {hasAvailablePrompts || isReady ? (
              <div className="mt-2 flex items-center justify-between text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {hasAvailablePrompts ? (
                  <button
                    type="button"
                    onClick={onNextPrompt}
                    className="hover:text-primary"
                    aria-label={translate('practiceSkipPrompt')}
                  >
                    {translate('practiceSkipPrompt')}
                  </button>
                ) : null}
                {isReady ? (
                  <button
                    type="button"
                    onClick={onRevealAnswer}
                    className="hover:text-primary"
                    aria-label={translate('practiceRevealAnswer')}
                  >
                    {translate('practiceRevealAnswer')}
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="md:hidden flex flex-col gap-3">
            <Button
              type="submit"
              size="lg"
              className={cn(
                'w-full rounded-2xl bg-gradient-to-r from-primary to-secondary text-base font-semibold text-white shadow-lg transition-all duration-200',
                isInputFocused ? 'h-11' : 'h-12',
                'hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-60 disabled:hover:translate-y-0',
                'flex items-center justify-center gap-2'
              )}
              disabled={isPrimaryDisabled}
              onPointerDown={handleTouchSubmit}
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
                  <DropdownMenuContent align="end" className="w-52 text-sm">
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

          <div className="hidden md:grid md:grid-cols-2 md:gap-3">
            <Button
              type="submit"
              size={isModalVariant ? 'lg' : 'default'}
              className={cn(
                'w-full gap-2 rounded-2xl bg-gradient-to-r from-primary to-secondary font-semibold shadow-lg transition-all duration-200',
                'text-white hover:-translate-y-0.5 hover:shadow-xl h-12 disabled:opacity-60 disabled:hover:translate-y-0',
                'flex items-center justify-center gap-2'
              )}
              disabled={isPrimaryDisabled}
              onPointerDown={handleTouchSubmit}
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
            {hasAvailablePrompts ? (
              <Button
                type="button"
                variant="outline"
                size={isModalVariant ? 'lg' : 'default'}
                onClick={onNextPrompt}
                className="w-full gap-2 rounded-2xl border-border/50"
              >
                <RefreshCcw className="h-4 w-4" />
                {translate('nextPrompt')}
              </Button>
            ) : null}
            {isReady ? (
              <Button
                type="button"
                variant="ghost"
                size={isModalVariant ? 'lg' : 'default'}
                onClick={onRevealAnswer}
                className="w-full gap-2 rounded-2xl"
              >
                <Eye className="h-4 w-4" />
                {translate('practiceRevealAnswer')}
              </Button>
            ) : null}
            <Button
              type="button"
              variant="ghost"
              size={isModalVariant ? 'lg' : 'default'}
              onClick={onReset}
              className="w-full gap-2 rounded-2xl"
              disabled={!isReady && !answer}
            >
              {translate('practiceReset')}
            </Button>
          </div>
        </form>

        {feedback && isReady ? (
          <div
            role="status"
            aria-live="polite"
            className={cn(
              'rounded-2xl px-4 py-3 md:px-5 md:py-4 shadow-lg border-2',
              'flex items-start gap-3 md:gap-4',
              feedback === 'correct'
                ? 'bg-success-soft border-success-soft text-success-strong'
                : 'bg-error-soft border-error-soft text-error-strong',
              isShaking && feedback === 'incorrect' && 'animate-shake'
            )}
          >
            <div
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-full bg-background/60',
                feedback === 'correct' ? 'text-success-strong' : 'text-error-strong'
              )}
            >
              {feedback === 'correct' ? (
                <Check className="h-5 w-5" />
              ) : (
                <XCircle className="h-5 w-5" />
              )}
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-sm font-bold leading-tight md:text-base">
                {feedback === 'correct'
                  ? translate('correctAnswer')
                  : translate('incorrectAnswer', { answer: revealedAnswer })}
              </p>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {feedback === 'correct'
                  ? translate('practiceContinueLearning')
                  : translate('practiceRevealAnswer')}
              </p>
            </div>
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

        {!isInputFocused && (
          <div className="space-y-2" data-testid="practice-panels">
            <CollapsiblePanel
              id="difficulty"
              title={`${difficultyLabelText}: ${selectedDifficultyLabel}`}
              description={selectedDifficultyDescription}
              isOpen={activePanel === 'difficulty'}
              onToggle={togglePanel}
            >
              <div className="flex flex-col gap-2">
                {difficultyOptions.map((preset) => {
                  const isSelected = preset.id === difficulty;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      className={cn(
                        'rounded-2xl border px-4 py-2 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60',
                        isSelected
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border/50 bg-background/80 text-muted-foreground hover:border-primary/40'
                      )}
                      onClick={() => setDifficulty(preset.id)}
                    >
                      <p className="text-sm font-semibold">{preset.label}</p>
                      <p className="text-xs text-muted-foreground">{preset.description}</p>
                    </button>
                  );
                })}
              </div>
            </CollapsiblePanel>

            <CollapsiblePanel
              id="direction"
              title={`${translate('practiceModeLabel')}: ${
                direction === 'mkToEn'
                  ? translate('practiceModeMkToEn')
                  : translate('practiceModeEnToMk')
              }`}
              description={translate('practiceHint')}
              isOpen={activePanel === 'direction'}
              onToggle={togglePanel}
            >
              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={direction === 'mkToEn' ? 'default' : 'outline'}
                  onClick={() => setDirection('mkToEn')}
                  aria-pressed={direction === 'mkToEn'}
                  className="w-full justify-start"
                >
                  {translate('practiceModeMkToEn')}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={direction === 'enToMk' ? 'default' : 'outline'}
                  onClick={() => setDirection('enToMk')}
                  aria-pressed={direction === 'enToMk'}
                  className="w-full justify-start"
                >
                  {translate('practiceModeEnToMk')}
                </Button>
              </div>
            </CollapsiblePanel>

            <CollapsiblePanel
              id="mode"
              title={`${translate('practiceDrillModeLabel')}: ${
                practiceMode === 'flashcard'
                  ? translate('practiceDrillModeFlashcard')
                  : translate('practiceDrillModeCloze')
              }`}
              description={translate('practiceHint')}
              isOpen={activePanel === 'mode'}
              onToggle={togglePanel}
            >
              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={practiceMode === 'flashcard' ? 'default' : 'outline'}
                  onClick={() => setPracticeMode('flashcard')}
                  aria-pressed={practiceMode === 'flashcard'}
                  className="w-full justify-start"
                >
                  {translate('practiceDrillModeFlashcard')}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={practiceMode === 'cloze' ? 'default' : 'outline'}
                  onClick={() => setPracticeMode('cloze')}
                  aria-pressed={practiceMode === 'cloze'}
                  className="w-full justify-start"
                >
                  {translate('practiceDrillModeCloze')}
                </Button>
              </div>
            </CollapsiblePanel>

            <div className="flex items-center justify-between rounded-2xl border border-dashed border-border/50 px-4 py-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {categoryLabelText}
                </p>
                <p className="text-sm font-medium text-foreground">{categoryValue}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsFiltersDrawerOpen(true)}
                className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-primary"
                aria-label={`${translate('practiceFilterLabel')} filters`}
              >
                <span>{translate('practiceFilterLabel')}</span>
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      <FiltersDrawer
        isOpen={isFiltersDrawerOpen}
        onClose={() => setIsFiltersDrawerOpen(false)}
        translate={translate}
        categories={categories}
        category={category}
        setCategory={setCategory}
      />
    </>
  );
}

type CollapsiblePanelProps = {
  id: PanelId;
  title: string;
  description: string;
  isOpen: boolean;
  onToggle: (panel: PanelId) => void;
  children: ReactNode;
};

function CollapsiblePanel({ id, title, description, isOpen, onToggle, children }: CollapsiblePanelProps) {
  return (
    <div className="rounded-2xl border border-border/50 bg-background/70">
      <button
        type="button"
        className="flex w-full items-center justify-between px-4 py-3 text-left"
        aria-expanded={isOpen}
        onClick={() => onToggle(id)}
      >
        <div>
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <ChevronDown className={cn('h-4 w-4 text-muted-foreground transition-transform', isOpen && 'rotate-180')} />
      </button>
      {isOpen ? <div className="px-4 pb-4">{children}</div> : null}
    </div>
  );
}

type FiltersDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  translate: Translate;
  categories: string[];
  category: string;
  setCategory: Dispatch<SetStateAction<string>>;
};

function FiltersDrawer({ isOpen, onClose, translate, categories, category, setCategory }: FiltersDrawerProps) {
  if (!isOpen) {
    return null;
  }

  const allOptions = [ALL_CATEGORIES, ...categories];

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/40" role="dialog" aria-modal aria-label="Filters">
      <button type="button" className="flex-1" onClick={onClose} aria-label={translate('practiceClose')} />
      <div className="rounded-t-3xl bg-background p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {translate('practiceFilterLabel')}
          </p>
          <Button type="button" size="sm" variant="ghost" onClick={onClose}>
            {translate('practiceClose')}
          </Button>
        </div>
        <div className="max-h-[50vh] space-y-2 overflow-y-auto pr-1">
          {allOptions.map((cat) => {
            const isSelected = cat === category;
            return (
              <button
                key={cat || 'all'}
                type="button"
                className={cn(
                  'flex w-full items-center justify-between rounded-2xl border px-4 py-2 text-left',
                  isSelected
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border/60 bg-background/80 text-foreground hover:border-primary/40'
                )}
                onClick={() => {
                  setCategory(cat);
                  onClose();
                }}
              >
                <span className="text-sm font-medium">
                  {cat === ALL_CATEGORIES ? translate('practiceAllCategories') : formatCategory(cat)}
                </span>
                {isSelected && <Check className="h-4 w-4" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
