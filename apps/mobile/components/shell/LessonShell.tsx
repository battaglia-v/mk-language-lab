/**
 * LessonShell - Full-screen immersive layout for practice/lesson sessions
 * 
 * Mirrors PWA's components/shell/LessonShell.tsx
 * Hides tab bar and provides consistent header (close + progress) and footer.
 * 
 * @see PARITY_CHECKLIST.md - Navigation parity
 * @see components/shell/LessonShell.tsx (PWA implementation)
 */

import { ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { X, Zap } from 'lucide-react-native';

interface LessonShellProps {
  children: ReactNode;

  /** Progress percentage (0-100) */
  progress?: number;

  /** Current question number */
  current?: number;

  /** Total questions */
  total?: number;

  /** XP earned so far in session */
  xp?: number;

  /** Custom close handler */
  onClose?: () => void;

  /** Route to navigate to on close (if no onClose provided) */
  closeHref?: string;

  /** Footer content (action buttons) */
  footer?: ReactNode;
}

/**
 * LessonShell - Full-screen session layout without tab navigation
 *
 * Used for practice sessions, drills, pronunciation exercises, etc.
 * Provides consistent header (close + progress) and sticky action footer.
 *
 * @example
 * <LessonShell
 *   progress={60}
 *   current={6}
 *   total={10}
 *   xp={45}
 *   footer={<PrimaryButton onPress={handleNext}>Continue</PrimaryButton>}
 * >
 *   <QuestionContent />
 * </LessonShell>
 */
export function LessonShell({
  children,
  progress = 0,
  current,
  total,
  xp,
  onClose,
  closeHref,
  footer,
}: LessonShellProps) {
  const handleClose = () => {
    if (onClose) {
      onClose();
    } else if (closeHref) {
      router.replace(closeHref as never);
    } else {
      router.back();
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header: Close + Progress + XP */}
      <View style={styles.header}>
        {/* Close Button */}
        <TouchableOpacity
          onPress={handleClose}
          style={styles.closeButton}
          accessibilityLabel="Close session"
          accessibilityRole="button"
        >
          <X size={24} color="#f7f8fb" />
        </TouchableOpacity>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${Math.min(100, progress)}%` }]} />
          </View>
          {current !== undefined && total !== undefined && (
            <Text style={styles.progressText}>
              {current}/{total}
            </Text>
          )}
        </View>

        {/* XP Display */}
        {xp !== undefined && xp > 0 && (
          <View style={styles.xpBadge}>
            <Zap size={14} color="#f6d83b" />
            <Text style={styles.xpText}>+{xp}</Text>
          </View>
        )}
      </View>

      {/* Main Content */}
      <View style={styles.content}>{children}</View>

      {/* Footer */}
      {footer && <View style={styles.footer}>{footer}</View>}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#06060b',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(34,37,54,0.5)',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(247,248,251,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressTrack: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(247,248,251,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#f6d83b',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(247,248,251,0.6)',
    fontVariant: ['tabular-nums'],
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(246,216,59,0.15)',
  },
  xpText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#f6d83b',
    fontVariant: ['tabular-nums'],
  },
  content: {
    flex: 1,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(34,37,54,0.5)',
  },
});

export default LessonShell;
