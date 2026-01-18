/**
 * PracticeModeSheet - Bottom sheet for practice mode and difficulty selection
 * 
 * Mirrors PWA's PracticeHub settings bottom sheet
 * 
 * @see PARITY_CHECKLIST.md - Feature parity
 * @see components/practice/PracticeHub.tsx (PWA implementation)
 */

import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Pressable,
} from 'react-native';
import { X, Zap, Keyboard, ListChecks, Shuffle } from 'lucide-react-native';

export type PracticeMode = 'multipleChoice' | 'typing' | 'cloze' | 'tapWords' | 'matching';
export type DifficultyFilter = 'all' | 'beginner' | 'intermediate' | 'advanced';

type Props = {
  visible: boolean;
  onClose: () => void;
  onStart: (mode: PracticeMode, difficulty: DifficultyFilter, count: number) => void;
  initialMode?: PracticeMode;
  initialDifficulty?: DifficultyFilter;
  initialCount?: number;
};

const MODES: { id: PracticeMode; label: string; icon: typeof Zap; description: string }[] = [
  {
    id: 'multipleChoice',
    label: 'Multiple Choice',
    icon: ListChecks,
    description: 'Choose the correct answer',
  },
  {
    id: 'typing',
    label: 'Typing',
    icon: Keyboard,
    description: 'Type your answer',
  },
  {
    id: 'tapWords',
    label: 'Word Order',
    icon: Shuffle,
    description: 'Arrange words in order',
  },
];

const DIFFICULTIES: { id: DifficultyFilter; label: string }[] = [
  { id: 'all', label: 'All Levels' },
  { id: 'beginner', label: 'Beginner' },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'advanced', label: 'Advanced' },
];

const COUNTS = [5, 10, 15, 20];

export function PracticeModeSheet({
  visible,
  onClose,
  onStart,
  initialMode = 'multipleChoice',
  initialDifficulty = 'all',
  initialCount = 10,
}: Props) {
  const [selectedMode, setSelectedMode] = useState<PracticeMode>(initialMode);
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyFilter>(initialDifficulty);
  const [selectedCount, setSelectedCount] = useState<number>(initialCount);

  const handleStart = () => {
    onStart(selectedMode, selectedDifficulty, selectedCount);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Practice Settings</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#f7f8fb" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Mode Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Practice Mode</Text>
              <View style={styles.modeGrid}>
                {MODES.map((mode) => {
                  const Icon = mode.icon;
                  const isSelected = selectedMode === mode.id;
                  return (
                    <TouchableOpacity
                      key={mode.id}
                      style={[styles.modeCard, isSelected && styles.modeCardSelected]}
                      onPress={() => setSelectedMode(mode.id)}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.modeIcon, isSelected && styles.modeIconSelected]}>
                        <Icon size={20} color={isSelected ? '#f6d83b' : 'rgba(247,248,251,0.6)'} />
                      </View>
                      <Text style={[styles.modeLabel, isSelected && styles.modeLabelSelected]}>
                        {mode.label}
                      </Text>
                      <Text style={styles.modeDescription}>{mode.description}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Difficulty Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Difficulty</Text>
              <View style={styles.optionRow}>
                {DIFFICULTIES.map((diff) => {
                  const isSelected = selectedDifficulty === diff.id;
                  return (
                    <TouchableOpacity
                      key={diff.id}
                      style={[styles.optionChip, isSelected && styles.optionChipSelected]}
                      onPress={() => setSelectedDifficulty(diff.id)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                        {diff.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Question Count */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Questions</Text>
              <View style={styles.optionRow}>
                {COUNTS.map((count) => {
                  const isSelected = selectedCount === count;
                  return (
                    <TouchableOpacity
                      key={count}
                      style={[styles.countChip, isSelected && styles.countChipSelected]}
                      onPress={() => setSelectedCount(count)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.countText, isSelected && styles.countTextSelected]}>
                        {count}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          {/* Start Button */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.startButton} onPress={handleStart} activeOpacity={0.8}>
              <Zap size={20} color="#000" />
              <Text style={styles.startButtonText}>Start Practice</Text>
            </TouchableOpacity>
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
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#0b0b12',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222536',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#f7f8fb',
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(247,248,251,0.6)',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modeGrid: {
    gap: 12,
  },
  modeCard: {
    backgroundColor: '#06060b',
    borderWidth: 1,
    borderColor: '#222536',
    borderRadius: 12,
    padding: 16,
  },
  modeCardSelected: {
    borderColor: 'rgba(246,216,59,0.5)',
    backgroundColor: 'rgba(246,216,59,0.05)',
  },
  modeIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(247,248,251,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  modeIconSelected: {
    backgroundColor: 'rgba(246,216,59,0.15)',
  },
  modeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f7f8fb',
    marginBottom: 4,
  },
  modeLabelSelected: {
    color: '#f6d83b',
  },
  modeDescription: {
    fontSize: 13,
    color: 'rgba(247,248,251,0.5)',
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#06060b',
    borderWidth: 1,
    borderColor: '#222536',
  },
  optionChipSelected: {
    borderColor: 'rgba(246,216,59,0.5)',
    backgroundColor: 'rgba(246,216,59,0.1)',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(247,248,251,0.7)',
  },
  optionTextSelected: {
    color: '#f6d83b',
  },
  countChip: {
    width: 56,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#06060b',
    borderWidth: 1,
    borderColor: '#222536',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countChipSelected: {
    borderColor: 'rgba(246,216,59,0.5)',
    backgroundColor: 'rgba(246,216,59,0.1)',
  },
  countText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(247,248,251,0.7)',
  },
  countTextSelected: {
    color: '#f6d83b',
  },
  footer: {
    padding: 20,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: '#222536',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#f6d83b',
    paddingVertical: 16,
    borderRadius: 12,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
});
