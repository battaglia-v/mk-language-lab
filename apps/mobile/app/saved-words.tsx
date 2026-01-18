/**
 * Saved Words Screen
 * 
 * View and manage saved vocabulary words
 * Mirrors PWA's app/[locale]/saved-words/page.tsx
 * 
 * @see PARITY_CHECKLIST.md - Feature parity
 * @see app/[locale]/saved-words/page.tsx (PWA implementation)
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  ArrowLeft,
  Trash2,
  Volume2,
  VolumeX,
  Play,
  BookmarkX,
  Search,
  Filter,
} from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  readSavedPhrases,
  writeSavedPhrases,
  removeSavedPhrase,
  type SavedPhraseRecord,
} from '../lib/saved-phrases';
import { useTTS } from '../hooks/useTTS';
import { haptic } from '../lib/haptics';

type SortOption = 'recent' | 'alphabetical';

export default function SavedWordsScreen() {
  const [savedWords, setSavedWords] = useState<SavedPhraseRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  
  const { speak, stop, isSpeaking } = useTTS({ lang: 'mk' });

  // Load saved words when screen focuses
  useFocusEffect(
    useCallback(() => {
      loadSavedWords();
    }, [])
  );

  const loadSavedWords = async () => {
    setIsLoading(true);
    try {
      const words = await readSavedPhrases();
      setSavedWords(words);
    } catch (error) {
      console.error('[SavedWords] Failed to load:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sortedWords = [...savedWords].sort((a, b) => {
    if (sortBy === 'recent') {
      return b.savedAt - a.savedAt;
    }
    return a.sourceText.localeCompare(b.sourceText);
  });

  const handleDelete = useCallback((word: SavedPhraseRecord) => {
    haptic.warning();
    Alert.alert(
      'Remove Word',
      `Remove "${word.sourceText}" from saved words?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            const updated = removeSavedPhrase(savedWords, word.id);
            setSavedWords(updated);
            await writeSavedPhrases(updated);
            haptic.success();
          },
        },
      ]
    );
  }, [savedWords]);

  const handleClearAll = useCallback(() => {
    if (savedWords.length === 0) return;
    
    haptic.warning();
    Alert.alert(
      'Clear All Words',
      `Remove all ${savedWords.length} saved words? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            setSavedWords([]);
            await writeSavedPhrases([]);
            haptic.success();
          },
        },
      ]
    );
  }, [savedWords.length]);

  const handleSpeak = useCallback((word: SavedPhraseRecord) => {
    haptic.selection();
    if (isSpeaking && speakingId === word.id) {
      stop();
      setSpeakingId(null);
    } else {
      setSpeakingId(word.id);
      // Speak Macedonian text (source or translated based on direction)
      const mkText = word.directionId === 'en-mk' ? word.translatedText : word.sourceText;
      speak(mkText, 'mk');
    }
  }, [speak, stop, isSpeaking, speakingId]);

  const handlePractice = useCallback(() => {
    if (savedWords.length === 0) return;
    haptic.medium();
    router.push({
      pathname: '/practice/session',
      params: { deck: 'saved-phrases' },
    });
  }, [savedWords.length]);

  const renderItem = ({ item }: { item: SavedPhraseRecord }) => {
    const isMkToEn = item.directionId === 'mk-en';
    const mkText = isMkToEn ? item.sourceText : item.translatedText;
    const enText = isMkToEn ? item.translatedText : item.sourceText;
    const isCurrentlySpeaking = isSpeaking && speakingId === item.id;

    return (
      <View style={styles.wordCard}>
        <View style={styles.wordContent}>
          <Text style={styles.mkText}>{mkText}</Text>
          <Text style={styles.enText}>{enText}</Text>
          <Text style={styles.dateText}>
            Saved {new Date(item.savedAt).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.wordActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleSpeak(item)}
          >
            {isCurrentlySpeaking ? (
              <VolumeX size={18} color="#f6d83b" />
            ) : (
              <Volume2 size={18} color="#f6d83b" />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDelete(item)}
          >
            <Trash2 size={18} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <BookmarkX size={64} color="rgba(247,248,251,0.2)" />
      <Text style={styles.emptyTitle}>No Saved Words</Text>
      <Text style={styles.emptyText}>
        Save words while reading or translating to build your personal vocabulary list.
      </Text>
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={() => router.push('/(tabs)/reader')}
      >
        <Text style={styles.emptyButtonText}>Start Reading</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#f7f8fb" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>My Saved Words</Text>
          <Text style={styles.subtitle}>
            {savedWords.length} {savedWords.length === 1 ? 'word' : 'words'}
          </Text>
        </View>
        {savedWords.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClearAll}
          >
            <Trash2 size={20} color="#ef4444" />
          </TouchableOpacity>
        )}
      </View>

      {/* Actions Bar */}
      {savedWords.length > 0 && (
        <View style={styles.actionsBar}>
          {/* Sort Toggle */}
          <View style={styles.sortToggle}>
            <TouchableOpacity
              style={[
                styles.sortOption,
                sortBy === 'recent' && styles.sortOptionActive,
              ]}
              onPress={() => setSortBy('recent')}
            >
              <Text
                style={[
                  styles.sortOptionText,
                  sortBy === 'recent' && styles.sortOptionTextActive,
                ]}
              >
                Recent
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.sortOption,
                sortBy === 'alphabetical' && styles.sortOptionActive,
              ]}
              onPress={() => setSortBy('alphabetical')}
            >
              <Text
                style={[
                  styles.sortOptionText,
                  sortBy === 'alphabetical' && styles.sortOptionTextActive,
                ]}
              >
                A-Z
              </Text>
            </TouchableOpacity>
          </View>

          {/* Practice Button */}
          <TouchableOpacity
            style={styles.practiceButton}
            onPress={handlePractice}
          >
            <Play size={16} color="#06060b" />
            <Text style={styles.practiceButtonText}>Practice</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Word List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#f6d83b" />
        </View>
      ) : (
        <FlatList
          data={sortedWords}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContent,
            savedWords.length === 0 && styles.listContentEmpty,
          ]}
          ListEmptyComponent={renderEmpty}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#06060b',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222536',
  },
  backButton: {
    padding: 4,
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#f7f8fb',
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(247,248,251,0.5)',
    marginTop: 2,
  },
  clearButton: {
    padding: 8,
  },
  actionsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  sortToggle: {
    flexDirection: 'row',
    backgroundColor: '#111827',
    borderRadius: 8,
    padding: 4,
  },
  sortOption: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
  },
  sortOptionActive: {
    backgroundColor: '#1f2937',
  },
  sortOptionText: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(247,248,251,0.5)',
  },
  sortOptionTextActive: {
    color: '#f7f8fb',
  },
  practiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f6d83b',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  practiceButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#06060b',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  listContentEmpty: {
    flex: 1,
  },
  wordCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0b0b12',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#222536',
  },
  wordContent: {
    flex: 1,
    marginRight: 12,
  },
  mkText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#f7f8fb',
    marginBottom: 4,
  },
  enText: {
    fontSize: 15,
    color: 'rgba(247,248,251,0.7)',
    marginBottom: 6,
  },
  dateText: {
    fontSize: 11,
    color: 'rgba(247,248,251,0.4)',
  },
  wordActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(247,248,251,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#f7f8fb',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: 'rgba(247,248,251,0.6)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#f6d83b',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#06060b',
  },
});
