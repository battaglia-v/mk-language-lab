import { useEffect } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet } from 'react-native';

export default function AuthCallbackScreen() {
  useEffect(() => {
    // AuthSession handles the redirect; this screen exists to avoid a blank state if opened directly.
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ActivityIndicator />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
