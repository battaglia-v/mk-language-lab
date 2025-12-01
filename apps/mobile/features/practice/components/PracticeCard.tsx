import { useMemo } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { NativeButton, NativeTypography } from '@mk/ui';
import type { PracticeCardContent } from '@mk/practice';
import { brandColors, spacingScale } from '@mk/tokens';
import { useAudioPrompt } from '../hooks/useAudioPrompt';

type PracticeCardProps = {
  card: PracticeCardContent;
  value: string;
  onChangeValue: (value: string) => void;
  onSubmit: () => void;
  onReveal: () => void;
  feedback: 'correct' | 'incorrect' | null;
  revealedAnswer?: string | null;
  isRevealed: boolean;
  disabled?: boolean;
};

export function PracticeCardContentView({
  card,
  value,
  onChangeValue,
  onSubmit,
  onReveal,
  feedback,
  revealedAnswer,
  isRevealed,
  disabled,
}: PracticeCardProps) {
  const placeholder =
    card.direction === 'mkToEn'
      ? 'Type the English translation…'
      : 'Type the Macedonian translation…';

  const promptSegments = useMemo(() => {
    if (card.type !== 'cloze') return [];
    return card.clozeSegments;
  }, [card]);

  const audioControls = useAudioPrompt({ cardId: card.id, audioUrl: card.audioUrl });

  return (
    <View style={styles.cardBody}>
      <NativeTypography variant="body" style={styles.promptLabel}>
        {card.type === 'cloze' ? 'Fill the blank' : 'Translate this'}
      </NativeTypography>
      {card.type === 'cloze' ? (
        <View style={styles.clozeWrapper}>
          {promptSegments.map((segment, index) => (
            <NativeTypography key={`${card.id}-segment-${index}`} variant="body" style={styles.clozeSegment}>
              {segment || '______'}
            </NativeTypography>
          ))}
          {card.translation ? (
            <NativeTypography variant="caption" style={styles.translationHint}>
              {card.translation}
            </NativeTypography>
          ) : null}
        </View>
      ) : (
        <NativeTypography variant="title" style={styles.promptText}>
          {card.prompt}
        </NativeTypography>
      )}

      {audioControls.hasAudio ? (
        <View style={styles.audioRow}>
          <NativeButton
            variant="secondary"
            onPress={audioControls.play}
            disabled={audioControls.status === 'loading'}
          >
            <NativeTypography variant="body" style={styles.audioButtonText}>
              {audioControls.status === 'playing' ? 'Playing…' : 'Play Audio'}
            </NativeTypography>
          </NativeButton>
          <NativeButton
            variant="ghost"
            onPress={audioControls.replaySlow}
            disabled={audioControls.status === 'loading'}
          >
            <NativeTypography variant="body" style={styles.audioButtonText}>
              Slow
            </NativeTypography>
          </NativeButton>
        </View>
      ) : null}

      <TextInput
        style={styles.input}
        placeholder={placeholder}
        value={value}
        editable={!disabled}
        onChangeText={onChangeValue}
        placeholderTextColor="rgba(247,248,251,0.5)"
      />

      <View style={styles.actionRow}>
        <NativeButton style={styles.primaryAction} onPress={onSubmit} disabled={disabled}>
          <NativeTypography variant="body" style={styles.primaryText}>
            Check
          </NativeTypography>
        </NativeButton>
        <NativeButton variant="ghost" onPress={onReveal}>
          <NativeTypography variant="body" style={styles.secondaryText}>
            Reveal
          </NativeTypography>
        </NativeButton>
      </View>

      {feedback === 'correct' ? (
        <NativeTypography variant="body" style={styles.correctText}>
          Great work! Keep the streak alive.
        </NativeTypography>
      ) : null}
      {feedback === 'incorrect' ? (
        <NativeTypography variant="body" style={styles.incorrectText}>
          Not quite. {revealedAnswer ? `Answer: ${revealedAnswer}` : ''}
        </NativeTypography>
      ) : null}
      {isRevealed ? (
        <NativeTypography variant="body" style={styles.revealedText}>
          {card.answer}
        </NativeTypography>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  cardBody: {
    gap: spacingScale.sm,
  },
  promptLabel: {
    color: 'rgba(247,248,251,0.7)',
  },
  promptText: {
    color: brandColors.navy,
  },
  clozeWrapper: {
    gap: spacingScale.xs,
  },
  clozeSegment: {
    color: brandColors.navy,
  },
  translationHint: {
    color: 'rgba(247,248,251,0.6)',
  },
  audioRow: {
    flexDirection: 'row',
    gap: spacingScale.sm,
    alignItems: 'center',
  },
  audioButtonText: {
    color: brandColors.navy,
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(247,248,251,0.2)',
    borderRadius: spacingScale.md,
    padding: spacingScale.sm,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacingScale.sm,
    alignItems: 'center',
  },
  primaryAction: {
    flex: 1,
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
  revealedText: {
    color: brandColors.plum,
    fontWeight: '600',
  },
});
