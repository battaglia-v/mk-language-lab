import { View, Text, StyleSheet } from 'react-native';
import type { DialogueLine } from '../../lib/lesson';

interface Props {
  content: DialogueLine[];
}

export function DialogueSection({ content }: Props) {
  return (
    <View style={styles.container}>
      {content.map((line, index) => (
        <View key={index} style={styles.lineContainer}>
          <Text style={styles.speaker}>{line.speaker}</Text>
          <Text style={styles.text}>{line.text}</Text>
          {line.translation && (
            <Text style={styles.translation}>{line.translation}</Text>
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  lineContainer: {
    backgroundColor: '#0b0b12',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  speaker: {
    fontSize: 12,
    fontWeight: '600',
    color: '#f6d83b',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  text: { fontSize: 16, color: '#f7f8fb', marginBottom: 4 },
  translation: { fontSize: 14, color: 'rgba(247,248,251,0.6)', fontStyle: 'italic' },
});
