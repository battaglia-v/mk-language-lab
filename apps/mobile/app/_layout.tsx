import { useMemo } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppThemeProvider } from '@mk/ui';
import { NotificationProvider } from '../lib/notifications';

export default function RootLayout() {
  const queryClient = useMemo(() => new QueryClient(), []);

  return (
    <QueryClientProvider client={queryClient}>
      <NotificationProvider>
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
          </Stack>
        </AppThemeProvider>
      </NotificationProvider>
    </QueryClientProvider>
  );
}
