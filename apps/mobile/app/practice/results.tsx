import { useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Star, RotateCcw, BookOpen, ArrowRight } from 'lucide-react-native';
import Svg, { Circle } from 'react-native-svg';
import { submitPracticeCompletion } from '../../lib/practice';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function PracticeResultsScreen() {
  const params = useLocalSearchParams<{
    correct?: string;
    total?: string;
    time?: string;
    deck?: string;
  }>();

  const correct = parseInt(params.correct || '0', 10);
  const total = parseInt(params.total || '1', 10);
  const time = parseInt(params.time || '0', 10);
  const deck = params.deck || 'curated';

  // Calculate stats
  const stats = useMemo(() => {
    const accuracy = Math.round((correct / total) * 100);
    const xpEarned = 10 + correct * 5; // Base 10 XP + 5 per correct
    const isGreatPerformance = accuracy >= 80;

    // Format time
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    const timeFormatted =
      minutes > 0
        ? `${minutes}m ${seconds}s`
        : `${seconds}s`;

    return {
      accuracy,
      xpEarned,
      isGreatPerformance,
      timeFormatted,
    };
  }, [correct, total, time]);

  // Submit completion to backend
  useEffect(() => {
    submitPracticeCompletion({
      deckType: deck,
      mode: 'multipleChoice', // TODO: pass actual mode via params
      correct,
      total,
      accuracy: stats.accuracy,
      xpEarned: stats.xpEarned,
      durationMs: time * 1000,
    }).catch((err) => {
      // Don't block UI on sync failure
      console.warn('Failed to sync practice completion:', err);
    });
  }, [deck, correct, total, stats.accuracy, stats.xpEarned, time]);

  // Progress ring calculations
  const ringSize = Math.min(SCREEN_WIDTH * 0.5, 200);
  const strokeWidth = 12;
  const radius = (ringSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progressOffset = circumference - (stats.accuracy / 100) * circumference;

  // Handle navigation
  const handlePracticeAgain = () => {
    router.replace(`/practice/session?deck=${deck}&mode=multipleChoice`);
  };

  const handleBackToPractice = () => {
    router.replace('/(tabs)/practice');
  };

  const handleContinueLearning = () => {
    router.replace('/(tabs)/learn');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <Text style={styles.title}>
          {stats.isGreatPerformance ? 'Great job!' : 'Session Complete'}
        </Text>

        {/* Score Ring */}
        <View style={styles.scoreContainer}>
          <Svg width={ringSize} height={ringSize} style={styles.ring}>
            {/* Background ring */}
            <Circle
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={radius}
              stroke="#222536"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            {/* Progress ring */}
            <Circle
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={radius}
              stroke={stats.isGreatPerformance ? '#22c55e' : '#f6d83b'}
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={progressOffset}
              strokeLinecap="round"
              transform={`rotate(-90 ${ringSize / 2} ${ringSize / 2})`}
            />
          </Svg>
          <View style={styles.scoreInner}>
            <Text style={styles.scoreFraction}>
              {correct}/{total}
            </Text>
            <Text style={styles.scorePercent}>{stats.accuracy}%</Text>
          </View>
        </View>

        {/* Celebration stars for good performance */}
        {stats.isGreatPerformance && (
          <View style={styles.starsRow}>
            <Star size={24} color="#f6d83b" fill="#f6d83b" />
            <Star size={32} color="#f6d83b" fill="#f6d83b" />
            <Star size={24} color="#f6d83b" fill="#f6d83b" />
          </View>
        )}

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.accuracy}%</Text>
            <Text style={styles.statLabel}>Accuracy</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.timeFormatted}</Text>
            <Text style={styles.statLabel}>Time</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{correct}</Text>
            <Text style={styles.statLabel}>Correct</Text>
          </View>
        </View>

        {/* XP Badge */}
        <View style={styles.xpBadge}>
          <Text style={styles.xpAmount}>+{stats.xpEarned} XP</Text>
          <Text style={styles.xpLabel}>earned this session</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handlePracticeAgain}
          activeOpacity={0.7}
        >
          <RotateCcw size={20} color="#000" />
          <Text style={styles.primaryButtonText}>Practice Again</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleBackToPractice}
          activeOpacity={0.7}
        >
          <BookOpen size={20} color="#f7f8fb" />
          <Text style={styles.secondaryButtonText}>Back to Practice</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkButton}
          onPress={handleContinueLearning}
          activeOpacity={0.7}
        >
          <Text style={styles.linkButtonText}>Continue Learning</Text>
          <ArrowRight size={16} color="rgba(247,248,251,0.6)" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#06060b',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#f7f8fb',
    marginBottom: 32,
    textAlign: 'center',
  },
  scoreContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  ring: {
    transform: [{ rotate: '0deg' }],
  },
  scoreInner: {
    position: 'absolute',
    alignItems: 'center',
  },
  scoreFraction: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#f7f8fb',
  },
  scorePercent: {
    fontSize: 18,
    color: 'rgba(247,248,251,0.6)',
    marginTop: 4,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0b0b12',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#f7f8fb',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(247,248,251,0.5)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#222536',
  },
  xpBadge: {
    backgroundColor: 'rgba(246,216,59,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(246,216,59,0.3)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  xpAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f6d83b',
  },
  xpLabel: {
    fontSize: 12,
    color: 'rgba(246,216,59,0.8)',
    marginTop: 4,
  },
  actions: {
    padding: 24,
    gap: 12,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#f6d83b',
    paddingVertical: 16,
    borderRadius: 12,
    minHeight: 52,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0b0b12',
    borderWidth: 1,
    borderColor: '#222536',
    paddingVertical: 16,
    borderRadius: 12,
    minHeight: 52,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f7f8fb',
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 12,
    minHeight: 48,
  },
  linkButtonText: {
    fontSize: 14,
    color: 'rgba(247,248,251,0.6)',
  },
});
