'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Volume2, Brain, Heart, RotateCcw, Settings2, FileText, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { PracticeStreakCalendar } from '@/components/gamification/PracticeStreakCalendar';
import { TopGameBar } from '@/components/gamification/TopGameBar';
import { ModeTileGrid, ContinueCTA, type ModeTile } from './ModeTileGrid';
import { CustomDecksDropdown } from './CustomDecksDropdown';
import { usePracticeDecks } from './usePracticeDecks';
import { cn } from '@/lib/utils';
import type { DeckType, PracticeMode, DifficultyFilter } from './types';

export function PracticeHub() {
  const t = useTranslations('practiceHub');
  const locale = useLocale();
  const {
    savedDeck, historyDeck, curatedDeck, customDecks,
    mistakesDeck, srsDueDeck, favoritesDeck,
    activeCustomDeckId, loadCustomDeck, clearCustomDeck, clearMistakes,
    recommendedDeck, deckCounts, favoritesSRSCounts,
  } = usePracticeDecks();

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [deckType, setDeckType] = useState<DeckType>(recommendedDeck);
  const [mode, setMode] = useState<PracticeMode>('multiple-choice');
  const [difficulty, setDifficulty] = useState<DifficultyFilter>('all');

  const handleDeckSelect = (type: DeckType) => {
    setDeckType(type);
    clearCustomDeck();
  };

  const handleCustomDeckSelect = (deckId: string) => {
    loadCustomDeck(deckId);
    setDeckType('custom');
  };

  const buildSessionUrl = () => {
    const params = new URLSearchParams({
      deck: deckType,
      mode,
      difficulty,
      ...(activeCustomDeckId && { customDeckId: activeCustomDeckId }),
    });
    return `/${locale}/practice/session?${params.toString()}`;
  };

  const currentDeckCount = deckCounts[deckType] || curatedDeck.length;
  const hasCardsToReview = currentDeckCount > 0;

  // Build mode tiles
  const modeTiles: ModeTile[] = [
    {
      id: 'pronunciation',
      title: t('modes.pronunciation.title', { default: 'Pronunciation' }),
      description: t('modes.pronunciation.description', { default: 'Perfect your accent' }),
      href: `/practice/pronunciation`,
      icon: Volume2,
      variant: 'default',
    },
    {
      id: 'grammar',
      title: t('modes.grammar.title', { default: 'Grammar' }),
      description: t('modes.grammar.description', { default: 'Master patterns' }),
      href: `/practice/grammar`,
      icon: Brain,
      variant: 'default',
    },
    {
      id: 'word-gaps',
      title: t('modes.wordGaps.title', { default: 'Word Gaps' }),
      description: t('modes.wordGaps.description', { default: 'Fill in the blank' }),
      href: `/practice/word-gaps`,
      icon: FileText,
      variant: 'primary',
      badge: 'New',
    },
    {
      id: 'vocabulary',
      title: t('modes.vocabulary.title', { default: 'Vocabulary' }),
      description: t('modes.vocabulary.description', { default: 'Build word bank' }),
      href: `/practice/session?deck=curated&mode=multiple-choice`,
      icon: Sparkles,
      cardCount: curatedDeck.length,
    },
  ];

  return (
    <div className="flex flex-col gap-4 sm:gap-5">
      {/* Top Game Bar - Streak/XP/Goal */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            {t('badge')}
          </p>
          <h1 className="text-xl font-bold text-foreground sm:text-2xl">
            {t('title')}
          </h1>
        </div>
        <TopGameBar compact />
      </div>

      {/* Dominant Continue CTA */}
      <ContinueCTA
        href={buildSessionUrl()}
        label={t('drills.startSession', { default: 'Start Practice' })}
        subtitle={`${currentDeckCount} ${t('drills.cardsAvailable', { default: 'cards ready' })}`}
      />

      {/* Smart Review Badges */}
      {(srsDueDeck.length > 0 || mistakesDeck.length > 0 || favoritesDeck.length > 0) && (
        <section className="flex flex-wrap gap-2">
          {srsDueDeck.length > 0 && (
            <Button
              variant={deckType === 'srs' ? 'secondary' : 'outline'}
              size="sm"
              className="h-10 gap-2 rounded-full"
              onClick={() => handleDeckSelect('srs')}
            >
              <Brain className="h-4 w-4" />
              {t('drills.smartReview')}
              <Badge variant="outline" className="ml-1">{srsDueDeck.length}</Badge>
            </Button>
          )}
          {favoritesDeck.length > 0 && (
            <Button
              variant={deckType === 'favorites' ? 'secondary' : 'outline'}
              size="sm"
              className="h-10 gap-2 rounded-full"
              onClick={() => handleDeckSelect('favorites')}
            >
              <Heart className="h-4 w-4" />
              {t('drills.favorites', { default: 'Favorites' })}
              {favoritesSRSCounts.due > 0 && (
                <Badge variant="destructive" className="ml-1">{favoritesSRSCounts.due} {t('drills.due', { default: 'due' })}</Badge>
              )}
              {favoritesSRSCounts.due === 0 && favoritesSRSCounts.new_ > 0 && (
                <Badge variant="secondary" className="ml-1">{favoritesSRSCounts.new_} {t('drills.new', { default: 'new' })}</Badge>
              )}
              {favoritesSRSCounts.due === 0 && favoritesSRSCounts.new_ === 0 && (
                <Badge variant="outline" className="ml-1">{favoritesDeck.length}</Badge>
              )}
            </Button>
          )}
          {mistakesDeck.length > 0 && (
            <Button
              variant={deckType === 'mistakes' ? 'secondary' : 'outline'}
              size="sm"
              className="h-10 gap-2 rounded-full"
              onClick={() => handleDeckSelect('mistakes')}
            >
              <RotateCcw className="h-4 w-4" />
              {t('drills.reviewMistakes')}
              <Badge variant="outline" className="ml-1">{mistakesDeck.length}</Badge>
            </Button>
          )}
        </section>
      )}

      {/* Practice Modes - 2-column grid */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Practice Modes
          </h2>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 rounded-full"
            onClick={() => setSettingsOpen(true)}
          >
            <Settings2 className="h-4 w-4 mr-1" />
            Settings
          </Button>
        </div>
        <ModeTileGrid tiles={modeTiles} />
      </section>

      {/* Streak Calendar */}
      <section className="glass-card rounded-2xl p-4 sm:p-5">
        <PracticeStreakCalendar weeks={8} />
      </section>

      {/* Deck Selection */}
      <section className="glass-card rounded-2xl p-4 sm:p-5">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-3">
          {t('drills.selectDeck', { default: 'Select Deck' })}
        </h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <DeckToggle label={t('cards.translate.title')} count={curatedDeck.length} active={deckType === 'curated'} onClick={() => handleDeckSelect('curated')} />
          <DeckToggle label={t('savedDeck.badge')} count={savedDeck.length} active={deckType === 'saved'} disabled={!savedDeck.length} onClick={() => handleDeckSelect('saved')} />
          <DeckToggle label={t('translation.tabLabel')} count={historyDeck.length} active={deckType === 'history'} disabled={!historyDeck.length} onClick={() => handleDeckSelect('history')} />
          <CustomDecksDropdown decks={customDecks} activeCustomDeckId={activeCustomDeckId} onSelectDeck={handleCustomDeckSelect} disabled={!customDecks.length} />
        </div>
      </section>

      {/* Settings BottomSheet */}
      <BottomSheet open={settingsOpen} onClose={() => setSettingsOpen(false)} title={t('drills.settings', { default: 'Practice Settings' })}>
        <div className="space-y-6">
          {/* Mode Selection */}
          <div>
            <h3 className="text-sm font-semibold mb-2">{t('drills.modeLabel', { default: 'Mode' })}</h3>
            <div className="flex gap-2">
              <Button variant={mode === 'typing' ? 'secondary' : 'outline'} className="flex-1" onClick={() => setMode('typing')}>
                {t('drills.modeTyping', { default: 'Typing' })}
              </Button>
              <Button variant={mode === 'multiple-choice' ? 'secondary' : 'outline'} className="flex-1" onClick={() => setMode('multiple-choice')}>
                {t('drills.modeMultipleChoice', { default: 'Multiple Choice' })}
              </Button>
            </div>
          </div>

          {/* Difficulty Selection */}
          <div>
            <h3 className="text-sm font-semibold mb-2">{t('drills.difficultyLabel', { default: 'Difficulty' })}</h3>
            <div className="flex flex-wrap gap-2">
              {(['all', 'beginner', 'intermediate', 'advanced'] as const).map((d) => (
                <Button key={d} variant={difficulty === d ? 'secondary' : 'outline'} size="sm" onClick={() => setDifficulty(d)} disabled={deckType !== 'curated'}>
                  {d === 'all' ? t('drills.allLevels', { default: 'All' }) : t(`drills.difficulty${d.charAt(0).toUpperCase() + d.slice(1)}`, { default: d })}
                </Button>
              ))}
            </div>
            {deckType !== 'curated' && <p className="text-xs text-muted-foreground mt-2">{t('drills.difficultyFilterHelper')}</p>}
          </div>

          {/* Clear Mistakes */}
          {deckType === 'mistakes' && mistakesDeck.length > 0 && (
            <Button variant="destructive" className="w-full" onClick={() => { clearMistakes(); handleDeckSelect('curated'); }}>
              {t('drills.clearMistakes')}
            </Button>
          )}
        </div>
      </BottomSheet>
    </div>
  );
}

function DeckToggle({ label, count, active, disabled, onClick }: { label: string; count: number; active: boolean; disabled?: boolean; onClick: () => void }) {
  return (
    <Button
      variant="outline"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'flex h-auto min-h-[60px] flex-col items-start justify-between gap-1 rounded-xl p-3 text-left',
        active && 'border-primary/70 bg-primary/15 text-white ring-1 ring-primary/25',
        disabled && 'opacity-40'
      )}
    >
      <span className="text-xs line-clamp-2 font-medium">{label}</span>
      <Badge variant={active ? 'default' : 'secondary'} className="text-xs">{count}</Badge>
    </Button>
  );
}
