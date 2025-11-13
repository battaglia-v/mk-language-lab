import { useCallback, useMemo, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { useRouter } from 'expo-router';
import { NativeButton, NativeCard, NativeStatPill, NativeTypography } from '@mk/ui';
import { brandColors, spacingScale } from '@mk/tokens';
import { useNotifications } from '../../lib/notifications';
import type { ReminderWindowId } from '../../lib/notifications/constants';

const DIFFICULTY_MODES = [
  { key: 'casual', label: 'Casual', description: 'No timers, focus on accuracy.' },
  { key: 'focus', label: 'Focus', description: 'Timers on, standard XP rewards.' },
  { key: 'blitz', label: 'Blitz', description: 'Rapid fire drills with XP multipliers.' },
] as const;

export default function PracticeSettingsModal() {
  const router = useRouter();
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

  const selectedDetails = useMemo(
    () => DIFFICULTY_MODES.find((mode) => mode.key === selectedMode)?.description ?? '',
    [selectedMode]
  );

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
              Session Settings
            </NativeTypography>
            <NativeTypography variant="caption" style={styles.subheading}>
              Tune timers, hints, and audio helpers before the next run.
            </NativeTypography>
          </View>

          <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.section}>
              <NativeTypography variant="eyebrow" style={styles.label}>
                Mode
              </NativeTypography>
              <View style={styles.modeGrid}>
                {DIFFICULTY_MODES.map((mode) => (
                  <NativeCard
                    key={mode.key}
                    style={[
                      styles.modeCard,
                      selectedMode === mode.key && styles.modeCardActive,
                    ]}
                  >
                    <Pressable onPress={() => setSelectedMode(mode.key)} android_ripple={{ color: 'rgba(0,0,0,0.08)' }}>
                      <NativeTypography variant="body" style={styles.modeLabel}>
                        {mode.label}
                      </NativeTypography>
                      <NativeTypography variant="caption" style={styles.modeDescription}>
                        {mode.description}
                      </NativeTypography>
                    </Pressable>
                  </NativeCard>
                ))}
              </View>
              <NativeTypography variant="caption" style={styles.modeHint}>
                {selectedDetails}
              </NativeTypography>
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
                Summary
              </NativeTypography>
              <View style={styles.summaryRow}>
                <NativeStatPill label="Mode" value={selectedMode} accent="gold" />
                <NativeStatPill label="Audio" value={audioPrompts ? 'On' : 'Off'} accent="green" />
                <NativeStatPill label="Hints" value={hintsEnabled ? 'Enabled' : 'Off'} accent="red" />
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <NativeButton onPress={() => router.back()}>
              <NativeTypography variant="body" style={styles.primaryButtonText}>
                Save & Continue
              </NativeTypography>
            </NativeButton>
            <NativeButton variant="ghost" onPress={() => router.back()}>
              <NativeTypography variant="body" style={styles.secondaryButtonText}>
                Cancel
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
