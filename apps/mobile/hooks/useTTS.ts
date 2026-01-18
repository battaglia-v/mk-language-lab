/**
 * useTTS - Text-to-Speech hook for React Native
 * 
 * Uses expo-speech for native TTS on iOS and Android
 * Optimized for Macedonian language learning with natural-sounding speech
 * 
 * @see PARITY_CHECKLIST.md - Feature parity
 * @see hooks/use-tts.ts (PWA implementation)
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import * as Speech from 'expo-speech';
import { Platform } from 'react-native';

interface UseTTSOptions {
  /** Language code: 'mk' for Macedonian, 'en' for English */
  lang?: 'mk' | 'en';
  /** Speaking rate (0.5 to 2.0, default 0.75 for clearer pronunciation) */
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
 * Language codes to try for Macedonian in order of preference
 * 
 * Macedonian (mk) has LIMITED native TTS support, so we use South Slavic alternatives:
 * 
 * BEST MATCH: Bulgarian (bg-BG) - Same Cyrillic alphabet, very similar phonetics
 *   - Both use ш, ч, ж, џ similarly
 *   - Vowel sounds are nearly identical
 *   - Bulgarian voices handle Macedonian text quite naturally
 * 
 * SECOND BEST: Serbian (sr-RS) - Also South Slavic, similar structure
 *   - Serbian Cyrillic is close to Macedonian
 *   - Good consonant pronunciation
 *   - Some vowel differences but generally good
 * 
 * FALLBACK: Croatian (hr-HR) - South Slavic but Latin script default
 *   - Can pronounce Cyrillic with Ekavian pronunciation
 *   - Last resort as it's less phonetically accurate
 */
const MACEDONIAN_FALLBACKS = Platform.select({
  // iOS often has high-quality Bulgarian voices
  ios: ['mk-MK', 'mk', 'bg-BG', 'bg', 'sr-RS', 'sr-Latn-RS', 'hr-HR'],
  // Android has varying support - Bulgarian is usually best available
  android: ['mk-MK', 'bg-BG', 'bg', 'sr-RS', 'sr', 'hr-HR', 'hr'],
  default: ['mk', 'bg-BG', 'sr-RS'],
});

/**
 * Find the best available voice for Macedonian from device voices
 * Prefers high-quality enhanced voices when available
 */
async function findBestMacedonianVoice(): Promise<{ language: string; identifier?: string }> {
  try {
    const voices = await Speech.getAvailableVoicesAsync();
    
    // Try each fallback in order
    for (const langCode of MACEDONIAN_FALLBACKS || []) {
      const langPrefix = langCode.toLowerCase().split('-')[0];
      
      // Find all voices matching this language
      const matchingVoices = voices.filter(
        (v) => v.language.toLowerCase().startsWith(langPrefix)
      );
      
      if (matchingVoices.length > 0) {
        // Prefer "enhanced" or "premium" voices (they sound more natural)
        const enhancedVoice = matchingVoices.find(
          (v) => v.identifier?.toLowerCase().includes('enhanced') || 
                 v.identifier?.toLowerCase().includes('premium') ||
                 v.identifier?.toLowerCase().includes('wavenet') ||
                 v.quality === 'Enhanced'
        );
        
        const selectedVoice = enhancedVoice || matchingVoices[0];
        console.log(`[TTS] Using ${selectedVoice.language} voice for Macedonian (${selectedVoice.identifier || 'default'})`);
        
        return {
          language: selectedVoice.language,
          identifier: selectedVoice.identifier,
        };
      }
    }
    
    // Ultimate fallback
    console.log('[TTS] No Slavic voice found, using sr-RS');
    return { language: 'sr-RS' };
  } catch (error) {
    console.warn('[TTS] Failed to get voices:', error);
    return { language: 'sr-RS' };
  }
}

/**
 * Hook for Text-to-Speech functionality
 *
 * Uses expo-speech for native TTS
 * Falls back gracefully if not supported
 *
 * For Macedonian, tries to find the best available Slavic voice
 * and uses a slower speaking rate for clearer pronunciation
 *
 * @example
 * const { speak, isSpeaking, isSupported } = useTTS({ lang: 'mk' });
 * <TouchableOpacity onPress={() => speak('Здраво')} disabled={!isSupported}>
 *   {isSpeaking ? <VolumeX /> : <Volume2 />}
 * </TouchableOpacity>
 */
export function useTTS(options: UseTTSOptions = {}): UseTTSReturn {
  // Slower rate (0.75) for clearer Macedonian pronunciation in learning context
  const { lang = 'mk', rate = 0.75, pitch = 1.0 } = options;

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSupported, setIsSupported] = useState(true);
  
  // Cache the best Macedonian voice (language code + optional voice identifier)
  const macedonianVoiceRef = useRef<{ language: string; identifier?: string } | null>(null);

  // Check if TTS is available and find best Macedonian voice on mount
  useEffect(() => {
    const checkAvailability = async () => {
      try {
        const isSpeakingCheck = await Speech.isSpeakingAsync();
        setIsSupported(true);
        setIsSpeaking(isSpeakingCheck);
        
        // Pre-load the best Macedonian voice
        macedonianVoiceRef.current = await findBestMacedonianVoice();
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
      
      // Use cached Macedonian voice or find one, use en-US for English
      let voiceConfig: { language: string; identifier?: string };
      if (targetLang === 'mk') {
        if (!macedonianVoiceRef.current) {
          macedonianVoiceRef.current = await findBestMacedonianVoice();
        }
        voiceConfig = macedonianVoiceRef.current;
      } else {
        voiceConfig = { language: 'en-US' };
      }

      try {
        setIsSpeaking(true);

        await Speech.speak(text, {
          language: voiceConfig.language,
          voice: voiceConfig.identifier, // Use specific voice if available (for higher quality)
          rate: targetLang === 'mk' ? rate : 0.9, // Slower for Macedonian learning
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
 * Uses slower rate for Macedonian for clearer pronunciation
 */
export async function quickSpeak(text: string, lang: 'mk' | 'en' = 'mk'): Promise<void> {
  let voiceConfig: { language: string; identifier?: string };
  
  if (lang === 'mk') {
    voiceConfig = await findBestMacedonianVoice();
  } else {
    voiceConfig = { language: 'en-US' };
  }
  
  try {
    Speech.stop();
    await Speech.speak(text, {
      language: voiceConfig.language,
      voice: voiceConfig.identifier, // Use specific voice if available
      rate: lang === 'mk' ? 0.75 : 0.9, // Slower for Macedonian learning
      pitch: 1.0,
    });
  } catch (error) {
    console.warn('[TTS] Quick speak failed:', error);
  }
}

export default useTTS;
