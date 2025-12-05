import { useCallback, useMemo, useState } from 'react';
import {
  NativeButton,
  NativeCard,
  NativeStatPill,
  NativeTypography,
} from '@mk/ui';
import { brandColors, spacingScale } from '@mk/tokens';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  Text,
} from 'react-native';
import { analyzeText, AnalyzeTextError, type TranslateLanguage, type AnalyzedTextData } from '@mk/api-client';
import { getApiBaseUrl } from '../../lib/api';
import { authenticatedFetch } from '../../lib/auth';

type DirectionOption = {
  id: 'mk-en' | 'en-mk';
  label: string;
  placeholder: string;
  sourceLang: TranslateLanguage;
  targetLang: TranslateLanguage;
};

const directionOptions: DirectionOption[] = [
  {
    id: 'en-mk',
    label: 'EN → MK',
    placeholder: 'Type English text to analyze…',
    sourceLang: 'en',
    targetLang: 'mk',
  },
  {
    id: 'mk-en',
    label: 'MK → EN',
    placeholder: 'Type Macedonian text to analyze…',
    sourceLang: 'mk',
    targetLang: 'en',
  },
];

const MAX_CHARS = 5000;

const difficultyColors = {
  beginner: brandColors.success,
  intermediate: brandColors.warning,
  advanced: brandColors.danger,
};

const difficultyLabels = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

