import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';
import { useQueryClient } from '@tanstack/react-query';
import { loginWithEmailPassword, fetchMobileUser } from './mobileAuthApi';
import { setStoredAuthToken } from './tokenStore';
import { requireApiBaseUrl } from '../api';

WebBrowser.maybeCompleteAuthSession();

type AuthStatus = 'unknown' | 'authenticated' | 'unauthenticated';

export type AuthUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

type SignInParams = {
  email: string;
  password: string;
};

type SignInResult = {
  ok: boolean;
  error?: string;
};

type AuthContextValue = {
  status: AuthStatus;
  user: AuthUser | null;
  authToken: string | null;
  isHydrated: boolean;
  isWorking: boolean;
  error: string | null;
  signInWithCredentials: (params: SignInParams) => Promise<SignInResult>;
  signInWithBrowser: () => Promise<SignInResult>;
  signOut: () => Promise<void>;
  clearError: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_STORAGE_KEY = '@mkll/auth/token';
const AUTH_SESSION_REDIRECT_PATH = 'auth';

export function AuthProvider({ children }: PropsWithChildren) {
  const [status, setStatus] = useState<AuthStatus>('unknown');
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isWorking, setIsWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const hydrateUserFromToken = useCallback(
    async (token: string) => {
      try {
        const remoteUser = await fetchMobileUser(token);
        if (remoteUser) {
          setUser(remoteUser);
          setStatus('authenticated');
          await queryClient.invalidateQueries();
        } else {
          await clearStoredToken();
          setAuthToken(null);
          setStoredAuthToken(null);
          setUser(null);
          setStatus('unauthenticated');
        }
      } catch (err) {
        console.warn('[auth] Failed to hydrate user', err);
        setUser(null);
        setStatus('unauthenticated');
      } finally {
        setIsHydrated(true);
      }
    },
    [queryClient]
  );

  useEffect(() => {
    (async () => {
      const storedToken = await readStoredToken();
      if (!storedToken) {
        setStatus('unauthenticated');
        setIsHydrated(true);
        return;
      }
      setAuthToken(storedToken);
      setStoredAuthToken(storedToken);
      await hydrateUserFromToken(storedToken);
    })().catch((hydrateError) => {
      console.warn('[auth] Failed to hydrate session', hydrateError);
      setStatus('unauthenticated');
      setAuthToken(null);
      setStoredAuthToken(null);
      setIsHydrated(true);
    });
  }, [hydrateUserFromToken]);

  const persistToken = useCallback(async (token: string | null) => {
    setStoredAuthToken(token);
    if (!token) {
      await clearStoredToken();
      return;
    }
    await storeToken(token);
  }, []);

  const signInWithCredentials = useCallback(
    async ({ email, password }: SignInParams): Promise<SignInResult> => {
      setIsWorking(true);
      setError(null);
      try {
        const response = await loginWithEmailPassword({ email, password });
        await persistToken(response.token);
        setAuthToken(response.token);
        await hydrateUserFromToken(response.token);
        return { ok: true };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to sign in';
        setError(message);
        setUser(null);
        setStatus('unauthenticated');
        setAuthToken(null);
        await persistToken(null);
        return { ok: false, error: message };
      } finally {
        setIsWorking(false);
      }
    },
    [hydrateUserFromToken, persistToken]
  );

  const signOut = useCallback(async () => {
    setIsWorking(true);
    setError(null);
    try {
      setUser(null);
      setStatus('unauthenticated');
      setAuthToken(null);
      await persistToken(null);
      queryClient.clear();
    } finally {
      setIsWorking(false);
    }
  }, [persistToken, queryClient]);

  const signInWithBrowser = useCallback(async (): Promise<SignInResult> => {
    setIsWorking(true);
    setError(null);
    try {
      const baseUrl = requireApiBaseUrl();
      const redirectUri = AuthSession.makeRedirectUri({
        scheme: Constants.expoConfig?.scheme ?? 'mkll',
        path: AUTH_SESSION_REDIRECT_PATH,
        preferLocalhost: true,
      });
      const callbackUrl = buildExpoCallbackUrl(baseUrl, redirectUri);
      const authUrl = `${baseUrl}/api/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`;

      const result = await AuthSession.startAsync({
        authUrl,
        returnUrl: redirectUri,
      });

      if (result.type !== 'success') {
        const message =
          result.type === 'dismiss' || result.type === 'cancel'
            ? 'Sign-in cancelled.'
            : 'Unable to complete browser sign-in.';
        setError(message);
        return { ok: false, error: message };
      }

      const parsedUrl = result.url ? new URL(result.url) : null;
      const token = parsedUrl?.searchParams.get('token');
      const errorParam = parsedUrl?.searchParams.get('error');
      if (errorParam || !token) {
        const message = errorParam ?? 'Missing auth token in callback.';
        setError(message);
        return { ok: false, error: message };
      }

      await persistToken(token);
      setAuthToken(token);
      await hydrateUserFromToken(token);
      return { ok: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to complete browser sign-in.';
      setError(message);
      return { ok: false, error: message };
    } finally {
      setIsWorking(false);
    }
  }, [hydrateUserFromToken, persistToken]);

  const clearError = useCallback(() => setError(null), []);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      authToken,
      isHydrated,
      isWorking,
      error,
      signInWithCredentials,
      signInWithBrowser,
      signOut,
      clearError,
    }),
    [authToken, clearError, error, isHydrated, isWorking, signInWithBrowser, signInWithCredentials, signOut, status, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

async function storeToken(token: string) {
  try {
    if (Platform.OS !== 'web' && (await SecureStore.isAvailableAsync())) {
      await SecureStore.setItemAsync(TOKEN_STORAGE_KEY, token, { keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK });
      return;
    }
  } catch (error) {
    console.warn('[auth] Failed to store token in SecureStore', error);
  }
  await AsyncStorage.setItem(TOKEN_STORAGE_KEY, token);
}

async function readStoredToken() {
  try {
    if (Platform.OS !== 'web' && (await SecureStore.isAvailableAsync())) {
      const value = await SecureStore.getItemAsync(TOKEN_STORAGE_KEY);
      if (value) {
        return value;
      }
    }
  } catch (error) {
    console.warn('[auth] Failed to read token from SecureStore', error);
  }
  const fallback = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
  return fallback;
}

async function clearStoredToken() {
  try {
    if (Platform.OS !== 'web' && (await SecureStore.isAvailableAsync())) {
      await SecureStore.deleteItemAsync(TOKEN_STORAGE_KEY);
    }
  } catch (error) {
    console.warn('[auth] Failed to clear SecureStore token', error);
  }
  await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
}

function buildExpoCallbackUrl(baseUrl: string, redirectUri: string) {
  const callbackUrl = new URL('/api/mobile/auth/expo-complete', baseUrl);
  callbackUrl.searchParams.set('redirect_uri', redirectUri);
  return callbackUrl.toString();
}
