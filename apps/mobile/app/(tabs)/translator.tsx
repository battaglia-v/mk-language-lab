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

type DirectionOption = {
  id: 'mk-en' | 'en-mk';
  label: string;
  placeholder: string;
};

type TranslationEntry = {
  id: string;
  directionId: DirectionOption['id'];
  sourceText: string;
  translatedText: string;
  timestamp: number;
};

const directionOptions: DirectionOption[] = [
  {
    id: 'en-mk',
    label: 'EN → MK',
    placeholder: 'Type English text…',
  },
  {
    id: 'mk-en',
    label: 'MK → EN',
    placeholder: 'Type Macedonian text…',
  },
];

const MAX_CHARS = 1800;

export default function TranslatorScreen() {
  const [directionId, setDirectionId] = useState<DirectionOption['id']>('en-mk');
  const selectedDirection = useMemo(
    () => directionOptions.find((option) => option.id === directionId) ?? directionOptions[0],
    [directionId],
  );
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [history, setHistory] = useState<TranslationEntry[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
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
      setErrorMessage(null);
      return;
    }
    setIsTranslating(true);
    setErrorMessage(null);
    // Mock translation for now
    await new Promise((resolve) => setTimeout(resolve, 600));
    const translation = `[${selectedDirection.label}] ${text}`;
    setTranslatedText(translation);
    const entry: TranslationEntry = {
      id: `${Date.now()}`,
      directionId,
      sourceText: text,
      translatedText: translation,
      timestamp: Date.now(),
    };
    setHistory((prev) => [entry, ...prev].slice(0, 5));
    setIsTranslating(false);
  }, [directionId, inputText, selectedDirection.label]);

  const handleClear = useCallback(() => {
    setInputText('');
    setTranslatedText('');
    setErrorMessage(null);
  }, []);

  const handleLoadHistory = useCallback((entry: TranslationEntry) => {
    setDirectionId(entry.directionId);
    setInputText(entry.sourceText);
    setTranslatedText(entry.translatedText);
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <NativeTypography variant="hero" style={styles.hero}>
          Translator
        </NativeTypography>
        <NativeTypography variant="body" style={styles.body}>
          Pick a direction, type a prompt, and review recent translations. API integration will slot in later.
        </NativeTypography>

        <View style={styles.directionRow}>
          {directionOptions.map((option) => (
            <NativeButton
              key={option.id}
              variant={directionId === option.id ? 'primary' : 'secondary'}
              style={styles.directionButton}
              onPress={() => setDirectionId(option.id)}
            >
              <NativeTypography variant="body" style={styles.directionLabel}>
                {option.label}
              </NativeTypography>
            </NativeButton>
          ))}
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
            <NativeTypography variant="body" style={styles.errorText}>
              {errorMessage}
            </NativeTypography>
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
        </NativeCard>

            {history.length > 0 ? (
          <NativeCard style={styles.historyCard}>
            <NativeTypography variant="title" style={styles.cardTitle}>
              History
            </NativeTypography>
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
                  <NativeTypography variant="caption" style={styles.secondaryText}>
                    {entry.sourceText}
                  </NativeTypography>
                  <NativeTypography variant="body" style={styles.historyResult}>
                    {entry.translatedText}
                  </NativeTypography>
                </NativeCard>
              ))}
            </View>
          </NativeCard>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: brandColors.cream },
  container: { padding: spacingScale.xl, gap: spacingScale.lg },
  hero: { color: brandColors.navy },
  body: { color: 'rgba(16,24,40,0.85)' },
  directionRow: { flexDirection: 'row', gap: spacingScale.sm, flexWrap: 'wrap' },
  directionButton: { flexGrow: 1 },
  directionLabel: { color: '#fff' },
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
  historyResult: { color: brandColors.navy },
});
