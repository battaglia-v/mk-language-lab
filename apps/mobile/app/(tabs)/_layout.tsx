import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import { brandColors } from '@mk/tokens';

const tabIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
  home: 'home',
  practice: 'school',
  translator: 'language',
  reader: 'book',
  discover: 'compass',
  profile: 'person-circle',
};

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: brandColors.red,
        tabBarInactiveTintColor: 'rgba(247,248,251,0.6)',
        tabBarStyle: {
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderTopWidth: 1,
          borderTopColor: 'rgba(0,0,0,0.08)',
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          paddingTop: 8,
          paddingBottom: 8,
          height: 70,
        },
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={tabIcons[route.name] ?? 'ellipse'} size={size} color={color} />
        ),
      })}
    >
      <Tabs.Screen name="home" options={{ title: 'Home' }} />
      <Tabs.Screen name="practice" options={{ title: 'Practice' }} />
      <Tabs.Screen name="translator" options={{ title: 'Translator' }} />
      <Tabs.Screen name="reader" options={{ title: 'Reader' }} />
      <Tabs.Screen name="discover" options={{ title: 'Discover' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
