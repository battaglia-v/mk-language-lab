'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { CheckCircle2, XCircle, Volume2, VolumeX, Lightbulb, SkipForward, Heart, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { usePracticeDecks } from './usePracticeDecks';
import { isFavorite, toggleFavorite } from '@/lib/favorites';
import { recordPracticeSession } from '@/lib/practice-activity';
import { calculateXP, formatDifficultyLabel } from './types';
import type { DeckType, PracticeMode, DifficultyFilter, Flashcard } from './types';

type Props = { deckType: DeckType; mode: PracticeMode; difficulty: DifficultyFilter; customDeckId?: string };

export function PracticeSession({ deckType, mode, difficulty, customDeckId }: Props) {
  const t = useTranslations('practiceHub');
  const locale = useLocale();
  const router = useRouter();
  const { getDeck, loadCustomDeck } = usePracticeDecks();

  const [deck, setDeck] = useState<Flashcard[]>([]);
  const [index, setIndex] = useState(0);
  const [guess, setGuess] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [isFav, setIsFav] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const sessionStart = useRef(Date.now());

  // Load deck
  useEffect(() => {
    if (customDeckId) {
      loadCustomDeck(customDeckId).then(setDeck);
    } else {
      setDeck(getDeck(deckType, difficulty));
    }
  }, [deckType, difficulty, customDeckId, getDeck, loadCustomDeck]);

  const card = deck[index];
  const total = deck.length || 1;
  const progress = Math.round(((index + 1) / total) * 100);

  // Check favorite status
  useEffect(() => {
    if (card?.id) setIsFav(isFavorite(card.id));
  }, [card?.id]);

  const resetCard = useCallback(() => {
    setGuess(''); setFeedback(null); setRevealed(false); setHint(null); setSelectedChoice(null);
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  const endSession = useCallback(() => {
    const duration = Math.floor((Date.now() - sessionStart.current) / 1000);
    const xp = calculateXP(correctAnswers, maxStreak);
    recordPracticeSession(reviewedCount, correctAnswers, duration);
    const params = new URLSearchParams({
      reviewed: reviewedCount.toString(), correct: correctAnswers.toString(),
      streak: maxStreak.toString(), duration: duration.toString(), xp: xp.toString(), deck: deckType,
    });
    router.push(`/${locale}/practice/results?${params}`);
  }, [correctAnswers, maxStreak, reviewedCount, deckType, locale, router]);

  const goNext = useCallback(() => {
    if (index + 1 >= deck.length) { endSession(); return; }
    setIndex((i) => i + 1);
    resetCard();
  }, [index, deck.length, endSession, resetCard]);

  const handleAnswer = useCallback((isCorrect: boolean) => {
    setFeedback(isCorrect ? 'correct' : 'incorrect');
    setRevealed(true);
    setReviewedCount((c) => c + 1);
    if (isCorrect) {
      setCorrectAnswers((c) => c + 1);
      setStreak((s) => { const n = s + 1; if (n > maxStreak) setMaxStreak(n); return n; });
    } else {
      setStreak(0);
    }
  }, [maxStreak]);

  const submitTyping = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!card || !guess.trim()) return;
    handleAnswer(guess.trim().toLowerCase() === card.target.trim().toLowerCase());
  }, [card, guess, handleAnswer]);

  const selectChoice = useCallback((choice: string) => {
    if (!card || feedback) return;
    setSelectedChoice(choice);
    handleAnswer(choice.trim().toLowerCase() === card.target.trim().toLowerCase());
  }, [card, feedback, handleAnswer]);

  // Auto-advance on correct
  useEffect(() => {
    if (feedback === 'correct') {
      const t = setTimeout(goNext, 800);
      return () => clearTimeout(t);
    }
  }, [feedback, goNext]);

  // Generate choices
  const choices = useMemo(() => {
    if (!card || deck.length < 2) return [];
    const others = deck.filter((c) => c.id !== card.id).map((c) => c.target);
    const unique = [...new Set(others)].sort(() => Math.random() - 0.5).slice(0, 3);
    return [card.target, ...unique].sort(() => Math.random() - 0.5);
  }, [card, deck]);

  const speak = () => {
    if (!card || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(card.macedonian || card.source);
    u.lang = 'sr-RS'; u.rate = 0.85;
    u.onstart = () => setIsSpeaking(true);
    u.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(u);
  };

  const showHint = () => {
    if (!card) return;
    const h = card.target.split(/\s+/).map((w) => w.slice(0, 2) + '_'.repeat(Math.max(0, w.length - 2))).join(' ');
    setHint(h);
  };

  const toggleFav = () => {
    if (!card) return;
    const mk = card.macedonian || (card.direction === 'mk-en' ? card.source : card.target);
    const en = card.direction === 'mk-en' ? card.target : card.source;
    setIsFav(toggleFavorite({ id: card.id, macedonian: mk, english: en, category: card.category || undefined }));
  };

  if (!deck.length) return <div className="flex items-center justify-center h-[60vh] text-muted-foreground">Loading...</div>;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* Header */}
      <header className="flex items-center gap-3 border-b border-border/40 px-4 py-3 safe-top">
        <Button variant="ghost" size="sm" className="h-10 w-10 rounded-full p-0" onClick={endSession}>
          <X className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <Progress value={progress} className="h-2" />
        </div>
        <span className="text-sm font-medium text-muted-foreground">{index + 1}/{total}</span>
      </header>

      {/* Card */}
      <div className="flex-1 overflow-auto px-4 py-6">
        <div className="mx-auto max-w-lg space-y-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{card?.direction === 'en-mk' ? 'EN → MK' : 'MK → EN'}</span>
            {card?.difficulty && <Badge variant="outline">{formatDifficultyLabel(card.difficulty)}</Badge>}
          </div>

          <p className="text-2xl font-bold text-foreground sm:text-3xl">{card?.source}</p>

          <div className={cn('rounded-xl border border-primary/20 bg-primary/5 p-4 transition-all', revealed ? 'opacity-100' : 'opacity-0')}>
            <p className="text-lg font-medium text-primary">{card?.target}</p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={speak} className={cn('h-9 rounded-full', isSpeaking && 'text-primary')}>
              {isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="sm" onClick={toggleFav} className={cn('h-9 rounded-full', isFav && 'text-pink-400')}>
              <Heart className={cn('h-4 w-4', isFav && 'fill-current')} />
            </Button>
          </div>

          {/* Input Area */}
          {mode === 'typing' ? (
            <form onSubmit={submitTyping} className="space-y-3">
              {hint && !revealed && <div className="rounded-lg bg-amber-500/10 px-3 py-2 text-sm text-amber-200 font-mono">{hint}</div>}
              <div className="flex gap-2">
                <Input value={guess} onChange={(e) => setGuess(e.target.value)} placeholder={t('drills.wordInputPlaceholder')} className="flex-1 min-h-[48px] rounded-xl" disabled={!!feedback} />
                <Button type="submit" className="min-h-[48px] rounded-xl px-6" disabled={!guess.trim() || !!feedback}>{t('drills.submitWord')}</Button>
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="ghost" size="sm" onClick={showHint} disabled={revealed || !!hint}><Lightbulb className="h-4 w-4 mr-1" />{t('drills.hintButton')}</Button>
                <Button type="button" variant="ghost" size="sm" onClick={goNext}><SkipForward className="h-4 w-4 mr-1" />{t('drills.skip')}</Button>
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {choices.map((c, i) => (
                  <Button key={i} variant="outline" onClick={() => selectChoice(c)} disabled={!!feedback}
                    className={cn('min-h-[52px] justify-start rounded-xl text-left',
                      selectedChoice === c && feedback === 'correct' && 'border-emerald-400 bg-emerald-500/20',
                      selectedChoice === c && feedback === 'incorrect' && 'border-amber-400 bg-amber-500/20',
                      feedback && c === card?.target && 'border-emerald-400 bg-emerald-500/15'
                    )}>
                    <span className="mr-2 text-muted-foreground">{['A','B','C','D'][i]}.</span>{c}
                  </Button>
                ))}
              </div>
              <Button variant="ghost" size="sm" onClick={goNext}><SkipForward className="h-4 w-4 mr-1" />{t('drills.skip')}</Button>
            </div>
          )}

          {/* Feedback */}
          {feedback && (
            <div className={cn('rounded-xl border px-4 py-3 flex items-start gap-2',
              feedback === 'correct' ? 'border-emerald-400/60 bg-emerald-500/15 text-emerald-50' : 'border-amber-400/60 bg-amber-500/15 text-amber-50')}>
              {feedback === 'correct' ? <CheckCircle2 className="h-5 w-5 text-emerald-400" /> : <XCircle className="h-5 w-5 text-amber-400" />}
              <div>
                <p className="font-medium">{feedback === 'correct' ? t('drills.feedbackCorrect') : t('drills.feedbackIncorrectTitle')}</p>
                {feedback === 'incorrect' && <p className="text-xs mt-1">{t('drills.feedbackIncorrect', { answer: card?.target })}</p>}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      {feedback === 'incorrect' && (
        <footer className="border-t border-border/40 px-4 py-3 safe-bottom">
          <Button className="w-full min-h-[48px] rounded-xl" onClick={goNext}>{t('drills.continueLabel', { default: 'Continue' })}</Button>
        </footer>
      )}
    </div>
  );
}
