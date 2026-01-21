import type { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Macedonian Language Lab',
  slug: 'makedonski-mk-language-lab',
  scheme: 'mklanguage',
  version: '2.3.0',
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
    versionCode: 230, // v2.3.0 = 230 (major*100 + minor*10 + patch)
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#06060b',
    },
    edgeToEdgeEnabled: true,
  },

  plugins: [
    'expo-router',
    'expo-secure-store',
    '@react-native-google-signin/google-signin',
  ],

  extra: {
    apiBaseUrl:
      process.env.EXPO_PUBLIC_API_BASE_URL ??
      'https://mk-language-lab.vercel.app',
    eas: {
      projectId: '5c712af3-a6e9-462d-8243-a119b56af569',
    },
  },

  experiments: {
    typedRoutes: true,
  },
});
