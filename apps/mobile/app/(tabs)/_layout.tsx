import { Tabs } from 'expo-router';
import { Home, Languages, Sparkles, BookOpen, FolderOpen } from 'lucide-react-native';
import { useTranslations } from '../../lib/i18n';
import { haptic } from '../../lib/haptics';

/**
 * Tab Layout - Matches PWA's shellNavItems order
 * 
 * PWA tabs: Learn (Home), Translate, Practice, Reader, Resources
 * Profile is accessed via header/settings, not a tab
 * 
 * @see PARITY_CHECKLIST.md - Navigation parity
 * @see components/shell/navItems.ts (PWA implementation)
 */
export default function TabLayout() {
  const t = useTranslations('nav');

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0b0b12',
          borderTopColor: '#222536',
          height: 80,
          paddingBottom: 20,
          paddingTop: 10,
        },
        tabBarActiveTintColor: '#f6d83b',
        tabBarInactiveTintColor: 'rgba(247,248,251,0.5)',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
      screenListeners={{
        tabPress: () => {
          // Trigger haptic feedback on tab press
          haptic.selection();
        },
      }}
    >
      {/* Tab order matches PWA: Learn, Translate, Practice, Reader, Resources */}
      <Tabs.Screen
        name="index"
        options={{
          href: null, // Redirect handled in index.tsx
        }}
      />
      <Tabs.Screen
        name="learn"
        options={{
          title: t('learn'),
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="translate"
        options={{
          title: t('translate'),
          tabBarIcon: ({ color, size }) => <Languages color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="practice"
        options={{
          title: t('practice'),
          tabBarIcon: ({ color, size }) => <Sparkles color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="reader"
        options={{
          title: t('reader'),
          tabBarIcon: ({ color, size }) => <BookOpen color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="resources"
        options={{
          title: t('resources'),
          tabBarIcon: ({ color, size }) => <FolderOpen color={color} size={size} />,
        }}
      />
      {/* Profile is now accessed via settings, not a tab - matches PWA */}
      <Tabs.Screen
        name="profile"
        options={{
          href: null, // Hide from tab bar
        }}
      />
    </Tabs>
  );
}
