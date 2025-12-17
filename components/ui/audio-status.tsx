'use client';

import { Volume2, VolumeX, Loader2, AlertCircle, RefreshCw, Play, User, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { AudioPlayerState, AudioErrorType } from '@/hooks/use-audio-player';

/**
 * AudioSourceBadge - Shows whether audio is Native or AI/TTS
 */
function AudioSourceBadge({ 
  isNative, 
  className 
}: { 
  isNative: boolean; 
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
        isNative
          ? 'bg-green-500/10 text-green-500'
          : 'bg-amber-500/10 text-amber-500',
        className
      )}
    >
      {isNative ? (
        <>
          <User className="h-3 w-3" aria-hidden="true" />
          <span className="label-nowrap">Native</span>
        </>
      ) : (
        <>
          <Bot className="h-3 w-3" aria-hidden="true" />
          <span className="label-nowrap">AI</span>
        </>
      )}
    </span>
  );
}

interface AudioStatusProps {
  /** Current audio state */
  state: AudioPlayerState;
  /** Error message (when state is 'error') */
  errorMessage?: string | null;
  /** Error type for conditional rendering */
  errorType?: AudioErrorType | null;
  /** Callback for retry button */
  onRetry?: () => void;
  /** Callback for play button */
  onPlay?: () => void;
  /** Whether using TTS fallback */
  usingTTS?: boolean;
  /** Additional class name */
  className?: string;
  /** Compact mode (icon only) */
  compact?: boolean;
  /** Show source badge (Native vs AI) */
  showSourceBadge?: boolean;
  /** Translation strings */
  t?: {
    loading?: string;
    playing?: string;
    usingTTS?: string;
    error?: string;
    retry?: string;
    tapToPlay?: string;
  };
}

/**
 * AudioStatus - Visual feedback for audio playback state
 * 
 * Shows appropriate icons, loading states, and error messages
 * with retry functionality. Never leaves users confused about
 * what happened with audio.
 * 
 * @example
 * <AudioStatus
 *   state={audioState}
 *   errorMessage={error}
 *   onRetry={() => player.retry()}
 * />
 */
export function AudioStatus({
  state,
  errorMessage,
  errorType,
  onRetry,
  onPlay,
  usingTTS,
  className,
  compact = false,
  showSourceBadge = false,
  t,
}: AudioStatusProps) {
  const labels = {
    loading: t?.loading ?? 'Loading audio...',
    playing: t?.playing ?? 'Playing',
    usingTTS: t?.usingTTS ?? 'Using text-to-speech',
    error: t?.error ?? 'Audio not available yet',
    retry: t?.retry ?? 'Try again',
    tapToPlay: t?.tapToPlay ?? 'Tap to play',
  };

  // Loading state
  if (state === 'loading') {
    return (
      <div className={cn(
        "flex items-center gap-2 text-muted-foreground",
        compact ? "text-xs" : "text-sm",
        className
      )}>
        <Loader2 className={cn("animate-spin", compact ? "h-4 w-4" : "h-5 w-5")} aria-hidden="true" />
        {!compact && <span>{labels.loading}</span>}
      </div>
    );
  }

  // Playing state
  if (state === 'playing') {
    return (
      <div className={cn(
        "flex items-center gap-2",
        compact ? "text-xs" : "text-sm",
        usingTTS ? "text-amber-400" : "text-primary",
        className
      )}>
        <Volume2 className={cn("animate-pulse", compact ? "h-4 w-4" : "h-5 w-5")} aria-hidden="true" />
        {!compact && (
          <span className="metadata-row gap-2">
            <span>{usingTTS ? labels.usingTTS : labels.playing}</span>
            {showSourceBadge && <AudioSourceBadge isNative={!usingTTS} />}
          </span>
        )}
      </div>
    );
  }

  // Error state with retry
  if (state === 'error') {
    const errorDisplay = errorMessage || labels.error;
    
    return (
      <div className={cn(
        "flex flex-col gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3",
        compact && "p-2",
        className
      )}>
        <div className="flex items-center gap-2 text-amber-200">
          <AlertCircle className={cn(compact ? "h-4 w-4" : "h-5 w-5", "flex-shrink-0")} aria-hidden="true" />
          <span className={cn("font-medium", compact ? "text-xs" : "text-sm")}>
            {compact ? labels.error : errorDisplay}
          </span>
        </div>
        
        {!compact && errorType !== 'aborted' && onRetry && (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onRetry}
              className="h-8 gap-1.5 rounded-full border border-amber-500/30 px-3 text-xs font-semibold text-amber-200 hover:bg-amber-500/20"
            >
              <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
              {labels.retry}
            </Button>
            
            {/* Show TTS option if available */}
            {errorType === 'network' && (
              <span className="text-xs text-amber-300/70">
                or try text-to-speech
              </span>
            )}
          </div>
        )}
      </div>
    );
  }

  // Ready/idle state - show play prompt
  if (state === 'ready' || state === 'idle' || state === 'ended' || state === 'paused') {
    if (!onPlay) return null;
    
    return (
      <Button
        variant="ghost"
        size={compact ? "sm" : "default"}
        onClick={onPlay}
        className={cn(
          "gap-2 rounded-full",
          compact ? "h-8 px-3 text-xs" : "h-10 px-4 text-sm",
          "text-muted-foreground hover:text-primary",
          className
        )}
      >
        <Play className={cn(compact ? "h-4 w-4" : "h-5 w-5")} aria-hidden="true" />
        {!compact && <span>{labels.tapToPlay}</span>}
      </Button>
    );
  }

  return null;
}

