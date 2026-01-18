import { useState, useCallback, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { X, BookOpen, Plus, Check, Volume2, VolumeX, Sparkles } from 'lucide-react-native';
import { saveWord, isWordSaved } from '../../lib/glossary';
import { useTTS } from '../../hooks/useTTS';
import { haptic } from '../../lib/haptics';

export type WordInfo = {
  mk: string;
  en: string;
  pos?: string;
  isLoading?: boolean;
};

interface WordPopupProps {
  /** Whether the popup is visible */
  visible: boolean;
  /** The word info to display */
  word: WordInfo | null;
  /** Callback when popup should close */
  onClose: () => void;
  /** Story ID for save-to-glossary (placeholder for 64-03) */
  storyId?: string;
}

const POS_LABELS: Record<string, string> = {
  noun: 'Noun',
  verb: 'Verb',
  adjective: 'Adjective',
  adverb: 'Adverb',
  'reflexive verb': 'Reflexive Verb',
  number: 'Number',
  other: 'Other',
};

/**
 * WordPopup - Enhanced modal popup for language learning
 *
 * Displays the Macedonian word, English translation, and part of speech.
 * Features:
 * - Text-to-Speech pronunciation
 * - Save-to-glossary functionality
 * - Gamified visual design
 * - Haptic feedback
 */
export function WordPopup({ visible, word, onClose, storyId }: WordPopupProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [isCheckingSaved, setIsCheckingSaved] = useState(false);
  const [showXP, setShowXP] = useState(false);

  // TTS hook for pronunciation
  const { speak, isSpeaking, stop, isSupported } = useTTS({ lang: 'mk' });

  // Check if word is already saved when popup opens
  useEffect(() => {
    const checkSaved = async () => {
      if (visible && word && !word.isLoading) {
        setIsCheckingSaved(true);
        setShowXP(false);
        try {
          const saved = await isWordSaved(word.mk);
          setIsSaved(saved);
        } catch {
          setIsSaved(false);
        } finally {
          setIsCheckingSaved(false);
        }
      }
    };
    checkSaved();
  }, [visible, word]);

  // Reset saved state when popup closes
  const handleClose = useCallback(() => {
    setIsSaved(false);
    setIsCheckingSaved(false);
    setShowXP(false);
    if (isSpeaking) stop();
    onClose();
  }, [onClose, isSpeaking, stop]);

  // Speak the word
  const handleSpeak = useCallback(() => {
    if (!word || word.isLoading) return;
    haptic.light();
    if (isSpeaking) {
      stop();
    } else {
      speak(word.mk);
    }
  }, [word, speak, stop, isSpeaking]);

  // Save word to glossary
  const handleSave = useCallback(async () => {
    if (!word || word.isLoading || !storyId) return;

    haptic.success();
    try {
      await saveWord({
        mk: word.mk,
        en: word.en,
        pos: word.pos,
        source: storyId,
      });
      setIsSaved(true);
      // Show XP animation
      setShowXP(true);
      setTimeout(() => setShowXP(false), 1500);
    } catch (err) {
      console.error('[WordPopup] Failed to save word:', err);
    }
  }, [word, storyId]);

  if (!word) return null;

  const posLabel = word.pos ? POS_LABELS[word.pos.toLowerCase()] ?? word.pos : null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <Pressable style={styles.overlay} onPress={handleClose}>
        <Pressable style={styles.popup} onPress={(e) => e.stopPropagation()}>
          {/* Close button */}
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <X size={20} color="rgba(247,248,251,0.6)" />
          </TouchableOpacity>

          {/* XP Animation */}
          {showXP && (
            <View style={styles.xpBadge}>
              <Sparkles size={14} color="#f6d83b" />
              <Text style={styles.xpText}>+5 XP</Text>
            </View>
          )}

          {/* Word content */}
          <View style={styles.content}>
            {/* Macedonian word with TTS */}
            <View style={styles.wordHeader}>
              <Text style={styles.macedonian}>{word.mk}</Text>
              {isSupported && !word.isLoading && (
                <TouchableOpacity
                  style={[styles.speakButton, isSpeaking && styles.speakButtonActive]}
                  onPress={handleSpeak}
                >
                  {isSpeaking ? (
                    <VolumeX size={22} color="#f6d83b" />
                  ) : (
                    <Volume2 size={22} color="#f7f8fb" />
                  )}
                </TouchableOpacity>
              )}
            </View>

            {/* Translation */}
            {word.isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#f6d83b" />
                <Text style={styles.loadingText}>Translating...</Text>
              </View>
            ) : (
              <Text style={styles.english}>{word.en}</Text>
            )}

            {/* Part of speech badge */}
            {posLabel && !word.isLoading && (
              <View style={styles.posBadge}>
                <BookOpen size={12} color="rgba(247,248,251,0.6)" />
                <Text style={styles.posText}>{posLabel}</Text>
              </View>
            )}

            {/* Action buttons */}
            {!word.isLoading && !isCheckingSaved && (
              <View style={styles.actionButtons}>
                {/* Save to glossary button */}
                <TouchableOpacity
                  style={[
                    styles.saveButton,
                    isSaved && styles.saveButtonSaved,
                  ]}
                  onPress={handleSave}
                  disabled={isSaved}
                >
                  {isSaved ? (
                    <>
                      <Check size={18} color="#22c55e" />
                      <Text style={[styles.saveButtonText, styles.saveButtonTextSaved]}>
                        Saved!
                      </Text>
                    </>
                  ) : (
                    <>
                      <Plus size={18} color="#f6d83b" />
                      <Text style={styles.saveButtonText}>Save to Glossary</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {/* Tip */}
            {!word.isLoading && (
              <Text style={styles.tip}>Tap the speaker to hear pronunciation</Text>
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
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  popup: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#0b0b12',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#222536',
    padding: 24,
    // Subtle glow effect
    shadowColor: '#f6d83b',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 8,
    zIndex: 1,
  },
  xpBadge: {
    position: 'absolute',
    top: -12,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f6d83b',
    borderRadius: 16,
    zIndex: 2,
  },
  xpText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#06060b',
  },
  content: {
    alignItems: 'center',
  },
  wordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  macedonian: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#f7f8fb',
    textAlign: 'center',
  },
  speakButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(247,248,251,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  speakButtonActive: {
    backgroundColor: 'rgba(246,216,59,0.2)',
  },
  english: {
    fontSize: 22,
    color: '#22c55e',
    marginBottom: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  loadingText: {
    fontSize: 16,
    color: 'rgba(247,248,251,0.5)',
  },
  posBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: 'rgba(247,248,251,0.08)',
    borderRadius: 20,
    marginBottom: 20,
  },
  posText: {
    fontSize: 13,
    color: 'rgba(247,248,251,0.6)',
    fontWeight: '500',
  },
  actionButtons: {
    width: '100%',
    gap: 10,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    paddingVertical: 16,
    backgroundColor: 'rgba(246,216,59,0.15)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(246,216,59,0.4)',
  },
  saveButtonSaved: {
    backgroundColor: 'rgba(34,197,94,0.15)',
    borderColor: 'rgba(34,197,94,0.3)',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f6d83b',
  },
  saveButtonTextSaved: {
    color: '#22c55e',
  },
  tip: {
    fontSize: 12,
    color: 'rgba(247,248,251,0.4)',
    marginTop: 16,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
