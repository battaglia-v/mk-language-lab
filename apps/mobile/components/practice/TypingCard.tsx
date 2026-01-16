import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

type Props = {
  prompt: string;
  correctAnswer: string;
  placeholder?: string;
  onAnswer: (answer: string, isCorrect: boolean) => void;
};

// Macedonian special characters for keyboard hints
const MACEDONIAN_CHARS = ['ѓ', 'ќ', 'љ', 'њ', 'џ', 'ж', 'ш', 'ч', 'ц'];

/**
 * Normalize answer for comparison
 * - Lowercase, trim whitespace
 * - Strip common articles and punctuation
 */
function normalizeAnswer(answer: string): string {
  return answer
    .toLowerCase()
    .trim()
    .replace(/^(the|a|an)\s+/i, '') // Strip English articles
    .replace(/[.,!?;:'"]/g, ''); // Strip punctuation
}

export function TypingCard({ prompt, correctAnswer, placeholder, onAnswer }: Props) {
  const [userInput, setUserInput] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [skipped, setSkipped] = useState(false);

  const normalizedUser = normalizeAnswer(userInput);
  const normalizedCorrect = normalizeAnswer(correctAnswer);
  const isCorrect = normalizedUser === normalizedCorrect;

  const handleCheck = () => {
    setShowResult(true);
  };

  const handleSkip = () => {
    setSkipped(true);
    setShowResult(true);
  };

  const handleNext = () => {
    onAnswer(userInput, isCorrect && !skipped);
  };

  const handleCharPress = (char: string) => {
    setUserInput((prev) => prev + char);
  };

  const canCheck = userInput.trim().length > 0;

  return (
    <View style={styles.container}>
      <Text style={styles.prompt}>{prompt}</Text>

      <TextInput
        style={[
          styles.input,
          showResult && isCorrect && styles.inputCorrect,
          showResult && !isCorrect && styles.inputWrong,
        ]}
        value={userInput}
        onChangeText={setUserInput}
        placeholder={placeholder || 'Type your answer...'}
        placeholderTextColor="rgba(247,248,251,0.4)"
        autoFocus
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="done"
        editable={!showResult}
        onSubmitEditing={canCheck && !showResult ? handleCheck : undefined}
      />

      {/* Macedonian keyboard hints */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.keyboardHints}
      >
        {MACEDONIAN_CHARS.map((char) => (
          <TouchableOpacity
            key={char}
            style={styles.keyHint}
            onPress={() => handleCharPress(char)}
            disabled={showResult}
            activeOpacity={0.7}
          >
            <Text style={styles.keyHintText}>{char}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.actions}>
        {!showResult ? (
          <>
            <TouchableOpacity
              style={[styles.checkButton, !canCheck && styles.checkButtonDisabled]}
              onPress={handleCheck}
              disabled={!canCheck}
              activeOpacity={0.7}
            >
              <Text style={styles.checkButtonText}>Check</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.skipButton} onPress={handleSkip} activeOpacity={0.7}>
              <Text style={styles.skipButtonText}>Skip</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity style={styles.nextButton} onPress={handleNext} activeOpacity={0.7}>
            <Text style={styles.nextButtonText}>Next</Text>
          </TouchableOpacity>
        )}
      </View>

      {showResult && (
        <View
          style={[
            styles.feedback,
            isCorrect && !skipped ? styles.feedbackCorrect : styles.feedbackWrong,
          ]}
        >
          <Text style={styles.feedbackText}>
            {skipped
              ? `The answer is: ${correctAnswer}`
              : isCorrect
                ? 'Correct!'
                : `Incorrect. The answer is: ${correctAnswer}`}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
  },
  prompt: {
    fontSize: 24,
    color: '#f7f8fb',
    textAlign: 'center',
    marginBottom: 32,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#0b0b12',
    borderWidth: 2,
    borderColor: '#222536',
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    color: '#f7f8fb',
    textAlign: 'center',
    minHeight: 56,
  },
  inputCorrect: {
    borderColor: '#22c55e',
    backgroundColor: 'rgba(34,197,94,0.1)',
  },
  inputWrong: {
    borderColor: '#ef4444',
    backgroundColor: 'rgba(239,68,68,0.1)',
  },
  keyboardHints: {
    paddingVertical: 16,
    gap: 8,
  },
  keyHint: {
    backgroundColor: '#222536',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    minWidth: 48,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  keyHintText: {
    fontSize: 18,
    color: '#f7f8fb',
    fontWeight: '500',
  },
  actions: {
    marginTop: 8,
    gap: 12,
  },
  checkButton: {
    backgroundColor: '#f6d83b',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  checkButtonDisabled: {
    opacity: 0.5,
  },
  checkButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '600',
  },
  skipButton: {
    paddingVertical: 12,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  skipButtonText: {
    color: 'rgba(247,248,251,0.6)',
    fontSize: 16,
  },
  nextButton: {
    backgroundColor: '#22c55e',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  nextButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '600',
  },
  feedback: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
  },
  feedbackCorrect: {
    backgroundColor: 'rgba(34,197,94,0.2)',
  },
  feedbackWrong: {
    backgroundColor: 'rgba(239,68,68,0.2)',
  },
  feedbackText: {
    color: '#f7f8fb',
    textAlign: 'center',
    fontSize: 16,
  },
});
