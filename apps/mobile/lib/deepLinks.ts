import { Linking } from 'react-native';
import { type Router } from 'expo-router';
import type { DiscoverLinkTarget } from '@mk/api-client';

export function mapWebPathToAppRoute(path: string): string {
  switch (path) {
    case '/practice':
      return '/(tabs)/practice';
    case '/translator/history':
      return '/(modals)/translator-history';
    case '/mission/settings':
      return '/(modals)/mission-settings';
    case '/profile':
    case '/profile/badges':
      return '/(tabs)/profile';
    default:
      return path.startsWith('/') ? path : `/${path}`;
  }
}

export function openDiscoverTarget(
  router: Router,
  target?: DiscoverLinkTarget,
  url?: string | null
) {
  switch (target) {
    case 'practice':
      router.push('/(tabs)/practice');
      return;
    case 'translator':
      router.push('/(modals)/translator-history');
      return;
    case 'profile':
      router.push('/(tabs)/profile');
      return;
    case 'discover':
      router.push('/(tabs)/discover');
      return;
    case 'mission-settings':
      router.push('/(modals)/mission-settings');
      return;
    case 'external':
      if (url) {
        void Linking.openURL(url);
      }
      return;
    default:
      if (url) {
        if (url.startsWith('http')) {
          void Linking.openURL(url);
        } else {
          router.push(mapWebPathToAppRoute(url));
        }
      } else {
        router.push('/(tabs)/practice');
      }
  }
}
