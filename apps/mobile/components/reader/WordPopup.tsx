import { useState, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { X, BookOpen, Plus, Check } from 'lucide-react-native';

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
 * WordPopup - Modal popup showing word translation
 *
 * Displays the Macedonian word, English translation, and part of speech.
 * Includes a placeholder save-to-glossary button for Phase 64-03.
 */
export function WordPopup({ visible, word, onClose, storyId }: WordPopupProps) {
  const [isSaved, setIsSaved] = useState(false);

  // Reset saved state when word changes
  const handleClose = useCallback(() => {
    setIsSaved(false);
    onClose();
  }, [onClose]);

  // Placeholder for 64-03 save functionality
  const handleSave = useCallback(() => {
    // TODO: Implement save-to-glossary in 64-03
    setIsSaved(true);
    console.log('[WordPopup] Save to glossary:', word?.mk, 'from story:', storyId);
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

          {/* Word content */}
          <View style={styles.content}>
            {/* Macedonian word */}
            <Text style={styles.macedonian}>{word.mk}</Text>

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

            {/* Save to glossary button (placeholder) */}
            {!word.isLoading && (
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
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  popup: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#0b0b12',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#222536',
    padding: 24,
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 8,
    zIndex: 1,
  },
  content: {
    alignItems: 'center',
  },
  macedonian: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#f7f8fb',
    marginBottom: 8,
    textAlign: 'center',
  },
  english: {
    fontSize: 20,
    color: '#f7f8fb',
    marginBottom: 12,
    textAlign: 'center',
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
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(247,248,251,0.08)',
    borderRadius: 16,
    marginBottom: 20,
  },
  posText: {
    fontSize: 12,
    color: 'rgba(247,248,251,0.6)',
    fontWeight: '500',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    paddingVertical: 14,
    backgroundColor: 'rgba(246,216,59,0.15)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(246,216,59,0.4)',
  },
  saveButtonSaved: {
    backgroundColor: 'rgba(34,197,94,0.15)',
    borderColor: 'rgba(34,197,94,0.3)',
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#f6d83b',
  },
  saveButtonTextSaved: {
    color: '#22c55e',
  },
});
