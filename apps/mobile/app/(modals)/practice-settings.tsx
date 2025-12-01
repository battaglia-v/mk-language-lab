import { useCallback, useMemo, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { useRouter } from 'expo-router';
import { NativeButton, NativeCard, NativeStatPill, NativeTypography } from '@mk/ui';
import { brandColors, spacingScale } from '@mk/tokens';
import { useNotifications } from '../../lib/notifications';
import type { ReminderWindowId } from '../../lib/notifications/constants';

const DIRECTIONS = [
  { key: 'enToMk' as const, label: 'EN → MK', description: 'Translate English to Macedonian' },
  { key: 'mkToEn' as const, label: 'MK → EN', description: 'Translate Macedonian to English' },
];

const PRACTICE_MODES = [
  { key: 'typing', label: 'Typing', description: 'Type the full translation' },
  { key: 'cloze', label: 'Fill blanks', description: 'Complete missing words' },
  { key: 'multipleChoice', label: 'Multiple choice', description: 'Choose the correct answer' },
  { key: 'listening', label: 'Listening', description: 'Type what you hear' },
] as const;

const DIFFICULTY_MODES = [
  { key: 'casual', label: 'Casual', description: 'No timers, focus on accuracy' },
  { key: 'focus', label: 'Focus', description: 'Timers on, standard XP' },
  { key: 'blitz', label: 'Blitz', description: 'Rapid fire with XP boost' },
] as const;

export default function PracticeSettingsModal() {
  const router = useRouter();
  const [direction, setDirection] = useState<(typeof DIRECTIONS)[number]['key']>('mkToEn');
  const [practiceMode, setPracticeMode] = useState<(typeof PRACTICE_MODES)[number]['key']>('typing');
  const [selectedMode, setSelectedMode] = useState<(typeof DIFFICULTY_MODES)[number]['key']>('focus');
  const [audioPrompts, setAudioPrompts] = useState(true);
  const [hintsEnabled, setHintsEnabled] = useState(true);
  const {
    reminderPreferences,
    toggleReminderWindow,
    permissionStatus,
    isHydrated: remindersHydrated,
    isScheduling: remindersScheduling,
    isRegisteringToken: remindersRegistering,
    requestPermission: requestReminderPermission,
  } = useNotifications();

  const reminderStatusCopy = useMemo(
    () =>
      getReminderStatusCopy({
        hasPermission: permissionStatus === 'granted',
        hasSelection: reminderPreferences.some((window) => window.enabled),
        isHydrated: remindersHydrated,
        isSyncing: remindersScheduling || remindersRegistering,
      }),
    [permissionStatus, reminderPreferences, remindersHydrated, remindersScheduling, remindersRegistering]
  );

  const handleReminderToggle = useCallback(
    (windowId: ReminderWindowId, value: boolean) => {
      void toggleReminderWindow(windowId, value);
    },
    [toggleReminderWindow]
  );

  return (
    <View style={styles.overlay}>
      <Pressable accessibilityRole="button" style={StyleSheet.absoluteFill} onPress={() => router.back()} />
      <SafeAreaView style={styles.safeArea}>
        <NativeCard style={styles.card}>
          <View style={styles.header}>
            <NativeTypography variant="title" style={styles.heading}>
              Practice Settings
            </NativeTypography>
            <NativeTypography variant="caption" style={styles.subheading}>
              Configure direction, mode, difficulty, and helpers.
            </NativeTypography>
          </View>

          <ScrollView contentContainerStyle={styles.content}>
            {/* Direction Section */}
            <View style={styles.section}>
              <NativeTypography variant="eyebrow" style={styles.label}>
                Translation Direction
              </NativeTypography>
              <View style={styles.directionRow}>
                {DIRECTIONS.map((dir) => (
                  <Pressable
                    key={dir.key}
                    onPress={() => setDirection(dir.key)}
                    style={[
                      styles.directionButton,
                      direction === dir.key && styles.directionButtonActive,
                    ]}
                  >
                    <NativeTypography variant="body" style={styles.directionLabel}>
                      {dir.label}
                    </NativeTypography>
                  </Pressable>
                ))}
              </View>
              <NativeTypography variant="caption" style={styles.modeHint}>
                {DIRECTIONS.find((d) => d.key === direction)?.description}
              </NativeTypography>
            </View>

            {/* Practice Mode Section */}
            <View style={styles.section}>
              <NativeTypography variant="eyebrow" style={styles.label}>
                Practice Mode
              </NativeTypography>
              <View style={styles.modeGrid}>
                {PRACTICE_MODES.map((mode) => (
                  <Pressable
                    key={mode.key}
                    onPress={() => setPracticeMode(mode.key)}
                    style={[
                      styles.modeCard,
                      practiceMode === mode.key && styles.modeCardActive,
                    ]}
                  >
                    <NativeTypography variant="body" style={styles.modeLabel}>
                      {mode.label}
                    </NativeTypography>
                    <NativeTypography variant="caption" style={styles.modeDescription}>
                      {mode.description}
                    </NativeTypography>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Difficulty Section */}
            <View style={styles.section}>
              <NativeTypography variant="eyebrow" style={styles.label}>
                Difficulty
              </NativeTypography>
              <View style={styles.modeGrid}>
                {DIFFICULTY_MODES.map((mode) => (
                  <Pressable
                    key={mode.key}
                    onPress={() => setSelectedMode(mode.key)}
                    style={[
                      styles.modeCard,
                      selectedMode === mode.key && styles.modeCardActive,
                    ]}
                  >
                    <NativeTypography variant="body" style={styles.modeLabel}>
                      {mode.label}
                    </NativeTypography>
                    <NativeTypography variant="caption" style={styles.modeDescription}>
                      {mode.description}
                    </NativeTypography>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <NativeTypography variant="eyebrow" style={styles.label}>
                Helpers
              </NativeTypography>
              <SettingToggle
                label="Audio prompts"
                description="Auto-play example audio on each card."
                value={audioPrompts}
                onValueChange={setAudioPrompts}
              />
              <SettingToggle
                label="Smart hints"
                description="Show cultural/context hints when you miss twice."
                value={hintsEnabled}
                onValueChange={setHintsEnabled}
              />
            </View>

            <View style={styles.section}>
              <NativeTypography variant="eyebrow" style={styles.label}>
                Mission reminders
              </NativeTypography>
              {reminderPreferences.map((window) => (
                <SettingToggle
                  key={window.id}
                  label={window.label}
                  description={window.description}
                  value={window.enabled}
                  disabled={
                    !remindersHydrated ||
                    remindersScheduling ||
                    remindersRegistering ||
                    permissionStatus !== 'granted'
                  }
                  onValueChange={(value) => handleReminderToggle(window.id, value)}
                />
              ))}
              {permissionStatus !== 'granted' && (
                <NativeButton variant="secondary" onPress={requestReminderPermission}>
                  <NativeTypography variant="body" style={styles.secondaryButtonText}>
                    Enable notifications
                  </NativeTypography>
                </NativeButton>
              )}
              <NativeTypography variant="caption" style={styles.permissionHint}>
                {reminderStatusCopy}
              </NativeTypography>
            </View>

            <View style={styles.section}>
              <NativeTypography variant="eyebrow" style={styles.label}>
                Current Settings
              </NativeTypography>
              <View style={styles.summaryRow}>
                <NativeStatPill
                  label="Direction"
                  value={DIRECTIONS.find((d) => d.key === direction)?.label ?? ''}
                  accent="red"
                />
                <NativeStatPill
                  label="Mode"
                  value={PRACTICE_MODES.find((m) => m.key === practiceMode)?.label ?? ''}
                  accent="gold"
                />
                <NativeStatPill label="Difficulty" value={selectedMode} accent="green" />
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <NativeButton onPress={() => router.back()}>
              <NativeTypography variant="body" style={styles.primaryButtonText}>
                Done
              </NativeTypography>
            </NativeButton>
          </View>
        </NativeCard>
      </SafeAreaView>
    </View>
  );
}

type SettingToggleProps = {
  label: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
};

function SettingToggle({ label, description, value, onValueChange, disabled }: SettingToggleProps) {
  return (
    <View style={[styles.toggleRow, disabled && styles.toggleRowDisabled]}>
      <View style={{ flex: 1 }}>
        <NativeTypography variant="body" style={styles.toggleLabel}>
          {label}
        </NativeTypography>
        <NativeTypography variant="caption" style={styles.toggleDescription}>
          {description}
        </NativeTypography>
      </View>
      <Switch value={value} onValueChange={onValueChange} thumbColor={brandColors.red} disabled={disabled} />
    </View>
  );
}

type ReminderStatusCopyInput = {
  hasPermission: boolean;
  hasSelection: boolean;
  isHydrated: boolean;
  isSyncing: boolean;
};

function getReminderStatusCopy({ hasPermission, hasSelection, isHydrated, isSyncing }: ReminderStatusCopyInput) {
  if (!isHydrated) {
    return 'Loading your reminder preferences...';
  }
  if (isSyncing) {
    return 'Syncing your reminder preferences...';
  }
  if (!hasPermission) {
    return 'Enable notifications in system settings to get mission nudges.';
  }
  if (hasSelection) {
    return 'We will ping you at the selected times to protect your streak.';
  }
  return 'Pick a reminder window to receive daily streak saves.';
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  safeArea: {
    width: '100%',
    paddingHorizontal: spacingScale.xl,
  },
  card: {
    padding: spacingScale.lg,
    borderRadius: spacingScale['2xl'],
  },
  header: {
    marginBottom: spacingScale.md,
  },
  heading: {
    color: brandColors.navy,
  },
  subheading: {
    color: 'rgba(16,24,40,0.65)',
  },
  content: {
    gap: spacingScale.lg,
  },
  section: {
    gap: spacingScale.sm,
  },
  label: {
    color: brandColors.red,
  },
  directionRow: {
    flexDirection: 'row',
    gap: spacingScale.sm,
  },
  directionButton: {
    flex: 1,
    paddingVertical: spacingScale.md,
    paddingHorizontal: spacingScale.sm,
    backgroundColor: 'rgba(16,24,40,0.04)',
    borderRadius: spacingScale.lg,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
  },
  directionButtonActive: {
    borderColor: brandColors.red,
    backgroundColor: brandColors.cream,
  },
  directionLabel: {
    color: brandColors.navy,
    fontWeight: '600',
  },
  modeGrid: {
    gap: spacingScale.sm,
  },
  modeCard: {
    padding: spacingScale.sm,
    borderRadius: spacingScale.lg,
  },
  modeCardActive: {
    borderWidth: 1,
    borderColor: brandColors.red,
    backgroundColor: brandColors.cream,
  },
  modeLabel: {
    color: brandColors.navy,
  },
  modeDescription: {
    color: 'rgba(16,24,40,0.65)',
  },
  modeHint: {
    color: 'rgba(16,24,40,0.65)',
  },
  summaryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacingScale.sm,
  },
  footer: {
    marginTop: spacingScale.lg,
    gap: spacingScale.sm,
  },
  primaryButtonText: {
    color: '#fff',
  },
  secondaryButtonText: {
    color: brandColors.navy,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(16,24,40,0.04)',
    paddingHorizontal: spacingScale.sm,
    paddingVertical: spacingScale.xs,
    borderRadius: spacingScale.lg,
    marginBottom: spacingScale.sm,
  },
  toggleLabel: {
    color: brandColors.navy,
  },
  toggleDescription: {
    color: 'rgba(16,24,40,0.65)',
  },
  toggleRowDisabled: {
    opacity: 0.5,
  },
  permissionHint: {
    color: 'rgba(16,24,40,0.65)',
  },
});
