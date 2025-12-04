import type { ConfigContext, ExpoConfig } from 'expo/config';

const APP_NAME = 'Македонски • MK Language Lab';
const APP_SLUG = 'makedonski-mk-language-lab';
const APP_SCHEME = 'mkll';
const DEFAULT_EAS_PROJECT_ID = '5c712af3-a6e9-462d-8243-a119b56af569';

export default ({ config }: ConfigContext): ExpoConfig => {
  const projectId = process.env.EXPO_PUBLIC_PROJECT_ID ?? process.env.EAS_PROJECT_ID ?? DEFAULT_EAS_PROJECT_ID;

  return {
    ...config,
    name: APP_NAME,
    slug: APP_SLUG,
    scheme: APP_SCHEME,
    version: '1.0.1',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    newArchEnabled: true,
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.mk.language.lab',
    },
    android: {
      package: 'com.mk.language.lab',
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
    },
    web: {
      favicon: './assets/favicon.png',
    },
    plugins: [
      'expo-router',
      [
        'expo-notifications',
        {
          icon: './assets/icon.png',
          color: '#E63946',
        },
      ],
      'expo-secure-store',
    ],
    extra: {
      ...config.extra,
      apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? '',
      environment: process.env.EXPO_PUBLIC_ENV ?? 'dev',
      projectId,
      eas: {
        projectId,
      },
    },
    experiments: {
      typedRoutes: true,
    },
  };
};
