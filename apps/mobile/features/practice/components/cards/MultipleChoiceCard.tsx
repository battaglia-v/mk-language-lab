import { StyleSheet, View } from 'react-native';
import type { MultipleChoiceCardContent, PracticeEvaluationResult } from '@mk/practice';
import { NativeButton, NativeTypography } from '@mk/ui';
import { brandColors, spacingScale } from '@mk/tokens';

type MultipleChoiceCardProps = {
  card: MultipleChoiceCardContent;
  onEvaluateAnswer: (input: string) => PracticeEvaluationResult | null;
  onResolved: (result: 'correct' | 'incorrect') => void;
  onSkip: () => void;
};

export function MultipleChoiceCard({
  card,
  onEvaluateAnswer,
  onResolved,
  onSkip,
}: MultipleChoiceCardProps) {
  const handleChoice = (choice: string) => {
    const evaluation = onEvaluateAnswer(choice);
    const result = evaluation?.isCorrect ? 'correct' : 'incorrect';
    onResolved(result);
  };

  return (
    <View style={styles.container}>
      <NativeTypography variant="title" style={styles.promptLabel}>
        Select the correct translation
      </NativeTypography>
      <NativeTypography variant="body" style={styles.prompt}>
        {card.prompt}
      </NativeTypography>
      <View style={styles.choiceGrid}>
        {card.choices.map((choice) => (
          <NativeButton
            key={choice}
            variant="secondary"
            style={styles.choiceButton}
            onPress={() => handleChoice(choice)}
          >
            <NativeTypography variant="body" style={styles.choiceText}>
              {choice}
            </NativeTypography>
          </NativeButton>
        ))}
      </View>
      <NativeButton variant="ghost" onPress={onSkip}>
        <NativeTypography variant="body" style={styles.secondaryText}>
          Skip
        </NativeTypography>
      </NativeButton>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacingScale.md,
  },
  promptLabel: {
    color: brandColors.navy,
  },
  prompt: {
    color: brandColors.navy,
    fontSize: 24,
    lineHeight: 32,
  },
  choiceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacingScale.sm,
  },
  choiceButton: {
    flexGrow: 1,
    minWidth: '45%',
  },
  choiceText: {
    color: brandColors.navy,
    textAlign: 'center',
  },
  secondaryText: {
    color: brandColors.navy,
  },
});
