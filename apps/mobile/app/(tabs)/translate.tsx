import { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { setStringAsync } from 'expo-clipboard';
import {
  ArrowLeftRight,
  Copy,
  X,
  Check,
  Clock,
  Trash2,
  FileText,
} from 'lucide-react-native';
import {
  translateText,
  TranslationDirection,
  getDirectionLabels,
  swapDirection,
} from '../../lib/translate';
import {
  addToHistory,
  getHistory,
  clearHistory,
  HistoryItem,
} from '../../lib/translation-history';

const MAX_CHARACTERS = 1800;

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

export default function TranslateScreen() {
  const [direction, setDirection] = useState<TranslationDirection>('en-mk');
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // History state
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const labels = getDirectionLabels(direction);

  // Load history when modal opens
  useEffect(() => {
    if (showHistory) {
      loadHistory();
    }
  }, [showHistory]);

  const loadHistory = useCallback(async () => {
    setIsLoadingHistory(true);
    try {
      const items = await getHistory();
      setHistory(items);
    } catch (err) {
      console.error('[Translate] Failed to load history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  const handleSwapDirection = useCallback(() => {
    const newDirection = swapDirection(direction);
    setDirection(newDirection);
    // Swap input and output
    if (translatedText) {
      setInputText(translatedText);
      setTranslatedText(inputText);
    }
  }, [direction, inputText, translatedText]);

  const handleClear = useCallback(() => {
    setInputText('');
    setTranslatedText('');
    setError(null);
    setIsCopied(false);
  }, []);

  const handleTranslate = useCallback(async () => {
    if (!inputText.trim()) return;

    setIsTranslating(true);
    setError(null);
    setIsCopied(false);

    try {
      const result = await translateText(inputText, direction);
      setTranslatedText(result.translatedText);

      // Save to history
      await addToHistory({
        sourceText: inputText.trim(),
        translatedText: result.translatedText,
        direction,
      });
    } catch (err) {
      console.error('[Translate] Error:', err);
      setError(err instanceof Error ? err.message : 'Translation failed');
    } finally {
      setIsTranslating(false);
    }
  }, [inputText, direction]);

  const handleCopy = useCallback(async () => {
    if (!translatedText) return;
    await setStringAsync(translatedText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  }, [translatedText]);

  const handleHistoryItemPress = useCallback((item: HistoryItem) => {
    setInputText(item.sourceText);
    setDirection(item.direction);
    setTranslatedText(''); // Don't auto-translate, let user review
    setShowHistory(false);
  }, []);

  const handleClearHistory = useCallback(async () => {
    await clearHistory();
    setHistory([]);
  }, []);

  const characterCount = inputText.length;
  const isOverLimit = characterCount > MAX_CHARACTERS;
  const canTranslate = inputText.trim().length > 0 && !isOverLimit && !isTranslating;

  const renderHistoryItem = ({ item }: { item: HistoryItem }) => {
    const dirLabel = item.direction === 'en-mk' ? 'EN→MK' : 'MK→EN';

    return (
      <TouchableOpacity
        style={styles.historyItem}
        onPress={() => handleHistoryItemPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.historyContent}>
          <Text style={styles.historySource} numberOfLines={1}>
            {truncate(item.sourceText, 50)}
          </Text>
          <Text style={styles.historyTranslated} numberOfLines={1}>
            {truncate(item.translatedText, 50)}
          </Text>
        </View>
        <View style={styles.historyBadge}>
          <Text style={styles.historyBadgeText}>{dirLabel}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerRow}>
              <View>
                <Text style={styles.title}>Translate</Text>
                <Text style={styles.subtitle}>English ↔ Macedonian</Text>
              </View>
              <TouchableOpacity
                style={styles.historyButton}
                onPress={() => setShowHistory(true)}
                activeOpacity={0.7}
              >
                <Clock size={22} color="#f6d83b" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Direction Toggle */}
          <View style={styles.directionContainer}>
            <TouchableOpacity
              style={[
                styles.directionButton,
                direction === 'en-mk' && styles.directionButtonActive,
              ]}
              onPress={() => setDirection('en-mk')}
            >
              <Text
                style={[
                  styles.directionButtonText,
                  direction === 'en-mk' && styles.directionButtonTextActive,
                ]}
              >
                EN → MK
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.swapButton}
              onPress={handleSwapDirection}
              activeOpacity={0.7}
            >
              <ArrowLeftRight size={20} color="#f6d83b" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.directionButton,
                direction === 'mk-en' && styles.directionButtonActive,
              ]}
              onPress={() => setDirection('mk-en')}
            >
              <Text
                style={[
                  styles.directionButtonText,
                  direction === 'mk-en' && styles.directionButtonTextActive,
                ]}
              >
                MK → EN
              </Text>
            </TouchableOpacity>
          </View>

          {/* Input Section */}
          <View style={styles.inputCard}>
            <View style={styles.inputHeader}>
              <Text style={styles.inputLabel}>{labels.sourceLabel}</Text>
              {inputText.length > 0 && (
                <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
                  <X size={18} color="rgba(247,248,251,0.5)" />
                </TouchableOpacity>
              )}
            </View>
            <TextInput
              style={styles.textInput}
              placeholder={labels.placeholder}
              placeholderTextColor="rgba(247,248,251,0.3)"
              value={inputText}
              onChangeText={setInputText}
              multiline
              textAlignVertical="top"
              maxLength={MAX_CHARACTERS + 100} // Allow slight overflow for UX
            />
            <View style={styles.inputFooter}>
              <Text
                style={[
                  styles.characterCount,
                  isOverLimit && styles.characterCountError,
                ]}
              >
                {characterCount}/{MAX_CHARACTERS}
              </Text>
            </View>
          </View>

          {/* Translate Button */}
          <TouchableOpacity
            onPress={handleTranslate}
            disabled={!canTranslate}
            activeOpacity={0.8}
            style={[
              styles.translateButton,
              canTranslate ? styles.translateButtonActive : styles.translateButtonDisabled,
            ]}
          >
            {isTranslating ? (
              <ActivityIndicator size="small" color="#06060b" />
            ) : (
              <Text
                style={[
                  styles.translateButtonText,
                  !canTranslate && styles.translateButtonTextDisabled,
                ]}
              >
                Translate
              </Text>
            )}
          </TouchableOpacity>

          {/* Error */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity onPress={handleTranslate}>
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Result Section */}
          {translatedText && (
            <View style={styles.resultCard}>
              <View style={styles.resultHeader}>
                <Text style={styles.resultLabel}>{labels.targetLabel}</Text>
                <TouchableOpacity
                  onPress={handleCopy}
                  style={styles.copyButton}
                  activeOpacity={0.7}
                >
                  {isCopied ? (
                    <>
                      <Check size={16} color="#22c55e" />
                      <Text style={styles.copiedText}>Copied!</Text>
                    </>
                  ) : (
                    <>
                      <Copy size={16} color="#f6d83b" />
                      <Text style={styles.copyText}>Copy</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
              <Text style={styles.resultText} selectable>
                {translatedText}
              </Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* History Modal */}
      <Modal
        visible={showHistory}
        animationType="slide"
        transparent
        onRequestClose={() => setShowHistory(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Translation History</Text>
              <TouchableOpacity
                onPress={() => setShowHistory(false)}
                style={styles.modalCloseButton}
              >
                <X size={24} color="#f7f8fb" />
              </TouchableOpacity>
            </View>

            {/* History List */}
            {isLoadingHistory ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#f6d83b" />
              </View>
            ) : history.length === 0 ? (
              <View style={styles.emptyContainer}>
                <FileText size={48} color="rgba(247,248,251,0.3)" />
                <Text style={styles.emptyTitle}>No history yet</Text>
                <Text style={styles.emptyText}>
                  Your recent translations will appear here
                </Text>
              </View>
            ) : (
              <>
                <FlatList
                  data={history}
                  renderItem={renderHistoryItem}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={styles.historyList}
                  showsVerticalScrollIndicator={false}
                />

                {/* Clear History Button */}
                <TouchableOpacity
                  style={styles.clearHistoryButton}
                  onPress={handleClearHistory}
                  activeOpacity={0.7}
                >
                  <Trash2 size={18} color="#ef4444" />
                  <Text style={styles.clearHistoryText}>Clear History</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#06060b',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#f7f8fb',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(247,248,251,0.6)',
  },
  historyButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(246,216,59,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  directionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 12,
  },
  directionButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#0b0b12',
    borderWidth: 1,
    borderColor: '#222536',
  },
  directionButtonActive: {
    backgroundColor: 'rgba(246,216,59,0.15)',
    borderColor: 'rgba(246,216,59,0.4)',
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
    borderRadius: 20,
    backgroundColor: 'rgba(246,216,59,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputCard: {
    backgroundColor: '#0b0b12',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#222536',
    marginBottom: 16,
    padding: 16,
  },
  inputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(247,248,251,0.5)',
    letterSpacing: 1,
  },
  clearButton: {
    padding: 4,
  },
  textInput: {
    fontSize: 16,
    color: '#f7f8fb',
    minHeight: 120,
    maxHeight: 200,
    lineHeight: 24,
  },
  inputFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  characterCount: {
    fontSize: 12,
    color: 'rgba(247,248,251,0.4)',
  },
  characterCountError: {
    color: '#ef4444',
  },
  translateButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  translateButtonActive: {
    backgroundColor: '#f6d83b',
  },
  translateButtonDisabled: {
    backgroundColor: '#333',
    opacity: 0.5,
  },
  translateButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#06060b',
  },
  translateButtonTextDisabled: {
    color: 'rgba(247,248,251,0.5)',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 16,
    padding: 12,
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
  },
  errorText: {
    fontSize: 14,
    color: '#ef4444',
  },
  retryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f6d83b',
  },
  resultCard: {
    backgroundColor: '#0b0b12',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#222536',
    padding: 16,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(247,248,251,0.5)',
    letterSpacing: 1,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  copyText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#f6d83b',
  },
  copiedText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#22c55e',
  },
  resultText: {
    fontSize: 16,
    color: '#f7f8fb',
    lineHeight: 24,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#0b0b12',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingBottom: 32,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#222536',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#f7f8fb',
  },
  modalCloseButton: {
    padding: 4,
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f7f8fb',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: 'rgba(247,248,251,0.5)',
    textAlign: 'center',
  },
  historyList: {
    padding: 16,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#06060b',
    borderRadius: 12,
    marginBottom: 8,
  },
  historyContent: {
    flex: 1,
    marginRight: 12,
  },
  historySource: {
    fontSize: 15,
    fontWeight: '500',
    color: '#f7f8fb',
    marginBottom: 4,
  },
  historyTranslated: {
    fontSize: 14,
    color: 'rgba(247,248,251,0.6)',
  },
  historyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(246,216,59,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(246,216,59,0.3)',
  },
  historyBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#f6d83b',
  },
  clearHistoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
  },
  clearHistoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ef4444',
  },
});
