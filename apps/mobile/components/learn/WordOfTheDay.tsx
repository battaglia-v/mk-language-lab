/**
 * WordOfTheDay - Daily vocabulary highlight component
 * 
 * Displays a featured word with translation, pronunciation, and TTS
 * Mirrors PWA's components/learn/WordOfTheDay.tsx
 * 
 * @see PARITY_CHECKLIST.md - Feature parity
 * @see components/learn/WordOfTheDay.tsx (PWA implementation)
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Volume2, VolumeX, BookOpen, Sparkles, RefreshCw } from 'lucide-react-native';
import { useTTS } from '../../hooks/useTTS';
import { apiFetch } from '../../lib/api';
import { haptic } from '../../lib/haptics';

export type WordOfTheDayData = {
  id: string;
  macedonian: string;
  english: string;
  pronunciation?: string;
  partOfSpeech?: string;
  example?: {
    mk: string;
    en: string;
  };
  category?: string;
};

// Fallback words in case API fails
const FALLBACK_WORDS: WordOfTheDayData[] = [
  {
    id: 'fallback-1',
    macedonian: 'Добро утро',
    english: 'Good morning',
    pronunciation: 'DOH-bro OO-tro',
    partOfSpeech: 'phrase',
    example: {
      mk: 'Добро утро! Како си?',
      en: 'Good morning! How are you?',
    },
    category: 'greetings',
  },
  {
    id: 'fallback-2',
    macedonian: 'Благодарам',
    english: 'Thank you',
    pronunciation: 'bla-go-DA-ram',
    partOfSpeech: 'verb',
    example: {
      mk: 'Благодарам многу!',
      en: 'Thank you very much!',
    },
    category: 'common',
  },
  {
    id: 'fallback-3',
    macedonian: 'Пријатно',
    english: 'Nice / Pleasant',
    pronunciation: 'pri-YAT-no',
    partOfSpeech: 'adjective',
    example: {
      mk: 'Многу пријатно е овде.',
      en: 'It is very pleasant here.',
    },
    category: 'adjectives',
  },
];

/**
 * Get today's fallback word (cycles through fallback list)
 */
function getTodaysFallbackWord(): WordOfTheDayData {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
  );
  return FALLBACK_WORDS[dayOfYear % FALLBACK_WORDS.length];
}

export function WordOfTheDay() {
  const [word, setWord] = useState<WordOfTheDayData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { speak, isSpeaking, stop, isSupported: ttsSupported } = useTTS({ lang: 'mk' });

  const fetchWord = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await apiFetch<WordOfTheDayData>('/api/word-of-the-day', {
        skipAuth: true,
      });
      setWord(data);
    } catch (err) {
      console.warn('[WordOfTheDay] API failed, using fallback:', err);
      // Use fallback word instead of showing error
      setWord(getTodaysFallbackWord());
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWord();
  }, [fetchWord]);

  const handleSpeak = useCallback((text: string) => {
    haptic.selection();
    if (isSpeaking) {
      stop();
    } else {
      speak(text);
    }
  }, [speak, stop, isSpeaking]);

  const handleRefresh = useCallback(() => {
    haptic.light();
    fetchWord();
  }, [fetchWord]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#f6d83b" />
          <Text style={styles.loadingText}>Loading word of the day...</Text>
        </View>
      </View>
    );
  }

  if (!word) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Sparkles size={16} color="#f6d83b" />
          <Text style={styles.headerTitle}>Word of the Day</Text>
        </View>
        <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
          <RefreshCw size={16} color="rgba(247,248,251,0.5)" />
        </TouchableOpacity>
      </View>

      {/* Word Content */}
      <View style={styles.wordContainer}>
        {/* Macedonian word */}
        <View style={styles.wordRow}>
          <Text style={styles.macedonianWord}>{word.macedonian}</Text>
          {ttsSupported && (
            <TouchableOpacity
              onPress={() => handleSpeak(word.macedonian)}
              style={styles.speakButton}
            >
              {isSpeaking ? (
                <VolumeX size={20} color="#f6d83b" />
              ) : (
                <Volume2 size={20} color="#f6d83b" />
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* English translation */}
        <Text style={styles.englishWord}>{word.english}</Text>

        {/* Pronunciation */}
        {word.pronunciation && (
          <Text style={styles.pronunciation}>/{word.pronunciation}/</Text>
        )}

        {/* Part of speech badge */}
        {word.partOfSpeech && (
          <View style={styles.posBadge}>
            <Text style={styles.posText}>{word.partOfSpeech}</Text>
          </View>
        )}

        {/* Example sentence */}
        {word.example && (
          <View style={styles.exampleContainer}>
            <View style={styles.exampleHeader}>
              <BookOpen size={14} color="rgba(247,248,251,0.5)" />
              <Text style={styles.exampleLabel}>Example</Text>
            </View>
            <Text style={styles.exampleMk}>{word.example.mk}</Text>
            <Text style={styles.exampleEn}>{word.example.en}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0b0b12',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(246,216,59,0.2)',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: 'rgba(247,248,251,0.5)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#f6d83b',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  refreshButton: {
    padding: 4,
  },
  wordContainer: {
    gap: 8,
  },
  wordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  macedonianWord: {
    fontSize: 28,
    fontWeight: '700',
    color: '#f7f8fb',
    flex: 1,
  },
  speakButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(246,216,59,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  englishWord: {
    fontSize: 18,
    color: 'rgba(247,248,251,0.8)',
  },
  pronunciation: {
    fontSize: 14,
    color: 'rgba(247,248,251,0.5)',
    fontStyle: 'italic',
  },
  posBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(246,216,59,0.15)',
    marginTop: 4,
  },
  posText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#f6d83b',
    textTransform: 'capitalize',
  },
  exampleContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#222536',
    gap: 6,
  },
  exampleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  exampleLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(247,248,251,0.5)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  exampleMk: {
    fontSize: 15,
    color: '#f7f8fb',
    lineHeight: 22,
  },
  exampleEn: {
    fontSize: 14,
    color: 'rgba(247,248,251,0.6)',
    fontStyle: 'italic',
  },
});

export default WordOfTheDay;
