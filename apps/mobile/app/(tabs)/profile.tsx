import { SafeAreaView, StyleSheet, View } from 'react-native';
import { NativeTypography, NativeCard, NativeStatPill } from '@mk/ui';
import { brandColors, spacingScale } from '@mk/tokens';

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <NativeTypography variant="hero" style={styles.hero}>
          Sofia Koleva
        </NativeTypography>
        <NativeTypography variant="body" style={styles.body}>
          Account settings, streak history, and badges will arrive soon. For now, enjoy this preview.
        </NativeTypography>
        <NativeCard style={styles.statCard}>
          <View style={styles.statRow}>
            <NativeStatPill label="XP" value="12,450" accent="green" />
            <NativeStatPill label="Level" value="Intermediate" accent="gold" />
          </View>
          <View style={styles.statRow}>
            <NativeStatPill label="Streak" value="21 days" />
            <NativeStatPill label="Quests" value="3 active" accent="red" />
          </View>
        </NativeCard>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: brandColors.cream },
  container: { flex: 1, padding: spacingScale.xl, gap: spacingScale.lg },
  hero: { color: brandColors.navy },
  body: { color: 'rgba(16,24,40,0.85)' },
  statCard: { gap: spacingScale.sm },
  statRow: { flexDirection: 'row', gap: spacingScale.sm, flexWrap: 'wrap' },
});
