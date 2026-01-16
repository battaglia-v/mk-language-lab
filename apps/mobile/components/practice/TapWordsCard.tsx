import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

type Props = {
  /** The prompt/question to display */
  prompt: string;
  /** Words in correct order (will be shuffled for display) */
  correctWords: string[];
  onAnswer: (answer: string, isCorrect: boolean) => void;
};

/**
 * Shuffle array using Fisher-Yates algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function TapWordsCard({ prompt, correctWords, onAnswer }: Props) {
  // Initialize with shuffled words, each with a unique key
  const [availableWords] = useState(() =>
    shuffleArray(correctWords.map((word, index) => ({ id: `${index}-${word}`, word })))
  );
  const [selectedWords, setSelectedWords] = useState<{ id: string; word: string }[]>([]);
  const [showResult, setShowResult] = useState(false);

  const correctAnswer = correctWords.join(' ');
  const userAnswer = selectedWords.map((w) => w.word).join(' ');
  const isCorrect = userAnswer === correctAnswer;

  // Words still available to tap (not yet selected)
  const remainingWords = availableWords.filter(
    (word) => !selectedWords.some((selected) => selected.id === word.id)
  );

  const handleWordTap = (word: { id: string; word: string }) => {
    if (showResult) return;
    setSelectedWords((prev) => [...prev, word]);
  };

  const handleSelectedWordTap = (word: { id: string; word: string }) => {
    if (showResult) return;
    setSelectedWords((prev) => prev.filter((w) => w.id !== word.id));
  };

  const handleCheck = () => {
    setShowResult(true);
  };

  const handleNext = () => {
    onAnswer(userAnswer, isCorrect);
  };

  // Can check when all words are placed
  const canCheck = selectedWords.length === correctWords.length;

  return (
    <View style={styles.container}>
      <Text style={styles.prompt}>{prompt}</Text>

      {/* Answer row - where selected words appear */}
      <View style={styles.answerRow}>
        {selectedWords.length === 0 ? (
          <Text style={styles.placeholder}>Tap words below to build your answer</Text>
        ) : (
          selectedWords.map((word) => (
            <TouchableOpacity
              key={word.id}
              style={[
                styles.wordTile,
                styles.selectedTile,
                showResult && isCorrect && styles.tileCorrect,
                showResult && !isCorrect && styles.tileWrong,
              ]}
              onPress={() => handleSelectedWordTap(word)}
              disabled={showResult}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.wordText,
                  showResult && isCorrect && styles.wordTextCorrect,
                  showResult && !isCorrect && styles.wordTextWrong,
                ]}
              >
                {word.word}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* Word bank - available words to tap */}
      <View style={styles.wordBank}>
        {remainingWords.map((word) => (
          <TouchableOpacity
            key={word.id}
            style={styles.wordTile}
            onPress={() => handleWordTap(word)}
            disabled={showResult}
            activeOpacity={0.7}
          >
            <Text style={styles.wordText}>{word.word}</Text>
          </TouchableOpacity>
        ))}
      </View>

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
  prompt: {
    fontSize: 20,
    color: '#f7f8fb',
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '600',
  },
  answerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    minHeight: 60,
    backgroundColor: '#0b0b12',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#222536',
    borderStyle: 'dashed',
    marginBottom: 24,
  },
  placeholder: {
    color: 'rgba(247,248,251,0.4)',
    fontSize: 14,
    textAlign: 'center',
  },
  wordBank: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  wordTile: {
    backgroundColor: '#222536',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedTile: {
    backgroundColor: '#3b82f6',
  },
  tileCorrect: {
    backgroundColor: '#22c55e',
  },
  tileWrong: {
    backgroundColor: '#ef4444',
  },
  wordText: {
    fontSize: 16,
    color: '#f7f8fb',
    fontWeight: '500',
  },
  wordTextCorrect: {
    color: '#fff',
  },
  wordTextWrong: {
    color: '#fff',
  },
  actions: {
    marginTop: 'auto',
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
