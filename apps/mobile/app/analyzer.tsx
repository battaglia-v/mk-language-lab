/**
 * Text Analyzer Screen - Word-by-word analysis tool
 * 
 * Paste or type Macedonian text to see:
 * - Word-by-word translation
 * - Part of speech for each word
 * - Difficulty level
 * - Full contextual translation
 * - Alternative meanings for ambiguous words
 */

import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  ArrowLeft,
  ArrowLeftRight,
  Sparkles,
  Volume2,
  VolumeX,
  BookmarkPlus,
  Info,
  X,
  Eye,
  EyeOff,
} from 'lucide-react-native';
import {
  analyzeText,
  AnalysisResult,
  AnalysisDirection,
  AnalyzedWord,
  getDifficultyLabel,
  getPosLabel,
  getWordDifficultyColor,
} from '../lib/text-analyzer';
import { useTTS } from '../hooks/useTTS';
import { upsertSavedPhrase } from '../lib/saved-phrases';
import { haptic } from '../lib/haptics';

const MAX_CHARACTERS = 3000;

const DIRECTION_OPTIONS: { id: AnalysisDirection; label: string; placeholder: string }[] = [
  { id: 'mk-en', label: 'MK → EN', placeholder: 'Внесете македонски текст...' },
  { id: 'en-mk', label: 'EN → MK', placeholder: 'Enter English text...' },
];

