import { SafeAreaView, StyleSheet, View } from 'react-native';
import { NativeTypography, NativeCard, NativeButton } from '@mk/ui';
import { spacingScale, brandColors } from '@mk/tokens';

export default function DiscoverScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <NativeTypography variant="hero" style={styles.hero}>
          Discover
        </NativeTypography>
        <NativeTypography variant="body" style={styles.body}>
          Culture drops, news feeds, and quests will surface here once the content API lands.
        </NativeTypography>
        <NativeCard style={styles.card}>
          <NativeTypography variant="title" style={styles.cardTitle}>
            Upcoming
          </NativeTypography>
          <NativeTypography variant="body" style={styles.cardBody}>
            Editorial cards, Instagram lessons, and Smart Review suggestions will populate this tab.
          </NativeTypography>
          <NativeButton variant="secondary" style={styles.cardButton}>
            <NativeTypography variant="body" style={styles.buttonLabel}>
              See Roadmap
            </NativeTypography>
          </NativeButton>
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
  card: { gap: spacingScale.sm },
  cardTitle: { color: brandColors.navy },
  cardBody: { color: 'rgba(16,24,40,0.8)' },
  cardButton: { marginTop: spacingScale.sm },
  buttonLabel: { color: brandColors.navy },
});
