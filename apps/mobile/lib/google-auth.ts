import { useEffect, useState, useCallback } from 'react';
import {
  GoogleSignin,
  statusCodes,
  isErrorWithCode,
} from '@react-native-google-signin/google-signin';

// Google OAuth client IDs
const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

// Configure Google Sign-In on module load
// We use the Web Client ID for token exchange with our backend
if (GOOGLE_WEB_CLIENT_ID) {
  GoogleSignin.configure({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    offlineAccess: true,
  });
}

export const isGoogleAuthConfigured = Boolean(GOOGLE_WEB_CLIENT_ID);

if (__DEV__) {
  console.log('[GoogleAuth] Web Client ID:', GOOGLE_WEB_CLIENT_ID ? 'Set' : 'Not set');
  console.log('[GoogleAuth] Configured:', isGoogleAuthConfigured);
}

// Type for the Google auth response
export type GoogleAuthResponse = {
  type: 'success' | 'error' | 'cancel';
  idToken?: string;
  accessToken?: string;
  error?: Error;
};

// Type for the auth hook result
export interface UseGoogleAuthResult {
  signIn: () => Promise<GoogleAuthResponse>;
  signOut: () => Promise<void>;
  isSigningIn: boolean;
  isConfigured: boolean;
}

/**
 * Custom hook for native Google Sign-In.
 * Uses @react-native-google-signin for seamless in-app authentication.
 */
export function useGoogleAuth(): UseGoogleAuthResult {
  const [isSigningIn, setIsSigningIn] = useState(false);

  const signIn = useCallback(async (): Promise<GoogleAuthResponse> => {
    if (!isGoogleAuthConfigured) {
      return {
        type: 'error',
        error: new Error('Google Sign-In is not configured'),
      };
    }

    setIsSigningIn(true);

    try {
      // Check if Google Play Services are available
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

      // Sign in
      const userInfo = await GoogleSignin.signIn();

      // Get tokens
      const tokens = await GoogleSignin.getTokens();

      console.log('[GoogleAuth] Sign-in successful');

      return {
        type: 'success',
        idToken: userInfo.data?.idToken || tokens.idToken,
        accessToken: tokens.accessToken,
      };
    } catch (error) {
      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.SIGN_IN_CANCELLED:
            console.log('[GoogleAuth] User cancelled sign-in');
            return { type: 'cancel' };

          case statusCodes.IN_PROGRESS:
            console.log('[GoogleAuth] Sign-in already in progress');
            return { type: 'error', error: new Error('Sign-in already in progress') };

          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            console.error('[GoogleAuth] Play Services not available');
            return { type: 'error', error: new Error('Google Play Services not available') };

          default:
            console.error('[GoogleAuth] Unknown error:', error);
            return { type: 'error', error: error as Error };
        }
      }

      console.error('[GoogleAuth] Error:', error);
      return { type: 'error', error: error as Error };
    } finally {
      setIsSigningIn(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await GoogleSignin.signOut();
      console.log('[GoogleAuth] Signed out');
    } catch (error) {
      console.error('[GoogleAuth] Sign-out error:', error);
    }
  }, []);

  return {
    signIn,
    signOut,
    isSigningIn,
    isConfigured: isGoogleAuthConfigured,
  };
}
