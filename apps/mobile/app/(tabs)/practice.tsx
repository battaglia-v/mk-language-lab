import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PracticeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Practice</Text>
        <Text style={styles.subtitle}>Practice sessions coming in Phase 63</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#06060b',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f7f8fb',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(247,248,251,0.72)',
    textAlign: 'center',
  },
});
