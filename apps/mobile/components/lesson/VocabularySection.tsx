import { View, Text, StyleSheet } from 'react-native';
import type { VocabularyItem } from '../../lib/lesson';

interface Props {
  content: VocabularyItem[];
}

export function VocabularySection({ content }: Props) {
  return (
    <View style={styles.container}>
      {content.map((item, index) => (
        <View key={index} style={styles.card}>
          <View style={styles.wordRow}>
            <Text style={styles.word}>{item.word}</Text>
            {item.gender && (
              <View style={[
                styles.badge,
                item.gender === 'm' ? styles.badgeMale :
                item.gender === 'f' ? styles.badgeFemale :
                styles.badgeNeuter
              ]}>
                <Text style={[
                  styles.badgeText,
                  item.gender === 'm' ? styles.badgeTextMale :
                  item.gender === 'f' ? styles.badgeTextFemale :
                  styles.badgeTextNeuter
                ]}>
                  {item.gender}
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.translation}>{item.translation}</Text>
          {item.pos && <Text style={styles.pos}>{item.pos}</Text>}
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
  wordRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  word: { fontSize: 18, fontWeight: '600', color: '#f7f8fb' },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeMale: { backgroundColor: 'rgba(59,130,246,0.2)' },
  badgeFemale: { backgroundColor: 'rgba(236,72,153,0.2)' },
  badgeNeuter: { backgroundColor: 'rgba(168,85,247,0.2)' },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  badgeTextMale: { color: '#60a5fa' },
  badgeTextFemale: { color: '#f472b6' },
  badgeTextNeuter: { color: '#c084fc' },
  translation: { fontSize: 14, color: 'rgba(247,248,251,0.72)', marginTop: 4 },
  pos: { fontSize: 12, color: 'rgba(247,248,251,0.5)', marginTop: 2, fontStyle: 'italic' },
});
