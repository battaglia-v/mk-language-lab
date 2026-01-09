'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
import { Volume2, Brain, FileText, Sparkles, Heart, Settings2, Clock, Zap, ChevronRight, Play, BookOpen, BookmarkPlus, Languages, BookText, Plus, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { usePracticeDecks } from './usePracticeDecks';
import { PracticeModeSelector, type PracticeMode as VocabPracticeMode } from './PracticeModeSelector';
import { cn } from '@/lib/utils';
import type { DeckType, PracticeMode, DifficultyFilter } from './types';

type PracticeModeConfig = {
  id: string;
  href: string;
  icon: typeof Volume2;
  variant: 'default' | 'primary' | 'accent' | 'saved';
  cardCount?: number;
  disabled?: boolean;
  disabledReason?: string;
};

/**
 * PracticeHub - Duolingo-style practice mode selection
 *
 * Clean, focused UI with big playful cards. Settings hidden in bottom sheet.
 */
export function PracticeHub() {
  const t = useTranslations('practiceHub');
  const locale = useLocale();
  const { status } = useSession();
  const {
    savedDeck, curatedDeck,
    mistakesDeck, srsDueDeck,
    favoritesDeck,
    clearCustomDeck, clearMistakes,
    recommendedDeck,
    vocabCounts,
    lessonReviewDeck,
    loadLessonReviewDeck,
    userVocabDeck,
    loadUserVocabDeck,
  } = usePracticeDecks();

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [deckType, setDeckType] = useState<DeckType>(recommendedDeck);
  const [mode, setMode] = useState<PracticeMode>('multiple-choice');
  const [difficulty, setDifficulty] = useState<DifficultyFilter>('all');
  const [vocabMode, setVocabMode] = useState<VocabPracticeMode>('mixed');

  const isAuthenticated = status === 'authenticated';
  const hasVocabulary = vocabCounts.total > 0;

  // Load lesson review deck and user vocab on mount
  useEffect(() => {
    if (isAuthenticated) {
      loadLessonReviewDeck();
      loadUserVocabDeck();
    }
  }, [isAuthenticated, loadLessonReviewDeck, loadUserVocabDeck]);

  // Total saved words across all sources
  const totalSavedWords = savedDeck.length + favoritesDeck.length + userVocabDeck.length;

  const handleDeckSelect = (type: DeckType) => {
    setDeckType(type);
    clearCustomDeck();
  };

  // Practice mode cards configuration
  // Note: Pronunciation/Speaking is hidden for beta - audio coming soon
  // Lesson Review is recommended when user has completed lessons
  const hasLessonVocabulary = lessonReviewDeck.length > 0;
  
  const modes: PracticeModeConfig[] = [
    {
      id: 'lessonReview',
      href: `/${locale}/practice/session?deck=lesson-review&mode=multiple-choice`,
      icon: BookOpen,
      // Primary variant when user has lesson vocabulary, otherwise default
      variant: hasLessonVocabulary ? 'primary' : 'default',
      cardCount: lessonReviewDeck.length,
      disabled: lessonReviewDeck.length === 0,
      disabledReason: t('modes.lessonReview.disabledReason', { default: 'Complete a lesson to unlock vocabulary review' }),
    },
    {
      id: 'grammar',
      href: `/${locale}/practice/grammar`,
      icon: Brain,
      variant: 'default',
    },
    {
      id: 'wordSprint',
      href: `/${locale}/practice/word-sprint`,
      icon: FileText,
      // Primary only if no lesson vocabulary
      variant: hasLessonVocabulary ? 'default' : 'primary',
    },
    {
      id: 'vocabulary',
      href: `/${locale}/practice/session?deck=curated&mode=multiple-choice`,
      icon: Sparkles,
      variant: 'accent',
      cardCount: curatedDeck.length,
    },
  ];
  
  // Recommended mode: Lesson Review if user has lesson vocabulary, otherwise Word Sprint
  const recommendedModeId = hasLessonVocabulary ? 'lessonReview' : 'wordSprint';
  const recommendedMode = modes.find((modeConfig) => modeConfig.id === recommendedModeId);
  const otherModes = modes.filter((modeConfig) => modeConfig.id !== recommendedModeId);

  return (
    <div className="flex flex-col gap-7">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {t('hub.title')}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t('hub.subtitle')}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-11 min-h-[44px] gap-1.5 rounded-full px-3 text-muted-foreground"
          onClick={() => setSettingsOpen(true)}
          data-testid="practice-settings-open"
        >
          <Settings2 className="h-4 w-4" />
          <span className="hidden sm:inline">{t('hub.settingsLink')}</span>
        </Button>
      </header>

      {/* My Saved Words - Prominent section for saved vocabulary */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <BookmarkPlus className="h-5 w-5 text-pink-500" />
              My Saved Words
            </h2>
            <p className="text-sm text-muted-foreground">
              Words you&apos;ve saved from lessons, reading, or translating
            </p>
          </div>
          {totalSavedWords > 0 && (
            <span className="text-2xl font-bold text-pink-500">{totalSavedWords}</span>
          )}
        </div>

        {totalSavedWords > 0 ? (
          <Card className="p-4 bg-gradient-to-br from-pink-500/10 to-rose-500/5 border-pink-500/20">
            {/* Word count breakdown */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex flex-wrap gap-3 text-sm">
                {savedDeck.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    <Languages className="h-4 w-4 text-blue-500" />
                    <span>{savedDeck.length} from Translate</span>
                  </div>
                )}
                {favoritesDeck.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    <BookText className="h-4 w-4 text-green-500" />
                    <span>{favoritesDeck.length} from Reader</span>
                  </div>
                )}
                {userVocabDeck.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    <BookOpen className="h-4 w-4 text-primary" />
                    <span>{userVocabDeck.length} due for review</span>
                  </div>
                )}
              </div>
              <Link href={`/${locale}/saved-words`} className="text-sm text-pink-500 hover:underline font-medium">
                Manage →
              </Link>
            </div>

            {/* Practice CTA */}
            <div className="flex flex-col sm:flex-row gap-2">
              <Link
                href={`/${locale}/practice/session?deck=saved&mode=multiple-choice`}
                className="flex-1"
              >
                <Button className="w-full gap-2 bg-pink-500 hover:bg-pink-600 text-white dark:text-black">
                  <Play className="h-4 w-4" />
                  Practice Saved Words
                  <ArrowRight className="h-4 w-4 ml-auto" />
                </Button>
              </Link>
              {favoritesDeck.length > 0 && (
                <Link
                  href={`/${locale}/practice/session?deck=favorites&mode=multiple-choice`}
                  className="flex-1"
                >
                  <Button variant="outline" className="w-full gap-2 border-pink-500/30 hover:bg-pink-500/10">
                    <Heart className="h-4 w-4 text-pink-500" />
                    Review Favorites ({favoritesDeck.length})
                  </Button>
                </Link>
              )}
            </div>
          </Card>
        ) : (
          <Card className="p-5 border-dashed border-2 border-border/50 bg-muted/10">
            <div className="space-y-5">
              <div className="text-center">
                <div className="h-16 w-16 rounded-full bg-pink-500/10 flex items-center justify-center mx-auto mb-3">
                  <BookmarkPlus className="h-8 w-8 text-pink-500" />
                </div>
                <p className="font-semibold text-foreground text-lg">Build your personal word bank</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Save words you want to remember and practice them here
                </p>
              </div>
              
              {/* Step-by-step instructions */}
              <div className="space-y-3 text-left">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground text-center">
                  How to save words
                </p>
                
                {/* Translate method */}
                <div className="flex gap-3 p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
                  <div className="h-8 w-8 rounded-lg bg-blue-500/20 flex items-center justify-center shrink-0">
                    <Languages className="h-4 w-4 text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">In Translate</p>
                    <p className="text-xs text-muted-foreground">
                      Translate a word or phrase, then tap the <Heart className="h-3 w-3 inline text-pink-500" /> heart icon to save it
                    </p>
                  </div>
                  <Link href={`/${locale}/translate`}>
                    <Button variant="ghost" size="sm" className="h-8 px-2 text-blue-500">
                      Try it <ChevronRight className="h-3 w-3 ml-1" />
                    </Button>
                  </Link>
                </div>
                
                {/* Reader method */}
                <div className="flex gap-3 p-3 rounded-lg bg-green-500/5 border border-green-500/20">
                  <div className="h-8 w-8 rounded-lg bg-green-500/20 flex items-center justify-center shrink-0">
                    <BookText className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">In Reader</p>
                    <p className="text-xs text-muted-foreground">
                      Tap any word while reading, then tap &ldquo;Save word&rdquo; in the popup
                    </p>
                  </div>
                  <Link href={`/${locale}/reader`}>
                    <Button variant="ghost" size="sm" className="h-8 px-2 text-green-500">
                      Try it <ChevronRight className="h-3 w-3 ml-1" />
                    </Button>
                  </Link>
                </div>
                
                {/* Lessons method */}
                <div className="flex gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                    <BookOpen className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">In Lessons</p>
                    <p className="text-xs text-muted-foreground">
                      Complete lessons to automatically add vocabulary to your review deck
                    </p>
                  </div>
                  <Link href={`/${locale}/learn`}>
                    <Button variant="ghost" size="sm" className="h-8 px-2 text-primary">
                      Try it <ChevronRight className="h-3 w-3 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </Card>
        )}
      </section>

      {/* Vocabulary Practice - SRS mode selector for authenticated users */}
      {isAuthenticated && hasVocabulary && (
        <section className="space-y-3">
          <PracticeModeSelector
            counts={vocabCounts}
            selectedMode={vocabMode}
            onModeSelect={setVocabMode}
          />
        </section>
      )}

      {/* Recommended */}
      {recommendedMode && (
        <section className="space-y-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t('hub.recommendedTitle')}
            </p>
            <p className="text-sm text-muted-foreground">{t('hub.recommendedSubtitle')}</p>
          </div>
          <PracticeModeCard
            config={recommendedMode}
            t={t}
            highlightLabel={t('hub.recommendedBadge')}
          />
        </section>
      )}

      {/* More practice modes */}
      <section className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {t('hub.moreModesTitle')}
        </p>
        <div className="flex flex-col gap-3">
          {otherModes.map((modeConfig) => (
            <PracticeModeCard
              key={modeConfig.id}
              config={modeConfig}
              t={t}
            />
          ))}
        </div>
      </section>

      {/* Settings Bottom Sheet */}
      <BottomSheet
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        title={t('drills.settings', { default: 'Practice Settings' })}
        testId="practice-settings-sheet"
      >
        <div className="space-y-6">
          {/* Mode Selection */}
          <div>
            <h3 className="text-sm font-semibold mb-2">
              {t('drills.modeLabel', { default: 'Mode' })}
            </h3>
            <div className="flex gap-2">
              <Button
                variant={mode === 'typing' ? 'secondary' : 'outline'}
                className="flex-1 min-h-[44px]"
                onClick={() => setMode('typing')}
                data-testid="practice-settings-mode-typing"
              >
                {t('drills.modeTyping', { default: 'Typing' })}
              </Button>
              <Button
                variant={mode === 'multiple-choice' ? 'secondary' : 'outline'}
                className="flex-1 min-h-[44px]"
                onClick={() => setMode('multiple-choice')}
                data-testid="practice-settings-mode-multiple-choice"
              >
                {t('drills.modeMultipleChoice', { default: 'Multiple Choice' })}
              </Button>
            </div>
          </div>

          {/* Difficulty Selection */}
          <div>
            <h3 className="text-sm font-semibold mb-2">
              {t('drills.difficultyLabel', { default: 'Difficulty' })}
            </h3>
            <div className="flex flex-wrap gap-2">
              {(['all', 'beginner', 'intermediate', 'advanced'] as const).map((d) => (
                <Button
                  key={d}
                  variant={difficulty === d ? 'secondary' : 'outline'}
                  onClick={() => setDifficulty(d)}
                  data-testid={`practice-settings-difficulty-${d}`}
                  className="min-h-[44px] px-4"
                >
                  {d === 'all'
                    ? t('drills.allLevels', { default: 'All' })
                    : t(`drills.difficulty${d.charAt(0).toUpperCase() + d.slice(1)}`, { default: d })}
                </Button>
              ))}
            </div>
          </div>

          {/* Deck Selection */}
          <div>
            <h3 className="text-sm font-semibold mb-2">
              {t('drills.selectDeck', { default: 'Select Deck' })}
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <DeckButton
                label={t('cards.translate.title', { default: 'Starter Deck' })}
                count={curatedDeck.length}
                active={deckType === 'curated'}
                onClick={() => handleDeckSelect('curated')}
                testId="practice-settings-deck-curated"
              />
              <DeckButton
                label={t('savedDeck.badge', { default: 'Saved' })}
                count={savedDeck.length}
                active={deckType === 'saved'}
                disabled={!savedDeck.length}
                onClick={() => handleDeckSelect('saved')}
                testId="practice-settings-deck-saved"
              />
              {srsDueDeck.length > 0 && (
                <DeckButton
                  label={t('drills.smartReview', { default: 'Smart Review' })}
                  count={srsDueDeck.length}
                  active={deckType === 'srs'}
                  onClick={() => handleDeckSelect('srs')}
                  testId="practice-settings-deck-srs"
                />
              )}
              {mistakesDeck.length > 0 && (
                <DeckButton
                  label={t('drills.reviewMistakes', { default: 'Mistakes' })}
                  count={mistakesDeck.length}
                  active={deckType === 'mistakes'}
                  onClick={() => handleDeckSelect('mistakes')}
                  testId="practice-settings-deck-mistakes"
                />
              )}
            </div>
          </div>

          {/* Clear Mistakes */}
          {deckType === 'mistakes' && mistakesDeck.length > 0 && (
            <Button
              variant="destructive"
              className="w-full min-h-[44px]"
              onClick={() => {
                clearMistakes();
                handleDeckSelect('curated');
              }}
              data-testid="practice-settings-clear-mistakes"
            >
              {t('drills.clearMistakes', { default: 'Clear mistakes' })}
            </Button>
          )}
        </div>
      </BottomSheet>
    </div>
  );
}

