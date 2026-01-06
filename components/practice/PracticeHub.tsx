'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Volume2, Brain, FileText, Sparkles, Heart, Settings2, Clock, Zap, ChevronRight, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { usePracticeDecks } from './usePracticeDecks';
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
  const {
    savedDeck, curatedDeck,
    mistakesDeck, srsDueDeck,
    clearCustomDeck, clearMistakes,
    recommendedDeck,
  } = usePracticeDecks();

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [deckType, setDeckType] = useState<DeckType>(recommendedDeck);
  const [mode, setMode] = useState<PracticeMode>('multiple-choice');
  const [difficulty, setDifficulty] = useState<DifficultyFilter>('all');

  const handleDeckSelect = (type: DeckType) => {
    setDeckType(type);
    clearCustomDeck();
  };

  // Practice mode cards configuration
  // Note: Pronunciation/Speaking is hidden for beta - audio coming soon
  const modes: PracticeModeConfig[] = [
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
      variant: 'primary',
    },
    {
      id: 'vocabulary',
      href: `/${locale}/practice/session?deck=curated&mode=multiple-choice`,
      icon: Sparkles,
      variant: 'accent',
      cardCount: curatedDeck.length,
    },
    {
      id: 'saved',
      href: `/${locale}/practice/session?deck=saved&mode=multiple-choice`,
      icon: Heart,
      variant: 'saved',
      cardCount: savedDeck.length,
      disabled: savedDeck.length === 0,
      disabledReason: t('savedDeck.lockedReason', { default: 'Save a phrase in Translate to unlock.' }),
    },
  ];
  const recommendedMode = modes.find((modeConfig) => modeConfig.id === 'wordSprint');
  const otherModes = modes.filter((modeConfig) => modeConfig.id !== 'wordSprint');

  return (
    <div className="flex flex-col gap-6">
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
    primary: 'bg-primary/10 border-primary/30 hover:border-primary/50',
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
        'group flex items-center gap-4 rounded-2xl border p-4 transition-all duration-200',
        'min-h-[80px] active:scale-[0.99]',
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
          <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary">
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
