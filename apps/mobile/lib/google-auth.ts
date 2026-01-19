import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { Platform } from 'react-native';

// Complete any pending browser sessions
WebBrowser.maybeCompleteAuthSession();

// Google OAuth client IDs
// IMPORTANT: For Expo, we need the WEB client ID for the OAuth flow
// The Android/iOS client IDs are only for native SDK integration
const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const GOOGLE_ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;
const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

// For Expo auth, we need the WEB client ID regardless of platform
// The Android/iOS client IDs are for native verification only
export const isGoogleAuthConfigured = Boolean(GOOGLE_WEB_CLIENT_ID);

if (__DEV__) {
  console.log('[GoogleAuth] Platform:', Platform.OS);
  console.log('[GoogleAuth] Web Client ID:', GOOGLE_WEB_CLIENT_ID ? 'Set' : 'Not set');
  console.log('[GoogleAuth] Android Client ID:', GOOGLE_ANDROID_CLIENT_ID ? 'Set' : 'Not set');
  console.log('[GoogleAuth] iOS Client ID:', GOOGLE_IOS_CLIENT_ID ? 'Set' : 'Not set');
  console.log('[GoogleAuth] Configured:', isGoogleAuthConfigured);
}

// Type for the Google auth response
export type GoogleAuthResponse = {
  type: 'success' | 'error' | 'cancel';
  authentication?: {
    idToken?: string;
    accessToken?: string;
  };
  error?: Error;
} | null;

// Type for the auth hook result
export interface UseGoogleAuthResult {
  request: Google.GoogleAuthRequestConfig | null;
  response: GoogleAuthResponse;
  promptAsync: () => Promise<void>;
  isReady: boolean;
  isConfigured: boolean;
}

/**
 * Custom hook for Google authentication.
 * Always calls useAuthRequest (to satisfy React rules of hooks),
 * but returns disabled state if not configured.
 * 
 * IMPORTANT: We only use webClientId to force the web-based OAuth flow.
 * Passing androidClientId/iosClientId would trigger native SDK flow
 * which requires additional configuration in Google Cloud Console.
 */
export function useGoogleAuth(): UseGoogleAuthResult {
  // Always call the hook (React rules of hooks requirement)
  // Only use webClientId to force web-based OAuth flow via browser
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    // Don't pass androidClientId/iosClientId - this forces web flow
  });

  // If not configured, return disabled state
  if (!isGoogleAuthConfigured) {
    return {
      request: null,
      response: null,
      promptAsync: async () => {
        console.warn('[GoogleAuth] Not configured for this platform');
      },
      isReady: false,
      isConfigured: false,
    };
  }

  return {
    request: request as Google.GoogleAuthRequestConfig | null,
    response: response as GoogleAuthResponse,
    promptAsync: async () => {
      if (promptAsync) {
        await promptAsync();
      }
    },
    isReady: !!request,
    isConfigured: true,
  };
}

