/**
 * AchievementToast - Toast notification for achievement unlocks
 * 
 * Shows animated popup when user unlocks an achievement
 * Mirrors PWA's components/gamification/AchievementAnimations.tsx
 * 
 * @see PARITY_CHECKLIST.md - Feature parity
 * @see components/gamification/AchievementAnimations.tsx (PWA)
 */

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { X, Trophy, Star, Zap } from 'lucide-react-native';
import { haptic } from '../lib/haptics';
import type { Achievement } from '../lib/achievements';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ============================================================================
// Types
// ============================================================================

type AchievementToastData = {
  id: string;
  achievement: Achievement;
};

type AchievementToastContextType = {
  showAchievementToast: (achievement: Achievement) => void;
  showMultipleAchievements: (achievements: Achievement[]) => void;
};

// ============================================================================
// Context
// ============================================================================

const AchievementToastContext = createContext<AchievementToastContextType | null>(null);

export function useAchievementToast() {
  const context = useContext(AchievementToastContext);
  if (!context) {
    throw new Error('useAchievementToast must be used within AchievementToastProvider');
  }
  return context;
}

// ============================================================================
// Components
// ============================================================================

type ToastItemProps = {
  achievement: Achievement;
  onDismiss: () => void;
  index: number;
};

function ToastItem({ achievement, onDismiss, index }: ToastItemProps) {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Stagger entrance animation
    const delay = index * 150;

    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          tension: 60,
          friction: 10,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          tension: 60,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Trigger haptic
    haptic.success();

    // Auto dismiss after 5 seconds
    const timer = setTimeout(() => {
      dismissToast();
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const dismissToast = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => onDismiss());
  };

  // Get category color
  const getCategoryColor = (category: Achievement['category']) => {
    switch (category) {
      case 'learning':
        return '#22c55e';
      case 'streak':
        return '#f97316';
      case 'practice':
        return '#3b82f6';
      case 'special':
        return '#a855f7';
      default:
        return '#f6d83b';
    }
  };

  const categoryColor = getCategoryColor(achievement.category);

  return (
    <Animated.View
      style={[
        styles.toastContainer,
        {
          transform: [{ translateY }, { scale }],
          opacity,
          marginTop: index * 10,
        },
      ]}
    >
      {/* Glow effect */}
      <View style={[styles.glow, { backgroundColor: categoryColor }]} />

      {/* Content */}
      <View style={styles.toastContent}>
        {/* Icon */}
        <View style={[styles.iconContainer, { backgroundColor: `${categoryColor}20` }]}>
          <Text style={styles.iconEmoji}>{achievement.icon}</Text>
        </View>

        {/* Text */}
        <View style={styles.textContainer}>
          <Text style={styles.unlockLabel}>Achievement Unlocked!</Text>
          <Text style={styles.achievementTitle}>{achievement.title}</Text>
          <Text style={styles.achievementDesc}>{achievement.description}</Text>
        </View>

        {/* XP Badge */}
        <View style={styles.xpBadge}>
          <Zap size={12} color="#f6d83b" />
          <Text style={styles.xpText}>+{achievement.xpReward}</Text>
        </View>

        {/* Close button */}
        <TouchableOpacity
          style={styles.closeButton}
          onPress={dismissToast}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <X size={16} color="rgba(247,248,251,0.5)" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

// ============================================================================
// Provider
// ============================================================================

type AchievementToastProviderProps = {
  children: React.ReactNode;
};

export function AchievementToastProvider({ children }: AchievementToastProviderProps) {
  const [toasts, setToasts] = useState<AchievementToastData[]>([]);
  const toastIdRef = useRef(0);

  const showAchievementToast = useCallback((achievement: Achievement) => {
    const id = `achievement-${toastIdRef.current++}`;
    setToasts((prev) => [...prev, { id, achievement }]);
  }, []);

  const showMultipleAchievements = useCallback((achievements: Achievement[]) => {
    const newToasts = achievements.map((achievement) => ({
      id: `achievement-${toastIdRef.current++}`,
      achievement,
    }));
    setToasts((prev) => [...prev, ...newToasts]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <AchievementToastContext.Provider
      value={{ showAchievementToast, showMultipleAchievements }}
    >
      {children}
      {/* Toast container */}
      <View style={styles.toastWrapper} pointerEvents="box-none">
        {toasts.map((toast, index) => (
          <ToastItem
            key={toast.id}
            achievement={toast.achievement}
            onDismiss={() => dismissToast(toast.id)}
            index={index}
          />
        ))}
      </View>
    </AchievementToastContext.Provider>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  toastWrapper: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
  },
  toastContainer: {
    width: SCREEN_WIDTH - 32,
    backgroundColor: '#0b0b12',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(246,216,59,0.3)',
    overflow: 'hidden',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  glow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    opacity: 0.8,
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 18,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconEmoji: {
    fontSize: 24,
  },
  textContainer: {
    flex: 1,
    marginRight: 8,
  },
  unlockLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#f6d83b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  achievementTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#f7f8fb',
    marginBottom: 2,
  },
  achievementDesc: {
    fontSize: 12,
    color: 'rgba(247,248,251,0.6)',
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(246,216,59,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
  },
  xpText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#f6d83b',
  },
  closeButton: {
    padding: 4,
  },
});

export default AchievementToastProvider;
