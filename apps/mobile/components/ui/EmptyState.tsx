/**
 * EmptyState - Unified empty state component
 * 
 * Provides consistent empty state styling with:
 * - Visual illustration (icon)
 * - Clear title and description
 * - Primary CTA button
 * - Optional secondary action
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { haptic } from '../../lib/haptics';

type EmptyStateVariant = 'default' | 'coming-soon' | 'no-data' | 'locked' | 'error';

interface EmptyStateProps {
  /** Icon to display */
  icon: LucideIcon;
  /** Icon color (default: gold) */
  iconColor?: string;
  /** Title text */
  title: string;
  /** Description text */
  description: string;
  /** Primary action button text */
  actionText?: string;
  /** Primary action callback */
  onAction?: () => void;
  /** Secondary action text */
  secondaryText?: string;
  /** Secondary action callback */
  onSecondaryAction?: () => void;
  /** Visual variant */
  variant?: EmptyStateVariant;
  /** Custom container style */
  style?: ViewStyle;
}

const VARIANT_STYLES: Record<EmptyStateVariant, {
  iconBg: string;
  iconColor: string;
  buttonBg: string;
  buttonText: string;
}> = {
  default: {
    iconBg: 'rgba(246,216,59,0.15)',
    iconColor: '#f6d83b',
    buttonBg: '#f6d83b',
    buttonText: '#06060b',
  },
  'coming-soon': {
    iconBg: 'rgba(59,130,246,0.15)',
    iconColor: '#3b82f6',
    buttonBg: '#3b82f6',
    buttonText: '#ffffff',
  },
  'no-data': {
    iconBg: 'rgba(247,248,251,0.1)',
    iconColor: 'rgba(247,248,251,0.5)',
    buttonBg: 'rgba(247,248,251,0.1)',
    buttonText: '#f7f8fb',
  },
  locked: {
    iconBg: 'rgba(168,85,247,0.15)',
    iconColor: '#a855f7',
    buttonBg: '#a855f7',
    buttonText: '#ffffff',
  },
  error: {
    iconBg: 'rgba(239,68,68,0.15)',
    iconColor: '#ef4444',
    buttonBg: 'rgba(239,68,68,0.2)',
    buttonText: '#ef4444',
  },
};

export function EmptyState({
  icon: Icon,
  iconColor,
  title,
  description,
  actionText,
  onAction,
  secondaryText,
  onSecondaryAction,
  variant = 'default',
  style,
}: EmptyStateProps) {
  const variantStyle = VARIANT_STYLES[variant];
  const finalIconColor = iconColor || variantStyle.iconColor;

  const handleAction = () => {
    haptic.light();
    onAction?.();
  };

  const handleSecondaryAction = () => {
    haptic.light();
    onSecondaryAction?.();
  };

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.iconContainer, { backgroundColor: variantStyle.iconBg }]}>
        <Icon size={48} color={finalIconColor} />
      </View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>

      {actionText && onAction && (
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: variantStyle.buttonBg }]}
          onPress={handleAction}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={actionText}
        >
          <Text style={[styles.actionText, { color: variantStyle.buttonText }]}>
            {actionText}
          </Text>
        </TouchableOpacity>
      )}

      {secondaryText && onSecondaryAction && (
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleSecondaryAction}
          activeOpacity={0.7}
          accessibilityRole="button"
        >
          <Text style={styles.secondaryText}>{secondaryText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#f7f8fb',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: 'rgba(247,248,251,0.6)',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
    marginBottom: 24,
  },
  actionButton: {
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
    minWidth: 160,
    alignItems: 'center',
    marginBottom: 12,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    padding: 12,
  },
  secondaryText: {
    fontSize: 14,
    color: '#f6d83b',
  },
});

export default EmptyState;
