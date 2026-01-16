import { View, Text, StyleSheet } from 'react-native';
import type { GrammarNote } from '../../lib/lesson';

interface Props {
  content: GrammarNote[];
}

export function GrammarSection({ content }: Props) {
  return (
    <View style={styles.container}>
      {content.map((note, index) => (
        <View key={index} style={styles.card}>
          <Text style={styles.title}>{note.title}</Text>
          <Text style={styles.explanation}>{note.explanation}</Text>
          {note.examples && note.examples.length > 0 && (
            <View style={styles.examples}>
              {note.examples.map((example, i) => (
                <Text key={i} style={styles.example}>• {example}</Text>
              ))}
            </View>
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  card: {
    backgroundColor: '#0b0b12',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  title: { fontSize: 16, fontWeight: '600', color: '#f6d83b', marginBottom: 8 },
  explanation: { fontSize: 14, color: '#f7f8fb', lineHeight: 22 },
  examples: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#222536' },
  example: { fontSize: 14, color: 'rgba(247,248,251,0.72)', marginBottom: 4 },
});
