'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, RotateCcw, Home } from 'lucide-react';
import { PronunciationCard, type PronunciationWord } from './PronunciationCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { triggerHaptic } from '@/lib/haptics';
import { cn } from '@/lib/utils';

interface SessionResult {
  wordId: string;
  score: number;
  skipped: boolean;
}

interface PronunciationSessionProps {
  /** Words to practice */
  words: PronunciationWord[];
  /** Session title */
  title: string;
  /** XP earned per correct word */
  xpPerWord?: number;
  /** Callback when session completes */
  onComplete: (results: { 
    totalWords: number;
    completedWords: number;
    skippedWords: number;
    xpEarned: number;
    averageScore: number;
  }) => void;
  /** Callback to restart session */
  onRestart: () => void;
  /** Callback to go home/back */
  onHome: () => void;
  /** Translations */
  t: {
    sessionTitle: string;
    progress: string;
    listenFirst: string;
    tapToListen: string;
    nowYourTurn: string;
    holdToRecord: string;
    recording: string;
    releaseTo: string;
    yourRecording: string;
    playYours: string;
    playReference: string;
    tryAgain: string;
    soundsGood: string;
    skip: string;
    next: string;
    micPermissionDenied: string;
    micNotSupported: string;
    sessionComplete: string;
    greatJob: string;
    wordsCompleted: string;
    wordsSkipped: string;
    xpEarned: string;
    practiceAgain: string;
    backToHome: string;
    perfectScore: string;
    keepPracticing: string;
  };
  /** Additional class name */
  className?: string;
}

/**
 * PronunciationSession - Full pronunciation practice session manager
 * 
 * Manages the flow through a set of pronunciation words,
 * tracks progress, and shows a completion summary.
 */
export function PronunciationSession({
  words,
  title,
  xpPerWord = 10,
  onComplete,
  onRestart,
  onHome,
  t,
  className,
}: PronunciationSessionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<SessionResult[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  const prefersReducedMotion = useReducedMotion();

  const currentWord = words[currentIndex];

  // Calculate session stats
  const sessionStats = useMemo(() => {
    const completedWords = results.filter(r => !r.skipped).length;
    const skippedWords = results.filter(r => r.skipped).length;
    const totalScore = results.filter(r => !r.skipped).reduce((sum, r) => sum + r.score, 0);
    const averageScore = completedWords > 0 ? totalScore / completedWords : 0;
    const xpEarned = completedWords * xpPerWord;

    return {
      totalWords: words.length,
      completedWords,
      skippedWords,
      xpEarned,
      averageScore,
    };
  }, [results, words.length, xpPerWord]);

  // Handle word completion
  const handleWordComplete = useCallback((result: SessionResult) => {
    setResults(prev => [...prev, result]);
  }, []);

  // Move to next word
  const handleNext = useCallback(() => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // Session complete
      setIsComplete(true);
      triggerHaptic('success');
      onComplete(sessionStats);
    }
  }, [currentIndex, words.length, onComplete, sessionStats]);

  // Handle skip
  const handleSkip = useCallback(() => {
    handleNext();
  }, [handleNext]);

  // Handle restart
  const handleRestart = useCallback(() => {
    setCurrentIndex(0);
    setResults([]);
    setIsComplete(false);
    onRestart();
  }, [onRestart]);

  // Session complete screen
  if (isComplete) {
    const isPerfect = sessionStats.skippedWords === 0 && sessionStats.averageScore >= 80;

    return (
      <Card className={cn("overflow-hidden", className)}>
        <CardContent className="flex flex-col items-center gap-6 p-8 text-center">
          {/* Trophy/Star animation */}
          <motion.div
            initial={prefersReducedMotion ? {} : { scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className={cn(
              "flex h-24 w-24 items-center justify-center rounded-full",
              isPerfect ? "bg-accent" : "bg-primary/10"
            )}
          >
            {isPerfect ? (
              <Trophy className="h-12 w-12 text-accent-foreground" />
            ) : (
              <Star className="h-12 w-12 text-primary" />
            )}
          </motion.div>

          {/* Completion message */}
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">{t.sessionComplete}</h2>
            <p className="text-muted-foreground">
              {isPerfect ? t.perfectScore : t.keepPracticing}
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
            <div className="rounded-lg bg-muted p-4 text-center">
              <p className="text-2xl font-bold text-foreground">
                {sessionStats.completedWords}
              </p>
              <p className="text-xs text-muted-foreground">{t.wordsCompleted}</p>
            </div>
            <div className="rounded-lg bg-muted p-4 text-center">
              <p className="text-2xl font-bold text-foreground">
                {sessionStats.skippedWords}
              </p>
              <p className="text-xs text-muted-foreground">{t.wordsSkipped}</p>
            </div>
          </div>

          {/* XP earned */}
          <motion.div
            initial={prefersReducedMotion ? {} : { scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-2 rounded-full bg-accent/20 px-6 py-3"
          >
            <Star className="h-5 w-5 text-accent" />
            <span className="font-bold text-accent">
              +{sessionStats.xpEarned} XP
            </span>
          </motion.div>

          {/* Action buttons */}
          <div className="flex flex-col gap-3 w-full max-w-xs pt-4">
            <Button
              size="lg"
              onClick={handleRestart}
              className="w-full"
              data-testid="pronunciation-session-restart"
            >
              <RotateCcw className="h-5 w-5 mr-2" />
              {t.practiceAgain}
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={onHome}
              className="w-full"
              data-testid="pronunciation-session-back"
            >
              <Home className="h-5 w-5 mr-2" />
              {t.backToHome}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Active practice session
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* Session header */}
      <div className="flex items-center justify-between px-4">
        <h1 className="text-lg font-semibold">{title}</h1>
        <span className="text-sm text-muted-foreground">
          {currentIndex + 1} / {words.length}
        </span>
      </div>

      {/* Current word card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentWord.id}
          initial={prefersReducedMotion ? {} : { opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={prefersReducedMotion ? {} : { opacity: 0, x: -50 }}
          transition={{ duration: 0.2 }}
        >
          <PronunciationCard
            word={currentWord}
            position={currentIndex + 1}
            total={words.length}
            onComplete={handleWordComplete}
            onNext={handleNext}
            onSkip={handleSkip}
            t={{
              listenFirst: t.listenFirst,
              tapToListen: t.tapToListen,
              nowYourTurn: t.nowYourTurn,
              holdToRecord: t.holdToRecord,
              recording: t.recording,
              releaseTo: t.releaseTo,
              yourRecording: t.yourRecording,
              playYours: t.playYours,
              playReference: t.playReference,
              tryAgain: t.tryAgain,
              soundsGood: t.soundsGood,
              skip: t.skip,
              next: t.next,
              micPermissionDenied: t.micPermissionDenied,
              micNotSupported: t.micNotSupported,
            }}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export type { PronunciationWord, SessionResult };
