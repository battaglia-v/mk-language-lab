'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Square, Play, Pause, RotateCcw, Volume2, Check, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useAudioRecorder } from '@/hooks/use-audio-recorder';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { cn } from '@/lib/utils';
import { triggerHaptic } from '@/lib/haptics';

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

interface PronunciationCardProps {
  /** Word to practice */
  word: PronunciationWord;
  /** Current position (1-indexed) */
  position: number;
  /** Total words in session */
  total: number;
  /** Callback when user completes this word */
  onComplete: (result: { wordId: string; score: number; skipped: boolean }) => void;
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
  };
  /** Additional class name */
  className?: string;
}

type PracticeStep = 'listen' | 'record' | 'compare';

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

  const referenceAudioRef = useRef<HTMLAudioElement | null>(null);
  const recordingAudioRef = useRef<HTMLAudioElement | null>(null);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const prefersReducedMotion = useReducedMotion();
  const maxRecordingDuration = 3; // seconds

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
      setStep('compare');
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

  // Play reference audio
  const playReference = useCallback(() => {
    if (!word.audioUrl) return;
    
    if (referenceAudioRef.current) {
      referenceAudioRef.current.pause();
      referenceAudioRef.current.currentTime = 0;
    }

    const audio = new Audio(word.audioUrl);
    referenceAudioRef.current = audio;

    audio.onplay = () => setIsPlayingReference(true);
    audio.onended = () => {
      setIsPlayingReference(false);
      setHasListened(true);
    };
    audio.onpause = () => setIsPlayingReference(false);
    audio.onerror = () => setIsPlayingReference(false);

    audio.play().catch(() => {
      setIsPlayingReference(false);
    });
  }, [word.audioUrl]);

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

  // Handle "Sounds Good" - mark as complete
  const handleSoundsGood = useCallback(() => {
    triggerHaptic('success');
    onComplete({ wordId: word.id, score: 100, skipped: false });
    onNext();
  }, [word.id, onComplete, onNext]);

  // Handle "Try Again"
  const handleTryAgain = useCallback(() => {
    triggerHaptic('light');
    resetRecorder();
    setStep('record');
    setRecordingProgress(0);
  }, [resetRecorder]);

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

  // Not supported fallback
  if (!isSupported) {
    return (
      <Card className={cn("border-destructive/50 bg-destructive/5", className)}>
        <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <p className="text-muted-foreground">{t.micNotSupported}</p>
          <Button variant="outline" onClick={handleSkip}>
            {t.skip}
          </Button>
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
                disabled={!word.audioUrl || isPlayingReference}
                className="min-h-[64px] min-w-[200px] rounded-full"
              >
                {isPlayingReference ? (
                  <Pause className="h-6 w-6 mr-2" />
                ) : (
                  <Volume2 className="h-6 w-6 mr-2" />
                )}
                {t.tapToListen}
              </Button>

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
                className={cn(
                  "flex h-24 w-24 items-center justify-center rounded-full transition-all",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  recorderState === 'recording' 
                    ? "bg-destructive text-white scale-110 shadow-lg" 
                    : "bg-primary text-primary-foreground hover:bg-primary/90",
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

          {step === 'compare' && (
            <motion.div
              key="compare"
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? {} : { opacity: 0, y: -20 }}
              className="flex flex-col items-center gap-6"
            >
              {/* Playback buttons */}
              <div className="flex gap-4">
                {/* Reference audio */}
                <Button
                  variant="outline"
                  size="lg"
                  onClick={playReference}
                  disabled={isPlayingReference}
                  className="flex-1 min-h-[56px]"
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
                <Button
                  variant="outline"
                  onClick={handleTryAgain}
                  className="flex-1 min-h-[48px]"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  {t.tryAgain}
                </Button>

                <Button
                  variant="default"
                  onClick={handleSoundsGood}
                  className="flex-1 min-h-[48px] bg-success hover:bg-success/90"
                >
                  <Check className="h-4 w-4 mr-2" />
                  {t.soundsGood}
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
          >
            <X className="h-4 w-4 mr-1" />
            {t.skip}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
