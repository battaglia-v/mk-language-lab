'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * Audio player states with explicit failure modes
 * 
 * @description
 * - idle: No audio loaded/ready
 * - loading: Fetching audio from URL or generating TTS
 * - ready: Audio loaded and ready to play
 * - playing: Audio is currently playing
 * - paused: Audio was paused mid-playback
 * - ended: Audio finished playing
 * - error: Something went wrong (see errorMessage)
 */
export type AudioPlayerState = 
  | 'idle' 
  | 'loading' 
  | 'ready' 
  | 'playing' 
  | 'paused' 
  | 'ended' 
  | 'error';

/**
 * Error types for audio playback
 */
export type AudioErrorType = 
  | 'network'      // Failed to fetch audio
  | 'decode'       // Audio format not supported
  | 'aborted'      // User/system cancelled playback
  | 'blocked'      // Browser blocked autoplay
  | 'tts_unavailable' // TTS not supported
  | 'unknown';

export interface AudioPlayerResult {
  /** Current playback state */
  state: AudioPlayerState;
  /** Human-readable error message (if state is 'error') */
  errorMessage: string | null;
  /** Error type for programmatic handling */
  errorType: AudioErrorType | null;
  /** Current playback progress (0-1) */
  progress: number;
  /** Duration in seconds (0 if unknown) */
  duration: number;
  /** Current time in seconds */
  currentTime: number;
  /** Whether TTS is being used as fallback */
  usingTTS: boolean;
  /** Play the audio */
  play: () => Promise<void>;
  /** Pause the audio */
  pause: () => void;
  /** Stop and reset to beginning */
  stop: () => void;
  /** Load a new audio URL */
  load: (url: string) => void;
  /** Speak text using TTS (fallback) */
  speakTTS: (text: string, lang?: string) => void;
  /** Stop TTS speech */
  stopTTS: () => void;
  /** Retry last action */
  retry: () => void;
}

interface UseAudioPlayerOptions {
  /** Initial audio URL */
  initialUrl?: string;
  /** Auto-play when ready */
  autoPlay?: boolean;
  /** Use TTS fallback if audio fails */
  useTTSFallback?: boolean;
  /** TTS language code */
  ttsLang?: string;
  /** TTS speech rate (0.1 - 10) */
  ttsRate?: number;
  /** Callback when playback ends */
  onEnded?: () => void;
  /** Callback on error */
  onError?: (errorType: AudioErrorType, message: string) => void;
}

/**
 * useAudioPlayer - Robust audio playback hook with explicit states
 * 
 * Features:
 * - Explicit loading/playing/error states
 * - TTS fallback for when audio URLs fail
 * - Clear error messages for users
 * - Retry functionality
 * - Mobile browser compatibility (user interaction required)
 * 
 * @example
 * const { state, play, errorMessage } = useAudioPlayer({ initialUrl: audioSrc });
 * 
 * if (state === 'error') {
 *   return <ErrorMessage>{errorMessage}</ErrorMessage>;
 * }
 */
