import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '../store/auth';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { processQueue } from '../lib/offline-queue';

export default function RootLayout() {
  const { isLoading, initialize } = useAuthStore();

  useEffect(() => {
    initialize();

    // Process any queued practice completions on app start
    // Silent background operation - don't block UI
    processQueue()
      .then(({ success, failed }) => {
        if (success > 0 || failed > 0) {
          console.log(`[OfflineQueue] Processed: ${success} success, ${failed} failed`);
        }
      })
      .catch((err) => {
        console.warn('[OfflineQueue] Failed to process queue:', err);
      });
  }, [initialize]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f6d83b" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#06060b' },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="sign-in" />
        <Stack.Screen name="register" />
        <Stack.Screen name="forgot-password" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#06060b',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
