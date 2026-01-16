import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { PracticeExercise } from '../../lib/lesson';

interface Props {
  content: PracticeExercise[];
}

export function PracticeSection({ content }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  const exercise = content[currentIndex];
  if (!exercise) return null;

  const handleCheck = () => {
    setShowResult(true);
  };

  const handleNext = () => {
    if (currentIndex < content.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
      setShowResult(false);
    }
  };

  const isCorrect = selectedOption === exercise.answer;

  return (
    <View style={styles.container}>
      <Text style={styles.progress}>
        {currentIndex + 1} / {content.length}
      </Text>
      <Text style={styles.question}>{exercise.question}</Text>

      {exercise.options && (
        <View style={styles.options}>
          {exercise.options.map((option, index) => {
            const isSelected = selectedOption === option;
            const showCorrect = showResult && option === exercise.answer;
            const showWrong = showResult && isSelected && !isCorrect;

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.option,
                  isSelected && styles.optionSelected,
                  showCorrect && styles.optionCorrect,
                  showWrong && styles.optionWrong,
                ]}
                onPress={() => !showResult && setSelectedOption(option)}
                disabled={showResult}
              >
                <Text style={styles.optionText}>{option}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      <View style={styles.actions}>
        {!showResult ? (
          <TouchableOpacity
            style={[styles.checkButton, !selectedOption && styles.checkButtonDisabled]}
            onPress={handleCheck}
            disabled={!selectedOption}
          >
            <Text style={styles.checkButtonText}>Check</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>
              {currentIndex < content.length - 1 ? 'Next' : 'Done'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {showResult && (
        <View style={[styles.feedback, isCorrect ? styles.feedbackCorrect : styles.feedbackWrong]}>
          <Text style={styles.feedbackText}>
            {isCorrect ? 'Correct!' : `Incorrect. The answer is: ${exercise.answer}`}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  progress: { fontSize: 12, color: 'rgba(247,248,251,0.5)', textAlign: 'center', marginBottom: 8 },
  question: { fontSize: 18, color: '#f7f8fb', textAlign: 'center', marginBottom: 24 },
  options: { gap: 12 },
  option: {
    backgroundColor: '#0b0b12',
    borderWidth: 2,
    borderColor: '#222536',
    borderRadius: 12,
    padding: 16,
  },
  optionSelected: { borderColor: '#f6d83b' },
  optionCorrect: { borderColor: '#3ecf8e', backgroundColor: 'rgba(62,207,142,0.1)' },
  optionWrong: { borderColor: '#ff7878', backgroundColor: 'rgba(255,120,120,0.1)' },
  optionText: { fontSize: 16, color: '#f7f8fb', textAlign: 'center' },
  actions: { marginTop: 24 },
  checkButton: {
    backgroundColor: '#f6d83b',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  checkButtonDisabled: { opacity: 0.5 },
  checkButtonText: { color: '#000', fontSize: 18, fontWeight: '600' },
  nextButton: {
    backgroundColor: '#3ecf8e',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  nextButtonText: { color: '#000', fontSize: 18, fontWeight: '600' },
  feedback: { marginTop: 16, padding: 16, borderRadius: 12 },
  feedbackCorrect: { backgroundColor: 'rgba(62,207,142,0.2)' },
  feedbackWrong: { backgroundColor: 'rgba(255,120,120,0.2)' },
  feedbackText: { color: '#f7f8fb', textAlign: 'center' },
});
