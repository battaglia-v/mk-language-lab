/**
 * useTTS - Text-to-Speech hook for React Native
 * 
 * Uses expo-speech for native TTS on iOS and Android
 * Mirrors PWA's hooks/use-tts.ts behavior
 * 
 * @see PARITY_CHECKLIST.md - Feature parity
 * @see hooks/use-tts.ts (PWA implementation)
 */

import { useState, useCallback, useEffect } from 'react';
import * as Speech from 'expo-speech';

interface UseTTSOptions {
  /** Language code: 'mk' for Macedonian, 'en' for English */
  lang?: 'mk' | 'en';
  /** Speaking rate (0.5 to 2.0, default 0.85 for language learning) */
  rate?: number;
  /** Pitch (0.5 to 2.0, default 1.0) */
  pitch?: number;
}

interface UseTTSReturn {
  /** Whether TTS is currently speaking */
  isSpeaking: boolean;
  /** Whether TTS is supported on this device */
  isSupported: boolean;
  /** Whether TTS is loading voices */
  isLoading: boolean;
  /** Speak the given text */
  speak: (text: string, overrideLang?: 'mk' | 'en') => Promise<void>;
  /** Stop any ongoing speech */
  stop: () => void;
}

/**
 * Get the best available voice for a language
 * For Macedonian, we try Serbian (sr-RS) as the closest Slavic language
 */
function getLanguageCode(lang: 'mk' | 'en'): string {
  // Macedonian uses Serbian as closest available voice
  // Try sr-RS first, then sr, then fallback to en-US
  return lang === 'mk' ? 'sr-RS' : 'en-US';
}

/**
 * Hook for Text-to-Speech functionality
 *
 * Uses expo-speech for native TTS
 * Falls back gracefully if not supported
 *
 * For Macedonian, uses Serbian (sr-RS) voices as closest match
 *
 * @example
 * const { speak, isSpeaking, isSupported } = useTTS({ lang: 'mk' });
 * <TouchableOpacity onPress={() => speak('Здраво')} disabled={!isSupported}>
 *   {isSpeaking ? <VolumeX /> : <Volume2 />}
 * </TouchableOpacity>
 */
export function useTTS(options: UseTTSOptions = {}): UseTTSReturn {
  const { lang = 'mk', rate = 0.85, pitch = 1.0 } = options;

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSupported, setIsSupported] = useState(true);

  // Check if TTS is available on mount
  useEffect(() => {
    const checkAvailability = async () => {
      try {
        const isSpeakingCheck = await Speech.isSpeakingAsync();
        setIsSupported(true);
        setIsSpeaking(isSpeakingCheck);
      } catch (error) {
        console.warn('[TTS] Speech not supported:', error);
        setIsSupported(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAvailability();
  }, []);

  // Monitor speaking state
  useEffect(() => {
    const checkSpeaking = async () => {
      if (!isSupported) return;
      
      try {
        const speaking = await Speech.isSpeakingAsync();
        setIsSpeaking(speaking);
      } catch {
        // Ignore errors during check
      }
    };

    // Check periodically while speaking
    const interval = setInterval(checkSpeaking, 200);
    return () => clearInterval(interval);
  }, [isSupported]);

  const stop = useCallback(() => {
    try {
      Speech.stop();
      setIsSpeaking(false);
    } catch (error) {
      console.warn('[TTS] Failed to stop:', error);
    }
  }, []);

  const speak = useCallback(
    async (text: string, overrideLang?: 'mk' | 'en') => {
      if (!text || !isSupported) return;

      // Stop any current speech
      stop();

      const targetLang = overrideLang ?? lang;
      const languageCode = getLanguageCode(targetLang);

      try {
        setIsSpeaking(true);

        await Speech.speak(text, {
          language: languageCode,
          rate,
          pitch,
          onStart: () => setIsSpeaking(true),
          onDone: () => setIsSpeaking(false),
          onStopped: () => setIsSpeaking(false),
          onError: (error) => {
            console.warn('[TTS] Speech error:', error);
            setIsSpeaking(false);
          },
        });
      } catch (error) {
        console.error('[TTS] Failed to speak:', error);
        setIsSpeaking(false);
      }
    },
    [isSupported, lang, rate, pitch, stop]
  );

  return {
    isSpeaking,
    isLoading,
    isSupported,
    speak,
    stop,
  };
}

/**
 * Quick speak utility (one-shot, no state management)
 */
export async function quickSpeak(text: string, lang: 'mk' | 'en' = 'mk'): Promise<void> {
  const languageCode = getLanguageCode(lang);
  
  try {
    Speech.stop();
    await Speech.speak(text, {
      language: languageCode,
      rate: 0.85,
      pitch: 1.0,
    });
  } catch (error) {
    console.warn('[TTS] Quick speak failed:', error);
  }
}

export default useTTS;