/**
 * AudioErrorBanner - Full-width error banner for audio issues
 * 
 * Use this for prominent error display, e.g., at the top of a practice session
 */
interface AudioErrorBannerProps {
  /** Error message to display */
  message: string;
  /** Retry callback */
  onRetry?: () => void;
  /** Dismiss callback */
  onDismiss?: () => void;
  /** Additional class name */
  className?: string;
}

export function AudioErrorBanner({
  message,
  onRetry,
  onDismiss,
  className,
}: AudioErrorBannerProps) {
  return (
    <div className={cn(
      "flex flex-col gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 sm:flex-row sm:items-center sm:justify-between",
      className
    )}>
      <div className="flex items-start gap-3">
        <VolumeX className="h-5 w-5 flex-shrink-0 text-amber-400 mt-0.5" aria-hidden="true" />
        <div className="space-y-1">
          <p className="font-medium text-amber-100">Audio Issue</p>
          <p className="text-sm text-amber-200/80">{message}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {onRetry && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRetry}
            className="h-9 gap-1.5 rounded-full border border-amber-500/40 px-4 text-sm font-semibold text-amber-200 hover:bg-amber-500/20"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Try Again
          </Button>
        )}
        {onDismiss && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="h-9 rounded-full px-4 text-sm text-amber-300/70 hover:text-amber-200"
          >
            Dismiss
          </Button>
        )}
      </div>
    </div>
  );
}

/**
 * NativeAudioButton - Button specifically for "Listen to Native" feature
 * 
 * Handles all states (loading, playing, error) in a single button
 */
interface NativeAudioButtonProps {
  /** Current audio state */
  state: AudioPlayerState;
  /** Error message */
  errorMessage?: string | null;
  /** Whether using TTS fallback */
  usingTTS?: boolean;
  /** Play callback */
  onPlay: () => void;
  /** Stop callback */
  onStop?: () => void;
  /** Retry callback */
  onRetry?: () => void;
  /** Additional class name */
  className?: string;
  /** Button label */
  label?: string;
  /** Size variant */
  size?: 'sm' | 'default' | 'lg';
}

export function NativeAudioButton({
  state,
  errorMessage,
  usingTTS,
  onPlay,
  onStop,
  onRetry,
  className,
  label = 'Listen to Native',
  size = 'default',
}: NativeAudioButtonProps) {
  const isLoading = state === 'loading';
  const isPlaying = state === 'playing';
  const isError = state === 'error';

  const handleClick = () => {
    if (isPlaying && onStop) {
      onStop();
    } else if (isError && onRetry) {
      onRetry();
    } else {
      onPlay();
    }
  };

  const sizeClasses = {
    sm: 'h-9 px-3 text-sm',
    default: 'h-11 px-4 text-sm',
    lg: 'h-12 px-5 text-base',
  };

  const iconSize = {
    sm: 'h-4 w-4',
    default: 'h-5 w-5',
    lg: 'h-5 w-5',
  };

  return (
    <div className="flex flex-col gap-2">
      <Button
        variant={isError ? 'outline' : isPlaying ? 'secondary' : 'default'}
        onClick={handleClick}
        disabled={isLoading}
        className={cn(
          "gap-2 rounded-full font-semibold transition-all",
          sizeClasses[size],
          isError && "border-amber-500/40 text-amber-200 hover:bg-amber-500/10",
          className
        )}
      >
        {isLoading ? (
          <>
            <Loader2 className={cn(iconSize[size], "animate-spin")} aria-hidden="true" />
            <span>Loading...</span>
          </>
        ) : isPlaying ? (
          <>
            <Volume2 className={cn(iconSize[size], "animate-pulse")} aria-hidden="true" />
            <span>{usingTTS ? 'Speaking...' : 'Playing...'}</span>
          </>
        ) : isError ? (
          <>
            <RefreshCw className={iconSize[size]} aria-hidden="true" />
            <span>Retry Audio</span>
          </>
        ) : (
          <>
            <Volume2 className={iconSize[size]} aria-hidden="true" />
            <span>{label}</span>
          </>
        )}
      </Button>

      {/* Error explanation below button */}
      {isError && errorMessage && (
        <p className="text-xs text-amber-300/70 text-center px-2">
          {errorMessage}
        </p>
      )}

      {/* TTS indicator */}
      {isPlaying && usingTTS && (
        <p className="text-xs text-amber-400 text-center">
          Using text-to-speech (native audio unavailable)
        </p>
      )}
    </div>
  );
}