export function useAudioPlayer(options: UseAudioPlayerOptions = {}): AudioPlayerResult {
  const {
    initialUrl,
    autoPlay = false,
    useTTSFallback = true,
    ttsLang = 'sr-RS', // Serbian as closest to Macedonian
    ttsRate = 0.85,
    onEnded,
    onError,
  } = options;

  const [state, setState] = useState<AudioPlayerState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<AudioErrorType | null>(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [usingTTS, setUsingTTS] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const urlRef = useRef<string | undefined>(initialUrl);
  const lastTextRef = useRef<string>('');
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Clear progress interval
  const clearProgressInterval = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }, []);

  // Update progress during playback
  const startProgressInterval = useCallback(() => {
    clearProgressInterval();
    progressIntervalRef.current = setInterval(() => {
      if (audioRef.current) {
        const { currentTime: ct, duration: d } = audioRef.current;
        setCurrentTime(ct);
        setProgress(d > 0 ? ct / d : 0);
      }
    }, 100);
  }, [clearProgressInterval]);

  // Clean up audio element
  const cleanupAudio = useCallback(() => {
    clearProgressInterval();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current.load();
      audioRef.current = null;
    }
  }, [clearProgressInterval]);

  // Stop TTS
  const stopTTS = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setUsingTTS(false);
  }, []);

  // Map MediaError to our error types
  const mapMediaError = useCallback((error: MediaError | null): { type: AudioErrorType; message: string } => {
    if (!error) {
      return { type: 'unknown', message: 'Unknown playback error' };
    }
    
    switch (error.code) {
      case MediaError.MEDIA_ERR_ABORTED:
        return { type: 'aborted', message: 'Audio playback was cancelled' };
      case MediaError.MEDIA_ERR_NETWORK:
        return { type: 'network', message: 'Failed to load audio. Please check your connection and try again.' };
      case MediaError.MEDIA_ERR_DECODE:
        return { type: 'decode', message: 'Audio format not supported by your browser' };
      case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
        return { type: 'decode', message: 'Audio source not available' };
      default:
        return { type: 'unknown', message: 'Unexpected playback error' };
    }
  }, []);

  // Handle audio errors
  const handleError = useCallback((type: AudioErrorType, message: string) => {
    setState('error');
    setErrorType(type);
    setErrorMessage(message);
    onError?.(type, message);
    clearProgressInterval();
  }, [onError, clearProgressInterval]);

  // Speak text using TTS
  const speakTTS = useCallback((text: string, lang?: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      handleError('tts_unavailable', 'Text-to-speech is not supported in this browser');
      return;
    }

    stopTTS();
    lastTextRef.current = text;
    setUsingTTS(true);
    setState('loading');

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang || ttsLang;
    utterance.rate = ttsRate;
    utterance.pitch = 1;

    utterance.onstart = () => {
      setState('playing');
    };

    utterance.onend = () => {
      setState('ended');
      setUsingTTS(false);
      onEnded?.();
    };

    utterance.onerror = (event) => {
      // Some errors are not real errors (e.g., interrupted)
      if (event.error === 'interrupted' || event.error === 'canceled') {
        setState('idle');
        return;
      }
      handleError('tts_unavailable', `Speech synthesis failed: ${event.error}`);
    };

    window.speechSynthesis.speak(utterance);
  }, [ttsLang, ttsRate, stopTTS, onEnded, handleError]);

  // Load a new audio URL
  const load = useCallback((url: string) => {
    cleanupAudio();
    stopTTS();
    urlRef.current = url;
    setState('loading');
    setErrorMessage(null);
    setErrorType(null);
    setProgress(0);
    setCurrentTime(0);
    setDuration(0);

    const audio = new Audio();
    audioRef.current = audio;

    audio.onloadedmetadata = () => {
      setDuration(audio.duration);
      setState('ready');
      if (autoPlay) {
        audio.play().catch(() => {
          handleError('blocked', 'Playback was blocked. Tap to play audio.');
        });
      }
    };

    audio.onplay = () => {
      setState('playing');
      startProgressInterval();
    };

    audio.onpause = () => {
      if (state !== 'ended') {
        setState('paused');
      }
      clearProgressInterval();
    };

    audio.onended = () => {
      setState('ended');
      clearProgressInterval();
      setProgress(1);
      onEnded?.();
    };

    audio.onerror = () => {
      const { type, message } = mapMediaError(audio.error);
      
      // Try TTS fallback for network/decode errors
      if (useTTSFallback && (type === 'network' || type === 'decode') && lastTextRef.current) {
        speakTTS(lastTextRef.current);
        return;
      }
      
      handleError(type, message);
    };

    audio.src = url;
    audio.load();
  }, [cleanupAudio, stopTTS, autoPlay, state, startProgressInterval, clearProgressInterval, onEnded, mapMediaError, useTTSFallback, speakTTS, handleError]);

  // Play audio
  const play = useCallback(async () => {
    // If using TTS, resume speech
    if (usingTTS && window.speechSynthesis?.paused) {
      window.speechSynthesis.resume();
      setState('playing');
      return;
    }

    // If no audio loaded but we have a URL, load it first
    if (!audioRef.current && urlRef.current) {
      load(urlRef.current);
      return;
    }

    if (!audioRef.current) {
      handleError('unknown', 'No audio loaded');
      return;
    }

    try {
      setState('loading');
      await audioRef.current.play();
      // State will be set to 'playing' by onplay handler
    } catch (err) {
      // Handle autoplay blocking
      if (err instanceof DOMException && err.name === 'NotAllowedError') {
        handleError('blocked', 'Tap to enable audio playback');
      } else {
        handleError('unknown', 'Failed to play audio');
      }
    }
  }, [usingTTS, load, handleError]);

  // Pause audio
  const pause = useCallback(() => {
    if (usingTTS && window.speechSynthesis) {
      window.speechSynthesis.pause();
      setState('paused');
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
    }
  }, [usingTTS]);

  // Stop audio and reset
  const stop = useCallback(() => {
    stopTTS();
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    
    clearProgressInterval();
    setProgress(0);
    setCurrentTime(0);
    setState('ready');
  }, [stopTTS, clearProgressInterval]);

  // Retry last action
  const retry = useCallback(() => {
    setErrorMessage(null);
    setErrorType(null);
    
    if (urlRef.current) {
      load(urlRef.current);
    } else if (lastTextRef.current) {
      speakTTS(lastTextRef.current);
    } else {
      setState('idle');
    }
  }, [load, speakTTS]);

  // Load initial URL
  useEffect(() => {
    if (initialUrl) {
      load(initialUrl);
    }
  }, [initialUrl, load]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupAudio();
      stopTTS();
    };
  }, [cleanupAudio, stopTTS]);

  return {
    state,
    errorMessage,
    errorType,
    progress,
    duration,
    currentTime,
    usingTTS,
    play,
    pause,
    stop,
    load,
    speakTTS,
    stopTTS,
    retry,
  };
}

/**
 * Get user-friendly status text for audio state
 */
export function getAudioStateText(state: AudioPlayerState, t?: {
  loading?: string;
  playing?: string;
  paused?: string;
  error?: string;
  tapToPlay?: string;
}): string {
  const defaults = {
    loading: 'Loading audio...',
    playing: 'Playing',
    paused: 'Paused',
    error: 'Audio unavailable',
    tapToPlay: 'Tap to play',
  };
  
  const labels = { ...defaults, ...t };
  
  switch (state) {
    case 'loading':
      return labels.loading;
    case 'playing':
      return labels.playing;
    case 'paused':
      return labels.paused;
    case 'error':
      return labels.error;
    case 'ready':
    case 'ended':
    case 'idle':
      return labels.tapToPlay;
    default:
      return labels.tapToPlay;
  }
}

