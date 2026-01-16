import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';

// Complete any pending browser sessions
WebBrowser.maybeCompleteAuthSession();

// Google OAuth client IDs
// These should be set in environment variables for production
const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const GOOGLE_ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;
const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

export function useGoogleAuth() {
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID,
    iosClientId: GOOGLE_IOS_CLIENT_ID,
  });

  return {
    request,
    response,
    promptAsync,
    isReady: !!request,
  };
}

export type GoogleAuthResponse = typeof Google.useAuthRequest extends (
  ...args: unknown[]
) => [unknown, infer R, unknown]
  ? R
  : never;
