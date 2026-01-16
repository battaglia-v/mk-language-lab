import type { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Macedonian Language Lab',
  slug: 'mk-language-lab',
  scheme: 'mklanguage',
  version: '2.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,

  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#06060b',
  },

  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.mklanguage.app',
  },

  android: {
    package: 'com.mklanguage.app', // CRITICAL: Match TWA for Play Store continuity
    versionCode: 200, // v2.0.0 = 200 (major*100 + minor*10 + patch)
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#06060b',
    },
    edgeToEdgeEnabled: true,
  },

  plugins: ['expo-router', 'expo-secure-store', 'expo-clipboard'],

  extra: {
    apiBaseUrl:
      process.env.EXPO_PUBLIC_API_BASE_URL ??
      'https://mk-language-lab.vercel.app',
    eas: {
      projectId: process.env.EAS_PROJECT_ID,
    },
  },

  experiments: {
    typedRoutes: true,
  },
});