export default function AnalyzerScreen() {
  const [direction, setDirection] = useState<AnalysisDirection>('mk-en');
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedWord, setSelectedWord] = useState<AnalyzedWord | null>(null);
  // Track which words have been revealed (for progressive learning)
  const [revealedWords, setRevealedWords] = useState<Set<string>>(new Set());
  // Global reveal toggle
  const [showAllTranslations, setShowAllTranslations] = useState(false);

  const { speak, isSpeaking, stop } = useTTS({ lang: direction === 'mk-en' ? 'mk' : 'en' });

  const currentOption = DIRECTION_OPTIONS.find((opt) => opt.id === direction)!;

  const handleAnalyze = useCallback(async () => {
    if (!inputText.trim()) return;

    setIsAnalyzing(true);
    setError(null);
    setResult(null);
    setSelectedWord(null);
    haptic.light();

    try {
      const analysisResult = await analyzeText(inputText.trim(), direction);
      setResult(analysisResult);
      haptic.success();
    } catch (err) {
      console.error('[Analyzer] Failed:', err);
      setError('Analysis failed. Please try again.');
      haptic.error();
    } finally {
      setIsAnalyzing(false);
    }
  }, [inputText, direction]);

  const handleSwapDirection = () => {
    const newDirection = direction === 'mk-en' ? 'en-mk' : 'mk-en';
    setDirection(newDirection);
    setResult(null);
    setSelectedWord(null);
    haptic.selection();
  };

  const handleClear = () => {
    setInputText('');
    setResult(null);
    setSelectedWord(null);
    setError(null);
    haptic.light();
  };

  const handleWordPress = (word: AnalyzedWord) => {
    // Toggle word translation visibility
    const newRevealed = new Set(revealedWords);
    if (newRevealed.has(word.id)) {
      newRevealed.delete(word.id);
    } else {
      newRevealed.add(word.id);
    }
    setRevealedWords(newRevealed);
    setSelectedWord(word);
    haptic.selection();
  };

  const handleToggleAllTranslations = () => {
    setShowAllTranslations(!showAllTranslations);
    if (!showAllTranslations && result) {
      // Reveal all words
      setRevealedWords(new Set(result.words.map(w => w.id)));
    } else {
      // Hide all words
      setRevealedWords(new Set());
    }
    haptic.light();
  };

  const isWordRevealed = (wordId: string) => {
    return showAllTranslations || revealedWords.has(wordId);
  };

  const handleSpeakWord = (word: AnalyzedWord) => {
    if (isSpeaking) {
      stop();
    } else {
      speak(word.original, direction === 'mk-en' ? 'mk' : 'en');
    }
  };

  const handleSaveWord = async (word: AnalyzedWord) => {
    await upsertSavedPhrase({
      macedonian: direction === 'mk-en' ? word.original : word.translation,
      english: direction === 'mk-en' ? word.translation : word.original,
      direction: direction === 'mk-en' ? 'mk-en' : 'en-mk',
    });
    haptic.success();
  };

  const handleSpeakFullText = () => {
    if (isSpeaking) {
      stop();
    } else if (inputText.trim()) {
      speak(inputText.trim(), direction === 'mk-en' ? 'mk' : 'en');
    }
  };

  const difficultyInfo = result ? getDifficultyLabel(result.difficulty.level) : null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#f7f8fb" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Sparkles size={20} color="#f6d83b" />
            <Text style={styles.headerTitle}>Text Analyzer</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Direction Toggle */}
          <View style={styles.directionContainer}>
            {DIRECTION_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.id}
                style={[styles.directionButton, direction === opt.id && styles.directionButtonActive]}
                onPress={() => {
                  setDirection(opt.id);
                  setResult(null);
                  setSelectedWord(null);
                  haptic.selection();
                }}
              >
                <Text
                  style={[styles.directionButtonText, direction === opt.id && styles.directionButtonTextActive]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.swapButton} onPress={handleSwapDirection}>
              <ArrowLeftRight size={18} color="rgba(247,248,251,0.6)" />
            </TouchableOpacity>
          </View>

          {/* Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={inputText}
              onChangeText={(text) => setInputText(text.slice(0, MAX_CHARACTERS))}
              placeholder={currentOption.placeholder}
              placeholderTextColor="rgba(247,248,251,0.4)"
              multiline
              textAlignVertical="top"
            />
            {inputText && (
              <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
                <X size={18} color="rgba(247,248,251,0.5)" />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.inputMeta}>
            <Text style={styles.charCount}>
              {inputText.length}/{MAX_CHARACTERS}
            </Text>
            {inputText.trim() && (
              <TouchableOpacity style={styles.speakButton} onPress={handleSpeakFullText}>
                {isSpeaking ? (
                  <VolumeX size={18} color="#f6d83b" />
                ) : (
                  <Volume2 size={18} color="rgba(247,248,251,0.6)" />
                )}
              </TouchableOpacity>
            )}
          </View>

          {/* Analyze Button */}
          <TouchableOpacity
            style={[styles.analyzeButton, (!inputText.trim() || isAnalyzing) && styles.analyzeButtonDisabled]}
            onPress={handleAnalyze}
            disabled={!inputText.trim() || isAnalyzing}
          >
            {isAnalyzing ? (
              <ActivityIndicator size="small" color="#06060b" />
            ) : (
              <>
                <Sparkles size={20} color="#06060b" />
                <Text style={styles.analyzeButtonText}>Analyze Text</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Error */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Results */}
          {result && (
            <View style={styles.resultsContainer}>
              {/* Difficulty Badge */}
              {difficultyInfo && (
                <View style={styles.difficultyBadge}>
                  <Text style={styles.difficultyEmoji}>{difficultyInfo.emoji}</Text>
                  <Text style={[styles.difficultyText, { color: difficultyInfo.color }]}>
                    {difficultyInfo.label}
                  </Text>
                  <Text style={styles.difficultyStats}>
                    {result.metadata.wordCount} words • {result.metadata.sentenceCount} sentences
                  </Text>
                </View>
              )}

              {/* Full Translation */}
              <View style={styles.fullTranslationCard}>
                <Text style={styles.sectionLabel}>Full Translation</Text>
                <Text style={styles.fullTranslationText}>{result.fullTranslation}</Text>
              </View>

              {/* Word-by-Word */}
              <View style={styles.wordsSection}>
                <View style={styles.wordsSectionHeader}>
                  <Text style={styles.sectionLabel}>Word Analysis</Text>
                  <TouchableOpacity
                    style={styles.revealToggle}
                    onPress={handleToggleAllTranslations}
                  >
                    {showAllTranslations ? (
                      <EyeOff size={16} color="rgba(247,248,251,0.6)" />
                    ) : (
                      <Eye size={16} color="rgba(247,248,251,0.6)" />
                    )}
                    <Text style={styles.revealToggleText}>
                      {showAllTranslations ? 'Hide All' : 'Show All'}
                    </Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.wordsTip}>Tap words to reveal translations</Text>
                <View style={styles.wordsContainer}>
                  {result.words.map((word) => {
                    const revealed = isWordRevealed(word.id);
                    return (
                      <TouchableOpacity
                        key={word.id}
                        style={[
                          styles.wordChip,
                          { backgroundColor: getWordDifficultyColor(word.difficulty) },
                          selectedWord?.id === word.id && styles.wordChipSelected,
                          revealed && styles.wordChipRevealed,
                        ]}
                        onPress={() => handleWordPress(word)}
                      >
                        <Text style={styles.wordOriginal}>{word.original}</Text>
                        {revealed ? (
                          <Text style={styles.wordTranslation}>{word.translation}</Text>
                        ) : (
                          <Text style={styles.wordTranslationHidden}>tap to reveal</Text>
                        )}
                        {word.pos !== 'other' && revealed && (
                          <Text style={styles.wordPos}>{getPosLabel(word.pos)}</Text>
                        )}
                        {word.hasMultipleMeanings && (
                          <View style={styles.multiMeaningDot} />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Selected Word Detail */}
              {selectedWord && (
                <View style={styles.wordDetailCard}>
                  <View style={styles.wordDetailHeader}>
                    <Text style={styles.wordDetailOriginal}>{selectedWord.original}</Text>
                    <View style={styles.wordDetailActions}>
                      <TouchableOpacity
                        style={styles.wordDetailAction}
                        onPress={() => handleSpeakWord(selectedWord)}
                      >
                        {isSpeaking ? (
                          <VolumeX size={20} color="#f6d83b" />
                        ) : (
                          <Volume2 size={20} color="#f7f8fb" />
                        )}
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.wordDetailAction}
                        onPress={() => handleSaveWord(selectedWord)}
                      >
                        <BookmarkPlus size={20} color="#f7f8fb" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <Text style={styles.wordDetailTranslation}>
                    {selectedWord.contextualMeaning || selectedWord.translation}
                  </Text>

                  {selectedWord.pos !== 'other' && (
                    <View style={styles.wordDetailMeta}>
                      <Text style={styles.wordDetailPosLabel}>Part of Speech:</Text>
                      <Text style={styles.wordDetailPosValue}>{selectedWord.pos}</Text>
                    </View>
                  )}

                  {selectedWord.alternativeTranslations && selectedWord.alternativeTranslations.length > 0 && (
                    <View style={styles.wordDetailAlternatives}>
                      <Text style={styles.alternativesLabel}>Also means:</Text>
                      <Text style={styles.alternativesValue}>
                        {selectedWord.alternativeTranslations.join(', ')}
                      </Text>
                    </View>
                  )}

                  {selectedWord.contextHint && (
                    <View style={styles.wordDetailHint}>
                      <Info size={14} color="rgba(247,248,251,0.6)" />
                      <Text style={styles.hintText}>{selectedWord.contextHint}</Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#06060b',
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#222536',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f7f8fb',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  directionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  directionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#0b0b12',
    borderWidth: 1,
    borderColor: '#222536',
  },
  directionButtonActive: {
    backgroundColor: 'rgba(246,216,59,0.15)',
    borderColor: '#f6d83b',
  },
  directionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(247,248,251,0.6)',
  },
  directionButtonTextActive: {
    color: '#f6d83b',
  },
  swapButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#0b0b12',
    borderWidth: 1,
    borderColor: '#222536',
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    backgroundColor: '#0b0b12',
    borderWidth: 1,
    borderColor: '#222536',
    borderRadius: 16,
    padding: 16,
    paddingRight: 44,
    color: '#f7f8fb',
    fontSize: 16,
    minHeight: 140,
    maxHeight: 240,
  },
  clearButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: 'rgba(247,248,251,0.1)',
  },
  inputMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 8,
  },
  charCount: {
    fontSize: 12,
    color: 'rgba(247,248,251,0.4)',
  },
  speakButton: {
    padding: 8,
  },
  analyzeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#f6d83b',
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 8,
  },
  analyzeButtonDisabled: {
    opacity: 0.5,
  },
  analyzeButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#06060b',
  },
  errorContainer: {
    backgroundColor: 'rgba(239,68,68,0.15)',
    padding: 12,
    borderRadius: 12,
    marginTop: 16,
  },
  errorText: {
    color: '#ef4444',
    textAlign: 'center',
    fontSize: 14,
  },
  resultsContainer: {
    marginTop: 24,
    gap: 16,
  },
  difficultyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: '#0b0b12',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#222536',
  },
  difficultyEmoji: {
    fontSize: 20,
  },
  difficultyText: {
    fontSize: 15,
    fontWeight: '600',
  },
  difficultyStats: {
    fontSize: 13,
    color: 'rgba(247,248,251,0.5)',
    marginLeft: 'auto',
  },
  fullTranslationCard: {
    backgroundColor: 'rgba(246,216,59,0.08)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(246,216,59,0.2)',
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(247,248,251,0.5)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  fullTranslationText: {
    fontSize: 16,
    color: '#f7f8fb',
    lineHeight: 24,
  },
  wordsSection: {
    marginTop: 8,
  },
  wordsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  revealToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(247,248,251,0.1)',
  },
  revealToggleText: {
    fontSize: 12,
    color: 'rgba(247,248,251,0.6)',
    fontWeight: '500',
  },
  wordsTip: {
    fontSize: 12,
    color: 'rgba(247,248,251,0.4)',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  wordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  wordChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    position: 'relative',
  },
  wordChipSelected: {
    borderWidth: 2,
    borderColor: '#f6d83b',
  },
  wordChipRevealed: {
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.3)',
  },
  wordOriginal: {
    fontSize: 15,
    fontWeight: '600',
    color: '#f7f8fb',
  },
  wordTranslation: {
    fontSize: 12,
    color: '#22c55e',
    marginTop: 2,
    fontWeight: '500',
  },
  wordTranslationHidden: {
    fontSize: 11,
    color: 'rgba(247,248,251,0.3)',
    marginTop: 2,
    fontStyle: 'italic',
  },
  wordPos: {
    fontSize: 10,
    color: 'rgba(247,248,251,0.4)',
    marginTop: 2,
    fontStyle: 'italic',
  },
  multiMeaningDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#f6d83b',
  },
  wordDetailCard: {
    backgroundColor: '#0b0b12',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f6d83b',
    marginTop: 8,
  },
  wordDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  wordDetailOriginal: {
    fontSize: 22,
    fontWeight: '700',
    color: '#f7f8fb',
  },
  wordDetailActions: {
    flexDirection: 'row',
    gap: 8,
  },
  wordDetailAction: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: 'rgba(247,248,251,0.1)',
  },
  wordDetailTranslation: {
    fontSize: 18,
    color: '#f6d83b',
    fontWeight: '500',
    marginBottom: 12,
  },
  wordDetailMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  wordDetailPosLabel: {
    fontSize: 13,
    color: 'rgba(247,248,251,0.5)',
  },
  wordDetailPosValue: {
    fontSize: 13,
    color: '#f7f8fb',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  wordDetailAlternatives: {
    backgroundColor: 'rgba(247,248,251,0.05)',
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
  },
  alternativesLabel: {
    fontSize: 12,
    color: 'rgba(247,248,251,0.5)',
    marginBottom: 4,
  },
  alternativesValue: {
    fontSize: 14,
    color: 'rgba(247,248,251,0.8)',
  },
  wordDetailHint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(247,248,251,0.1)',
  },
  hintText: {
    flex: 1,
    fontSize: 13,
    color: 'rgba(247,248,251,0.6)',
    fontStyle: 'italic',
  },
});
