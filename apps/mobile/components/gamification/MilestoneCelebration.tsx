/**
 * MilestoneCelebration - Modal celebrating milestone achievements (Android)
 * 
 * Shows an animated celebration when user reaches a milestone.
 * 
 * Parity: Must match PWA MilestoneCelebration.tsx
 */

import { useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { X, Share2, Sparkles } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

interface Milestone {
  id: string;
  title: string;
  titleMk: string;
  description: string;
  icon: string;
  xpReward: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface MilestoneCelebrationProps {
  milestone: Milestone;
  onClose: () => void;
  onShare?: () => void;
  autoDismiss?: boolean;
  dismissDelay?: number;
}

const RARITY_COLORS: Record<string, string> = {
  common: '#9ca3af',
  rare: '#3b82f6',
  epic: '#a855f7',
  legendary: '#f59e0b',
};

const RARITY_BG: Record<string, string> = {
  common: 'rgba(156, 163, 175, 0.1)',
  rare: 'rgba(59, 130, 246, 0.1)',
  epic: 'rgba(168, 85, 247, 0.1)',
  legendary: 'rgba(245, 158, 11, 0.15)',
};

export function MilestoneCelebration({
  milestone,
  onClose,
  onShare,
  autoDismiss = false,
  dismissDelay = 5000,
}: MilestoneCelebrationProps) {
  const scaleAnim = useMemo(() => new Animated.Value(0.8), []);
  const opacityAnim = useMemo(() => new Animated.Value(0), []);
  const bounceAnim = useMemo(() => new Animated.Value(0), []);

  const rarityColor = RARITY_COLORS[milestone.rarity];
  const rarityBg = RARITY_BG[milestone.rarity];

  useEffect(() => {
    // Haptic feedback
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Entrance animation
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Bounce animation for icon
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -10,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Auto dismiss
    if (autoDismiss) {
      const timer = setTimeout(onClose, dismissDelay);
      return () => clearTimeout(timer);
    }
  }, [autoDismiss, dismissDelay, onClose, scaleAnim, opacityAnim, bounceAnim]);

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.modal,
            { borderColor: rarityColor },
            {
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Close button */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <X size={20} color="rgba(247,248,251,0.5)" />
          </TouchableOpacity>

          {/* Icon */}
          <Animated.View
            style={[
              styles.iconContainer,
              { backgroundColor: rarityBg },
              { transform: [{ translateY: bounceAnim }] },
            ]}
          >
            <Text style={styles.icon}>{milestone.icon}</Text>
            <View style={[styles.sparkle, { top: -8, right: -8 }]}>
              <Sparkles size={20} color={rarityColor} />
            </View>
          </Animated.View>

          {/* Title */}
          <Text style={styles.subtitle}>Milestone Achieved!</Text>
          <Text style={[styles.title, { color: rarityColor }]}>
            {milestone.title}
          </Text>
          <Text style={styles.titleMk}>{milestone.titleMk}</Text>

          {/* Description */}
          <Text style={styles.description}>{milestone.description}</Text>

          {/* XP Reward */}
          <View style={[styles.xpBadge, { backgroundColor: rarityBg }]}>
            <Text style={styles.xpIcon}>⚡</Text>
            <Text style={[styles.xpText, { color: rarityColor }]}>
              +{milestone.xpReward} XP
            </Text>
          </View>

          {/* Rarity */}
          <View style={[styles.rarityBadge, { backgroundColor: rarityBg }]}>
            <Sparkles size={12} color={rarityColor} />
            <Text style={[styles.rarityText, { color: rarityColor }]}>
              {milestone.rarity.toUpperCase()}
            </Text>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            {onShare && (
              <TouchableOpacity
                style={styles.shareButton}
                onPress={onShare}
                activeOpacity={0.7}
              >
                <Share2 size={16} color="#f7f8fb" />
                <Text style={styles.shareButtonText}>Share</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.continueButton, { backgroundColor: rarityColor }]}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.continueButtonText,
                milestone.rarity === 'legendary' && { color: '#000' }
              ]}>
                Continue
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modal: {
    width: width - 48,
    maxWidth: 340,
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
    borderWidth: 2,
    padding: 24,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 4,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  icon: {
    fontSize: 48,
  },
  sparkle: {
    position: 'absolute',
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(247,248,251,0.5)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  titleMk: {
    fontSize: 14,
    color: 'rgba(247,248,251,0.6)',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#f7f8fb',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 12,
  },
  xpIcon: {
    fontSize: 18,
  },
  xpText: {
    fontSize: 16,
    fontWeight: '700',
  },
  rarityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 20,
  },
  rarityText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
  },
  shareButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  shareButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f7f8fb',
  },
  continueButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
  continueButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});

export default MilestoneCelebration;