/**
 * PracticeModeCard - Big playful card for each practice mode
 */
function PracticeModeCard({
  config,
  t,
  highlightLabel,
}: {
  config: PracticeModeConfig;
  t: ReturnType<typeof useTranslations<'practiceHub'>>;
  highlightLabel?: string;
}) {
  const Icon = config.icon;
  const testId = `practice-mode-${config.id}`;

  const variantStyles = {
    default: 'bg-card border-border hover:border-primary/30 hover:bg-accent/50',
    primary: 'bg-primary/10 border-primary/30 hover:border-primary/50 shadow-sm shadow-primary/10',
    accent: 'bg-amber-500/10 border-amber-500/30 hover:border-amber-500/50',
    saved: 'bg-pink-500/10 border-pink-500/30 hover:border-pink-500/50',
  };

  const iconStyles = {
    default: 'bg-muted text-muted-foreground',
    primary: 'bg-primary/20 text-primary',
    accent: 'bg-amber-500/20 text-amber-500',
    saved: 'bg-pink-500/20 text-pink-500',
  };

  // Get translated strings
  const title = t(`modes.${config.id}.title`, { default: config.id });
  const description = t(`modes.${config.id}.description`, { default: '' });
  const time = t(`modes.${config.id}.time`, { default: '2–5 min' });
  const xp = t(`modes.${config.id}.xp`, { default: '+10 XP' });

  const content = (
    <div
      className={cn(
        'group flex items-center gap-4 rounded-2xl border p-5 transition-all duration-200',
        'min-h-[88px] active:scale-[0.99]',
        variantStyles[config.variant],
        config.disabled && 'opacity-50'
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl',
          iconStyles[config.variant]
        )}
      >
        <Icon className="h-6 w-6" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className="text-base font-semibold leading-tight text-foreground line-clamp-2 break-normal sm:text-lg">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-1 break-normal">{description}</p>
        {config.disabled && config.disabledReason ? (
          <p className="mt-1 text-xs text-muted-foreground">{config.disabledReason}</p>
        ) : null}
        {config.variant === 'primary' && !config.disabled && (
          <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-1 text-[11px] font-semibold text-primary">
            <Play className="h-3 w-3" />
            Start now
          </span>
        )}
      </div>

      {/* Metadata: time + XP */}
      <div className="flex flex-col items-end gap-1.5 min-w-[64px] max-w-[96px] text-right">
        {highlightLabel && (
          <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
            {highlightLabel}
          </span>
        )}
        <span className="text-xs text-muted-foreground sm:flex sm:items-center sm:gap-1">
          <Clock className="hidden h-3 w-3 sm:inline" aria-hidden="true" />
          {time}
        </span>
        <span className="text-xs font-semibold text-primary sm:flex sm:items-center sm:gap-1">
          <Zap className="hidden h-3 w-3 sm:inline" aria-hidden="true" />
          {xp}
        </span>
        {config.cardCount !== undefined && config.cardCount > 0 && (
          <span className="hidden text-[10px] text-muted-foreground sm:inline">
            {config.cardCount} cards
          </span>
        )}
      </div>

      {/* Start indicator */}
      <ChevronRight className="h-5 w-5 text-muted-foreground opacity-50 group-hover:opacity-100 transition-opacity" />
    </div>
  );

  if (config.disabled) {
    return (
      <button type="button" disabled aria-disabled="true" className="w-full text-left" data-testid={testId}>
        {content}
      </button>
    );
  }

  return (
    <Link href={config.href} data-testid={testId}>
      {content}
    </Link>
  );
}

/**
 * DeckButton - Compact deck selection button for settings sheet
 */
function DeckButton({
  label,
  count,
  active,
  disabled,
  onClick,
  testId,
}: {
  label: string;
  count: number;
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  testId: string;
}) {
  return (
    <Button
      variant="outline"
      disabled={disabled}
      onClick={onClick}
      data-testid={testId}
      className={cn(
        'flex h-auto min-h-[52px] flex-col items-start justify-center gap-0.5 rounded-xl p-3 text-left',
        active && 'border-primary/70 bg-primary/15 ring-1 ring-primary/25',
        disabled && 'opacity-40'
      )}
    >
      <span className="text-sm font-medium line-clamp-1">{label}</span>
      <span className={cn('text-xs', active ? 'text-primary' : 'text-muted-foreground')}>
        {count} cards
      </span>
    </Button>
  );
}
