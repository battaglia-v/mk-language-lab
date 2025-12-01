import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { NativeButton, NativeCard, NativeStatPill, NativeTypography } from '@mk/ui';
import { brandColors, spacingScale } from '@mk/tokens';
import { useTranslatorHistory } from '../../lib/translator/history';

export default function TranslatorHistoryModal() {
  const router = useRouter();
  const { history, isHydrated } = useTranslatorHistory();
  const directionLabel = (id: 'en-mk' | 'mk-en') => (id === 'en-mk' ? 'EN → MK' : 'MK → EN');

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

          {!isHydrated ? (
            <NativeTypography variant="body" style={styles.subtitle}>
              Loading your recent translations…
            </NativeTypography>
          ) : history.length === 0 ? (
            <NativeTypography variant="body" style={styles.subtitle}>
              No translations yet. Your next lookup will appear here.
            </NativeTypography>
          ) : (
            <ScrollView contentContainerStyle={styles.list}>
              {history.map((entry) => (
                <View key={entry.id} style={styles.entry}>
                  <View style={{ flex: 1 }}>
                    <NativeTypography variant="body" style={styles.entryPhrase}>
                      {entry.sourceText}
                    </NativeTypography>
                    <NativeTypography variant="caption" style={styles.entryMeta}>
                      {directionLabel(entry.directionId)} ·{' '}
                      {new Date(entry.timestamp).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </NativeTypography>
                    <NativeTypography variant="caption" style={styles.resultText}>
                      {entry.translatedText}
                    </NativeTypography>
                  </View>
                  <NativeStatPill
                    label="Detected"
                    value={entry.detectedLanguage ? entry.detectedLanguage.toUpperCase() : 'Auto'}
                    accent="gold"
                  />
                </View>
              ))}
            </ScrollView>
          )}

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
    color: 'rgba(247,248,251,0.65)',
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
    color: 'rgba(247,248,251,0.65)',
  },
  resultText: {
    color: brandColors.navy,
  },
  primaryButtonText: {
    color: '#fff',
  },
});
