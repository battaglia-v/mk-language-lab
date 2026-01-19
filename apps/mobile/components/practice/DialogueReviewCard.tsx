/**
 * DialogueReviewCard - Contextual vocabulary practice within dialogues (Android)
 * 
 * Shows a dialogue-based review exercise where learners practice
 * weak vocabulary in meaningful conversational context.
 * 
 * Features:
 * - Displays dialogue context with speaker labels
 * - Highlights focus vocabulary
 * - Cloze-style fill-in-the-blank exercises
 * - Progress tracking
 * 
 * Parity: Must match PWA DialogueReviewCard.tsx
 */

import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MessageCircle, User, CheckCircle, XCircle, ArrowRight, Sparkles } from 'lucide-react-native';

interface DialogueLine {
  speaker: string;
  textMk: string;
  textEn: string;
}

interface Dialogue {
  id: string;
  title_mk: string;
  title_en: string;
  difficulty: string;
  topic: string;
  lines: DialogueLine[];
}

interface VocabularyItem {
  macedonian: string;
  english: string;
}

interface DialogueReviewCardProps {
  dialogue: Dialogue;
  currentLineIndex: number;
  targetWord: VocabularyItem;
  clozeSentence: string;
  translationHint: string;
  onAnswer: (answer: string, isCorrect: boolean) => void;
  onContinue: () => void;
  progress?: { current: number; total: number };
}

