import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';

// Complete any pending browser sessions
WebBrowser.maybeCompleteAuthSession();

// Google OAuth client IDs
// These should be set in environment variables for production
const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const GOOGLE_ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;
const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

// Check if any OAuth credentials are configured
const hasCredentials = Boolean(
  GOOGLE_WEB_CLIENT_ID || GOOGLE_ANDROID_CLIENT_ID || GOOGLE_IOS_CLIENT_ID
);

if (!hasCredentials && process.env.NODE_ENV !== 'production') {
  console.warn(
    '[GoogleAuth] No OAuth credentials configured. Set EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID, ' +
    'EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID, or EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID.'
  );
}

/**
 * Hook for Google OAuth authentication
 * 
 * Always calls the underlying hook to satisfy rules-of-hooks,
 * but returns disabled state if credentials aren't configured.
 */
export function useGoogleAuth() {
  // Always call the hook unconditionally to satisfy rules-of-hooks
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID,
    iosClientId: GOOGLE_IOS_CLIENT_ID,
  });

  // If no credentials configured, return disabled state
  if (!hasCredentials) {
    return {
      request: null,
      response: null,
      promptAsync: async () => {
        throw new Error('Google sign-in is not configured');
      },
      isReady: false,
      isConfigured: false,
    };
  }

  return {
    request,
    response,
    promptAsync,
    isReady: !!request,
    isConfigured: true,
  };
}

export type GoogleAuthResponse = typeof Google.useAuthRequest extends (
  ...args: unknown[]
) => [unknown, infer R, unknown]
  ? R
  : never;
