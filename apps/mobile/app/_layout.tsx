import { StatusBar } from 'expo-status-bar';
import { Stack } from 'expo-router';
import { AppThemeProvider } from '@mk/ui';
import { NotificationProvider } from '../lib/notifications';
import { TranslatorHistoryProvider } from '../lib/translator/history';
import { AuthProvider } from '../lib/auth';
import { MobileQueryClientProvider } from '../lib/queryClient';

export default function RootLayout() {
  return (
    <MobileQueryClientProvider>
      <AuthProvider>
        <NotificationProvider>
          <TranslatorHistoryProvider>
            <AppThemeProvider>
              <StatusBar style="light" />
              <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen
                name="(modals)"
                options={{
                  presentation: 'transparentModal',
                }}
              />
              <Stack.Screen
                name="sign-in"
                options={{
                  title: 'Sign in',
                  presentation: 'card',
                }}
              />
            </Stack>
          </AppThemeProvider>
        </TranslatorHistoryProvider>
      </NotificationProvider>
    </AuthProvider>
    </MobileQueryClientProvider>
  );
}
