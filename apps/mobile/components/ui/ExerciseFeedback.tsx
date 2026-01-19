/**
 * ExerciseFeedback - Enhanced feedback for exercise answers (Android)
 * 
 * Shows correct/incorrect feedback with:
 * - "Why This Is Wrong" explanations for better learning
 * - Grammar tips for contextual education
 * - Beginner-friendly language (A1/A2)
 * 
 * Parity with: components/learn/ExerciseLayout.tsx (FeedbackBanner)
 */

import { View, Text, StyleSheet, Animated } from 'react-native';
import { useEffect, useMemo, useRef } from 'react';
import { CheckCircle, XCircle, Lightbulb } from 'lucide-react-native';

export interface ExerciseFeedbackProps {
  /** Whether the answer was correct */
  isCorrect: boolean;
  /** The correct answer (shown when wrong) */
  correctAnswer?: string;
  /** General explanation of the answer */
  explanation?: string;
  /** Specific reason WHY the answer was wrong (learning-focused) */
  whyWrong?: string;
  /** Optional grammar tip related to this exercise */
  grammarTip?: string;
  /** Whether to animate in */
  animated?: boolean;
}

export function ExerciseFeedback({
  isCorrect,
  correctAnswer,
  explanation,
  whyWrong,
  grammarTip,
  animated = true,
}: ExerciseFeedbackProps) {
  // Use useMemo to create stable animation values
  const fadeAnim = useMemo(() => new Animated.Value(0), []);
  const slideAnim = useMemo(() => new Animated.Value(10), []);

  useEffect(() => {
    if (animated) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(1);
      slideAnim.setValue(0);
    }
  }, [animated, fadeAnim, slideAnim]);

  return (
    <Animated.View
      style={[
        styles.container,
        isCorrect ? styles.containerCorrect : styles.containerWrong,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      {/* Header: Correct/Incorrect */}
      <View style={styles.header}>
        {isCorrect ? (
          <CheckCircle size={20} color="#22c55e" />
        ) : (
          <XCircle size={20} color="#f59e0b" />
        )}
        <Text style={[styles.headerText, isCorrect ? styles.textCorrect : styles.textWrong]}>
          {isCorrect ? 'Correct!' : 'Not quite right'}
        </Text>
      </View>

      {/* Show correct answer for incorrect responses */}
      {!isCorrect && correctAnswer && (
        <View style={styles.correctAnswerContainer}>
          <Text style={styles.correctAnswerLabel}>Correct answer: </Text>
          <Text style={styles.correctAnswerText}>{correctAnswer}</Text>
        </View>
      )}

      {/* WHY it's wrong - most important for learning */}
      {!isCorrect && whyWrong && (
        <View style={styles.whyWrongContainer}>
          <Text style={styles.whyLabel}>Why? </Text>
          <Text style={styles.whyText}>{whyWrong}</Text>
        </View>
      )}

      {/* General explanation (for both correct and incorrect) */}
      {explanation && (
        <Text style={styles.explanationText}>{explanation}</Text>
      )}

      {/* Grammar tip - subtle educational nudge */}
      {grammarTip && (
        <View style={styles.grammarTipContainer}>
          <Lightbulb size={14} color="rgba(247,248,251,0.5)" />
          <Text style={styles.grammarTipText}>
            <Text style={styles.grammarTipLabel}>Tip: </Text>
            {grammarTip}
          </Text>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    borderRadius: 12,
    borderWidth: 2,
    padding: 16,
    gap: 8,
  },
  containerCorrect: {
    borderColor: 'rgba(34, 197, 94, 0.5)',
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
  },
  containerWrong: {
    borderColor: 'rgba(245, 158, 11, 0.5)',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerText: {
    fontSize: 15,
    fontWeight: '600',
  },
  textCorrect: {
    color: '#22c55e',
  },
  textWrong: {
    color: '#f59e0b',
  },
  correctAnswerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  correctAnswerLabel: {
    fontSize: 14,
    color: 'rgba(247,248,251,0.6)',
  },
  correctAnswerText: {
    fontSize: 14,
    color: '#f7f8fb',
    fontWeight: '600',
  },
  whyWrongContainer: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(245, 158, 11, 0.2)',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  whyLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f59e0b',
  },
  whyText: {
    fontSize: 14,
    color: '#f7f8fb',
    flex: 1,
  },
  explanationText: {
    fontSize: 14,
    color: 'rgba(247,248,251,0.7)',
  },
  grammarTipContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(247,248,251,0.1)',
  },
  grammarTipLabel: {
    fontWeight: '600',
    color: 'rgba(247,248,251,0.6)',
  },
  grammarTipText: {
    fontSize: 13,
    color: 'rgba(247,248,251,0.5)',
    flex: 1,
  },
});

export default ExerciseFeedback;
