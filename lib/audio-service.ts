/**
 * Unified Audio Service
 *
 * Provides reliable audio playback with TTS fallback:
 * 1. Try native audio file if available
 * 2. Fall back to browser TTS if audio fails or unavailable
 * 3. Handle mobile-specific requirements (user gesture, voice preloading)
 *
 * Usage:
 *   import { audioService, useAudioPlayer } from '@/lib/audio-service';
 *
 *   // Simple playback
 *   await audioService.play({ text: 'Здраво', audioUrl: '/audio/zdravo.mp3' });
 *
 *   // React hook
 *   const { play, stop, isPlaying, isTTS } = useAudioPlayer();
 */

import { useCallback, useEffect, useRef, useState } from 'react';

export type AudioSource = 'native' | 'tts' | 'none';

export interface PlayOptions {
  /** Text to speak (required for TTS fallback) */
  text: string;
  /** Optional native audio URL */
  audioUrl?: string | null;
  /** Slow audio URL variant */
  slowUrl?: string | null;
  /** Play slow version */
  slow?: boolean;
  /** Preferred audio source */
  preferredSource?: 'native' | 'tts' | 'auto';
  /** Language for TTS (default: auto-detect) */
  lang?: 'mk' | 'en';
  /** Volume 0-1 (default: 1) */
  volume?: number;
  /** Playback rate for TTS (default: 1) */
  rate?: number;
}

export interface AudioState {
  isPlaying: boolean;
  source: AudioSource;
  error: string | null;
}

// Singleton state for voice preloading
let voicesLoaded = false;
let macedonianVoice: SpeechSynthesisVoice | null = null;
let englishVoice: SpeechSynthesisVoice | null = null;
let fallbackVoice: SpeechSynthesisVoice | null = null;

/**
 * Preload TTS voices (call early, ideally on page load after user interaction)
 */
export function preloadVoices(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      resolve();
      return;
    }

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length === 0) return false;

      // Find Macedonian voice
      macedonianVoice = voices.find(
        (v) => v.lang.startsWith('mk') || v.lang === 'mk-MK'
      ) || null;

      // Find English voice
      englishVoice = voices.find(
        (v) => v.lang.startsWith('en') && v.localService
      ) || voices.find(
        (v) => v.lang.startsWith('en')
      ) || null;

      // Fallback to any available voice
      fallbackVoice = voices.find((v) => v.localService) || voices[0] || null;

      voicesLoaded = true;
      return true;
    };

    // Try immediately
    if (loadVoices()) {
      resolve();
      return;
    }

    // Listen for voiceschanged event (required on some browsers)
    const handleVoicesChanged = () => {
      if (loadVoices()) {
        window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
        resolve();
      }
    };

    window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);

    // Timeout after 3 seconds
    setTimeout(() => {
      window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
      loadVoices(); // Try one more time
      resolve();
    }, 3000);
  });
}

/**
 * Check if TTS is available and has voices
 */
export function isTTSAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  if (!('speechSynthesis' in window)) return false;
  return voicesLoaded && (macedonianVoice !== null || fallbackVoice !== null);
}

/**
 * Detect language from text
 */
function detectLanguage(text: string): 'mk' | 'en' {
  // Check for Cyrillic characters (Macedonian)
  const cyrillicPattern = /[\u0400-\u04FF]/;
  return cyrillicPattern.test(text) ? 'mk' : 'en';
}

/**
 * Get the best available voice for the language
 */
function getVoiceForLanguage(lang: 'mk' | 'en'): SpeechSynthesisVoice | null {
  if (lang === 'mk') {
    return macedonianVoice || fallbackVoice;
  }
  return englishVoice || fallbackVoice;
}

/**
 * Play audio using native HTML5 Audio
 */
async function playNativeAudio(url: string, volume: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const audio = new Audio(url);
    audio.volume = volume;

    audio.onended = () => resolve();
    audio.onerror = () => reject(new Error('Native audio playback failed'));

    audio.play().catch(reject);

    // Store reference for stopping
    currentAudio = audio;
  });
}

/**
 * Play audio using browser TTS
 */
