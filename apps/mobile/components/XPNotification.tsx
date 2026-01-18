/**
 * XP Notification System for React Native
 * 
 * Animated XP popups when users earn experience points
 * Mirrors PWA's XPPopUp and XPNotificationProvider behavior
 * 
 * @see PARITY_CHECKLIST.md - Feature parity
 * @see components/gamification/XPPopUp.tsx (PWA implementation)
 * @see components/providers/XPNotificationProvider.tsx (PWA implementation)
 */

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Star, Zap } from 'lucide-react-native';
import { useReducedMotion } from '../hooks/useReducedMotion';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export type XPNotification = {
  id: string;
  amount: number;
  reason?: string;
};

type XPNotificationContextValue = {
  showXP: (amount: number, reason?: string) => void;
  showQuickXP: (amount: number) => void;
  clearAll: () => void;
};

const XPNotificationContext = createContext<XPNotificationContextValue | null>(null);

export function useXPNotification() {
  const context = useContext(XPNotificationContext);
  if (!context) {
    throw new Error('useXPNotification must be used within XPNotificationProvider');
  }
  return context;
}

// Individual XP popup
function XPPopUp({ 
  notification, 
  onComplete 
}: { 
  notification: XPNotification; 
  onComplete: () => void;
}) {
  const { amount, reason } = notification;
  const prefersReducedMotion = useReducedMotion();
  
  // Use useMemo to create animated values (avoids lint issues with refs during render)
  const fadeAnim = useMemo(() => new Animated.Value(0), []);
  const scaleAnim = useMemo(() => new Animated.Value(0.5), []);
  const translateYAnim = useMemo(() => new Animated.Value(0), []);

  useEffect(() => {
    if (prefersReducedMotion) {
      // Simple fade for reduced motion
      Animated.sequence([
        Animated.timing(fadeAnim, { 
          toValue: 1, 
          duration: 100, 
          useNativeDriver: true 
        }),
        Animated.delay(1200),
        Animated.timing(fadeAnim, { 
          toValue: 0, 
          duration: 100, 
          useNativeDriver: true 
        }),
      ]).start(() => onComplete());
    } else {
      // Full animation
      Animated.parallel([
        // Fade in
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        // Scale up with bounce
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      // Float up and fade out after delay
      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(translateYAnim, {
            toValue: -30,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => onComplete());
      }, 800);

      return () => clearTimeout(timer);
    }
  }, [fadeAnim, scaleAnim, translateYAnim, onComplete, prefersReducedMotion]);

  return (
    <Animated.View
      style={[
        styles.popup,
        {
          opacity: fadeAnim,
          transform: [
            { scale: scaleAnim },
            { translateY: translateYAnim },
          ],
        },
      ]}
    >
      <Star color="#000" size={20} fill="#000" />
      <View style={styles.popupContent}>
        <Text style={styles.popupAmount}>+{amount} XP</Text>
        {reason && <Text style={styles.popupReason}>{reason}</Text>}
      </View>
    </Animated.View>
  );
}

// Provider component
export function XPNotificationProvider({ 
  children,
  position = 'top',
}: { 
  children: React.ReactNode;
  position?: 'top' | 'center' | 'bottom';
}) {
  const [notifications, setNotifications] = useState<XPNotification[]>([]);
  const insets = useSafeAreaInsets();

  const showXP = useCallback((amount: number, reason?: string) => {
    const id = `xp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    setNotifications((prev) => [...prev.slice(-4), { id, amount, reason }]);
  }, []);

  const showQuickXP = useCallback((amount: number) => {
    showXP(amount);
  }, [showXP]);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const getPositionStyle = (): { top?: number; bottom?: number } => {
    switch (position) {
      case 'top':
        return { top: insets.top + 80 };
      case 'center':
        return { top: Math.round(SCREEN_HEIGHT * 0.45) };
      case 'bottom':
        return { bottom: insets.bottom + 80 };
      default:
        return { top: insets.top + 80 };
    }
  };

  return (
    <XPNotificationContext.Provider value={{ showXP, showQuickXP, clearAll }}>
      {children}
      <View 
        style={[styles.container, getPositionStyle()]} 
        pointerEvents="none"
      >
        {notifications.map((notification) => (
          <XPPopUp
            key={notification.id}
            notification={notification}
            onComplete={() => removeNotification(notification.id)}
          />
        ))}
      </View>
    </XPNotificationContext.Provider>
  );
}

// Quick XP badge for inline display
export function QuickXPBadge({ amount }: { amount: number }) {
  if (amount <= 0) return null;
  
  return (
    <View style={styles.quickBadge}>
      <Zap color="#f6d83b" size={14} fill="#f6d83b" />
      <Text style={styles.quickBadgeText}>+{amount}</Text>
    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999,
    gap: 8,
  },
  popup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f6d83b',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    gap: 8,
  },
  popupContent: {
    alignItems: 'flex-start',
  },
  popupAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  popupReason: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(0,0,0,0.7)',
  },
  quickBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(246,216,59,0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 2,
  },
  quickBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#f6d83b',
  },
});
