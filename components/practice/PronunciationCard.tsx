'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Square, Play, Pause, RotateCcw, Volume2, Check, X, AlertCircle, Volume1 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useAudioRecorder } from '@/hooks/use-audio-recorder';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { usePronunciationScoring, getScoreColorClass, getScoreBgClass } from '@/hooks/use-pronunciation-scoring';
import { cn } from '@/lib/utils';
import { triggerHaptic } from '@/lib/haptics';

// =============================================================================
// AUDIO CONFIGURATION
// =============================================================================

/**
 * Audio source types for pronunciation reference
 * - 'native': Real Macedonian audio recordings (preferred)
 * - 'tts': Web Speech API fallback (current default)
 *
 * TODO: When real Macedonian audio is available:
 * 1. Upload MP3 files to cloud storage (Vercel Blob or S3)
 * 2. Update pronunciation-sessions.json with CDN URLs
 * 3. This component will automatically prefer native audio over TTS
 */
export type AudioSourceType = 'native' | 'tts';

/**
 * TTS Configuration for fallback pronunciation
 *
 * Note: Serbian (sr-RS) is used as the closest available voice to Macedonian.
 * This is a temporary solution until native Macedonian audio is available.
 *
 * TODO: Consider alternatives:
 * - Google Cloud Text-to-Speech with Macedonian voice
 * - Azure Speech Services
 * - Custom Macedonian voice model
 */
const TTS_CONFIG = {
  /** Language code for TTS - Serbian is closest to Macedonian */
  lang: 'sr-RS',
  /** Speech rate (0.1-10, default 1) - slightly slower for learners */
  rate: 0.85,
  /** Pitch (0-2, default 1) */
  pitch: 1,
} as const;

// =============================================================================
// TYPES
// =============================================================================

export interface PronunciationWord {
  id: string;
  /** Macedonian word in Cyrillic */
  macedonian: string;
  /** Latin transliteration */
  transliteration: string;
  /** English translation */
  english: string;
  /** URL to reference audio file */
  audioUrl?: string;
  /** Phonetic breakdown */
  phonetic?: string;
}

/** Result of a pronunciation attempt */
export interface PronunciationResult {
  wordId: string;
  score: number;
  skipped: boolean;
  xpEarned?: number;
}

interface PronunciationCardProps {
  /** Word to practice */
  word: PronunciationWord;
  /** Current position (1-indexed) */
  position: number;
  /** Total words in session */
  total: number;
  /** Callback when user completes this word */
  onComplete: (result: PronunciationResult) => void;
  /** Callback to go to next word */
  onNext: () => void;
  /** Callback to skip */
  onSkip: () => void;
  /** Translations */
  t: {
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
    practiceSilently?: string;
    practiceSilentlyHint?: string;
    analyzing?: string;
    scoreLabel?: string;
    excellent?: string;
    good?: string;
    almostThere?: string;
    trySlower?: string;
    tryLouder?: string;
    tooShort?: string;
    tooLong?: string;
    needsWork?: string;
    gotIt?: string;
    attemptsRemaining?: string;
  };
  /** Additional class name */
  className?: string;
}

type PracticeStep = 'listen' | 'record' | 'scoring' | 'compare';

/**
 * PronunciationCard - Interactive pronunciation practice widget
 * 
 * Flow:
 * 1. Listen - User hears the reference pronunciation
 * 2. Record - User records their attempt (max 3 seconds)
 * 3. Compare - Side-by-side playback comparison
 */
