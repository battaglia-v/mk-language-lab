/**
 * CultureTipCard - Macedonian cultural tips in lessons (Android)
 * 
 * Shows practical, concise cultural insights that help learners
 * understand real-world usage and cultural context.
 * 
 * Features:
 * - Emoji flag visual identifier (🇲🇰)
 * - Concise, A1/A2 friendly language
 * - Optional related vocabulary
 * 
 * Parity with: components/learn/CultureTipCard.tsx (PWA)
 */

import { View, Text, StyleSheet } from 'react-native';

export interface CultureTipProps {
  /** The cultural tip content (1-2 sentences, beginner-friendly) */
  tip: string;
  /** Optional Macedonian version of the tip */
  tipMk?: string;
  /** Optional category (e.g., "Greetings", "Food", "Social") */
  category?: string;
  /** Optional related vocabulary words */
  relatedWords?: Array<{
    mk: string;
    en: string;
  }>;
}

export function CultureTipCard({
  tip,
  tipMk,
  category,
  relatedWords,
}: CultureTipProps) {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.flagEmoji}>🇲🇰</Text>
        <Text style={styles.headerText}>
          Culture Tip
          {category && <Text style={styles.categoryText}> • {category}</Text>}
        </Text>
      </View>

      {/* Tip content */}
      <Text style={styles.tipText}>{tip}</Text>

      {/* Macedonian version (optional) */}
      {tipMk && (
        <Text style={styles.tipMkText}>{tipMk}</Text>
      )}

      {/* Related vocabulary (optional) */}
      {relatedWords && relatedWords.length > 0 && (
        <View style={styles.relatedSection}>
          <Text style={styles.relatedLabel}>Related words:</Text>
          <View style={styles.wordsContainer}>
            {relatedWords.map((word, index) => (
              <View key={index} style={styles.wordBadge}>
                <Text style={styles.wordMk}>{word.mk}</Text>
                <Text style={styles.wordEn}>({word.en})</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

/**
 * Pre-built culture tips for common scenarios
 * These can be referenced by ID in lesson data
 */
export const CULTURE_TIPS: Record<string, CultureTipProps> = {
  'greeting-formal': {
    tip: 'In formal situations, use "Вие" (you-formal) instead of "ти" (you-informal). This shows respect to elders, teachers, and people you just met.',
    category: 'Social',
    relatedWords: [
      { mk: 'Вие', en: 'you (formal)' },
      { mk: 'ти', en: 'you (informal)' },
    ],
  },
  'coffee-invitation': {
    tip: 'When a Macedonian invites you for "кафе" (coffee), it\'s about spending time together, not just the drink. Refusing can seem impolite.',
    category: 'Social',
    relatedWords: [
      { mk: 'кафе', en: 'coffee' },
      { mk: 'ајде', en: 'let\'s go / come on' },
    ],
  },
  'rakija-toast': {
    tip: 'Before drinking rakija, Macedonians say "На здравје!" (to health). Make eye contact when clinking glasses!',
    category: 'Food & Drink',
    relatedWords: [
      { mk: 'На здравје!', en: 'Cheers!' },
      { mk: 'ракија', en: 'rakija (fruit brandy)' },
    ],
  },
  'guest-hospitality': {
    tip: 'Macedonians are famous for hospitality. A guest (гостин) is always offered food and drink. It\'s polite to accept at least a little.',
    category: 'Social',
    relatedWords: [
      { mk: 'гостин', en: 'guest' },
      { mk: 'домаќин', en: 'host' },
      { mk: 'мезе', en: 'appetizers' },
    ],
  },
  'name-day': {
    tip: 'Many Macedonians celebrate their "имендан" (name day) - the feast day of the saint they\'re named after. It\'s as important as a birthday!',
    category: 'Traditions',
    relatedWords: [
      { mk: 'имендан', en: 'name day' },
      { mk: 'Среќен имендан!', en: 'Happy name day!' },
    ],
  },
  'bread-respect': {
    tip: 'Bread (леб) is highly respected in Macedonian culture. Never throw bread away - it\'s considered disrespectful.',
    category: 'Food & Drink',
    relatedWords: [
      { mk: 'леб', en: 'bread' },
      { mk: 'погача', en: 'traditional bread' },
    ],
  },
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(210, 12, 36, 0.3)',
    backgroundColor: 'rgba(210, 12, 36, 0.08)',
    padding: 16,
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  flagEmoji: {
    fontSize: 18,
  },
  headerText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: '#D20C24',
  },
  categoryText: {
    fontWeight: '400',
    color: 'rgba(247,248,251,0.6)',
    textTransform: 'none',
  },
  tipText: {
    fontSize: 14,
    color: '#f7f8fb',
    lineHeight: 20,
  },
  tipMkText: {
    fontSize: 14,
    color: 'rgba(247,248,251,0.6)',
    fontStyle: 'italic',
    marginTop: 8,
  },
  relatedSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(210, 12, 36, 0.2)',
  },
  relatedLabel: {
    fontSize: 12,
    color: 'rgba(247,248,251,0.5)',
    marginBottom: 8,
  },
  wordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  wordBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(6,6,11,0.5)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  wordMk: {
    fontSize: 13,
    fontWeight: '600',
    color: '#f7f8fb',
  },
  wordEn: {
    fontSize: 13,
    color: 'rgba(247,248,251,0.6)',
  },
});

export default CultureTipCard;
