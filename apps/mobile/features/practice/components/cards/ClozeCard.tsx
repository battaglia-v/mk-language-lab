import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import type { PracticeEvaluationResult, ClozeCardContent } from '@mk/practice';
import { NativeButton, NativeTypography } from '@mk/ui';
import { brandColors, spacingScale } from '@mk/tokens';

type ClozeCardProps = {
  card: ClozeCardContent;
  onEvaluateAnswer: (input: string) => PracticeEvaluationResult | null;
  onResolved: (result: 'correct' | 'incorrect') => void;
  onSkip: () => void;
};

export function ClozeCard({ card, onEvaluateAnswer, onResolved, onSkip }: ClozeCardProps) {
  const [value, setValue] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'correct' | 'incorrect'>('idle');

  const handleCheck = () => {
    const evaluation = onEvaluateAnswer(value);
    if (!evaluation) {
      setFeedback('Enter the missing word to continue.');
      return;
    }
    if (evaluation.isCorrect) {
      setStatus('correct');
      setFeedback('Great! Swipe right to keep going.');
      setTimeout(() => onResolved('correct'), 350);
    } else {
      setStatus('incorrect');
      setFeedback(`Answer: ${evaluation.expectedAnswer}`);
      setTimeout(() => onResolved('incorrect'), 500);
    }
  };

  return (
    <View style={styles.container}>
      <NativeTypography variant="title" style={styles.promptLabel}>
        Fill in the blank
      </NativeTypography>
      <View style={styles.clozeLine}>
        {card.clozeSegments.map((segment, index) => (
          <NativeTypography key={`${card.id}-segment-${index}`} variant="body" style={styles.segment}>
            {segment}
            {index !== card.clozeSegments.length - 1 ? (
              <NativeTypography variant="body" style={styles.blank}>
                ______
              </NativeTypography>
            ) : null}
          </NativeTypography>
        ))}
      </View>
      {card.translationHint ? (
        <NativeTypography variant="caption" style={styles.hint}>
          {card.translationHint}
        </NativeTypography>
      ) : null}
      <TextInput
        style={styles.input}
        placeholder="Type the missing word…"
        value={value}
        onChangeText={setValue}
      />
      {feedback ? (
        <NativeTypography
          variant="body"
          style={status === 'correct' ? styles.correctText : styles.incorrectText}
        >
          {feedback}
        </NativeTypography>
      ) : null}
      <View style={styles.actions}>
        <NativeButton onPress={handleCheck}>
          <NativeTypography variant="body" style={styles.primaryText}>
            Check
          </NativeTypography>
        </NativeButton>
        <NativeButton variant="ghost" onPress={onSkip}>
          <NativeTypography variant="body" style={styles.secondaryText}>
            Reveal / Skip
          </NativeTypography>
        </NativeButton>
      </View>
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
  clozeLine: {
    flexWrap: 'wrap',
    flexDirection: 'row',
    gap: spacingScale.xs,
  },
  segment: {
    color: brandColors.navy,
  },
  blank: {
    color: brandColors.red,
    fontWeight: '600',
  },
  hint: {
    color: 'rgba(16,24,40,0.7)',
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(16,24,40,0.15)',
    borderRadius: spacingScale.lg,
    padding: spacingScale.sm,
    fontSize: 18,
    backgroundColor: '#fff',
  },
  actions: {
    flexDirection: 'row',
    gap: spacingScale.sm,
  },
  primaryText: {
    color: '#fff',
  },
  secondaryText: {
    color: brandColors.navy,
  },
  correctText: {
    color: brandColors.green,
  },
  incorrectText: {
    color: brandColors.red,
  },
});
