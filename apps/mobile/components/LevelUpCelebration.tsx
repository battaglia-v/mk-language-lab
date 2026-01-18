/**
 * LevelUpCelebration - Full-screen level up animation
 * 
 * Shows celebration modal when user levels up
 * Mirrors PWA's components/gamification/AchievementAnimations.tsx
 * 
 * @see PARITY_CHECKLIST.md - Feature parity
 * @see components/gamification/AchievementAnimations.tsx (PWA)
 */

import React, { useEffect, useMemo, createContext, useContext, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  Dimensions,
} from 'react-native';
import { Star, Zap, Sparkles, ChevronRight } from 'lucide-react-native';
import { haptic } from '../lib/haptics';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ============================================================================
// Types
// ============================================================================

type LevelUpData = {
  newLevel: number;
  xpEarned: number;
  nextLevelXP: number;
  previousLevel: number;
};

type LevelUpContextType = {
  showLevelUp: (data: LevelUpData) => void;
};

// ============================================================================
// Context
// ============================================================================

const LevelUpContext = createContext<LevelUpContextType | null>(null);

export function useLevelUp() {
  const context = useContext(LevelUpContext);
  if (!context) {
    throw new Error('useLevelUp must be used within LevelUpProvider');
  }
  return context;
}

// ============================================================================
// Particle Component
// ============================================================================

type ParticleProps = {
  delay: number;
  startX: number;
  startY: number;
  color: string;
};

function Particle({ delay, startX, startY, color }: ParticleProps) {
  // Use useMemo to create animated values (avoids lint issues with refs during render)
  const translateY = useMemo(() => new Animated.Value(0), []);
  const translateX = useMemo(() => new Animated.Value(0), []);
  const opacity = useMemo(() => new Animated.Value(0), []);
  const scale = useMemo(() => new Animated.Value(0), []);

  useEffect(() => {
    const randomX = (Math.random() - 0.5) * 200;
    const randomY = -Math.random() * 300 - 100;

    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          tension: 50,
          friction: 5,
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: randomX,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: randomY,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [delay, opacity, scale, translateX, translateY]);

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          backgroundColor: color,
          left: startX,
          top: startY,
          transform: [{ translateX }, { translateY }, { scale }],
          opacity,
        },
      ]}
    />
  );
}

// ============================================================================
// Main Component
// ============================================================================

type LevelUpCelebrationProps = {
  visible: boolean;
  data: LevelUpData | null;
  onClose: () => void;
};

