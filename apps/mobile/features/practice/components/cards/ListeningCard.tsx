import { StyleSheet, View } from 'react-native';
import type { ListeningCardContent } from '@mk/practice';
import { NativeButton, NativeTypography } from '@mk/ui';
import { brandColors, spacingScale } from '@mk/tokens';
import { useAudioPrompt } from '../../hooks/useAudioPrompt';

type ListeningCardProps = {
  card: ListeningCardContent;
  onResolved: (result: 'correct' | 'incorrect') => void;
  onSkip: () => void;
};

export function ListeningCard({ card, onResolved, onSkip }: ListeningCardProps) {
  const audio = useAudioPrompt({
    audioId: card.id,
    audioUrl: card.audioUrl,
  });

  return (
    <View style={styles.container}>
      <NativeTypography variant="title" style={styles.promptLabel}>
        Listen and respond
      </NativeTypography>
      <NativeTypography variant="body" style={styles.prompt}>
        {card.prompt}
      </NativeTypography>
      <View style={styles.audioRow}>
        <NativeButton
          style={styles.audioButton}
          onPress={audio.isPlaying ? audio.pause : audio.play}
          disabled={!audio.hasAudio || audio.isLoading}
        >
          <NativeTypography variant="body" style={styles.primaryText}>
            {audio.isPlaying ? 'Pause' : 'Play'}
          </NativeTypography>
        </NativeButton>
        <NativeButton
          variant="secondary"
          style={styles.audioButton}
          onPress={audio.replaySlow}
          disabled={!audio.hasAudio || audio.isLoading}
        >
          <NativeTypography variant="body" style={styles.secondaryText}>
            Slow replay
          </NativeTypography>
        </NativeButton>
      </View>
      {audio.error ? (
        <NativeTypography variant="caption" style={styles.errorText}>
          {audio.error}
        </NativeTypography>
      ) : null}
      <View style={styles.actions}>
        <NativeButton onPress={() => onResolved('correct')}>
          <NativeTypography variant="body" style={styles.primaryText}>
            I understood
          </NativeTypography>
        </NativeButton>
        <NativeButton variant="ghost" onPress={() => onResolved('incorrect')}>
          <NativeTypography variant="body" style={styles.secondaryText}>
            I missed it
          </NativeTypography>
        </NativeButton>
        <NativeButton variant="ghost" onPress={onSkip}>
          <NativeTypography variant="body" style={styles.secondaryText}>
            Skip
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
    fontSize: 22,
  },
  audioRow: {
    flexDirection: 'row',
    gap: spacingScale.sm,
  },
  audioButton: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacingScale.sm,
  },
  primaryText: {
    color: '#fff',
  },
  secondaryText: {
    color: brandColors.navy,
  },
  errorText: {
    color: brandColors.red,
  },
});
