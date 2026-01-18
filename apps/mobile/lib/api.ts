import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { getToken, setToken, clearAll } from './storage';

/**
 * Get the API base URL based on environment
 * 
 * For development:
 * - Set EXPO_PUBLIC_API_BASE_URL in your .env.local
 * - Or the app will use the production URL
 * 
 * Note: Expo Go on Android Emulator needs http://10.0.2.2:3000
 *       Expo Go on iOS Simulator needs http://localhost:3000
 *       Expo Go on physical device needs your computer's local IP
 */
function getApiBase(): string {
  // First check for explicitly set env var
  const envUrl = Constants.expoConfig?.extra?.apiBaseUrl;
  if (envUrl && envUrl !== 'https://mk-language-lab.vercel.app') {
    return envUrl;
  }

  // In development, use production API since localhost doesn't work well
  // with Expo Go without explicit IP configuration
  return 'https://mk-language-lab.vercel.app';
}

const API_BASE = getApiBase();

// Log the API base on init for debugging
if (__DEV__) {
  console.log('[API] Base URL:', API_BASE);
}

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface FetchOptions extends Omit<RequestInit, 'body'> {
  skipAuth?: boolean;
  body?: unknown;
  /** Skip automatic 401 retry (default: false) */
  skipRetry?: boolean;
}

// Track if we're currently refreshing to avoid parallel refresh attempts
let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

/**
 * Attempt to refresh the auth token
 * Returns true if refresh successful, false otherwise
 */
async function refreshToken(): Promise<boolean> {
  // If already refreshing, wait for that attempt
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const currentToken = await getToken();
      if (!currentToken) {
        return false;
      }

      // Call token refresh endpoint
      const response = await fetch(`${API_BASE}/api/mobile/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentToken}`,
        },
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      if (data.token) {
        await setToken(data.token);
        return true;
      }

      return false;
    } catch (error) {
      console.warn('[API] Token refresh failed:', error);
      return false;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function apiFetch<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { skipAuth, skipRetry, body, ...fetchOptions } = options;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  };

  if (!skipAuth) {
    const token = await getToken();
    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...fetchOptions,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  // Handle 401 with automatic retry
  if (response.status === 401 && !skipAuth && !skipRetry) {
    const refreshed = await refreshToken();
    
    if (refreshed) {
      // Retry the original request with new token
      const newToken = await getToken();
      if (newToken) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${newToken}`;
      }
      
      const retryResponse = await fetch(`${API_BASE}${endpoint}`, {
        ...fetchOptions,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      if (retryResponse.ok) {
        const contentType = retryResponse.headers.get('content-type');
        if (contentType?.includes('application/json')) {
          return retryResponse.json();
        }
        return {} as T;
      }
    }

    // Refresh failed or retry failed - clear auth and throw
    await clearAll();
    throw new AuthError('Session expired');
  }

  if (!response.ok) {
    const text = await response.text();
    throw new ApiError(response.status, text);
  }

  // Handle empty responses
  const contentType = response.headers.get('content-type');
  if (contentType?.includes('application/json')) {
    return response.json();
  }

  return {} as T;
}

export function getApiBaseUrl(): string {
  return API_BASE;
}