async function playTTS(
  text: string,
  lang: 'mk' | 'en',
  volume: number,
  rate: number
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!('speechSynthesis' in window)) {
      reject(new Error('TTS not available in this browser'));
      return;
    }

    // Cancel any existing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.volume = volume;
    utterance.rate = rate;

    const voice = getVoiceForLanguage(lang);
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    } else {
      utterance.lang = lang === 'mk' ? 'mk-MK' : 'en-US';
    }

    utterance.onend = () => resolve();
    utterance.onerror = (event) => {
      if (event.error === 'canceled') {
        resolve(); // User stopped playback
      } else {
        reject(new Error(`TTS error: ${event.error}`));
      }
    };

    window.speechSynthesis.speak(utterance);
    currentUtterance = utterance;
  });
}

// Current playback references
let currentAudio: HTMLAudioElement | null = null;
let currentUtterance: SpeechSynthesisUtterance | null = null;
let currentSource: AudioSource = 'none';

/**
 * Stop any currently playing audio
 */
export function stopAudio(): void {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }

  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }

  currentUtterance = null;
  currentSource = 'none';
}

/**
 * Main audio playback function
 *
 * @returns The source that was used for playback
 * @throws Error if both native audio and TTS fail
 */
export async function playAudio(options: PlayOptions): Promise<AudioSource> {
  const {
    text,
    audioUrl,
    slowUrl,
    slow = false,
    preferredSource = 'auto',
    lang,
    volume = 1,
    rate = 1,
  } = options;

  // Stop any current playback
  stopAudio();

  const detectedLang = lang || detectLanguage(text);
  const effectiveUrl = slow && slowUrl ? slowUrl : audioUrl;

  // Try native audio first (unless TTS is preferred)
  if (effectiveUrl && preferredSource !== 'tts') {
    try {
      currentSource = 'native';
      await playNativeAudio(effectiveUrl, volume);
      return 'native';
    } catch (error) {
      console.warn('[audio-service] Native audio failed, trying TTS fallback:', error);
    }
  }

  // Try TTS
  if (preferredSource !== 'native' && text) {
    // Ensure voices are loaded
    if (!voicesLoaded) {
      await preloadVoices();
    }

    try {
      currentSource = 'tts';
      await playTTS(text, detectedLang, volume, slow ? 0.7 : rate);
      return 'tts';
    } catch (error) {
      console.warn('[audio-service] TTS failed:', error);
    }
  }

  currentSource = 'none';
  throw new Error('Audio playback failed: both native audio and TTS unavailable');
}

/**
 * Check if currently playing
 */
export function isAudioPlaying(): boolean {
  if (currentAudio && !currentAudio.paused) {
    return true;
  }

  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    return window.speechSynthesis.speaking;
  }

  return false;
}

/**
 * Get current audio source
 */
export function getCurrentSource(): AudioSource {
  return currentSource;
}

// Export singleton service
export const audioService = {
  play: playAudio,
  stop: stopAudio,
  isPlaying: isAudioPlaying,
  getSource: getCurrentSource,
  preloadVoices,
  isTTSAvailable,
};

// React Hook for audio playback
export interface UseAudioPlayerReturn {
  play: (options: PlayOptions) => Promise<void>;
  stop: () => void;
  isPlaying: boolean;
  source: AudioSource;
  error: string | null;
  isTTS: boolean;
}

export function useAudioPlayer(): UseAudioPlayerReturn {
  const [isPlaying, setIsPlaying] = useState(false);
  const [source, setSource] = useState<AudioSource>('none');
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    // Preload voices on mount
    preloadVoices();

    return () => {
      mountedRef.current = false;
      stopAudio();
    };
  }, []);

  const play = useCallback(async (options: PlayOptions) => {
    setIsPlaying(true);
    setError(null);
    setSource('none');

    try {
      const usedSource = await playAudio(options);
      if (mountedRef.current) {
        setSource(usedSource);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : 'Audio playback failed');
      }
    } finally {
      if (mountedRef.current) {
        setIsPlaying(false);
      }
    }
  }, []);

  const stop = useCallback(() => {
    stopAudio();
    setIsPlaying(false);
    setSource('none');
  }, []);

  return {
    play,
    stop,
    isPlaying,
    source,
    error,
    isTTS: source === 'tts',
  };
}
