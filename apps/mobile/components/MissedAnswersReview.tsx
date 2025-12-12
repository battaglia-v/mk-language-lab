/**
 * MissedAnswersReview Component
 *
 * Displays a list of incorrect answers from a practice session for review.
 * Helps learners identify and study their mistakes.
 */

import { View, StyleSheet, ScrollView } from 'react-native';
import { NativeCard, NativeTypography } from '@mk/ui';
import { brandColors, spacingScale } from '@mk/tokens';
import type { MissedAnswer } from '../features/practice/useMobileQuickPracticeSession';

interface MissedAnswersReviewProps {
  missedAnswers: MissedAnswer[];
  maxVisible?: number;
}

export function MissedAnswersReview({
  missedAnswers,
  maxVisible = 5,
}: MissedAnswersReviewProps) {
  if (missedAnswers.length === 0) {
    return null;
  }

  const visibleAnswers = missedAnswers.slice(0, maxVisible);
  const remainingCount = missedAnswers.length - maxVisible;

  return (
    <View style={styles.container}>
      <NativeTypography variant="caption" style={styles.header}>
        Review your mistakes ({missedAnswers.length})
      </NativeTypography>
      <ScrollView
        style={styles.scrollView}
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
      >
        {visibleAnswers.map((missed) => (
          <NativeCard key={missed.cardId} style={styles.card}>
            <View style={styles.row}>
              <View style={styles.promptContainer}>
                <NativeTypography variant="caption" style={styles.label}>
                  Prompt
                </NativeTypography>
                <NativeTypography variant="body" style={styles.prompt}>
                  {missed.prompt}
                </NativeTypography>
              </View>
            </View>
            <View style={styles.answersRow}>
              {missed.userAnswer && (
                <View style={styles.answerBlock}>
                  <NativeTypography variant="caption" style={styles.label}>
                    Your answer
                  </NativeTypography>
                  <NativeTypography variant="body" style={styles.wrongAnswer}>
                    {missed.userAnswer}
                  </NativeTypography>
                </View>
              )}
              <View style={styles.answerBlock}>
                <NativeTypography variant="caption" style={styles.label}>
                  Correct
                </NativeTypography>
                <NativeTypography variant="body" style={styles.correctAnswer}>
                  {missed.correctAnswer}
                </NativeTypography>
              </View>
            </View>
          </NativeCard>
        ))}
        {remainingCount > 0 && (
          <NativeTypography variant="caption" style={styles.moreText}>
            +{remainingCount} more mistakes
          </NativeTypography>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacingScale.md,
    maxHeight: 200,
  },
  header: {
    color: 'rgba(247,248,251,0.6)',
    marginBottom: spacingScale.sm,
    textAlign: 'center',
  },
  scrollView: {
    flexGrow: 0,
  },
  card: {
    padding: spacingScale.sm,
    marginBottom: spacingScale.xs,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  row: {
    marginBottom: spacingScale.xs,
  },
  promptContainer: {},
  label: {
    color: 'rgba(247,248,251,0.5)',
    fontSize: 10,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  prompt: {
    color: brandColors.text,
    fontSize: 14,
  },
  answersRow: {
    flexDirection: 'row',
    gap: spacingScale.md,
  },
  answerBlock: {
    flex: 1,
  },
  wrongAnswer: {
    color: brandColors.red,
    fontSize: 14,
    textDecorationLine: 'line-through',
  },
  correctAnswer: {
    color: brandColors.mint,
    fontSize: 14,
    fontWeight: '600',
  },
  moreText: {
    color: 'rgba(247,248,251,0.5)',
    textAlign: 'center',
    marginTop: spacingScale.xs,
  },
});
