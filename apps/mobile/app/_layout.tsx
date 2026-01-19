import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Linking from 'expo-linking';
import { useAuthStore } from '../store/auth';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { processQueue } from '../lib/offline-queue';
import { initializeTheme } from '../lib/theme';
import { ToastProvider } from '../lib/toast';
import { initializeNotifications } from '../lib/notifications';
// Offline toast disabled - was too intrusive
// import { useNetworkState } from '../lib/offline';
// import { OfflineStatusToast } from '../components/OfflineStatusToast';
import { XPNotificationProvider } from '../components/XPNotification';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { AchievementToastProvider } from '../components/AchievementToast';
import { LevelUpProvider } from '../components/LevelUpCelebration';

export default function RootLayout() {
  const { isLoading, initialize } = useAuthStore();

  useEffect(() => {
    // Initialize auth
    initialize();

    // Initialize theme
    initializeTheme();

    // Initialize push notifications
    initializeNotifications()
      .then(() => console.log('[App] Notifications initialized'))
      .catch((err) => console.warn('[App] Notification init failed:', err));

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

    // Handle deep links for auth callbacks
    const handleDeepLink = (event: { url: string }) => {
      const url = event.url;
      console.log('[DeepLink] Received:', url);
      
      // Handle auth callback deep links
      // URL format: mklanguage://auth/callback?token=xxx&expiresAt=xxx
      if (url.includes('auth/callback')) {
        const parsed = Linking.parse(url);
        const token = parsed.queryParams?.token as string | undefined;
        const expiresAt = parsed.queryParams?.expiresAt as string | undefined;
        
        if (token) {
          // Token will be handled by the auth store
          console.log('[DeepLink] Auth callback received');
        }
      }
    };

    // Listen for deep links while app is running
    const subscription = Linking.addEventListener('url', handleDeepLink);

    // Check if app was opened with a deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    return () => {
      subscription.remove();
    };
  }, [initialize]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f6d83b" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <ToastProvider>
          <XPNotificationProvider>
            <AchievementToastProvider>
              <LevelUpProvider>
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
              <Stack.Screen
                name="settings"
                options={{
                  presentation: 'card',
                  animation: 'slide_from_right',
                }}
              />
              <Stack.Screen
                name="practice/word-sprint"
                options={{
                  presentation: 'card',
                  animation: 'slide_from_bottom',
                }}
              />
              <Stack.Screen
                name="saved-words"
                options={{
                  presentation: 'card',
                  animation: 'slide_from_right',
                }}
              />
              <Stack.Screen
                name="onboarding"
                options={{
                  presentation: 'fullScreenModal',
                  animation: 'fade',
                }}
              />
              <Stack.Screen
                name="achievements"
                options={{
                  presentation: 'card',
                  animation: 'slide_from_right',
                }}
              />
              <Stack.Screen
                name="news"
                options={{
                  presentation: 'card',
                  animation: 'slide_from_right',
                }}
              />
              <Stack.Screen
                name="news-reader"
                options={{
                  presentation: 'card',
                  animation: 'slide_from_right',
                }}
              />
              <Stack.Screen
                name="analyzer"
                options={{
                  presentation: 'card',
                  animation: 'slide_from_right',
                }}
              />
              <Stack.Screen
                name="translator"
                options={{
                  presentation: 'card',
                  animation: 'slide_from_right',
                }}
              />
              <Stack.Screen
                name="help"
                options={{
                  presentation: 'card',
                  animation: 'slide_from_right',
                }}
              />
            </Stack>
              </LevelUpProvider>
            </AchievementToastProvider>
          </XPNotificationProvider>
        </ToastProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
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
