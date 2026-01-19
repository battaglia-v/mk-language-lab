/**
 * DifficultyIndicator - Shows current adaptive difficulty level (Android)
 * 
 * Visual indicator for the current difficulty level during
 * adaptive practice sessions.
 * 
 * Features:
 * - Color-coded difficulty badge
 * - Animated transitions when difficulty changes
 * - Accuracy info display
 * 
 * Parity: Must match PWA DifficultyIndicator.tsx
 */

import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Gauge, TrendingUp, TrendingDown, Minus } from 'lucide-react-native';

type DifficultyLevel = 'easy' | 'medium' | 'hard';

interface DifficultyIndicatorProps {
  difficulty: DifficultyLevel;
  accuracy?: number;
  isAdaptive?: boolean;
  adjustmentsMade?: number;
  compact?: boolean;
}

const DIFFICULTY_CONFIG: Record<DifficultyLevel, {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
}> = {
  easy: {
    label: 'Easy',
    color: '#22c55e',
    bgColor: 'rgba(34, 197, 94, 0.1)',
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  medium: {
    label: 'Medium',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.1)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  hard: {
    label: 'Advanced',
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
};

export function DifficultyIndicator({
  difficulty,
  accuracy,
  isAdaptive = true,
  adjustmentsMade = 0,
  compact = false,
}: DifficultyIndicatorProps) {
  const [previousDifficulty, setPreviousDifficulty] = useState(difficulty);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const config = DIFFICULTY_CONFIG[difficulty];

  // Animate difficulty changes
  useEffect(() => {
    if (difficulty !== previousDifficulty) {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        setPreviousDifficulty(difficulty);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [difficulty, previousDifficulty, pulseAnim]);

  // Determine trend icon
  const renderTrendIcon = () => {
    if (!isAdaptive || adjustmentsMade === 0) {
      return <Minus size={12} color="rgba(247,248,251,0.5)" />;
    }
    const levels: DifficultyLevel[] = ['easy', 'medium', 'hard'];
    const prevIndex = levels.indexOf(previousDifficulty);
    const currIndex = levels.indexOf(difficulty);
    
    if (currIndex > prevIndex) {
      return <TrendingUp size={12} color="#22c55e" />;
    } else if (currIndex < prevIndex) {
      return <TrendingDown size={12} color="#f59e0b" />;
    }
    return <Minus size={12} color="rgba(247,248,251,0.5)" />;
  };

  if (compact) {
    return (
      <Animated.View
        style={[
          styles.compactBadge,
          {
            backgroundColor: config.bgColor,
            borderColor: config.borderColor,
            transform: [{ scale: pulseAnim }],
          },
        ]}
      >
        <Gauge size={12} color={config.color} />
        <Text style={[styles.compactLabel, { color: config.color }]}>
          {config.label}
        </Text>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: config.bgColor,
          borderColor: config.borderColor,
          transform: [{ scale: pulseAnim }],
        },
      ]}
    >
      {/* Icon */}
      <View style={[styles.iconContainer, { backgroundColor: config.bgColor }]}>
        <Gauge size={20} color={config.color} />
      </View>

      {/* Info */}
      <View style={styles.info}>
        <View style={styles.labelRow}>
          <Text style={[styles.label, { color: config.color }]}>
            {config.label}
          </Text>
          {isAdaptive && adjustmentsMade > 0 && (
            <View style={styles.trendIcon}>
              {renderTrendIcon()}
            </View>
          )}
        </View>
        
        {accuracy !== undefined && (
          <Text style={styles.subtext}>
            Rolling accuracy: {Math.round(accuracy * 100)}%
          </Text>
        )}
        
        {isAdaptive && (
          <Text style={styles.subtext}>
            {adjustmentsMade === 0
              ? 'Adaptive mode active'
              : `${adjustmentsMade} adjustment${adjustmentsMade !== 1 ? 's' : ''} made`
            }
          </Text>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
  },
  trendIcon: {
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtext: {
    fontSize: 12,
    color: 'rgba(247,248,251,0.5)',
    marginTop: 2,
  },
  // Compact styles
  compactBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  compactLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
});

export default DifficultyIndicator;