export function DialogueReviewCard({
  dialogue,
  currentLineIndex,
  targetWord,
  clozeSentence,
  translationHint,
  onAnswer,
  onContinue,
  progress,
}: DialogueReviewCardProps) {
  const [userAnswer, setUserAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const currentLine = dialogue.lines[currentLineIndex];

  const handleCheck = () => {
    const normalized = userAnswer.toLowerCase().trim();
    const correct = 
      normalized === targetWord.macedonian.toLowerCase() ||
      clozeSentence.replace('______', normalized).toLowerCase() === currentLine.textMk.toLowerCase();
    
    setIsCorrect(correct);
    setShowResult(true);
    onAnswer(userAnswer, correct);
  };

  const handleContinue = () => {
    setUserAnswer('');
    setShowResult(false);
    setIsCorrect(false);
    onContinue();
  };

  // Get surrounding dialogue lines for context
  const contextLines = dialogue.lines.slice(
    Math.max(0, currentLineIndex - 1),
    currentLineIndex + 2
  );
  const startIndex = Math.max(0, currentLineIndex - 1);

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <MessageCircle size={20} color="#f6d83b" />
          <View>
            <Text style={styles.title}>{dialogue.title_en}</Text>
            <Text style={styles.subtitle}>{dialogue.title_mk}</Text>
          </View>
        </View>
        {progress && (
          <Text style={styles.progress}>
            {progress.current}/{progress.total}
          </Text>
        )}
      </View>

      {/* Dialogue context */}
      <View style={styles.dialogueBox}>
        {contextLines.map((line, idx) => {
          const actualIndex = startIndex + idx;
          const isCurrent = actualIndex === currentLineIndex;
          
          return (
            <View 
              key={idx} 
              style={[styles.dialogueLine, !isCurrent && styles.dialogueLineFaded]}
            >
              <View style={[
                styles.speakerIcon,
                isCurrent && styles.speakerIconActive
              ]}>
                <User size={16} color={isCurrent ? '#f6d83b' : 'rgba(247,248,251,0.5)'} />
              </View>
              <View style={styles.lineContent}>
                <Text style={styles.speakerName}>{line.speaker}</Text>
                <Text style={[
                  styles.lineText,
                  isCurrent && styles.lineTextActive
                ]}>
                  {isCurrent ? clozeSentence : line.textMk}
                </Text>
                {!isCurrent && (
                  <Text style={styles.lineTranslation}>{line.textEn}</Text>
                )}
              </View>
            </View>
          );
        })}
      </View>

      {/* Translation hint */}
      <View style={styles.hintBox}>
        <Text style={styles.hintLabel}>Translation:</Text>
        <Text style={styles.hintText}>{translationHint}</Text>
      </View>

      {/* Answer input */}
      <View style={styles.inputSection}>
        <TextInput
          style={styles.input}
          value={userAnswer}
          onChangeText={setUserAnswer}
          placeholder="Fill in the blank..."
          placeholderTextColor="rgba(247,248,251,0.3)"
          editable={!showResult}
          autoFocus
          returnKeyType="done"
          onSubmitEditing={() => {
            if (!showResult && userAnswer.trim()) {
              handleCheck();
            }
          }}
        />
        
        {!showResult && (
          <Text style={styles.wordHint}>
            Looking for: <Text style={styles.wordHintBold}>{targetWord.english}</Text>
          </Text>
        )}
      </View>

      {/* Result feedback */}
      {showResult && (
        <View style={[
          styles.feedback,
          isCorrect ? styles.feedbackCorrect : styles.feedbackIncorrect
        ]}>
          <View style={styles.feedbackHeader}>
            {isCorrect ? (
              <>
                <CheckCircle size={20} color="#22c55e" />
                <Text style={styles.feedbackTitleCorrect}>Correct!</Text>
              </>
            ) : (
              <>
                <XCircle size={20} color="#f59e0b" />
                <Text style={styles.feedbackTitleIncorrect}>Not quite</Text>
              </>
            )}
          </View>
          
          {!isCorrect && (
            <Text style={styles.feedbackCorrectAnswer}>
              Correct answer: <Text style={styles.bold}>{targetWord.macedonian}</Text>
            </Text>
          )}

          <Text style={styles.feedbackContext}>
            <Text style={styles.bold}>{currentLine.speaker}:</Text> {currentLine.textMk}
          </Text>
        </View>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        {!showResult ? (
          <TouchableOpacity
            style={[styles.button, !userAnswer.trim() && styles.buttonDisabled]}
            onPress={handleCheck}
            disabled={!userAnswer.trim()}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>Check</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.button, styles.buttonContinue]}
            onPress={handleContinue}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>Continue</Text>
            <ArrowRight size={16} color="#000" />
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

/**
 * DialogueReviewIntro - Introduction card for dialogue review session
 */
export function DialogueReviewIntro({
  dialogue,
  focusWords,
  onStart,
}: {
  dialogue: Dialogue;
  focusWords: VocabularyItem[];
  onStart: () => void;
}) {
  return (
    <View style={styles.introContainer}>
      <View style={styles.introIcon}>
        <MessageCircle size={32} color="#f6d83b" />
      </View>

      <Text style={styles.introTitle}>📖 {dialogue.title_en}</Text>
      <Text style={styles.introSubtitle}>{dialogue.title_mk}</Text>

      <Text style={styles.introDescription}>
        Practice these words in a real conversation context:
      </Text>

      <View style={styles.wordsList}>
        {focusWords.map((word, i) => (
          <View key={i} style={styles.wordBadge}>
            <Sparkles size={12} color="#f6d83b" />
            <Text style={styles.wordMk}>{word.macedonian}</Text>
            <Text style={styles.wordEn}>({word.english})</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={styles.startButton}
        onPress={onStart}
        activeOpacity={0.7}
      >
        <Text style={styles.startButtonText}>Start Practice</Text>
        <ArrowRight size={18} color="#000" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f7f8fb',
  },
  subtitle: {
    fontSize: 12,
    color: 'rgba(247,248,251,0.5)',
  },
  progress: {
    fontSize: 14,
    color: 'rgba(247,248,251,0.5)',
  },
  dialogueBox: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: 12,
    gap: 12,
    marginBottom: 12,
  },
  dialogueLine: {
    flexDirection: 'row',
    gap: 12,
  },
  dialogueLineFaded: {
    opacity: 0.5,
  },
  speakerIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  speakerIconActive: {
    backgroundColor: 'rgba(246,216,59,0.2)',
  },
  lineContent: {
    flex: 1,
  },
  speakerName: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(247,248,251,0.5)',
    marginBottom: 2,
  },
  lineText: {
    fontSize: 14,
    color: 'rgba(247,248,251,0.7)',
  },
  lineTextActive: {
    color: '#f7f8fb',
    fontWeight: '500',
  },
  lineTranslation: {
    fontSize: 12,
    color: 'rgba(247,248,251,0.4)',
    marginTop: 2,
  },
  hintBox: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  hintLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(247,248,251,0.5)',
    marginBottom: 4,
  },
  hintText: {
    fontSize: 14,
    color: '#f7f8fb',
  },
  inputSection: {
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#0b0b12',
    borderWidth: 2,
    borderColor: '#222536',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#f7f8fb',
    minHeight: 48,
  },
  wordHint: {
    fontSize: 12,
    color: 'rgba(247,248,251,0.5)',
    textAlign: 'center',
    marginTop: 8,
  },
  wordHintBold: {
    fontWeight: '600',
    color: '#f7f8fb',
  },
  feedback: {
    borderRadius: 12,
    borderWidth: 2,
    padding: 16,
    marginBottom: 12,
  },
  feedbackCorrect: {
    borderColor: 'rgba(34, 197, 94, 0.5)',
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
  },
  feedbackIncorrect: {
    borderColor: 'rgba(245, 158, 11, 0.5)',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
  },
  feedbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  feedbackTitleCorrect: {
    fontSize: 15,
    fontWeight: '600',
    color: '#22c55e',
  },
  feedbackTitleIncorrect: {
    fontSize: 15,
    fontWeight: '600',
    color: '#f59e0b',
  },
  feedbackCorrectAnswer: {
    fontSize: 14,
    color: '#f7f8fb',
    marginBottom: 8,
  },
  feedbackContext: {
    fontSize: 13,
    color: 'rgba(247,248,251,0.6)',
  },
  bold: {
    fontWeight: '600',
  },
  actions: {
    marginTop: 'auto',
  },
  button: {
    backgroundColor: '#f6d83b',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    minHeight: 48,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonContinue: {
    backgroundColor: '#22c55e',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  // Intro styles
  introContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  introIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(246,216,59,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  introTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#f7f8fb',
    marginBottom: 4,
  },
  introSubtitle: {
    fontSize: 14,
    color: 'rgba(247,248,251,0.6)',
    marginBottom: 16,
  },
  introDescription: {
    fontSize: 14,
    color: 'rgba(247,248,251,0.6)',
    textAlign: 'center',
    marginBottom: 16,
  },
  wordsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  wordBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(246,216,59,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  wordMk: {
    fontSize: 13,
    fontWeight: '600',
    color: '#f7f8fb',
  },
  wordEn: {
    fontSize: 13,
    color: 'rgba(247,248,251,0.6)',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f6d83b',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
});

export default DialogueReviewCard;
