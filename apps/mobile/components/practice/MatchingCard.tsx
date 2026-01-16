import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

type MatchPair = {
  id: string;
  source: string;
  target: string;
};

type Props = {
  /** Pairs to match (source on left, target on right) */
  pairs: MatchPair[];
  onAnswer: (answer: string, isCorrect: boolean) => void;
};

/**
 * Shuffle array using Fisher-Yates algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function MatchingCard({ pairs, onAnswer }: Props) {
  // Shuffled source and target items
  const [shuffledSources] = useState(() => shuffleArray(pairs.map((p) => ({ id: p.id, text: p.source }))));
  const [shuffledTargets] = useState(() => shuffleArray(pairs.map((p) => ({ id: p.id, text: p.target }))));

  // Track selection state
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<Set<string>>(new Set());
  const [wrongPair, setWrongPair] = useState<{ sourceId: string; targetId: string } | null>(null);

  // Check if all pairs are matched
  const allMatched = matchedPairs.size === pairs.length;

  // Auto-advance when all matched
  useEffect(() => {
    if (allMatched) {
      const timer = setTimeout(() => {
        onAnswer('all-matched', true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [allMatched, onAnswer]);

  const handleSourceTap = (id: string) => {
    if (matchedPairs.has(id) || allMatched) return;
    setWrongPair(null);
    setSelectedSource(id);
  };

  const handleTargetTap = (id: string) => {
    if (!selectedSource || matchedPairs.has(id) || allMatched) return;

    if (selectedSource === id) {
      // Correct match!
      setMatchedPairs((prev) => new Set([...prev, id]));
      setSelectedSource(null);
    } else {
      // Wrong match - show briefly
      setWrongPair({ sourceId: selectedSource, targetId: id });
      setTimeout(() => {
        setWrongPair(null);
        setSelectedSource(null);
      }, 800);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Match the pairs</Text>

      <View style={styles.matchArea}>
        {/* Source column (left) */}
        <View style={styles.column}>
          {shuffledSources.map((item) => {
            const isMatched = matchedPairs.has(item.id);
            const isSelected = selectedSource === item.id;
            const isWrong = wrongPair?.sourceId === item.id;

            return (
              <TouchableOpacity
                key={`source-${item.id}`}
                style={[
                  styles.matchTile,
                  isSelected && styles.tileSelected,
                  isMatched && styles.tileMatched,
                  isWrong && styles.tileWrong,
                ]}
                onPress={() => handleSourceTap(item.id)}
                disabled={isMatched || allMatched}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.tileText,
                    isMatched && styles.tileTextMatched,
                    isWrong && styles.tileTextWrong,
                  ]}
                >
                  {item.text}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Target column (right) */}
        <View style={styles.column}>
          {shuffledTargets.map((item) => {
            const isMatched = matchedPairs.has(item.id);
            const isWrong = wrongPair?.targetId === item.id;

            return (
              <TouchableOpacity
                key={`target-${item.id}`}
                style={[
                  styles.matchTile,
                  isMatched && styles.tileMatched,
                  isWrong && styles.tileWrong,
                ]}
                onPress={() => handleTargetTap(item.id)}
                disabled={isMatched || !selectedSource || allMatched}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.tileText,
                    isMatched && styles.tileTextMatched,
                    isWrong && styles.tileTextWrong,
                  ]}
                >
                  {item.text}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Progress indicator */}
      <Text style={styles.progress}>
        {matchedPairs.size} / {pairs.length} matched
      </Text>

      {allMatched && (
        <View style={styles.feedback}>
          <Text style={styles.feedbackText}>All matched! Great job!</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
  },
  title: {
    fontSize: 20,
    color: '#f7f8fb',
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '600',
  },
  matchArea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  column: {
    flex: 1,
    gap: 12,
  },
  matchTile: {
    backgroundColor: '#222536',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 12,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  tileSelected: {
    borderColor: '#3b82f6',
    backgroundColor: 'rgba(59,130,246,0.2)',
  },
  tileMatched: {
    backgroundColor: 'rgba(34,197,94,0.2)',
    borderColor: '#22c55e',
    opacity: 0.6,
  },
  tileWrong: {
    backgroundColor: 'rgba(239,68,68,0.2)',
    borderColor: '#ef4444',
  },
  tileText: {
    fontSize: 14,
    color: '#f7f8fb',
    textAlign: 'center',
  },
  tileTextMatched: {
    color: '#22c55e',
  },
  tileTextWrong: {
    color: '#ef4444',
  },
  progress: {
    fontSize: 14,
    color: 'rgba(247,248,251,0.5)',
    textAlign: 'center',
    marginTop: 24,
  },
  feedback: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(34,197,94,0.2)',
  },
  feedbackText: {
    color: '#22c55e',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
  },
});
