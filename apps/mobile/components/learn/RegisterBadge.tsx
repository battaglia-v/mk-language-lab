/**
 * RegisterBadge - Visual indicator for formal/informal speech register (Android)
 * 
 * Helps learners understand when to use formal vs informal language.
 * Essential for Macedonian where "Вие" vs "ти" matters socially.
 * 
 * Features:
 * - Clear visual distinction (🎩 Formal / 👋 Casual)
 * - Compact for inline use in vocabulary cards
 * - Accessible with ARIA labels
 * 
 * Parity with: components/learn/RegisterBadge.tsx (PWA)
 */

import { View, Text, StyleSheet } from 'react-native';

export type SpeechRegister = 'formal' | 'informal' | 'neutral';

export interface RegisterBadgeProps {
  /** The speech register */
  register: SpeechRegister;
  /** Size variant */
  size?: 'sm' | 'md';
  /** Show icon only (no text) */
  iconOnly?: boolean;
}

const REGISTER_CONFIG: Record<SpeechRegister, {
  icon: string;
  label: string;
  labelMk: string;
  description: string;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
}> = {
  formal: {
    icon: '🎩',
    label: 'Formal',
    labelMk: 'Формално',
    description: 'Use with elders, teachers, officials, or people you just met',
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    textColor: '#a78bfa',
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  informal: {
    icon: '👋',
    label: 'Casual',
    labelMk: 'Неформално',
    description: 'Use with friends, family, and peers',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    textColor: '#34d399',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  neutral: {
    icon: '💬',
    label: 'Neutral',
    labelMk: 'Неутрално',
    description: 'Appropriate in any context',
    backgroundColor: 'rgba(100, 116, 139, 0.15)',
    textColor: '#94a3b8',
    borderColor: 'rgba(100, 116, 139, 0.3)',
  },
};

export function RegisterBadge({
  register,
  size = 'sm',
  iconOnly = false,
}: RegisterBadgeProps) {
  const config = REGISTER_CONFIG[register];

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: config.backgroundColor,
          borderColor: config.borderColor,
          paddingHorizontal: size === 'sm' ? 8 : 10,
          paddingVertical: size === 'sm' ? 3 : 5,
        },
      ]}
      accessibilityLabel={`${config.label} speech register: ${config.description}`}
      accessibilityRole="text"
    >
      <Text style={styles.icon}>{config.icon}</Text>
      {!iconOnly && (
        <Text style={[styles.label, { color: config.textColor, fontSize: size === 'sm' ? 11 : 13 }]}>
          {config.label}
        </Text>
      )}
    </View>
  );
}

/**
 * RegisterWarning - Inline warning when mixing formal/informal registers
 */
export function RegisterWarning({
  expectedRegister,
  usedRegister,
}: {
  expectedRegister: SpeechRegister;
  usedRegister: SpeechRegister;
}) {
  if (expectedRegister === usedRegister || expectedRegister === 'neutral' || usedRegister === 'neutral') {
    return null;
  }

  const message = expectedRegister === 'formal'
    ? 'This context calls for formal language (Вие). Using informal "ти" may seem disrespectful.'
    : 'This is a casual context! You can use informal "ти" with friends and family.';

  return (
    <View style={styles.warningContainer}>
      <Text style={styles.warningIcon}>⚠️</Text>
      <View style={styles.warningContent}>
        <Text style={styles.warningTitle}>Register mismatch</Text>
        <Text style={styles.warningMessage}>{message}</Text>
      </View>
    </View>
  );
}

/**
 * Get register from vocabulary item or dialogue context
 */
export function inferRegister(text: string): SpeechRegister {
  const formalIndicators = ['Вие', 'Вас', 'Ваш', 'сте', 'имате', 'можете'];
  const informalIndicators = ['ти', 'тебе', 'твој', 'си', 'имаш', 'можеш'];

  const lowerText = text.toLowerCase();
  const hasFormal = formalIndicators.some(word => text.includes(word) || lowerText.includes(word.toLowerCase()));
  const hasInformal = informalIndicators.some(word => text.includes(word) || lowerText.includes(word.toLowerCase()));

  if (hasFormal && !hasInformal) return 'formal';
  if (hasInformal && !hasFormal) return 'informal';
  return 'neutral';
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 16,
    borderWidth: 1,
  },
  icon: {
    fontSize: 12,
  },
  label: {
    fontWeight: '600',
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    marginVertical: 8,
  },
  warningIcon: {
    fontSize: 16,
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f59e0b',
  },
  warningMessage: {
    fontSize: 12,
    color: 'rgba(247,248,251,0.6)',
    marginTop: 4,
  },
});

export default RegisterBadge;