function LevelUpCelebration({ visible, data, onClose }: LevelUpCelebrationProps) {
  // Use useMemo to create animated values (avoids lint issues with refs during render)
  const scaleAnim = useMemo(() => new Animated.Value(0), []);
  const rotateAnim = useMemo(() => new Animated.Value(0), []);
  const glowAnim = useMemo(() => new Animated.Value(0), []);
  const badgeScale = useMemo(() => new Animated.Value(0), []);

  // Interpolate animations
  const rotation = useMemo(
    () => rotateAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    }),
    [rotateAnim]
  );

  const glowOpacity = useMemo(
    () => glowAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 0.8],
    }),
    [glowAnim]
  );

  useEffect(() => {
    if (visible && data) {
      // Trigger haptic
      haptic.success();

      // Reset animations
      scaleAnim.setValue(0);
      rotateAnim.setValue(0);
      glowAnim.setValue(0);
      badgeScale.setValue(0);

      // Start entrance animation sequence
      Animated.sequence([
        // Badge entrance
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 40,
            friction: 5,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
        // Glow pulse
        Animated.loop(
          Animated.sequence([
            Animated.timing(glowAnim, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(glowAnim, {
              toValue: 0,
              duration: 1000,
              useNativeDriver: true,
            }),
          ])
        ),
      ]).start();

      // Badge bounce after delay
      setTimeout(() => {
        Animated.spring(badgeScale, {
          toValue: 1,
          tension: 100,
          friction: 5,
          useNativeDriver: true,
        }).start();
      }, 400);
    }
  }, [visible, data, scaleAnim, rotateAnim, glowAnim, badgeScale]);

  if (!data) return null;

  // Generate particles
  const particles = Array.from({ length: 20 }).map((_, i) => ({
    id: i,
    delay: i * 50,
    startX: SCREEN_WIDTH / 2 - 6,
    startY: SCREEN_HEIGHT / 2 - 50,
    color: ['#f6d83b', '#fbbf24', '#f59e0b', '#d97706'][i % 4],
  }));

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Particles */}
        {particles.map((p) => (
          <Particle key={p.id} {...p} />
        ))}

        {/* Glow effect */}
        <Animated.View
          style={[
            styles.glow,
            { opacity: glowOpacity },
          ]}
        />

        {/* Main content */}
        <Animated.View
          style={[
            styles.contentContainer,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Level badge */}
          <Animated.View
            style={[
              styles.levelBadge,
              {
                transform: [{ rotate: rotation }],
              },
            ]}
          >
            <Star size={80} color="#f6d83b" fill="#f6d83b" />
            <View style={styles.levelNumber}>
              <Text style={styles.levelText}>{data.newLevel}</Text>
            </View>
          </Animated.View>

          {/* Text content */}
          <View style={styles.textContent}>
            <Text style={styles.congratsText}>LEVEL UP!</Text>
            <Text style={styles.levelUpText}>
              You reached Level {data.newLevel}!
            </Text>
            <Text style={styles.descText}>
              {data.nextLevelXP > 0
                ? `${data.nextLevelXP.toLocaleString()} XP to next level`
                : 'You\'ve reached the max level!'}
            </Text>
          </View>

          {/* Stats */}
          <Animated.View
            style={[
              styles.statsContainer,
              { transform: [{ scale: badgeScale }] },
            ]}
          >
            <View style={styles.statBadge}>
              <Zap size={16} color="#f6d83b" />
              <Text style={styles.statText}>+{data.xpEarned} XP</Text>
            </View>
            <View style={styles.statBadge}>
              <Sparkles size={16} color="#a855f7" />
              <Text style={styles.statText}>
                Level {data.previousLevel} → {data.newLevel}
              </Text>
            </View>
          </Animated.View>

          {/* Continue button */}
          <TouchableOpacity
            style={styles.continueButton}
            onPress={() => {
              haptic.medium();
              onClose();
            }}
          >
            <Text style={styles.continueText}>Continue</Text>
            <ChevronRight size={20} color="#06060b" />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

// ============================================================================
// Provider
// ============================================================================

type LevelUpProviderProps = {
  children: React.ReactNode;
};

export function LevelUpProvider({ children }: LevelUpProviderProps) {
  const [visible, setVisible] = useState(false);
  const [data, setData] = useState<LevelUpData | null>(null);

  const showLevelUp = useCallback((levelData: LevelUpData) => {
    setData(levelData);
    setVisible(true);
  }, []);

  const handleClose = useCallback(() => {
    setVisible(false);
    setTimeout(() => setData(null), 300);
  }, []);

  return (
    <LevelUpContext.Provider value={{ showLevelUp }}>
      {children}
      <LevelUpCelebration
        visible={visible}
        data={data}
        onClose={handleClose}
      />
    </LevelUpContext.Provider>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(6,6,11,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#f6d83b',
    opacity: 0.3,
  },
  particle: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  contentContainer: {
    alignItems: 'center',
    padding: 32,
  },
  levelBadge: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  levelNumber: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#06060b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#f6d83b',
  },
  textContent: {
    alignItems: 'center',
    marginBottom: 24,
  },
  congratsText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#f6d83b',
    letterSpacing: 4,
    marginBottom: 8,
  },
  levelUpText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#f7f8fb',
    textAlign: 'center',
    marginBottom: 8,
  },
  descText: {
    fontSize: 14,
    color: 'rgba(247,248,251,0.6)',
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(247,248,251,0.1)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f7f8fb',
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f6d83b',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 14,
  },
  continueText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#06060b',
  },
});

export default LevelUpProvider;
