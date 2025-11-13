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
} from 'react-native';
import { translateText, TranslateTextError, type TranslateLanguage } from '@mk/api-client';
import { getApiBaseUrl } from '../../lib/api';
import { useTranslatorHistory } from '../../lib/translator/history';
import { authenticatedFetch } from '../../lib/auth';
import type { TranslatorHistoryEntry } from '../../lib/translator/history';

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
    placeholder: 'Type English text…',
    sourceLang: 'en',
    targetLang: 'mk',
  },
  {
    id: 'mk-en',
    label: 'MK → EN',
    placeholder: 'Type Macedonian text…',
    sourceLang: 'mk',
    targetLang: 'en',
  },
];

const languageLabels: Record<TranslateLanguage, string> = {
  en: 'English',
  mk: 'Macedonian',
};

const MAX_CHARS = 1800;

export default function TranslatorScreen() {
  const [directionId, setDirectionId] = useState<DirectionOption['id']>('en-mk');
  const selectedDirection = useMemo(
    () => directionOptions.find((option) => option.id === directionId) ?? directionOptions[0],
    [directionId],
  );
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [detectedLanguage, setDetectedLanguage] = useState<TranslateLanguage | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRetryable, setIsRetryable] = useState(false);
  const apiBaseUrl = getApiBaseUrl();
  const { history, addEntry, isHydrated } = useTranslatorHistory();
  const timestampFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        dateStyle: 'short',
        timeStyle: 'short',
      }),
    [],
  );

  const characterCount = `${inputText.length}/${MAX_CHARS}`;

  const handleTranslate = useCallback(async () => {
    const text = inputText.trim();
    if (!text) {
      setTranslatedText('');
      setDetectedLanguage(null);
      setErrorMessage(null);
      setIsRetryable(false);
      return;
    }

    if (!apiBaseUrl) {
      setTranslatedText('');
      setDetectedLanguage(null);
      setErrorMessage('Translator API is not configured. Set EXPO_PUBLIC_API_BASE_URL to enable translations.');
      setIsRetryable(false);
      return;
    }

    setIsTranslating(true);
    setErrorMessage(null);
    setIsRetryable(false);

    try {
      const result = await translateText({
        text,
        sourceLang: selectedDirection.sourceLang,
        targetLang: selectedDirection.targetLang,
        baseUrl: apiBaseUrl,
        fetcher: authenticatedFetch,
      });

      setTranslatedText(result.translatedText);
      setDetectedLanguage(result.detectedSourceLang);

      await addEntry({
        directionId,
        sourceLang: selectedDirection.sourceLang,
        targetLang: selectedDirection.targetLang,
        sourceText: text,
        translatedText: result.translatedText,
        detectedLanguage: result.detectedSourceLang,
      });
    } catch (error) {
      const retryable = error instanceof TranslateTextError ? Boolean(error.retryable) : false;
      setIsRetryable(retryable);
      setTranslatedText('');
      setDetectedLanguage(null);
      setErrorMessage(error instanceof Error ? error.message : 'Translation failed. Please try again.');
    } finally {
      setIsTranslating(false);
    }
  }, [
    apiBaseUrl,
    directionId,
    inputText,
    selectedDirection.sourceLang,
    selectedDirection.targetLang,
    addEntry,
  ]);

  const handleClear = useCallback(() => {
    setInputText('');
    setTranslatedText('');
    setDetectedLanguage(null);
    setErrorMessage(null);
    setIsRetryable(false);
  }, []);

  const handleLoadHistory = useCallback((entry: TranslatorHistoryEntry) => {
    setDirectionId(entry.directionId);
    setInputText(entry.sourceText);
    setTranslatedText(entry.translatedText);
    setDetectedLanguage(entry.detectedLanguage ?? null);
    setErrorMessage(null);
    setIsRetryable(false);
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <NativeTypography variant="hero" style={styles.hero}>
          Translator
        </NativeTypography>
        <NativeTypography variant="body" style={styles.body}>
          Pick a direction, type a prompt, and review recent translations powered by the Next.js API.
        </NativeTypography>
        {!apiBaseUrl ? (
          <NativeCard style={styles.warningCard}>
            <NativeTypography variant="body" style={styles.warningText}>
              Configure `EXPO_PUBLIC_API_BASE_URL` to enable live translations against the Next.js API.
            </NativeTypography>
          </NativeCard>
        ) : null}

        <View style={styles.directionRow}>
          {directionOptions.map((option) => {
            const isSelected = directionId === option.id;
            return (
              <NativeButton
                key={option.id}
                variant={isSelected ? 'primary' : 'secondary'}
                style={styles.directionButton}
                onPress={() => setDirectionId(option.id)}
              >
                <NativeTypography
                  variant="body"
                  style={[styles.directionLabel, !isSelected && styles.directionLabelUnselected]}
                >
                  {option.label}
                </NativeTypography>
              </NativeButton>
            );
          })}
          <NativeButton variant="ghost" style={styles.swapButton} onPress={() => setDirectionId(directionId === 'en-mk' ? 'mk-en' : 'en-mk')}>
            <NativeTypography variant="body" style={styles.swapLabel}>
              Swap
            </NativeTypography>
          </NativeButton>
        </View>

        <NativeCard style={styles.card}>
          <NativeTypography variant="title" style={styles.cardTitle}>
            Input
          </NativeTypography>
          <TextInput
            style={styles.textArea}
            multiline
            placeholder={selectedDirection.placeholder}
            value={inputText}
            onChangeText={(value) => setInputText(value.slice(0, MAX_CHARS))}
          />
            <NativeTypography variant="caption" style={styles.counter}>
            {characterCount}
          </NativeTypography>
          {errorMessage ? (
            <>
              <NativeTypography variant="body" style={styles.errorText}>
                {errorMessage}
              </NativeTypography>
              {isRetryable ? (
                <NativeTypography variant="caption" style={styles.retryHint}>
                  This looks temporary—try again in a moment.
                </NativeTypography>
              ) : null}
            </>
          ) : null}
          <View style={styles.actionRow}>
            <NativeButton style={styles.actionButton} onPress={handleTranslate} disabled={isTranslating}>
              <NativeTypography variant="body" style={styles.actionText}>
                Translate
              </NativeTypography>
            </NativeButton>
            <NativeButton variant="ghost" onPress={handleClear}>
              <NativeTypography variant="body" style={styles.secondaryText}>
                Clear
              </NativeTypography>
            </NativeButton>
          </View>
        </NativeCard>

        <NativeCard style={styles.card}>
          <NativeTypography variant="title" style={styles.cardTitle}>
            Result
          </NativeTypography>
          {isTranslating ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color={brandColors.red} />
              <NativeTypography variant="body" style={styles.secondaryText}>
                Translating…
              </NativeTypography>
            </View>
          ) : translatedText ? (
            <NativeTypography variant="body" style={styles.resultText}>
              {translatedText}
            </NativeTypography>
          ) : (
            <NativeTypography variant="body" style={styles.secondaryText}>
              Your translation will appear here.
            </NativeTypography>
          )}
          {detectedLanguage ? (
            <NativeStatPill label="Detected" value={languageLabels[detectedLanguage]} accent="green" />
          ) : null}
        </NativeCard>

        <NativeCard style={styles.historyCard}>
          <NativeTypography variant="title" style={styles.cardTitle}>
            History
          </NativeTypography>
          {!isHydrated ? (
            <NativeTypography variant="body" style={styles.secondaryText}>
              Loading recent translations…
            </NativeTypography>
          ) : history.length === 0 ? (
            <NativeTypography variant="body" style={styles.secondaryText}>
              Your recent translations will appear here.
            </NativeTypography>
          ) : (
            <View style={styles.historyList}>
              {history.map((entry) => (
                <NativeCard key={entry.id} style={styles.historyItem}>
                  <View style={styles.historyHeader}>
                    <NativeStatPill
                      label={directionOptions.find((opt) => opt.id === entry.directionId)?.label ?? entry.directionId}
                      value={timestampFormatter.format(entry.timestamp)}
                      accent="gold"
                    />
                    <NativeButton variant="ghost" onPress={() => handleLoadHistory(entry)}>
                      <NativeTypography variant="body" style={styles.secondaryText}>
                        Load
                      </NativeTypography>
                    </NativeButton>
                  </View>
                  {entry.detectedLanguage ? (
                    <NativeTypography variant="caption" style={styles.detectedText}>
                      Detected {languageLabels[entry.detectedLanguage]}
                    </NativeTypography>
                  ) : null}
                  <NativeTypography variant="caption" style={styles.secondaryText}>
                    {entry.sourceText}
                  </NativeTypography>
                  <NativeTypography variant="body" style={styles.historyResult}>
                    {entry.translatedText}
                  </NativeTypography>
                </NativeCard>
              ))}
            </View>
          )}
        </NativeCard>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: brandColors.cream },
  container: { padding: spacingScale.xl, gap: spacingScale.lg },
  hero: { color: brandColors.navy },
  body: { color: 'rgba(16,24,40,0.85)' },
  warningCard: { backgroundColor: brandColors.rose, borderColor: brandColors.red, borderWidth: 1, gap: spacingScale.xs },
  warningText: { color: brandColors.red },
  directionRow: { flexDirection: 'row', gap: spacingScale.sm, flexWrap: 'wrap' },
  directionButton: { flexGrow: 1 },
  directionLabel: { color: '#fff' },
  directionLabelUnselected: { color: brandColors.navy },
  swapButton: { alignSelf: 'flex-start' },
  swapLabel: { color: brandColors.navy },
  card: { gap: spacingScale.sm },
  cardTitle: { color: brandColors.navy },
  textArea: {
    minHeight: 140,
    borderWidth: 1,
    borderColor: 'rgba(16,24,40,0.2)',
    borderRadius: spacingScale.md,
    padding: spacingScale.sm,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  counter: { alignSelf: 'flex-end', color: 'rgba(16,24,40,0.6)' },
  errorText: { color: brandColors.red },
  retryHint: { color: brandColors.navy },
  actionRow: { flexDirection: 'row', gap: spacingScale.sm, flexWrap: 'wrap' },
  actionButton: { flexGrow: 1 },
  actionText: { color: '#fff' },
  secondaryText: { color: 'rgba(16,24,40,0.7)' },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: spacingScale.sm },
  resultText: { color: brandColors.navy },
  historyCard: { gap: spacingScale.sm },
  historyList: { gap: spacingScale.sm },
  historyItem: { gap: spacingScale.xs },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  detectedText: { color: brandColors.greenDark },
  historyResult: { color: brandColors.navy },
});
