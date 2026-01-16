import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

type Props = {
  /** Sentence with ___ blank where the word goes */
  sentence: string;
  /** The correct word for the blank */
  correctAnswer: string;
  /** Optional translation hint */
  translation?: string;
  onAnswer: (answer: string, isCorrect: boolean) => void;
};

/**
 * Normalize answer for comparison
 */
function normalizeAnswer(answer: string): string {
  return answer.toLowerCase().trim().replace(/[.,!?;:'"]/g, '');
}

export function ClozeCard({ sentence, correctAnswer, translation, onAnswer }: Props) {
  const [userInput, setUserInput] = useState('');
  const [showResult, setShowResult] = useState(false);

  const normalizedUser = normalizeAnswer(userInput);
  const normalizedCorrect = normalizeAnswer(correctAnswer);
  const isCorrect = normalizedUser === normalizedCorrect;

  const handleCheck = () => {
    setShowResult(true);
  };

  const handleNext = () => {
    onAnswer(userInput, isCorrect);
  };

  const canCheck = userInput.trim().length > 0;

  // Split sentence around the blank
  const parts = sentence.split('___');
  const beforeBlank = parts[0] || '';
  const afterBlank = parts[1] || '';

  return (
    <View style={styles.container}>
      {/* Sentence with inline blank */}
      <View style={styles.sentenceContainer}>
        <Text style={styles.sentenceText}>
          {beforeBlank}
          <Text
            style={[
              styles.blankHighlight,
              showResult && isCorrect && styles.blankCorrect,
              showResult && !isCorrect && styles.blankWrong,
            ]}
          >
            {showResult ? (isCorrect ? userInput : correctAnswer) : ' ___ '}
          </Text>
          {afterBlank}
        </Text>
      </View>

      {/* Translation hint */}
      {translation && (
        <Text style={styles.translationHint}>
          <Text style={styles.translationLabel}>Hint: </Text>
          {translation}
        </Text>
      )}

      {/* Input field */}
      <TextInput
        style={[
          styles.input,
          showResult && isCorrect && styles.inputCorrect,
          showResult && !isCorrect && styles.inputWrong,
        ]}
        value={userInput}
        onChangeText={setUserInput}
        placeholder="Type the missing word..."
        placeholderTextColor="rgba(247,248,251,0.4)"
        autoFocus
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="done"
        editable={!showResult}
        onSubmitEditing={canCheck && !showResult ? handleCheck : undefined}
      />

      <View style={styles.actions}>
        {!showResult ? (
          <TouchableOpacity
            style={[styles.checkButton, !canCheck && styles.checkButtonDisabled]}
            onPress={handleCheck}
            disabled={!canCheck}
            activeOpacity={0.7}
          >
            <Text style={styles.checkButtonText}>Check</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.nextButton} onPress={handleNext} activeOpacity={0.7}>
            <Text style={styles.nextButtonText}>Next</Text>
          </TouchableOpacity>
        )}
      </View>

      {showResult && (
        <View style={[styles.feedback, isCorrect ? styles.feedbackCorrect : styles.feedbackWrong]}>
          <Text style={styles.feedbackText}>
            {isCorrect ? 'Correct!' : `Incorrect. The answer is: ${correctAnswer}`}
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
  sentenceContainer: {
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  sentenceText: {
    fontSize: 20,
    color: '#f7f8fb',
    textAlign: 'center',
    lineHeight: 32,
  },
  blankHighlight: {
    color: '#3b82f6',
    fontWeight: '600',
    backgroundColor: 'rgba(59,130,246,0.2)',
    paddingHorizontal: 4,
  },
  blankCorrect: {
    color: '#22c55e',
    backgroundColor: 'rgba(34,197,94,0.2)',
  },
  blankWrong: {
    color: '#ef4444',
    backgroundColor: 'rgba(239,68,68,0.2)',
  },
  translationHint: {
    fontSize: 14,
    color: 'rgba(247,248,251,0.6)',
    textAlign: 'center',
    marginBottom: 24,
    fontStyle: 'italic',
  },
  translationLabel: {
    fontWeight: '500',
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
  actions: {
    marginTop: 24,
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
