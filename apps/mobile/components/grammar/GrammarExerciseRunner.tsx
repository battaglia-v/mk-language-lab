import { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { Check, X, ArrowRight, RotateCcw, Trophy } from 'lucide-react-native';
import type { GrammarLesson, GrammarExercise } from '../../lib/grammar';

// Results from completing the lesson
export type LessonResults = {
  correctAnswers: number;
  totalSteps: number;
  xpEarned: number;
  accuracy: number;
};

type Props = {
  lesson: GrammarLesson;
  onComplete: (results: LessonResults) => void;
  onExit: () => void;
  /** Callback when exercise index changes (for progress tracking) */
  onProgressChange?: (currentIndex: number) => void;
};

type ExerciseResult = {
  exerciseId: string;
  isCorrect: boolean;
  xpEarned: number;
};

export function GrammarExerciseRunner({ lesson, onComplete, onExit, onProgressChange }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<ExerciseResult[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [textInput, setTextInput] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const exercises = lesson.exercises;
  const currentExercise = exercises[currentIndex];
  const progress = ((currentIndex + 1) / exercises.length) * 100;

  // Notify parent of progress changes
  useEffect(() => {
    onProgressChange?.(currentIndex);
  }, [currentIndex, onProgressChange]);

  const checkMultipleChoice = useCallback((exercise: GrammarExercise): boolean => {
    if (selectedOption === null || exercise.correctIndex === undefined) return false;
    return selectedOption === exercise.correctIndex;
  }, [selectedOption]);

  const checkFillBlank = useCallback((exercise: GrammarExercise): boolean => {
    if (!exercise.correctAnswers || exercise.correctAnswers.length === 0) return false;
    const normalizedInput = textInput.toLowerCase().trim();
    return exercise.correctAnswers.some(
      (answer) => answer.toLowerCase().trim() === normalizedInput
    );
  }, [textInput]);

  const checkErrorCorrection = useCallback((exercise: GrammarExercise): boolean => {
    if (!exercise.correctedWord) return false;
    const normalizedInput = textInput.toLowerCase().trim();
    return exercise.correctedWord.toLowerCase().trim() === normalizedInput;
  }, [textInput]);

  const handleCheck = () => {
    let correct = false;

    switch (currentExercise.type) {
      case 'multiple-choice':
        correct = checkMultipleChoice(currentExercise);
        break;
      case 'fill-blank':
        correct = checkFillBlank(currentExercise);
        break;
      case 'error-correction':
        correct = checkErrorCorrection(currentExercise);
        break;
      default:
        // For unknown types, mark as correct to allow progression
        correct = true;
    }

    setIsCorrect(correct);
    setShowFeedback(true);

    const result: ExerciseResult = {
      exerciseId: currentExercise.id,
      isCorrect: correct,
      xpEarned: correct ? currentExercise.xp : 0,
    };
    setResults((prev) => [...prev, result]);
  };

  const handleNext = () => {
    if (currentIndex + 1 >= exercises.length) {
      // Calculate final results
      const allResults = [...results];
      const correctCount = allResults.filter((r) => r.isCorrect).length;
      const totalXp = allResults.reduce((sum, r) => sum + r.xpEarned, 0);

      const lessonResults: LessonResults = {
        correctAnswers: correctCount,
        totalSteps: exercises.length,
        xpEarned: totalXp,
        accuracy: exercises.length > 0 ? Math.round((correctCount / exercises.length) * 100) : 0,
      };

      onComplete(lessonResults);
      setShowResults(true);
    } else {
      // Move to next exercise
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setTextInput('');
      setShowFeedback(false);
      setIsCorrect(false);
    }
  };

  const handleRetry = () => {
    setCurrentIndex(0);
    setResults([]);
    setSelectedOption(null);
    setTextInput('');
    setShowFeedback(false);
    setIsCorrect(false);
    setShowResults(false);
  };

  const getCorrectAnswer = (): string => {
    switch (currentExercise.type) {
      case 'multiple-choice':
        if (currentExercise.options && currentExercise.correctIndex !== undefined) {
          return currentExercise.options[currentExercise.correctIndex];
        }
        return '';
      case 'fill-blank':
        return currentExercise.correctAnswers?.[0] || '';
      case 'error-correction':
        return currentExercise.correctedWord || '';
      default:
        return '';
    }
  };

  // Results screen
  if (showResults) {
    const correctCount = results.filter((r) => r.isCorrect).length;
    const totalXp = results.reduce((sum, r) => sum + r.xpEarned, 0);
    const accuracy = exercises.length > 0 ? Math.round((correctCount / exercises.length) * 100) : 0;

    return (
      <View style={styles.resultsContainer}>
        <View style={styles.resultsCard}>
          <View style={styles.trophyContainer}>
            <Trophy size={48} color="#f6d83b" />
          </View>
          <Text style={styles.resultsTitle}>Lesson Complete!</Text>
          <Text style={styles.resultsSubtitle}>{lesson.titleEn}</Text>

          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{accuracy}%</Text>
              <Text style={styles.statLabel}>Accuracy</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#10b981' }]}>
                {correctCount}/{exercises.length}
              </Text>
              <Text style={styles.statLabel}>Correct</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#f59e0b' }]}>+{totalXp}</Text>
              <Text style={styles.statLabel}>XP Earned</Text>
            </View>
          </View>

          <View style={styles.resultsActions}>
            <TouchableOpacity style={styles.primaryButton} onPress={onExit} activeOpacity={0.7}>
              <Text style={styles.primaryButtonText}>Continue Learning</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} onPress={handleRetry} activeOpacity={0.7}>
              <RotateCcw size={18} color="#f7f8fb" />
              <Text style={styles.secondaryButtonText}>Retry Lesson</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // Exercise view
  return (
    <View style={styles.container}>
      {/* Progress header */}
      <View style={styles.progressHeader}>
        <Text style={styles.progressText}>
          Exercise {currentIndex + 1} of {exercises.length}
        </Text>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${progress}%` }]} />
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Instruction */}
        <Text style={styles.instruction}>{currentExercise.instructionEn}</Text>

        {/* Question/Prompt */}
        {currentExercise.type === 'multiple-choice' && currentExercise.questionEn && (
          <Text style={styles.question}>{currentExercise.questionEn}</Text>
        )}

        {currentExercise.type === 'fill-blank' && currentExercise.sentenceMk && (
          <View style={styles.sentenceContainer}>
            <Text style={styles.sentenceMk}>{currentExercise.sentenceMk}</Text>
            {currentExercise.translationEn && (
              <Text style={styles.translation}>{currentExercise.translationEn}</Text>
            )}
          </View>
        )}

        {currentExercise.type === 'error-correction' && (
          <View style={styles.sentenceContainer}>
            <Text style={styles.errorSentence}>{currentExercise.sentenceWithErrorMk}</Text>
            {currentExercise.translationEn && (
              <Text style={styles.translation}>{currentExercise.translationEn}</Text>
            )}
            {currentExercise.errorWord && (
              <View style={styles.errorWordContainer}>
                <Text style={styles.errorWordLabel}>Fix this word:</Text>
                <Text style={styles.errorWord}>{currentExercise.errorWord}</Text>
              </View>
            )}
          </View>
        )}

        {/* Answer input based on type */}
        {currentExercise.type === 'multiple-choice' && currentExercise.options && (
          <View style={styles.optionsContainer}>
            {currentExercise.options.map((option, index) => {
              const isSelected = selectedOption === index;
              const showCorrect = showFeedback && index === currentExercise.correctIndex;
              const showWrong = showFeedback && isSelected && !isCorrect;

              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.option,
                    isSelected && !showFeedback && styles.optionSelected,
                    showCorrect && styles.optionCorrect,
                    showWrong && styles.optionWrong,
                  ]}
                  onPress={() => !showFeedback && setSelectedOption(index)}
                  disabled={showFeedback}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.optionText,
                      showCorrect && styles.optionTextCorrect,
                      showWrong && styles.optionTextWrong,
                    ]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {(currentExercise.type === 'fill-blank' || currentExercise.type === 'error-correction') && (
          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.textInput,
                showFeedback && isCorrect && styles.textInputCorrect,
                showFeedback && !isCorrect && styles.textInputWrong,
              ]}
              value={textInput}
              onChangeText={setTextInput}
              placeholder="Type your answer..."
              placeholderTextColor="rgba(247,248,251,0.4)"
              editable={!showFeedback}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        )}

        {/* Feedback */}
        {showFeedback && (
          <View style={[styles.feedback, isCorrect ? styles.feedbackCorrect : styles.feedbackWrong]}>
            <View style={styles.feedbackIcon}>
              {isCorrect ? (
                <Check size={24} color="#10b981" />
              ) : (
                <X size={24} color="#ef4444" />
              )}
            </View>
            <View style={styles.feedbackContent}>
              <Text style={styles.feedbackTitle}>
                {isCorrect ? 'Correct!' : 'Incorrect'}
              </Text>
              {!isCorrect && (
                <Text style={styles.feedbackAnswer}>
                  The correct answer is: {getCorrectAnswer()}
                </Text>
              )}
              {currentExercise.explanationEn && (
                <Text style={styles.feedbackExplanation}>{currentExercise.explanationEn}</Text>
              )}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Action buttons */}
      <View style={styles.actions}>
        {!showFeedback ? (
          <TouchableOpacity
            style={[
              styles.checkButton,
              (selectedOption === null && textInput.trim() === '') && styles.checkButtonDisabled,
            ]}
            onPress={handleCheck}
            disabled={selectedOption === null && textInput.trim() === ''}
            activeOpacity={0.7}
          >
            <Text style={styles.checkButtonText}>Check</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.nextButton} onPress={handleNext} activeOpacity={0.7}>
            <Text style={styles.nextButtonText}>
              {currentIndex + 1 >= exercises.length ? 'See Results' : 'Next'}
            </Text>
            <ArrowRight size={20} color="#000" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#06060b',
  },
  progressHeader: {
    padding: 16,
    paddingBottom: 8,
  },
  progressText: {
    fontSize: 13,
    color: 'rgba(247,248,251,0.6)',
    marginBottom: 8,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: 'rgba(247,248,251,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#f6d83b',
    borderRadius: 3,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingTop: 8,
  },
  instruction: {
    fontSize: 14,
    color: 'rgba(247,248,251,0.7)',
    marginBottom: 16,
  },
  question: {
    fontSize: 22,
    fontWeight: '600',
    color: '#f7f8fb',
    textAlign: 'center',
    marginBottom: 24,
  },
  sentenceContainer: {
    backgroundColor: 'rgba(247,248,251,0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  sentenceMk: {
    fontSize: 20,
    fontWeight: '500',
    color: '#f7f8fb',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorSentence: {
    fontSize: 20,
    fontWeight: '500',
    color: '#f7f8fb',
    textAlign: 'center',
    marginBottom: 8,
  },
  translation: {
    fontSize: 14,
    color: 'rgba(247,248,251,0.5)',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  errorWordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    gap: 8,
  },
  errorWordLabel: {
    fontSize: 13,
    color: 'rgba(247,248,251,0.6)',
  },
  errorWord: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
    backgroundColor: 'rgba(239,68,68,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  optionsContainer: {
    gap: 12,
  },
  option: {
    backgroundColor: '#0b0b12',
    borderWidth: 2,
    borderColor: '#222536',
    borderRadius: 12,
    padding: 16,
    minHeight: 52,
    justifyContent: 'center',
  },
  optionSelected: {
    borderColor: '#3b82f6',
    backgroundColor: 'rgba(59,130,246,0.1)',
  },
  optionCorrect: {
    borderColor: '#10b981',
    backgroundColor: 'rgba(16,185,129,0.1)',
  },
  optionWrong: {
    borderColor: '#ef4444',
    backgroundColor: 'rgba(239,68,68,0.1)',
  },
  optionText: {
    fontSize: 16,
    color: '#f7f8fb',
    textAlign: 'center',
  },
  optionTextCorrect: {
    color: '#10b981',
    fontWeight: '600',
  },
  optionTextWrong: {
    color: '#ef4444',
  },
  inputContainer: {
    marginTop: 8,
  },
  textInput: {
    backgroundColor: '#0b0b12',
    borderWidth: 2,
    borderColor: '#222536',
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    color: '#f7f8fb',
    textAlign: 'center',
  },
  textInputCorrect: {
    borderColor: '#10b981',
    backgroundColor: 'rgba(16,185,129,0.1)',
  },
  textInputWrong: {
    borderColor: '#ef4444',
    backgroundColor: 'rgba(239,68,68,0.1)',
  },
  feedback: {
    flexDirection: 'row',
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  feedbackCorrect: {
    backgroundColor: 'rgba(16,185,129,0.15)',
  },
  feedbackWrong: {
    backgroundColor: 'rgba(239,68,68,0.15)',
  },
  feedbackIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(247,248,251,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedbackContent: {
    flex: 1,
  },
  feedbackTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f7f8fb',
    marginBottom: 4,
  },
  feedbackAnswer: {
    fontSize: 14,
    color: 'rgba(247,248,251,0.8)',
  },
  feedbackExplanation: {
    fontSize: 13,
    color: 'rgba(247,248,251,0.6)',
    marginTop: 8,
    fontStyle: 'italic',
  },
  actions: {
    padding: 16,
    paddingBottom: 32,
  },
  checkButton: {
    backgroundColor: '#f6d83b',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    minHeight: 52,
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
    backgroundColor: '#10b981',
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 52,
  },
  nextButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '600',
  },
  // Results styles
  resultsContainer: {
    flex: 1,
    backgroundColor: '#06060b',
    padding: 16,
    justifyContent: 'center',
  },
  resultsCard: {
    backgroundColor: 'rgba(246,216,59,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(246,216,59,0.2)',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  trophyContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(246,216,59,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  resultsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f7f8fb',
    marginBottom: 4,
  },
  resultsSubtitle: {
    fontSize: 14,
    color: 'rgba(247,248,251,0.6)',
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#f6d83b',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(247,248,251,0.5)',
  },
  resultsActions: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#f6d83b',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'rgba(247,248,251,0.1)',
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryButtonText: {
    color: '#f7f8fb',
    fontSize: 16,
    fontWeight: '500',
  },
});
