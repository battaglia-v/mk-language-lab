/**
 * WelcomeBanner - Dismissible welcome message for new users
 * 
 * Shows tips and encouragement on first sessions
 * Mirrors PWA's components/WelcomeBanner.tsx
 * 
 * @see PARITY_CHECKLIST.md - Feature parity
 * @see components/WelcomeBanner.tsx (PWA implementation)
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { X, Sparkles, ArrowRight } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { haptic } from '../lib/haptics';

const DISMISSED_KEY = 'mkll:welcome-banner-dismissed';

type WelcomeBannerProps = {
  /** Optional custom message */
  message?: string;
  /** Called when banner is dismissed */
  onDismiss?: () => void;
};

export function WelcomeBanner({ message, onDismiss }: WelcomeBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  const checkVisibility = useCallback(async () => {
    try {
      const dismissed = await AsyncStorage.getItem(DISMISSED_KEY);
      if (!dismissed) {
        setIsVisible(true);
        // Animate in
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }
    } catch {
      // Ignore errors
    }
  }, [fadeAnim]);

  useEffect(() => {
    checkVisibility();
  }, [checkVisibility]);

  const handleDismiss = async () => {
    haptic.light();
    
    // Animate out
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(async () => {
      setIsVisible(false);
      await AsyncStorage.setItem(DISMISSED_KEY, 'true');
      onDismiss?.();
    });
  };

  const handleGetStarted = () => {
    haptic.medium();
    router.push('/onboarding');
  };

  if (!isVisible) return null;

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* Close button */}
      <TouchableOpacity
        style={styles.closeButton}
        onPress={handleDismiss}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <X size={18} color="rgba(247,248,251,0.5)" />
      </TouchableOpacity>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Sparkles size={24} color="#f6d83b" />
        </View>
        
        <View style={styles.textContent}>
          <Text style={styles.title}>Welcome to MK Language Lab! 🇲🇰</Text>
          <Text style={styles.message}>
            {message || "Start your Macedonian learning journey. We'll help you set up your personalized study plan."}
          </Text>
        </View>
      </View>

      {/* Action button */}
      <TouchableOpacity style={styles.actionButton} onPress={handleGetStarted}>
        <Text style={styles.actionText}>Get Started</Text>
        <ArrowRight size={16} color="#06060b" />
      </TouchableOpacity>
    </Animated.View>
  );
}

/**
 * Compact tip banner for contextual hints
 */
export function TipBanner({
  tip,
  onDismiss,
}: {
  tip: string;
  onDismiss?: () => void;
}) {
  return (
    <View style={styles.tipContainer}>
      <Sparkles size={16} color="#f6d83b" />
      <Text style={styles.tipText}>{tip}</Text>
      {onDismiss && (
        <TouchableOpacity onPress={onDismiss}>
          <X size={16} color="rgba(247,248,251,0.5)" />
        </TouchableOpacity>
      )}
    </View>
  );
}

/**
 * Reset welcome banner (for testing)
 */
export async function resetWelcomeBanner(): Promise<void> {
  await AsyncStorage.removeItem(DISMISSED_KEY);
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(246,216,59,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(246,216,59,0.2)',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 4,
    zIndex: 10,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
    paddingRight: 24,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(246,216,59,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContent: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f7f8fb',
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: 'rgba(247,248,251,0.7)',
    lineHeight: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#f6d83b',
    paddingVertical: 12,
    borderRadius: 10,
  },
  actionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#06060b',
  },
  // Tip banner styles
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(246,216,59,0.08)',
    borderRadius: 10,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: 'rgba(247,248,251,0.7)',
  },
});

export default WelcomeBanner;
