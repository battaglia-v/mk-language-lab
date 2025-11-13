import { useMemo } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { useRouter } from 'expo-router';
import { NativeButton, NativeCard, NativeStatPill, NativeTypography } from '@mk/ui';
import { brandColors, spacingScale } from '@mk/tokens';
import { useNotifications } from '../../lib/notifications';
import type { ReminderPreference } from '../../lib/notifications/constants';

export default function MissionSettingsModal() {
  const router = useRouter();
  const {
    permissionStatus,
    reminderPreferences,
    availableWindows,
    reminderWindows,
    isHydrated,
    isScheduling,
    isRegisteringToken,
    lastSyncedAt,
    requestPermission,
    toggleReminderWindow,
    refreshScheduledReminders,
  } = useNotifications();

  const permissionState = permissionStatus ?? 'undetermined';
  const permissionLabel =
    permissionState === 'granted' ? 'Enabled' : permissionState === 'denied' ? 'Denied' : 'Pending';
  const permissionAccent = permissionState === 'granted' ? 'green' : permissionState === 'denied' ? 'red' : 'gold';

  const enabledWindows = reminderPreferences.filter((preference) => preference.enabled);
  const summary = useMemo(() => {
    if (enabledWindows.length === 0) {
      return 'No reminders scheduled yet. Opt in to stay ahead of streak resets.';
    }

    return enabledWindows
      .map((window) => `${window.label} • ${formatWindowTime(window.hour, window.minute)}`)
      .join('  ·  ');
  }, [enabledWindows]);

  const togglesDisabled = !isHydrated || permissionState !== 'granted' || isScheduling;

  return (
    <View style={styles.overlay}>
      <Pressable accessibilityRole="button" style={StyleSheet.absoluteFill} onPress={() => router.back()} />
      <SafeAreaView style={styles.safeArea}>
        <NativeCard style={styles.card}>
          <View style={styles.header}>
            <NativeTypography variant="title" style={styles.heading}>
              Mission reminders
            </NativeTypography>
            <NativeTypography variant="caption" style={styles.subheading}>
              Status-aware nudges keep your streak alive without spamming.
            </NativeTypography>
          </View>

          <View style={styles.statusRow}>
            <NativeStatPill label="Permission" value={permissionLabel} accent={permissionAccent} />
            <NativeStatPill label="Windows" value={`${enabledWindows.length}/${availableWindows.length}`} accent="gold" />
          </View>
          {lastSyncedAt && (
            <NativeTypography variant="caption" style={styles.metaText}>
              Synced {formatTimestamp(lastSyncedAt)}
            </NativeTypography>
          )}
          {(isScheduling || isRegisteringToken) && (
            <NativeTypography variant="caption" style={styles.syncingText}>
              {isScheduling ? 'Updating local reminder queue…' : 'Registering push token with backend…'}
            </NativeTypography>
          )}

          <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.section}>
              <NativeTypography variant="eyebrow" style={styles.sectionLabel}>
                Reminder windows
              </NativeTypography>
              <NativeTypography variant="caption" style={styles.sectionHint}>
                Pick the times that work for you. We’ll handle the rest via Expo background tasks.
              </NativeTypography>
              <View style={styles.windowList}>
                {reminderPreferences.map((preference) => (
                  <ReminderWindowToggle
                    key={preference.id}
                    preference={preference}
                    disabled={togglesDisabled}
                    onToggle={async () => {
                      await toggleReminderWindow(preference.id, !preference.enabled);
                    }}
                  />
                ))}
              </View>
              <NativeTypography variant="caption" style={styles.summaryText}>
                {summary}
              </NativeTypography>
            </View>

            <View style={styles.section}>
              <NativeTypography variant="eyebrow" style={styles.sectionLabel}>
                Status & permissions
              </NativeTypography>
              {permissionState !== 'granted' && (
                <NativeTypography variant="caption" style={styles.permissionHint}>
                  Allow notifications to enable streak rescue reminders. If prompts do not appear, open iOS/Android
                  Settings ▸ Македонски and toggle notifications on.
                </NativeTypography>
              )}
              <NativeButton onPress={() => void requestPermission()} disabled={permissionState === 'granted'}>
                <NativeTypography variant="body" style={styles.primaryButtonText}>
                  {permissionState === 'granted' ? 'Notifications enabled' : 'Enable notifications'}
                </NativeTypography>
              </NativeButton>
              <NativeButton
                variant="secondary"
                onPress={() => void refreshScheduledReminders()}
                disabled={reminderWindows.length === 0 || isScheduling}
              >
                <NativeTypography variant="body" style={styles.secondaryButtonText}>
                  Sync reminders again
                </NativeTypography>
              </NativeButton>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <NativeButton variant="ghost" onPress={() => router.back()}>
              <NativeTypography variant="body" style={styles.closeButtonText}>
                Close
              </NativeTypography>
            </NativeButton>
          </View>
        </NativeCard>
      </SafeAreaView>
    </View>
  );
}

