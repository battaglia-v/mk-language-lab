import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import type { PracticeEvaluationResult, PracticeCardContent } from '@mk/practice';
import { NativeButton, NativeTypography } from '@mk/ui';
import { brandColors, spacingScale } from '@mk/tokens';

type TypingCardProps = {
  card: PracticeCardContent;
  onEvaluateAnswer: (input: string) => PracticeEvaluationResult | null;
  onResolved: (result: 'correct' | 'incorrect') => void;
  onSkip: () => void;
};

export function TypingCard({ card, onEvaluateAnswer, onResolved, onSkip }: TypingCardProps) {
  const [value, setValue] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'correct' | 'incorrect'>('idle');

  const handleCheck = () => {
    const evaluation = onEvaluateAnswer(value);
    if (!evaluation) {
      setFeedback('Please enter an answer first.');
      return;
    }
    if (evaluation.isCorrect) {
      setStatus('correct');
      setFeedback('Nice work! Swipe right to continue.');
      setTimeout(() => onResolved('correct'), 350);
    } else {
      setStatus('incorrect');
      setFeedback(`Answer: ${evaluation.expectedAnswer}`);
      setTimeout(() => onResolved('incorrect'), 500);
    }
  };

  const placeholder =
    card.direction === 'mkToEn'
      ? 'Type the English translation…'
      : 'Type the Macedonian translation…';

  return (
    <View style={styles.container}>
      <NativeTypography variant="title" style={styles.promptLabel}>
        Translate this
      </NativeTypography>
      <NativeTypography variant="body" style={styles.prompt}>
        {card.prompt}
      </NativeTypography>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        value={value}
        onChangeText={setValue}
        autoCapitalize="none"
        autoCorrect={false}
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
  prompt: {
    color: brandColors.navy,
    fontSize: 24,
    lineHeight: 32,
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
