'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Volume2, Brain, FileText, Sparkles, Heart, Settings2, Clock, Zap } from 'lucide-react';
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
    savedDeck, curatedDeck, customDecks,
    mistakesDeck, srsDueDeck, favoritesDeck,
    activeCustomDeckId, loadCustomDeck, clearCustomDeck, clearMistakes,
    recommendedDeck, deckCounts,
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
  const modes: PracticeModeConfig[] = [
    {
      id: 'pronunciation',
      href: `/${locale}/practice/pronunciation`,
      icon: Volume2,
      variant: 'default',
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
    },
  ];

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
          className="h-9 gap-1.5 rounded-full text-muted-foreground"
          onClick={() => setSettingsOpen(true)}
        >
          <Settings2 className="h-4 w-4" />
          <span className="hidden sm:inline">{t('hub.settingsLink')}</span>
        </Button>
      </header>

      {/* Practice Mode Cards - Full width, one per row */}
      <div className="flex flex-col gap-3">
        {modes.map((modeConfig) => (
          <PracticeModeCard
            key={modeConfig.id}
            config={modeConfig}
            t={t}
          />
        ))}
      </div>

      {/* Settings Bottom Sheet */}
      <BottomSheet
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        title={t('drills.settings', { default: 'Practice Settings' })}
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
                className="flex-1"
                onClick={() => setMode('typing')}
              >
                {t('drills.modeTyping', { default: 'Typing' })}
              </Button>
              <Button
                variant={mode === 'multiple-choice' ? 'secondary' : 'outline'}
                className="flex-1"
                onClick={() => setMode('multiple-choice')}
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
                  size="sm"
                  onClick={() => setDifficulty(d)}
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
              />
              <DeckButton
                label={t('savedDeck.badge', { default: 'Saved' })}
                count={savedDeck.length}
                active={deckType === 'saved'}
                disabled={!savedDeck.length}
                onClick={() => handleDeckSelect('saved')}
              />
              {srsDueDeck.length > 0 && (
                <DeckButton
                  label={t('drills.smartReview', { default: 'Smart Review' })}
                  count={srsDueDeck.length}
                  active={deckType === 'srs'}
                  onClick={() => handleDeckSelect('srs')}
                />
              )}
              {mistakesDeck.length > 0 && (
                <DeckButton
                  label={t('drills.reviewMistakes', { default: 'Mistakes' })}
                  count={mistakesDeck.length}
                  active={deckType === 'mistakes'}
                  onClick={() => handleDeckSelect('mistakes')}
                />
              )}
            </div>
          </div>

          {/* Clear Mistakes */}
          {deckType === 'mistakes' && mistakesDeck.length > 0 && (
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => {
                clearMistakes();
                handleDeckSelect('curated');
              }}
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
}: {
  config: PracticeModeConfig;
  t: ReturnType<typeof useTranslations<'practiceHub'>>;
}) {
  const Icon = config.icon;

  const variantStyles = {
    default: 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/8',
    primary: 'bg-gradient-to-br from-primary/20 to-primary/5 border-primary/30 hover:border-primary/50',
    accent: 'bg-gradient-to-br from-amber-500/20 to-amber-500/5 border-amber-500/30 hover:border-amber-500/50',
    saved: 'bg-gradient-to-br from-pink-500/20 to-pink-500/5 border-pink-500/30 hover:border-pink-500/50',
  };

  const iconStyles = {
    default: 'bg-white/10 text-white/80',
    primary: 'bg-primary/20 text-primary',
    accent: 'bg-amber-500/20 text-amber-400',
    saved: 'bg-pink-500/20 text-pink-400',
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
        config.disabled && 'opacity-50 pointer-events-none'
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
        <h3 className="font-semibold text-foreground truncate">{title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-1">{description}</p>
      </div>

      {/* Metadata: time + XP */}
      <div className="flex flex-col items-end gap-1 shrink-0">
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          {time}
        </span>
        <span className="flex items-center gap-1 text-xs font-semibold text-primary">
          <Zap className="h-3 w-3" />
          {xp}
        </span>
        {config.cardCount !== undefined && config.cardCount > 0 && (
          <span className="text-[10px] text-muted-foreground">
            {config.cardCount} cards
          </span>
        )}
      </div>
    </div>
  );

  if (config.disabled) {
    return content;
  }

  return <Link href={config.href}>{content}</Link>;
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
}: {
  label: string;
  count: number;
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      variant="outline"
      disabled={disabled}
      onClick={onClick}
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
