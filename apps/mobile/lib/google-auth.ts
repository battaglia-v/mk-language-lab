import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

// Complete any pending browser sessions
WebBrowser.maybeCompleteAuthSession();

// Google OAuth client IDs
// These should be set in environment variables for production
const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const GOOGLE_ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;
const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

// Check if the platform-specific credential is configured
export const isGoogleAuthConfigured = Platform.select({
  android: Boolean(GOOGLE_ANDROID_CLIENT_ID),
  ios: Boolean(GOOGLE_IOS_CLIENT_ID),
  web: Boolean(GOOGLE_WEB_CLIENT_ID),
  default: false,
}) ?? false;

if (!isGoogleAuthConfigured && __DEV__) {
  console.warn(
    '[GoogleAuth] No OAuth credentials configured for this platform. ' +
    'Google sign-in will be disabled.'
  );
}

// Type for the disabled auth state
export type GoogleAuthResult = {
  request: null;
  response: null;
  promptAsync: () => Promise<void>;
  isReady: false;
  isConfigured: false;
};

/**
 * Returns a disabled Google auth state.
 * Use this instead of useGoogleAuth when credentials are not configured.
 */
export function getDisabledGoogleAuth(): GoogleAuthResult {
  return {
    request: null,
    response: null,
    promptAsync: async () => {
      throw new Error('Google sign-in is not configured for this platform');
    },
    isReady: false,
    isConfigured: false,
  };
}

// Google auth response type (simplified since we're not using the hook)
export type GoogleAuthResponse = {
  type: 'success' | 'error' | 'cancel';
  authentication?: {
    idToken?: string;
    accessToken?: string;
  };
} | null;
