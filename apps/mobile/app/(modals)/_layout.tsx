import { Stack } from 'expo-router';

export default function ModalsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        presentation: 'transparentModal',
        contentStyle: { backgroundColor: 'transparent' },
      }}
    >
      <Stack.Screen name="practice-settings" />
      <Stack.Screen name="translator-history" />
      <Stack.Screen name="mission-settings" />
    </Stack>
  );
}
