import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { NativeButton, NativeCard, NativeStatPill, NativeTypography } from '@mk/ui';
import { brandColors, spacingScale } from '@mk/tokens';

const TRANSLATOR_ENTRIES = [
  { id: 'greeting', phrase: '„Здраво, ќе се видиме подоцна.“', direction: 'Mk → En', minutesAgo: 2 },
  { id: 'coffee', phrase: '„Може ли две кафиња без шеќер?“', direction: 'Mk → En', minutesAgo: 30 },
  { id: 'idiom', phrase: '„It is raining cats and dogs.“', direction: 'En → Mk', minutesAgo: 90 },
  { id: 'travel', phrase: '„Каде е најблиската автобуска станица?“', direction: 'Mk → En', minutesAgo: 240 },
] as const;

export default function TranslatorHistoryModal() {
  const router = useRouter();

  return (
    <View style={styles.overlay}>
      <SafeAreaView style={styles.safeArea}>
        <NativeCard style={styles.card}>
          <NativeTypography variant="title" style={styles.title}>
            Translator Inbox
          </NativeTypography>
          <NativeTypography variant="caption" style={styles.subtitle}>
            Recent prompts you looked up on the go. Tap to pin favorites later.
          </NativeTypography>

          <ScrollView contentContainerStyle={styles.list}>
            {TRANSLATOR_ENTRIES.map((entry) => (
              <View key={entry.id} style={styles.entry}>
                <View style={{ flex: 1 }}>
                  <NativeTypography variant="body" style={styles.entryPhrase}>
                    {entry.phrase}
                  </NativeTypography>
                  <NativeTypography variant="caption" style={styles.entryMeta}>
                    {entry.direction} · {entry.minutesAgo} min ago
                  </NativeTypography>
                </View>
                <NativeStatPill label="Pin soon" value="Hold to save" accent="gold" />
              </View>
            ))}
          </ScrollView>

          <NativeButton onPress={() => router.back()}>
            <NativeTypography variant="body" style={styles.primaryButtonText}>
              Close
            </NativeTypography>
          </NativeButton>
        </NativeCard>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacingScale.xl,
  },
  safeArea: {
    width: '100%',
  },
  card: {
    padding: spacingScale.lg,
    borderRadius: spacingScale['2xl'],
    gap: spacingScale.md,
  },
  title: {
    color: brandColors.navy,
  },
  subtitle: {
    color: 'rgba(16,24,40,0.65)',
  },
  list: {
    gap: spacingScale.sm,
  },
  entry: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacingScale.sm,
    padding: spacingScale.sm,
    borderRadius: spacingScale.lg,
    backgroundColor: 'rgba(16,24,40,0.04)',
  },
  entryPhrase: {
    color: brandColors.navy,
  },
  entryMeta: {
    color: 'rgba(16,24,40,0.65)',
  },
  primaryButtonText: {
    color: '#fff',
  },
});
