'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowRight, Volume2, Brain, Heart, RotateCcw, Settings2, Sparkles, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { PracticeStreakCalendar } from '@/components/gamification/PracticeStreakCalendar';
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

  return (
    <div className="flex flex-col gap-4 sm:gap-5">
      {/* Continue CTA - First and Prominent */}
      <section className="glass-card rounded-2xl p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-1">
              {t('badge')}
            </p>
            <h1 className="text-xl font-bold text-foreground sm:text-2xl">
              {t('title')}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {currentDeckCount} {t('drills.cardsAvailable', { default: 'cards ready' })}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="lg"
              className="min-h-[48px] rounded-xl"
              onClick={() => setSettingsOpen(true)}
            >
              <Settings2 className="h-5 w-5" />
              <span className="sr-only sm:not-sr-only sm:ml-2">{t('drills.settings', { default: 'Settings' })}</span>
            </Button>
            <Button
              asChild
              size="lg"
              className="flex-1 sm:flex-none min-h-[48px] rounded-xl bg-gradient-to-r from-primary to-amber-500 text-lg font-bold shadow-lg"
              disabled={!hasCardsToReview}
            >
              <Link href={buildSessionUrl()}>
                <Sparkles className="h-5 w-5 mr-2" />
                {t('drills.startSession', { default: 'Start Practice' })}
              </Link>
            </Button>
          </div>
        </div>
      </section>

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

      {/* Practice Modes */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Link
          href={`/${locale}/practice/pronunciation`}
          className="group glass-card flex items-center gap-4 rounded-2xl p-4 transition-all hover:bg-primary/5 hover:border-primary/30"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
            <Volume2 className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground">{t('modes.pronunciation.title')}</h3>
            <p className="text-sm text-muted-foreground truncate">{t('modes.pronunciation.description')}</p>
          </div>
          <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </Link>
        <Link
          href={`/${locale}/practice/grammar`}
          className="group glass-card flex items-center gap-4 rounded-2xl p-4 transition-all hover:bg-primary/5 hover:border-primary/30"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground">{t('modes.grammar.title')}</h3>
            <p className="text-sm text-muted-foreground truncate">{t('modes.grammar.description')}</p>
          </div>
          <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </Link>
        <Link
          href={`/${locale}/practice/cloze`}
          className="group glass-card flex items-center gap-4 rounded-2xl p-4 transition-all hover:bg-primary/5 hover:border-primary/30"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600">
            <FileText className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground">{t('modes.cloze.title', { default: 'Cloze' })}</h3>
            <p className="text-sm text-muted-foreground truncate">{t('modes.cloze.description', { default: 'Fill in the blank sentences' })}</p>
          </div>
          <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </Link>
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
