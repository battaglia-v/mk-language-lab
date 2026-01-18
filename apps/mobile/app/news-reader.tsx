/**
 * News Reader Screen - Read articles with tap-to-translate
 * 
 * Features:
 * - Clean reading experience
 * - Tap any word for translation
 * - TTS pronunciation
 * - Save words to glossary
 * - Link to full article
 * 
 * @see apps/mobile/app/reader/[id].tsx (Story reader implementation)
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import {
  ArrowLeft,
  ExternalLink,
  FileSearch,
  Volume2,
  VolumeX,
} from 'lucide-react-native';
import { TappableText } from '../components/reader/TappableText';
import { WordPopup, WordInfo } from '../components/reader/WordPopup';
import { translateWord } from '../lib/reader';
import { useTTS } from '../hooks/useTTS';
import { haptic } from '../lib/haptics';
import { stripHtml } from '../lib/news';

export default function NewsReaderScreen() {
  const params = useLocalSearchParams<{
    id: string;
    title: string;
    description: string;
    source: string;
    link: string;
  }>();

  const [selectedWord, setSelectedWord] = useState<WordInfo | null>(null);
  const { speak, isSpeaking, stop, isSupported } = useTTS({ lang: 'mk' });

  const title = params.title || 'News Article';
  const description = stripHtml(params.description || '');
  const source = params.source || 'Unknown';
  const link = params.link || '';

  const handleWordPress = useCallback(async (word: string) => {
    haptic.selection();
    
    // Show loading state
    setSelectedWord({
      mk: word,
      en: 'Translating...',
      isLoading: true,
    });

    // Fetch translation
    const translation = await translateWord(word);
    setSelectedWord({
      mk: word,
      en: translation ?? 'Translation not available',
      isLoading: false,
    });
  }, []);

  const handleClosePopup = () => {
    setSelectedWord(null);
    if (isSpeaking) stop();
  };

  const handleOpenArticle = () => {
    haptic.light();
    if (link) {
      Linking.openURL(link);
    }
  };

  const handleAnalyze = () => {
    haptic.selection();
    router.push({
      pathname: '/analyzer',
      params: { text: `${title}\n\n${description}`, source: 'news' },
    });
  };

  const handleSpeakTitle = () => {
    haptic.light();
    if (isSpeaking) {
      stop();
    } else {
      speak(title);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#f7f8fb" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {source}
        </Text>
        <TouchableOpacity onPress={handleOpenArticle} style={styles.externalButton}>
          <ExternalLink size={20} color="#f7f8fb" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Title with TTS */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
          {isSupported && (
            <TouchableOpacity
              style={[styles.speakButton, isSpeaking && styles.speakButtonActive]}
              onPress={handleSpeakTitle}
            >
              {isSpeaking ? (
                <VolumeX size={20} color="#f6d83b" />
              ) : (
                <Volume2 size={20} color="rgba(247,248,251,0.6)" />
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Instructions */}
        <View style={styles.instructionContainer}>
          <Text style={styles.instructionText}>
            Tap any word to see its translation
          </Text>
        </View>

        {/* Article Text */}
        <View style={styles.articleContainer}>
          <TappableText
            text={description}
            vocabulary={[]} // No pre-loaded vocabulary for news
            onWordPress={handleWordPress}
          />
        </View>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleAnalyze}
          >
            <FileSearch size={20} color="#a855f7" />
            <Text style={styles.actionButtonText}>Analyze Full Text</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonSecondary]}
            onPress={handleOpenArticle}
          >
            <ExternalLink size={20} color="#3b82f6" />
            <Text style={[styles.actionButtonText, { color: '#3b82f6' }]}>
              Read Full Article
            </Text>
          </TouchableOpacity>
        </View>

        {/* Source Attribution */}
        <Text style={styles.attribution}>
          Source: {source}
        </Text>
      </ScrollView>

      {/* Word Popup */}
      <WordPopup
        visible={!!selectedWord}
        word={selectedWord}
        onClose={handleClosePopup}
        storyId={`news-${params.id}`}
      />
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a2e',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#f7f8fb',
    textAlign: 'center',
    marginHorizontal: 8,
  },
  externalButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
  },
  title: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    color: '#f7f8fb',
    lineHeight: 32,
  },
  speakButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(247,248,251,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  speakButtonActive: {
    backgroundColor: 'rgba(246,216,59,0.2)',
  },
  instructionContainer: {
    backgroundColor: 'rgba(246,216,59,0.1)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(246,216,59,0.2)',
    marginBottom: 24,
  },
  instructionText: {
    fontSize: 13,
    color: '#f6d83b',
    textAlign: 'center',
  },
  articleContainer: {
    marginBottom: 32,
  },
  actionsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: 'rgba(168,85,247,0.15)',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.3)',
  },
  actionButtonSecondary: {
    backgroundColor: 'rgba(59,130,246,0.15)',
    borderColor: 'rgba(59,130,246,0.3)',
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#a855f7',
  },
  attribution: {
    fontSize: 12,
    color: 'rgba(247,248,251,0.4)',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
