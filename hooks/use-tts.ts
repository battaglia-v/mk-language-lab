'use client';

import { useState, useCallback, useEffect, useRef } from 'react';

interface UseTTSOptions {
  /** Language code: 'mk' for Macedonian, 'en' for English */
  lang?: 'mk' | 'en';
  /** Speaking rate (0.5 to 2.0, default 0.85 for language learning) */
  rate?: number;
  /** Whether to use Google Cloud TTS (requires backend) or Web Speech API */
  useCloudTTS?: boolean;
}

interface UseTTSReturn {
  /** Whether TTS is currently speaking */
  isSpeaking: boolean;
  /** Whether TTS is supported on this device */
  isSupported: boolean;
  /** Whether TTS is loading (for cloud TTS) */
  isLoading: boolean;
  /** Speak the given text */
  speak: (text: string) => Promise<void>;
  /** Stop any ongoing speech */
  stop: () => void;
}

/**
 * Hook for Text-to-Speech functionality
 *
 * Uses Web Speech API by default (works offline, instant)
 * Falls back gracefully if not supported
 *
 * For Macedonian, uses Serbian (sr-RS) voices as closest match
 *
 * @example
 * const { speak, isSpeaking, isSupported } = useTTS({ lang: 'mk' });
 * <button onClick={() => speak('Здраво')} disabled={!isSupported}>
 *   {isSpeaking ? <Loader2 /> : <Volume2 />}
 * </button>
 */
export function useTTS(options: UseTTSOptions = {}): UseTTSReturn {
  const { lang = 'mk', rate = 0.85, useCloudTTS = false } = options;

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Check browser support on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasWebSpeech = 'speechSynthesis' in window;
      setIsSupported(hasWebSpeech || useCloudTTS);
    }
  }, [useCloudTTS]);

  const stop = useCallback(() => {
    // Stop Web Speech API
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    // Stop audio element
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsSpeaking(false);
    setIsLoading(false);
  }, []);

  const speakWithWebSpeech = useCallback(
    (text: string) => {
      if (!window.speechSynthesis) return;

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      // Macedonian uses Serbian or other Slavic voices as fallback
      utterance.lang = lang === 'mk' ? 'sr-RS' : 'en-US';
      utterance.rate = rate;
      utterance.pitch = 1;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    },
    [lang, rate]
  );

  const speakWithCloudTTS = useCallback(
    async (text: string) => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, language: lang }),
        });

        if (!response.ok) {
          throw new Error('TTS request failed');
        }

        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);

        if (audioRef.current) {
          audioRef.current.pause();
        }

        const audio = new Audio(audioUrl);
        audioRef.current = audio;

        audio.onplay = () => setIsSpeaking(true);
        audio.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
        };
        audio.onerror = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
        };

        await audio.play();
      } catch (error) {
        console.error('[TTS] Cloud TTS failed, falling back to Web Speech:', error);
        // Fallback to Web Speech API
        speakWithWebSpeech(text);
      } finally {
        setIsLoading(false);
      }
    },
    [lang, speakWithWebSpeech]
  );

  const speak = useCallback(
    async (text: string) => {
      if (!text || !isSupported) return;

      stop();

      if (useCloudTTS) {
        await speakWithCloudTTS(text);
      } else {
        speakWithWebSpeech(text);
      }
    },
    [isSupported, stop, useCloudTTS, speakWithCloudTTS, speakWithWebSpeech]
  );

  return {
    isSpeaking,
    isLoading,
    isSupported,
    speak,
    stop,
  };
}

export default useTTS;
