import { useMemo } from 'react';
import { Text, StyleSheet, Pressable, View } from 'react-native';
import { VocabularyItem, lookupVocabulary } from '../../lib/reader';

interface TappableTextProps {
  /** The text to display */
  text: string;
  /** Vocabulary list for highlighting known words */
  vocabulary: VocabularyItem[];
  /** Callback when a word is pressed */
  onWordPress: (word: string) => void;
}

/**
 * TappableText - Renders text with tappable words
 *
 * Each word is wrapped in a Pressable. Words that exist in the vocabulary
 * are underlined to indicate they have translations available.
 */
export function TappableText({ text, vocabulary, onWordPress }: TappableTextProps) {
  // Split text into words while preserving punctuation and spaces
  const tokens = useMemo(() => {
    // Split on word boundaries while keeping delimiters
    return text.split(/(\s+|[.,!?;:„"«»—–'"()[\]])/);
  }, [text]);

  const renderToken = (token: string, index: number) => {
    // Skip empty tokens
    if (!token) return null;

    // Render whitespace and punctuation as plain text
    if (/^[\s.,!?;:„"«»—–'"()[\]]+$/.test(token)) {
      return (
        <Text key={index} style={styles.text}>
          {token}
        </Text>
      );
    }

    // Check if word has translation in vocabulary
    const hasVocabMatch = lookupVocabulary(token, vocabulary) !== undefined;

    return (
      <Pressable
        key={index}
        onPress={() => onWordPress(token)}
        style={({ pressed }) => [
          styles.wordPressable,
          pressed && styles.wordPressed,
        ]}
      >
        <Text style={[styles.word, hasVocabMatch && styles.wordWithVocab]}>
          {token}
        </Text>
      </Pressable>
    );
  };

  return (
    <View style={styles.paragraph}>
      <Text style={styles.textContainer}>{tokens.map(renderToken)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  paragraph: {
    marginBottom: 20,
  },
  textContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  text: {
    fontSize: 18,
    lineHeight: 30,
    color: '#f7f8fb',
  },
  wordPressable: {
    borderRadius: 2,
  },
  wordPressed: {
    backgroundColor: 'rgba(246,216,59,0.2)',
  },
  word: {
    fontSize: 18,
    lineHeight: 30,
    color: '#f7f8fb',
  },
  wordWithVocab: {
    textDecorationLine: 'underline',
    textDecorationStyle: 'dotted',
    textDecorationColor: 'rgba(246,216,59,0.5)',
  },
});
