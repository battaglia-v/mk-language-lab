import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import { brandColors } from '@mk/tokens';

const tabIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
  home: 'home',
  practice: 'flash',
  translator: 'language',
  discover: 'compass',
  profile: 'person-circle',
};

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: brandColors.red,
        tabBarInactiveTintColor: 'rgba(16,24,40,0.6)',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: 'rgba(0,0,0,0.05)',
        },
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={tabIcons[route.name] ?? 'ellipse'} size={size} color={color} />
        ),
      })}
    >
      <Tabs.Screen name="home" options={{ title: 'Home' }} />
      <Tabs.Screen name="practice" options={{ title: 'Practice' }} />
      <Tabs.Screen name="translator" options={{ title: 'Translator' }} />
      <Tabs.Screen name="discover" options={{ title: 'Discover' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
