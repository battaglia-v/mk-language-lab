/**
 * WordLookupSheet - Bottom sheet for word translation in Reader
 * 
 * Shows word translation, part of speech, and actions (TTS, save, practice)
 * Mirrors PWA's reader word lookup popover behavior
 * 
 * @see PARITY_CHECKLIST.md - Feature parity
 * @see components/reader/TappableText.tsx (PWA implementation)
 */

import React, { useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { 
  X, 
  Volume2, 
  VolumeX, 
  BookmarkPlus, 
  BookmarkCheck,
  Play,
  Copy,
  Check,
} from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import { useTTS } from '../../hooks/useTTS';
import { haptic } from '../../lib/haptics';

export type WordLookupData = {
  /** Original Macedonian word */
  original: string;
  /** English translation */
  translation: string;
  /** Part of speech (noun, verb, etc.) */
  partOfSpeech?: string;
  /** Pronunciation guide */
  pronunciation?: string;
  /** Alternative translations */
  alternatives?: string[];
  /** Context hint */
  contextHint?: string;
  /** Difficulty level */
  difficulty?: 'A1' | 'A2' | 'B1' | 'B2';
  /** Whether translation is loading */
  isLoading?: boolean;
};

type WordLookupSheetProps = {
  /** Whether the sheet is visible */
  visible: boolean;
  /** Word data to display */
  word: WordLookupData | null;
  /** Whether word is saved to favorites */
  isSaved: boolean;
  /** Close the sheet */
  onClose: () => void;
  /** Save word to favorites */
  onSave: () => void;
  /** Add word to practice queue */
  onPractice?: () => void;
};

const DIFFICULTY_COLORS: Record<string, { bg: string; text: string }> = {
  A1: { bg: 'rgba(34,197,94,0.15)', text: '#22c55e' },
  A2: { bg: 'rgba(59,130,246,0.15)', text: '#3b82f6' },
  B1: { bg: 'rgba(245,158,11,0.15)', text: '#f59e0b' },
  B2: { bg: 'rgba(239,68,68,0.15)', text: '#ef4444' },
};

export function WordLookupSheet({
  visible,
  word,
  isSaved,
  onClose,
  onSave,
  onPractice,
}: WordLookupSheetProps) {
  const { speak, isSpeaking, stop, isSupported: ttsSupported } = useTTS({ lang: 'mk' });
  const [isCopied, setIsCopied] = React.useState(false);

  const handleSpeak = useCallback(() => {
    if (!word) return;
    haptic.selection();
    if (isSpeaking) {
      stop();
    } else {
      speak(word.original);
    }
  }, [word, speak, stop, isSpeaking]);

  const handleCopy = useCallback(async () => {
    if (!word) return;
    haptic.light();
    await Clipboard.setStringAsync(`${word.original} - ${word.translation}`);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  }, [word]);

  const handleSave = useCallback(() => {
    haptic.success();
    onSave();
  }, [onSave]);

  const handlePractice = useCallback(() => {
    haptic.medium();
    onPractice?.();
  }, [onPractice]);

  if (!word) return null;

  const difficultyStyle = word.difficulty ? DIFFICULTY_COLORS[word.difficulty] : null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          {/* Handle bar */}
          <View style={styles.handleBar} />

          {/* Close button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color="rgba(247,248,251,0.5)" />
          </TouchableOpacity>

          {/* Word content */}
          <View style={styles.content}>
            {word.isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#f6d83b" />
                <Text style={styles.loadingText}>Translating...</Text>
              </View>
            ) : (
              <>
                {/* Word and translation */}
                <View style={styles.wordSection}>
                  <Text style={styles.originalWord}>{word.original}</Text>
                  <Text style={styles.translation}>{word.translation}</Text>
                  
                  {/* Metadata row */}
                  <View style={styles.metaRow}>
                    {word.partOfSpeech && (
                      <View style={styles.posBadge}>
                        <Text style={styles.posText}>{word.partOfSpeech}</Text>
                      </View>
                    )}
                    {difficultyStyle && word.difficulty && (
                      <View style={[styles.difficultyBadge, { backgroundColor: difficultyStyle.bg }]}>
                        <Text style={[styles.difficultyText, { color: difficultyStyle.text }]}>
                          {word.difficulty}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Pronunciation */}
                  {word.pronunciation && (
                    <Text style={styles.pronunciation}>/{word.pronunciation}/</Text>
                  )}

                  {/* Context hint */}
                  {word.contextHint && (
                    <Text style={styles.contextHint}>{word.contextHint}</Text>
                  )}

                  {/* Alternatives */}
                  {word.alternatives && word.alternatives.length > 0 && (
                    <View style={styles.alternativesContainer}>
                      <Text style={styles.alternativesLabel}>Also:</Text>
                      <Text style={styles.alternativesText}>
                        {word.alternatives.join(', ')}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Action buttons */}
                <View style={styles.actions}>
                  {/* Listen button */}
                  {ttsSupported && (
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={handleSpeak}
                    >
                      {isSpeaking ? (
                        <VolumeX size={20} color="#f6d83b" />
                      ) : (
                        <Volume2 size={20} color="#f6d83b" />
                      )}
                      <Text style={styles.actionText}>Listen</Text>
                    </TouchableOpacity>
                  )}

                  {/* Save button */}
                  <TouchableOpacity
                    style={[styles.actionButton, isSaved && styles.actionButtonActive]}
                    onPress={handleSave}
                    disabled={isSaved}
                  >
                    {isSaved ? (
                      <BookmarkCheck size={20} color="#22c55e" />
                    ) : (
                      <BookmarkPlus size={20} color="#f6d83b" />
                    )}
                    <Text style={[styles.actionText, isSaved && styles.actionTextSaved]}>
                      {isSaved ? 'Saved' : 'Save'}
                    </Text>
                  </TouchableOpacity>

                  {/* Practice button */}
                  {onPractice && (
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={handlePractice}
                    >
                      <Play size={20} color="#f6d83b" />
                      <Text style={styles.actionText}>Practice</Text>
                    </TouchableOpacity>
                  )}

                  {/* Copy button */}
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={handleCopy}
                  >
                    {isCopied ? (
                      <Check size={20} color="#22c55e" />
                    ) : (
                      <Copy size={20} color="#f6d83b" />
                    )}
                    <Text style={[styles.actionText, isCopied && styles.actionTextSaved]}>
                      {isCopied ? 'Copied' : 'Copy'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Helper text */}
                <Text style={styles.helperText}>
                  Saved words appear in Practice → My Saved Words
                </Text>
              </>
            )}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#0b0b12',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
    minHeight: 300,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#374151',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 4,
    zIndex: 10,
  },
  content: {
    padding: 24,
    paddingTop: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: 'rgba(247,248,251,0.6)',
  },
  wordSection: {
    alignItems: 'center',
    marginBottom: 24,
    gap: 8,
  },
  originalWord: {
    fontSize: 32,
    fontWeight: '700',
    color: '#f7f8fb',
    textAlign: 'center',
  },
  translation: {
    fontSize: 20,
    color: 'rgba(247,248,251,0.8)',
    textAlign: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  posBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(247,248,251,0.1)',
  },
  posText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(247,248,251,0.6)',
    textTransform: 'capitalize',
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
  },
  pronunciation: {
    fontSize: 14,
    color: 'rgba(247,248,251,0.5)',
    fontStyle: 'italic',
    marginTop: 4,
  },
  contextHint: {
    fontSize: 14,
    color: 'rgba(247,248,251,0.6)',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  alternativesContainer: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
  },
  alternativesLabel: {
    fontSize: 13,
    color: 'rgba(247,248,251,0.5)',
  },
  alternativesText: {
    fontSize: 13,
    color: 'rgba(247,248,251,0.7)',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 16,
  },
  actionButton: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(247,248,251,0.05)',
    minWidth: 70,
  },
  actionButtonActive: {
    backgroundColor: 'rgba(34,197,94,0.1)',
  },
  actionText: {
    fontSize: 12,
    color: '#f6d83b',
    marginTop: 4,
    fontWeight: '500',
  },
  actionTextSaved: {
    color: '#22c55e',
  },
  helperText: {
    fontSize: 12,
    color: 'rgba(247,248,251,0.4)',
    textAlign: 'center',
  },
});

export default WordLookupSheet;