export default function ReaderScreen() {
  const [directionId, setDirectionId] = useState<DirectionOption['id']>('mk-en');
  const selectedDirection = useMemo(
    () => directionOptions.find((option) => option.id === directionId) ?? directionOptions[0],
    [directionId],
  );
  const [inputText, setInputText] = useState('');
  const [analyzedData, setAnalyzedData] = useState<AnalyzedTextData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRetryable, setIsRetryable] = useState(false);
  const [revealMode, setRevealMode] = useState<'hidden' | 'revealed'>('hidden');
  const apiBaseUrl = getApiBaseUrl();

  const characterCount = `${inputText.length}/${MAX_CHARS}`;

  const handleAnalyze = useCallback(async () => {
    const text = inputText.trim();
    if (!text) {
      setAnalyzedData(null);
      setErrorMessage(null);
      setIsRetryable(false);
      return;
    }

    if (!apiBaseUrl) {
      setAnalyzedData(null);
      setErrorMessage('Reader API is not configured. Set EXPO_PUBLIC_API_BASE_URL to enable analysis.');
      setIsRetryable(false);
      return;
    }

    setIsAnalyzing(true);
    setErrorMessage(null);
    setIsRetryable(false);
    setRevealMode('hidden');

    try {
      const data = await analyzeText({
        text,
        sourceLang: selectedDirection.sourceLang,
        targetLang: selectedDirection.targetLang,
        baseUrl: apiBaseUrl,
        fetcher: authenticatedFetch,
      });

      setAnalyzedData(data);
    } catch (error) {
      if (error instanceof AnalyzeTextError) {
        setErrorMessage(error.message);
        setIsRetryable(error.retryable ?? false);
      } else {
        setErrorMessage('An unexpected error occurred. Please try again.');
        setIsRetryable(true);
      }
      setAnalyzedData(null);
    } finally {
      setIsAnalyzing(false);
    }
  }, [inputText, selectedDirection, apiBaseUrl]);

  const handleClear = useCallback(() => {
    setInputText('');
    setAnalyzedData(null);
    setErrorMessage(null);
    setIsRetryable(false);
    setRevealMode('hidden');
  }, []);

  const toggleRevealMode = useCallback(() => {
    setRevealMode((prev) => (prev === 'hidden' ? 'revealed' : 'hidden'));
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        {/* Header */}
        <View style={styles.header}>
          <NativeTypography variant="title" style={styles.title}>
            Word-by-Word Reader
          </NativeTypography>
          <NativeTypography variant="body" style={styles.subtitle}>
            Understand text word-by-word with translations, grammar, and difficulty levels
          </NativeTypography>
        </View>

        {/* Direction Toggle */}
        <View style={styles.directionToggle}>
          {directionOptions.map((option) => (
            <NativeButton
              key={option.id}
              title={option.label}
              onPress={() => setDirectionId(option.id)}
              variant={directionId === option.id ? 'primary' : 'secondary'}
              style={styles.directionButton}
            />
          ))}
        </View>

        {/* Input Card */}
        <NativeCard style={styles.inputCard}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={(text) => setInputText(text.slice(0, MAX_CHARS))}
            placeholder={selectedDirection.placeholder}
            placeholderTextColor={brandColors.textMuted}
            multiline
            maxLength={MAX_CHARS}
            editable={!isAnalyzing}
          />
          <View style={styles.inputFooter}>
            <NativeTypography variant="caption" style={styles.characterCount}>
              {characterCount}
            </NativeTypography>
            <View style={styles.actionButtons}>
              {inputText.length > 0 && (
                <NativeButton
                  title="Clear"
                  onPress={handleClear}
                  variant="secondary"
                  size="small"
                  disabled={isAnalyzing}
                />
              )}
              <NativeButton
                title={isAnalyzing ? 'Analyzing…' : 'Analyze'}
                onPress={handleAnalyze}
                variant="primary"
                size="small"
                disabled={!inputText.trim() || isAnalyzing}
              />
            </View>
          </View>
        </NativeCard>

        {/* Loading State */}
        {isAnalyzing && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={brandColors.primary} />
            <NativeTypography variant="body" style={styles.loadingText}>
              Analyzing text…
            </NativeTypography>
          </View>
        )}

        {/* Error State */}
        {errorMessage && (
          <NativeCard style={styles.errorCard}>
            <NativeTypography variant="body" style={styles.errorText}>
              {errorMessage}
            </NativeTypography>
            {isRetryable && (
              <NativeButton
                title="Retry"
                onPress={handleAnalyze}
                variant="primary"
                size="small"
                style={styles.retryButton}
              />
            )}
          </NativeCard>
        )}

        {/* Results */}
        {analyzedData && !isAnalyzing && (
          <View style={styles.resultsContainer}>
            {/* Difficulty Badge */}
            <View style={styles.difficultyHeader}>
              <NativeTypography variant="body" style={styles.difficultyLabel}>
                Difficulty:
              </NativeTypography>
              <NativeStatPill
                label={difficultyLabels[analyzedData.difficulty.level]}
                variant={analyzedData.difficulty.level === 'beginner' ? 'success' : analyzedData.difficulty.level === 'intermediate' ? 'warning' : 'danger'}
                style={styles.difficultyBadge}
              />
            </View>

            {/* Reveal Toggle */}
            <NativeButton
              title={revealMode === 'hidden' ? 'Show All Translations' : 'Hide Translations'}
              onPress={toggleRevealMode}
              variant="secondary"
              size="small"
              style={styles.revealButton}
            />

            {/* Word-by-Word Display */}
            <NativeCard style={styles.wordsCard}>
              <Text style={styles.wordsText}>
                {analyzedData.words.map((word) => (
                  <Text key={word.id}>
                    <Text style={styles.wordToken}>{word.original}</Text>
                    {revealMode === 'revealed' && (
                      <Text style={styles.wordTranslation}> ({word.translation})</Text>
                    )}
                    <Text> </Text>
                  </Text>
                ))}
              </Text>
              <NativeTypography variant="caption" style={styles.tapHint}>
                Tap words to see translations (coming soon)
              </NativeTypography>
            </NativeCard>

            {/* Full Translation */}
            <NativeCard style={styles.fullTranslationCard}>
              <NativeTypography variant="subtitle" style={styles.fullTranslationTitle}>
                Full Translation:
              </NativeTypography>
              <NativeTypography variant="body" style={styles.fullTranslationText}>
                {analyzedData.fullTranslation}
              </NativeTypography>
            </NativeCard>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: brandColors.background,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: spacingScale[4],
    gap: spacingScale[4],
  },
  header: {
    gap: spacingScale[2],
  },
  title: {
    color: brandColors.text,
  },
  subtitle: {
    color: brandColors.textMuted,
  },
  directionToggle: {
    flexDirection: 'row',
    gap: spacingScale[2],
  },
  directionButton: {
    flex: 1,
  },
  inputCard: {
    padding: spacingScale[4],
    gap: spacingScale[3],
  },
  textInput: {
    minHeight: 120,
    fontSize: 16,
    color: brandColors.text,
    textAlignVertical: 'top',
  },
  inputFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  characterCount: {
    color: brandColors.textMuted,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacingScale[2],
  },
  loadingContainer: {
    alignItems: 'center',
    padding: spacingScale[6],
    gap: spacingScale[3],
  },
  loadingText: {
    color: brandColors.textMuted,
  },
  errorCard: {
    padding: spacingScale[4],
    backgroundColor: `${brandColors.danger}20`,
    gap: spacingScale[3],
  },
  errorText: {
    color: brandColors.danger,
  },
  retryButton: {
    alignSelf: 'flex-start',
  },
  resultsContainer: {
    gap: spacingScale[4],
  },
  difficultyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacingScale[2],
  },
  difficultyLabel: {
    color: brandColors.text,
  },
  difficultyBadge: {},
  revealButton: {
    alignSelf: 'flex-start',
  },
  wordsCard: {
    padding: spacingScale[4],
    gap: spacingScale[3],
  },
  wordsText: {
    fontSize: 18,
    lineHeight: 32,
    color: brandColors.text,
  },
  wordToken: {
    fontWeight: '500',
  },
  wordTranslation: {
    fontSize: 14,
    color: brandColors.primary,
    fontStyle: 'italic',
  },
  tapHint: {
    color: brandColors.textMuted,
    fontStyle: 'italic',
  },
  fullTranslationCard: {
    padding: spacingScale[4],
    gap: spacingScale[3],
  },
  fullTranslationTitle: {
    color: brandColors.text,
  },
  fullTranslationText: {
    color: brandColors.textMuted,
  },
});
