/**
 * StreakRecoveryCard - Supportive messaging for streak status (Android)
 * 
 * Parity: Must match PWA StreakRecoveryCard.tsx
 */

import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Flame, Shield, Heart, Sparkles, X, ChevronRight } from 'lucide-react-native';

type StreakState = 
  | 'protected'
  | 'lost'
  | 'at-risk'
  | 'freeze-ready'
  | 'healthy';

interface StreakRecoveryCardProps {
  state: StreakState;
  streak: number;
  previousStreak?: number;
  daysMissed?: number;
  freezeAvailable?: boolean;
  onDismiss?: () => void;
  onStartPractice?: () => void;
}

const STATE_CONFIG: Record<StreakState, {
  iconColor: string;
  bgColor: string;
  borderColor: string;
  title: string;
  emoji: string;
}> = {
  protected: {
    iconColor: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.1)',
    borderColor: 'rgba(59, 130, 246, 0.3)',
    title: 'Streak Protected!',
    emoji: '🛡️',
  },
  lost: {
    iconColor: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.1)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
    title: 'Welcome Back!',
    emoji: '💪',
  },
  'at-risk': {
    iconColor: '#f97316',
    bgColor: 'rgba(249, 115, 22, 0.1)',
    borderColor: 'rgba(249, 115, 22, 0.3)',
    title: 'Keep Your Streak!',
    emoji: '🔥',
  },
  'freeze-ready': {
    iconColor: '#06b6d4',
    bgColor: 'rgba(6, 182, 212, 0.1)',
    borderColor: 'rgba(6, 182, 212, 0.3)',
    title: 'Streak Freeze Ready',
    emoji: '❄️',
  },
  healthy: {
    iconColor: '#22c55e',
    bgColor: 'rgba(34, 197, 94, 0.1)',
    borderColor: 'rgba(34, 197, 94, 0.3)',
    title: 'Great Progress!',
    emoji: '✨',
  },
};

export function StreakRecoveryCard({
  state,
  streak,
  previousStreak,
  freezeAvailable,
  onDismiss,
  onStartPractice,
}: StreakRecoveryCardProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const config = STATE_CONFIG[state];

  if (isDismissed || state === 'healthy') {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  const getMessage = (): string => {
    switch (state) {
      case 'protected':
        return `Your ${streak}-day streak was saved by a streak freeze! Practice today to keep it going.`;
      case 'lost':
        if (previousStreak && previousStreak > 7) {
          return `You had an amazing ${previousStreak}-day streak! Don't worry — start fresh today!`;
        }
        return `It's okay to miss a day. Let's start a new streak together!`;
      case 'at-risk':
        return `Your ${streak}-day streak is waiting! Complete a quick lesson to keep it alive.`;
      case 'freeze-ready':
        return `You have a streak freeze available. If you miss a day, your streak will be protected.`;
      default:
        return '';
    }
  };

  const getActionLabel = (): string => {
    switch (state) {
      case 'protected': return 'Practice Now';
      case 'lost': return 'Start Fresh';
      case 'at-risk': return 'Quick Lesson';
      case 'freeze-ready': return 'Got It';
      default: return 'Continue';
    }
  };

  return (
    <View style={[
      styles.container,
      { backgroundColor: config.bgColor, borderColor: config.borderColor }
    ]}>
      {/* Dismiss button */}
      {onDismiss && (
        <TouchableOpacity
          style={styles.dismissButton}
          onPress={handleDismiss}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <X size={16} color="rgba(247,248,251,0.5)" />
        </TouchableOpacity>
      )}

      <View style={styles.content}>
        {/* Icon */}
        <View style={[styles.iconContainer, { backgroundColor: config.bgColor }]}>
          <Text style={styles.emoji}>{config.emoji}</Text>
        </View>

        {/* Text content */}
        <View style={styles.textContent}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{config.title}</Text>
            {state === 'at-risk' && streak > 0 && (
              <View style={styles.streakBadge}>
                <Flame size={14} color="#f97316" />
                <Text style={styles.streakText}>{streak}</Text>
              </View>
            )}
          </View>

          <Text style={styles.message}>{getMessage()}</Text>

          {/* Actions */}
          <View style={styles.actions}>
            {state !== 'freeze-ready' && onStartPractice && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={onStartPractice}
                activeOpacity={0.7}
              >
                <Text style={styles.actionButtonText}>{getActionLabel()}</Text>
                <ChevronRight size={16} color="#000" />
              </TouchableOpacity>
            )}
            {state === 'freeze-ready' && (
              <TouchableOpacity
                style={styles.outlineButton}
                onPress={handleDismiss}
                activeOpacity={0.7}
              >
                <Text style={styles.outlineButtonText}>{getActionLabel()}</Text>
              </TouchableOpacity>
            )}
            {freezeAvailable && state === 'at-risk' && (
              <View style={styles.freezeIndicator}>
                <Shield size={12} color="#06b6d4" />
                <Text style={styles.freezeText}>Freeze ready</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  dismissButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 4,
    zIndex: 1,
  },
  content: {
    flexDirection: 'row',
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 24,
  },
  textContent: {
    flex: 1,
    gap: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#f7f8fb',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  streakText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#f97316',
  },
  message: {
    fontSize: 13,
    color: 'rgba(247,248,251,0.7)',
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f6d83b',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000',
  },
  outlineButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  outlineButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#f7f8fb',
  },
  freezeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  freezeText: {
    fontSize: 11,
    color: '#06b6d4',
  },
});

export default StreakRecoveryCard;
