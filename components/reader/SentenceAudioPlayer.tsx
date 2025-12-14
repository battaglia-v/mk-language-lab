'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Eye, EyeOff, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Constant moved outside component to avoid useCallback dependency issues
const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5] as const;

interface Sentence {
  id: string;
  mk: string;
  en: string;
  audioUrl?: string;
}

interface SentenceAudioPlayerProps {
  /** Array of sentences in the text */
  sentences: Sentence[];
  /** Currently active sentence index */
  activeSentenceIndex: number;
  /** Callback when sentence changes */
  onSentenceChange: (index: number) => void;
  /** Callback when audio plays */
  onAudioPlay?: (sentenceId: string) => void;
  /** Callback when translation is toggled */
  onTranslationToggle?: (visible: boolean) => void;
  /** Translations */
  t: {
    play: string;
    pause: string;
    previous: string;
    next: string;
    showTranslation: string;
    hideTranslation: string;
    sentence: string;
    of: string;
  };
  /** Additional class name */
  className?: string;
}

/**
 * SentenceAudioPlayer - Audio controls for sentence-level playback in Reader
 * 
 * Features:
 * - Play/pause current sentence audio
 * - Navigate between sentences
 * - Toggle translation visibility
 * - Playback speed control
 */
export function SentenceAudioPlayer({
  sentences,
  activeSentenceIndex,
  onSentenceChange,
  onAudioPlay,
  onTranslationToggle,
  t,
  className,
}: SentenceAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [progress, setProgress] = useState(0);

  const currentSentence = sentences[activeSentenceIndex];
  const hasAudio = !!currentSentence?.audioUrl;
  const hasPrevious = activeSentenceIndex > 0;
  const hasNext = activeSentenceIndex < sentences.length - 1;

  // Update audio source when sentence changes
  useEffect(() => {
    if (audioRef.current && currentSentence?.audioUrl) {
      audioRef.current.src = currentSentence.audioUrl;
      audioRef.current.playbackRate = playbackSpeed;
      setProgress(0);
      setIsPlaying(false);
    }
  }, [currentSentence?.audioUrl, playbackSpeed]);

  // Handle play/pause
  const togglePlay = useCallback(async () => {
    if (!audioRef.current || !hasAudio) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        await audioRef.current.play();
        setIsPlaying(true);
        onAudioPlay?.(currentSentence.id);
      }
    } catch (error) {
      console.error('[SentenceAudioPlayer] Play error:', error);
      setIsPlaying(false);
    }
  }, [isPlaying, hasAudio, currentSentence?.id, onAudioPlay]);

  // Handle navigation
  const goToPrevious = useCallback(() => {
    if (hasPrevious) {
      onSentenceChange(activeSentenceIndex - 1);
    }
  }, [hasPrevious, activeSentenceIndex, onSentenceChange]);

  const goToNext = useCallback(() => {
    if (hasNext) {
      onSentenceChange(activeSentenceIndex + 1);
    }
  }, [hasNext, activeSentenceIndex, onSentenceChange]);

  // Toggle translation
  const toggleTranslation = useCallback(() => {
    const newValue = !showTranslation;
    setShowTranslation(newValue);
    onTranslationToggle?.(newValue);
  }, [showTranslation, onTranslationToggle]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  // Handle audio ended
  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    setProgress(0);
    // Auto-advance to next sentence
    if (hasNext) {
      setTimeout(() => {
        onSentenceChange(activeSentenceIndex + 1);
      }, 500);
    }
  }, [hasNext, activeSentenceIndex, onSentenceChange]);

  // Update progress
  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      const pct = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setProgress(isNaN(pct) ? 0 : pct);
    }
  }, []);

  // Cycle through playback speeds
  const cycleSpeed = useCallback(() => {
    const currentIdx = PLAYBACK_SPEEDS.indexOf(playbackSpeed as typeof PLAYBACK_SPEEDS[number]);
    const nextIdx = (currentIdx + 1) % PLAYBACK_SPEEDS.length;
    const newSpeed = PLAYBACK_SPEEDS[nextIdx];
    setPlaybackSpeed(newSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = newSpeed;
    }
  }, [playbackSpeed]);

  return (
    <div className={cn(
      "flex flex-col gap-3 rounded-2xl border border-border/40 bg-white/5 p-4",
      className
    )}>
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        onEnded={handleEnded}
        onTimeUpdate={handleTimeUpdate}
        preload="metadata"
      />

      {/* Sentence indicator */}
      <div className="flex items-center justify-between">
        <Badge variant="outline" className="text-xs">
          {t.sentence} {activeSentenceIndex + 1} {t.of} {sentences.length}
        </Badge>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 rounded-full px-3 text-xs"
          onClick={cycleSpeed}
        >
          {playbackSpeed}x
        </Button>
      </div>

      {/* Current sentence display */}
      <div className="space-y-2">
        <p className="text-lg font-medium text-foreground">
          {currentSentence?.mk}
        </p>
        {showTranslation && (
          <p className="text-sm text-muted-foreground">
            {currentSentence?.en}
          </p>
        )}
      </div>

      {/* Progress bar */}
      {hasAudio && (
        <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-primary transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-between">
        {/* Left: Prev/Play/Next */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full"
            onClick={goToPrevious}
            disabled={!hasPrevious}
            aria-label={t.previous}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          <Button
            variant="default"
            size="icon"
            className="h-12 w-12 rounded-full bg-primary"
            onClick={togglePlay}
            disabled={!hasAudio}
            aria-label={isPlaying ? t.pause : t.play}
          >
            {isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5 ml-0.5" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full"
            onClick={goToNext}
            disabled={!hasNext}
            aria-label={t.next}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {/* Right: Translation toggle + Mute */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-10 w-10 rounded-full",
              showTranslation && "bg-primary/20 text-primary"
            )}
            onClick={toggleTranslation}
            aria-label={showTranslation ? t.hideTranslation : t.showTranslation}
          >
            {showTranslation ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full"
            onClick={toggleMute}
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? (
              <VolumeX className="h-5 w-5" />
            ) : (
              <Volume2 className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