export function PronunciationCard({
  word,
  position,
  total,
  onComplete,
  onNext,
  onSkip,
  t,
  className,
}: PronunciationCardProps) {
  const [step, setStep] = useState<PracticeStep>('listen');
  const [hasListened, setHasListened] = useState(false);
  const [isPlayingReference, setIsPlayingReference] = useState(false);
  const [isPlayingRecording, setIsPlayingRecording] = useState(false);
  const [recordingProgress, setRecordingProgress] = useState(0);
  const [usingTTS, setUsingTTS] = useState(false);
  const [audioError, setAudioError] = useState(false);

  const referenceAudioRef = useRef<HTMLAudioElement | null>(null);
  const recordingAudioRef = useRef<HTMLAudioElement | null>(null);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const prefersReducedMotion = useReducedMotion();
  const maxRecordingDuration = 3; // seconds

  // Pronunciation scoring hook
  const {
    state: scoringState,
    score,
    attemptNumber,
    scoreRecording,
    reset: resetScoring,
  } = usePronunciationScoring();

  const {
    state: recorderState,
    audioUrl: recordedAudioUrl,
    isSupported,
    startRecording,
    stopRecording,
    reset: resetRecorder,
  } = useAudioRecorder({
    maxDuration: maxRecordingDuration,
    onStart: () => {
      triggerHaptic('light');
      setRecordingProgress(0);
      // Start progress animation
      const startTime = Date.now();
      progressIntervalRef.current = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        setRecordingProgress(Math.min((elapsed / maxRecordingDuration) * 100, 100));
      }, 50);
    },
    onStop: () => {
      triggerHaptic('medium');
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      setRecordingProgress(100);
      setStep('scoring');
    },
    onError: () => {
      triggerHaptic('error');
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    },
  });

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  // Trigger scoring when entering scoring step
  useEffect(() => {
    if (step === 'scoring' && recordedAudioUrl) {
      scoreRecording(recordedAudioUrl, word.audioUrl);
    }
  }, [step, recordedAudioUrl, word.audioUrl, scoreRecording]);

  // Move to compare step when scoring completes
  useEffect(() => {
    if (scoringState === 'complete' && step === 'scoring') {
      setStep('compare');
    }
  }, [scoringState, step]);

  // TTS speak function as fallback when native audio is unavailable
  const speakWithTTS = useCallback((text: string) => {
    if (!window.speechSynthesis) {
      setAudioError(true);
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    // Use configured TTS settings (see TTS_CONFIG at top of file)
    utterance.lang = TTS_CONFIG.lang;
    utterance.rate = TTS_CONFIG.rate;
    utterance.pitch = TTS_CONFIG.pitch;

    utterance.onstart = () => {
      setIsPlayingReference(true);
      setUsingTTS(true);
    };
    utterance.onend = () => {
      setIsPlayingReference(false);
      setHasListened(true);
    };
    utterance.onerror = () => {
      setIsPlayingReference(false);
      setAudioError(true);
    };

    window.speechSynthesis.speak(utterance);
  }, []);

  // Play reference audio with TTS fallback
  const playReference = useCallback(() => {
    setAudioError(false);

    // If no audio URL, use TTS directly
    if (!word.audioUrl) {
      speakWithTTS(word.macedonian);
      return;
    }

    if (referenceAudioRef.current) {
      referenceAudioRef.current.pause();
      referenceAudioRef.current.currentTime = 0;
    }

    const audio = new Audio(word.audioUrl);
    referenceAudioRef.current = audio;

    audio.onplay = () => {
      setIsPlayingReference(true);
      setUsingTTS(false);
    };
    audio.onended = () => {
      setIsPlayingReference(false);
      setHasListened(true);
    };
    audio.onpause = () => setIsPlayingReference(false);
    audio.onerror = () => {
      // Audio file failed to load - fall back to TTS
      setIsPlayingReference(false);
      speakWithTTS(word.macedonian);
    };

    audio.play().catch(() => {
      // Playback failed - fall back to TTS
      setIsPlayingReference(false);
      speakWithTTS(word.macedonian);
    });
  }, [word.audioUrl, word.macedonian, speakWithTTS]);

  // Play recorded audio
  const playRecording = useCallback(() => {
    if (!recordedAudioUrl) return;

    if (recordingAudioRef.current) {
      recordingAudioRef.current.pause();
      recordingAudioRef.current.currentTime = 0;
    }

    const audio = new Audio(recordedAudioUrl);
    recordingAudioRef.current = audio;

    audio.onplay = () => setIsPlayingRecording(true);
    audio.onended = () => setIsPlayingRecording(false);
    audio.onpause = () => setIsPlayingRecording(false);
    audio.onerror = () => setIsPlayingRecording(false);

    audio.play().catch(() => {
      setIsPlayingRecording(false);
    });
  }, [recordedAudioUrl]);

  // Handle record button
  const handleRecordStart = useCallback(() => {
    if (step === 'listen') {
      setStep('record');
    }
    startRecording();
  }, [step, startRecording]);

  const handleRecordStop = useCallback(() => {
    stopRecording();
  }, [stopRecording]);

  // Handle "Sounds Good" / "Got It" - mark as complete with actual score
  const handleSoundsGood = useCallback(() => {
    const finalScore = score?.similarity ?? 100;
    const finalXp = score?.xpReward ?? 10;
    triggerHaptic(finalScore >= 90 ? 'success' : finalScore >= 70 ? 'medium' : 'light');
    onComplete({ wordId: word.id, score: finalScore, skipped: false, xpEarned: finalXp });
    onNext();
  }, [word.id, onComplete, onNext, score]);

  // Handle "Try Again"
  const handleTryAgain = useCallback(() => {
    triggerHaptic('light');
    resetRecorder();
    resetScoring();
    setStep('record');
    setRecordingProgress(0);
  }, [resetRecorder, resetScoring]);

  // Handle skip
  const handleSkip = useCallback(() => {
    triggerHaptic('light');
    onComplete({ wordId: word.id, score: 0, skipped: true });
    onSkip();
  }, [word.id, onComplete, onSkip]);

  // Get button state for recording
  const getRecordButtonState = (): { icon: React.ReactNode; label: string; disabled: boolean } => {
    switch (recorderState) {
      case 'requesting':
        return { icon: <Mic className="h-8 w-8 animate-pulse" />, label: '...', disabled: true };
      case 'recording':
        return { icon: <Square className="h-6 w-6" />, label: t.releaseTo, disabled: false };
      case 'error':
        return { icon: <AlertCircle className="h-8 w-8" />, label: t.micPermissionDenied, disabled: true };
      default:
        return { icon: <Mic className="h-8 w-8" />, label: t.holdToRecord, disabled: !hasListened && step === 'listen' };
    }
  };

  const recordButtonState = getRecordButtonState();

  // Handle "Practice silently" - mark as complete without recording
  const handlePracticeSilently = useCallback(() => {
    triggerHaptic('light');
    // Award partial XP for silent practice (no score since no recording)
    onComplete({ wordId: word.id, score: 0, skipped: false, xpEarned: 5 });
    onNext();
  }, [word.id, onComplete, onNext]);

  // Not supported fallback - show "Practice silently" option
  if (!isSupported) {
    return (
      <Card className={cn("border-amber-500/30 bg-amber-500/5", className)}>
        {/* Progress bar */}
        <div className="h-1 bg-muted">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${(position / total) * 100}%` }}
          />
        </div>
        <CardContent className="flex flex-col items-center gap-6 p-6 text-center">
          {/* Word display */}
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-foreground">
              {word.macedonian}
            </h2>
            <p className="text-lg text-muted-foreground font-mono">
              {word.transliteration}
            </p>
            <p className="text-sm text-muted-foreground">
              {word.english}
            </p>
          </div>

          {/* Listen button */}
          <Button
            size="lg"
            variant="default"
            onClick={playReference}
            disabled={isPlayingReference}
            className="min-h-[56px] min-w-[180px] rounded-full"
            data-testid="pronunciation-reference-audio"
          >
            {isPlayingReference ? (
              <Pause className="h-5 w-5 mr-2" />
            ) : (
              <Volume2 className="h-5 w-5 mr-2" />
            )}
            {t.tapToListen}
          </Button>

          {/* Info message */}
          <div className="flex items-start gap-2 text-sm text-amber-600 dark:text-amber-400">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>{t.practiceSilentlyHint || 'Listen and repeat without recording (no XP)'}</span>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 w-full max-w-xs">
            <Button
              variant="outline"
              onClick={handleSkip}
              className="flex-1"
              data-testid="pronunciation-skip"
            >
              {t.skip}
            </Button>
            <Button
              onClick={handlePracticeSilently}
              className="flex-1"
              disabled={!hasListened}
              data-testid="pronunciation-practice-silently"
            >
              {t.practiceSilently || 'I practiced'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      {/* Progress bar */}
      <div className="h-1 bg-muted">
        <div 
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${(position / total) * 100}%` }}
        />
      </div>

      <CardContent className="flex flex-col gap-6 p-6">
        {/* Word display */}
        <div className="text-center space-y-2">
          <motion.h2 
            className="text-4xl font-bold text-foreground"
            key={word.id}
            initial={prefersReducedMotion ? {} : { scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            {word.macedonian}
          </motion.h2>
          <p className="text-lg text-muted-foreground font-mono">
            {word.transliteration}
          </p>
          <p className="text-sm text-muted-foreground">
            {word.english}
          </p>
          {word.phonetic && (
            <p className="text-xs text-muted-foreground/70 font-mono">
              [{word.phonetic}]
            </p>
          )}
        </div>

        {/* Step indicator */}
        <div className="flex justify-center gap-2">
          {['listen', 'record', 'compare'].map((s, i) => (
            <div
              key={s}
              className={cn(
                "h-2 w-2 rounded-full transition-colors",
                step === s ? "bg-primary" : 
                  (['listen', 'record', 'compare'].indexOf(step) > i ? "bg-primary/50" : "bg-muted")
              )}
            />
          ))}
        </div>

        {/* Main interaction area */}
        <AnimatePresence mode="wait">
          {step === 'listen' && (
            <motion.div
              key="listen"
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? {} : { opacity: 0, y: -20 }}
              className="flex flex-col items-center gap-4"
            >
              <p className="text-sm text-muted-foreground">{t.listenFirst}</p>
              
              {/* Reference audio button */}
              <Button
                size="lg"
                variant={hasListened ? "outline" : "default"}
                onClick={playReference}
                disabled={isPlayingReference}
                className="min-h-[64px] min-w-[200px] rounded-full"
                data-testid="pronunciation-reference-audio"
              >
                {isPlayingReference ? (
                  <Pause className="h-6 w-6 mr-2" />
                ) : usingTTS ? (
                  <Volume1 className="h-6 w-6 mr-2" />
                ) : (
                  <Volume2 className="h-6 w-6 mr-2" />
                )}
                {t.tapToListen}
              </Button>

              {/* TTS indicator */}
              {usingTTS && hasListened && (
                <p className="text-xs text-muted-foreground/70">
                  Using text-to-speech
                </p>
              )}

              {/* Audio error message - only show if TTS also failed */}
              {audioError && !usingTTS && (
                <p className="text-xs text-muted-foreground">
                  Using synthesized audio
                </p>
              )}

              {hasListened && (
                <motion.p
                  initial={prefersReducedMotion ? {} : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-success"
                >
                  ✓ {t.nowYourTurn}
                </motion.p>
              )}
            </motion.div>
          )}

          {step === 'record' && (
            <motion.div
              key="record"
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? {} : { opacity: 0, y: -20 }}
              className="flex flex-col items-center gap-4"
            >
              <p className="text-sm text-muted-foreground">
                {recorderState === 'recording' ? t.recording : t.holdToRecord}
              </p>

              {/* Recording progress */}
              {recorderState === 'recording' && (
                <div className="w-full max-w-[200px]">
                  <Progress value={recordingProgress} className="h-2" />
                </div>
              )}

              {/* Record button */}
              <button
                onMouseDown={handleRecordStart}
                onMouseUp={handleRecordStop}
                onMouseLeave={recorderState === 'recording' ? handleRecordStop : undefined}
                onTouchStart={handleRecordStart}
                onTouchEnd={handleRecordStop}
                disabled={recordButtonState.disabled}
                aria-label={recordButtonState.label}
                data-testid="pronunciation-record"
                className={cn(
                  "flex h-24 w-24 items-center justify-center rounded-full transition-all",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  recorderState === 'recording' 
                    ? "bg-destructive text-white scale-110 shadow-lg" 
                    : "bg-primary text-[#0a0a0a] hover:bg-primary/90",
                  recordButtonState.disabled && "opacity-50 cursor-not-allowed"
                )}
              >
                {recordButtonState.icon}
              </button>

              {recorderState === 'error' && (
                <p className="text-sm text-destructive text-center max-w-[250px]">
                  {t.micPermissionDenied}
                </p>
              )}
            </motion.div>
          )}

          {step === 'scoring' && (
            <motion.div
              key="scoring"
              initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={prefersReducedMotion ? {} : { opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center gap-4 py-8"
            >
              <div className="relative">
                <div className="h-16 w-16 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
              </div>
              <p className="text-muted-foreground">
                {t.analyzing ?? 'Analyzing your pronunciation...'}
              </p>
            </motion.div>
          )}

          {step === 'compare' && (
            <motion.div
              key="compare"
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? {} : { opacity: 0, y: -20 }}
              className="flex flex-col items-center gap-6"
            >
              {/* Score display */}
              {score && (
                <motion.div
                  initial={prefersReducedMotion ? {} : { scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="flex flex-col items-center gap-2"
                >
                  <div className={cn(
                    "flex items-center justify-center w-20 h-20 rounded-full text-3xl font-bold",
                    getScoreBgClass(score.similarity),
                    getScoreColorClass(score.similarity)
                  )}>
                    {Math.round(score.similarity)}%
                  </div>
                  <p className={cn("text-sm font-medium", getScoreColorClass(score.similarity))}>
                    {score.similarity >= 90
                      ? (t.excellent ?? 'Excellent!')
                      : score.similarity >= 70
                      ? (t.good ?? 'Good!')
                      : score.similarity >= 50
                      ? (t.almostThere ?? 'Almost there!')
                      : (t.needsWork ?? 'Keep practicing!')}
                  </p>
                  {/* Feedback hint */}
                  {score.feedbackKey && score.similarity < 90 && (
                    <p className="text-xs text-muted-foreground text-center max-w-[200px]">
                      {score.feedbackKey === 'tooShort' && (t.tooShort ?? 'Try speaking a bit longer')}
                      {score.feedbackKey === 'tooLong' && (t.tooLong ?? 'Try speaking a bit shorter')}
                      {score.feedbackKey === 'tryLouder' && (t.tryLouder ?? 'Try speaking louder')}
                      {score.feedbackKey === 'trySlower' && (t.trySlower ?? 'Try speaking slower')}
                      {score.feedbackKey === 'needsWork' && null}
                    </p>
                  )}
                  {/* XP earned */}
                  {score.xpReward > 0 && (
                    <motion.div
                      initial={prefersReducedMotion ? {} : { y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400"
                    >
                      <span className="text-base">⭐</span>
                      +{score.xpReward} XP
                    </motion.div>
                  )}
                  {/* Attempts remaining hint */}
                  {attemptNumber < 3 && score.similarity < 70 && (
                    <p className="text-xs text-muted-foreground">
                      {t.attemptsRemaining ?? `${3 - attemptNumber} attempts remaining`}
                    </p>
                  )}
                </motion.div>
              )}

              {/* Playback buttons */}
              <div className="flex gap-4">
                {/* Reference audio */}
                <Button
                  variant="outline"
                  size="lg"
                  onClick={playReference}
                  disabled={isPlayingReference}
                  className="flex-1 min-h-[56px]"
                  data-testid="pronunciation-play-reference"
                >
                  <Volume2 className="h-5 w-5 mr-2" />
                  {t.playReference}
                </Button>

                {/* User recording */}
                <Button
                  variant="outline"
                  size="lg"
                  onClick={playRecording}
                  disabled={!recordedAudioUrl || isPlayingRecording}
                  className="flex-1 min-h-[56px]"
                  data-testid="pronunciation-play-recording"
                >
                  {isPlayingRecording ? (
                    <Pause className="h-5 w-5 mr-2" />
                  ) : (
                    <Play className="h-5 w-5 mr-2" />
                  )}
                  {t.playYours}
                </Button>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 w-full">
                {/* Show "Try Again" if there are attempts remaining and score is below passing */}
                {attemptNumber < 3 && score && score.similarity < 70 && (
                  <Button
                    variant="outline"
                    onClick={handleTryAgain}
                    className="flex-1 min-h-[48px]"
                    data-testid="pronunciation-try-again"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    {t.tryAgain}
                  </Button>
                )}

                <Button
                  variant="default"
                  onClick={handleSoundsGood}
                  className={cn(
                    "flex-1 min-h-[48px]",
                    score && score.similarity >= 70 
                      ? "bg-success hover:bg-success/90" 
                      : "bg-primary hover:bg-primary/90"
                  )}
                  data-testid="pronunciation-sounds-good"
                >
                  <Check className="h-4 w-4 mr-2" />
                  {score ? (t.gotIt ?? 'Got it') : t.soundsGood}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Skip button (always visible) */}
        <div className="flex justify-center pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSkip}
            className="text-muted-foreground hover:text-foreground"
            data-testid="pronunciation-skip"
          >
            <X className="h-4 w-4 mr-1" />
            {t.skip}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