type ReminderWindowToggleProps = {
  preference: ReminderPreference;
  disabled: boolean;
  onToggle: () => Promise<void>;
};

function ReminderWindowToggle({ preference, disabled, onToggle }: ReminderWindowToggleProps) {
  const handleToggle = () => {
    if (disabled) {
      return;
    }
    void onToggle();
  };

  return (
    <NativeCard style={[styles.windowCard, preference.enabled && styles.windowCardEnabled]}>
      <Pressable
        accessibilityRole="switch"
        accessibilityState={{ checked: preference.enabled, disabled }}
        style={styles.windowContent}
        onPress={handleToggle}
        disabled={disabled}
      >
        <View style={{ flex: 1, gap: spacingScale.xs }}>
          <NativeTypography variant="body" style={styles.windowLabel}>
            {preference.label}
          </NativeTypography>
          <NativeTypography variant="caption" style={styles.windowTime}>
            {formatWindowTime(preference.hour, preference.minute)}
          </NativeTypography>
          <NativeTypography variant="caption" style={styles.windowDescription}>
            {preference.description}
          </NativeTypography>
        </View>
        <Switch
          value={preference.enabled}
          onValueChange={handleToggle}
          disabled={disabled}
          thumbColor={preference.enabled ? brandColors.red : '#fff'}
          trackColor={{ true: 'rgba(230,57,70,0.45)', false: 'rgba(16,24,40,0.25)' }}
        />
      </Pressable>
    </NativeCard>
  );
}

function formatWindowTime(hour: number, minute: number) {
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatTimestamp(isoDate: string) {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return 'recently';
  }
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
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
    gap: spacingScale.lg,
    maxHeight: '90%',
  },
  header: {
    gap: spacingScale.xs,
  },
  heading: {
    color: brandColors.navy,
  },
  subheading: {
    color: 'rgba(16,24,40,0.7)',
  },
  statusRow: {
    flexDirection: 'row',
    gap: spacingScale.sm,
    flexWrap: 'wrap',
  },
  metaText: {
    color: 'rgba(16,24,40,0.6)',
  },
  syncingText: {
    color: brandColors.red,
  },
  content: {
    gap: spacingScale.lg,
    paddingBottom: spacingScale.xl,
  },
  section: {
    gap: spacingScale.sm,
  },
  sectionLabel: {
    color: brandColors.red,
  },
  sectionHint: {
    color: 'rgba(16,24,40,0.6)',
  },
  windowList: {
    gap: spacingScale.sm,
  },
  windowCard: {
    padding: spacingScale.sm,
    borderRadius: spacingScale.lg,
  },
  windowCardEnabled: {
    borderWidth: 1,
    borderColor: brandColors.red,
    backgroundColor: 'rgba(230,57,70,0.08)',
  },
  windowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacingScale.sm,
  },
  windowLabel: {
    color: brandColors.navy,
  },
  windowTime: {
    color: brandColors.goldDark,
  },
  windowDescription: {
    color: 'rgba(16,24,40,0.65)',
  },
  summaryText: {
    color: 'rgba(16,24,40,0.65)',
  },
  permissionHint: {
    color: brandColors.navy,
  },
  primaryButtonText: {
    color: '#fff',
    textAlign: 'center',
  },
  secondaryButtonText: {
    color: brandColors.navy,
    textAlign: 'center',
  },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(16,24,40,0.1)',
    paddingTop: spacingScale.sm,
  },
  closeButtonText: {
    color: brandColors.navy,
    textAlign: 'center',
  },
});
