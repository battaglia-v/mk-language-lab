import { useMemo } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { useRouter } from 'expo-router';
import { NativeButton, NativeCard, NativeStatPill, NativeTypography } from '@mk/ui';
import { brandColors, spacingScale } from '@mk/tokens';
import { useNotifications } from '../../lib/notifications/NotificationProvider';
import type { ReminderWindowOption } from '../../lib/notifications/useNotificationSettings';

export default function MissionSettingsModal() {
  const router = useRouter();
  const {
    permissionStatus,
    isHydrated,
    isScheduling,
    isRegisteringToken,
    reminderWindows,
    availableWindows,
    lastScheduledAt,
    requestPermission,
    toggleReminderWindow,
    refreshScheduledReminders,
  } = useNotifications();

  const permissionLabel =
    permissionStatus === 'granted' ? 'Enabled' : permissionStatus === 'denied' ? 'Denied' : 'Pending';
  const permissionAccent = permissionStatus === 'granted' ? 'green' : permissionStatus === 'denied' ? 'red' : 'gold';

  const reminderSummary = useMemo(() => {
    if (reminderWindows.length === 0) {
      return 'No reminders scheduled yet. Pick at least one window to receive streak nudges.';
    }
    const parts = reminderWindows
      .map((id) => {
        const option = availableWindows.find((window) => window.id === id);
        if (!option) {
          return id;
        }
        return `${option.label} • ${formatWindowTime(option.hour, option.minute)}`;
      })
      .join('  ·  ');
    return parts;
  }, [availableWindows, reminderWindows]);

  const togglesDisabled = !isHydrated || permissionStatus !== 'granted' || isScheduling;

  const handleRequestPermission = async () => {
    await requestPermission();
  };

  const handleSyncReminders = async () => {
    await refreshScheduledReminders();
  };

  return (
    <View style={styles.overlay}>
      <Pressable style={StyleSheet.absoluteFill} onPress={() => router.back()} accessibilityRole="button" />
      <SafeAreaView style={styles.safeArea}>
        <NativeCard style={styles.card}>
          <View style={styles.header}>
            <NativeTypography variant="title" style={styles.heading}>
              Mission reminders
            </NativeTypography>
            <NativeTypography variant="caption" style={styles.subheading}>
              Daily nudges that rescue your streak and keep the mission front and center.
            </NativeTypography>
          </View>

          <View style={styles.statusRow}>
            <NativeStatPill label="Permission" value={permissionLabel} accent={permissionAccent} />
            <NativeStatPill label="Windows" value={`${reminderWindows.length}/3`} accent="gold" />
          </View>
          {lastScheduledAt && (
            <NativeTypography variant="caption" style={styles.scheduleMeta}>
              Synced {formatLastScheduled(lastScheduledAt)}
            </NativeTypography>
          )}
          {(isScheduling || isRegisteringToken) && (
            <NativeTypography variant="caption" style={styles.syncingText}>
              {isScheduling ? 'Updating local reminder schedule…' : 'Syncing push token with the server…'}
            </NativeTypography>
          )}

          <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.section}>
              <NativeTypography variant="eyebrow" style={styles.sectionLabel}>
                Reminder windows
              </NativeTypography>
              <NativeTypography variant="caption" style={styles.sectionHint}>
                Choose up to two preferred times. We’ll send a friendly ping each day.
              </NativeTypography>
              <View style={styles.windowList}>
                {availableWindows.map((option) => (
                  <ReminderWindowToggle
                    key={option.id}
                    option={option}
                    enabled={reminderWindows.includes(option.id)}
                    disabled={togglesDisabled}
                    onToggle={() => toggleReminderWindow(option.id)}
                  />
                ))}
              </View>
              <NativeTypography variant="caption" style={styles.summaryText}>
                {reminderSummary}
              </NativeTypography>
            </View>

            <View style={styles.section}>
              <NativeTypography variant="eyebrow" style={styles.sectionLabel}>
                Status & controls
              </NativeTypography>
              {permissionStatus !== 'granted' && (
                <NativeTypography variant="caption" style={styles.permissionHint}>
                  Enable notifications to unlock streak reminders. iOS users may need to allow alerts in Settings ▸
                  Македонски.
                </NativeTypography>
              )}
              <NativeButton onPress={handleRequestPermission} disabled={permissionStatus === 'granted'}>
                <NativeTypography variant="body" style={styles.primaryButtonText}>
                  {permissionStatus === 'granted' ? 'Notifications enabled' : 'Enable notifications'}
                </NativeTypography>
              </NativeButton>
              <NativeButton
                variant="secondary"
                onPress={handleSyncReminders}
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
  option: ReminderWindowOption;
  enabled: boolean;
  disabled: boolean;
  onToggle: () => Promise<void> | void;
};

function ReminderWindowToggle({ option, enabled, disabled, onToggle }: ReminderWindowToggleProps) {
  const handleToggle = () => {
    if (disabled) {
      return;
    }
    void onToggle();
  };

  return (
    <NativeCard style={[styles.windowCard, enabled && styles.windowCardEnabled]}>
      <Pressable
        accessibilityRole="switch"
        accessibilityState={{ checked: enabled, disabled }}
        style={styles.windowContent}
        onPress={handleToggle}
        disabled={disabled}
      >
        <View style={{ flex: 1, gap: spacingScale.xs }}>
          <NativeTypography variant="body" style={styles.windowLabel}>
            {option.label}
          </NativeTypography>
          <NativeTypography variant="caption" style={styles.windowTime}>
            {formatWindowTime(option.hour, option.minute)}
          </NativeTypography>
          <NativeTypography variant="caption" style={styles.windowDescription}>
            {option.description}
          </NativeTypography>
        </View>
        <Switch
          value={enabled}
          onValueChange={handleToggle}
          disabled={disabled}
          thumbColor={enabled ? brandColors.red : '#fff'}
          trackColor={{ true: 'rgba(230,57,70,0.5)', false: 'rgba(16,24,40,0.25)' }}
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

function formatLastScheduled(isoDate: string) {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return 'recently';
  }
  return date.toLocaleString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    month: 'short',
    day: 'numeric',
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
  scheduleMeta: {
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
