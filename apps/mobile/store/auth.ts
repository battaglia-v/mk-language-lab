import { create } from 'zustand';
import {
  getToken,
  setToken,
  clearToken,
  getUser,
  setUser,
  clearAll,
  StoredUser,
} from '../lib/storage';
import { apiFetch, getApiBaseUrl, AuthError, ApiError } from '../lib/api';

interface AuthState {
  user: StoredUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;

  // Actions
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: (idToken: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

interface AuthResponse {
  user: StoredUser;
  token: string;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,

  initialize: async () => {
    try {
      const [token, user] = await Promise.all([getToken(), getUser()]);

      if (token && user) {
        // Validate token by fetching current user
        try {
          const currentUser = await apiFetch<StoredUser>('/api/profile');
          await setUser(currentUser);
          set({ user: currentUser, isAuthenticated: true, isLoading: false });
        } catch (err) {
          // Token invalid, clear everything
          if (err instanceof AuthError) {
            await clearAll();
            set({ user: null, isAuthenticated: false, isLoading: false });
          } else {
            // Network error, use cached user
            set({ user, isAuthenticated: true, isLoading: false });
          }
        }
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  signIn: async (email, password) => {
    set({ error: null });

    try {
      // Use dedicated mobile auth endpoint (not NextAuth callback)
      const response = await fetch(
        `${getApiBaseUrl()}/api/mobile/auth/login`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Invalid email or password');
      }

      const data = (await response.json()) as AuthResponse;

      if (data.token && data.user) {
        await setToken(data.token);
        await setUser(data.user);
        set({ user: data.user, isAuthenticated: true });
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Sign in failed. Please try again.';
      set({ error: message });
      throw err;
    }
  },

  signInWithGoogle: async (idToken) => {
    set({ error: null });

    try {
      // Use dedicated mobile Google auth endpoint
      const response = await fetch(
        `${getApiBaseUrl()}/api/mobile/auth/google`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken }),
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Google sign-in failed');
      }

      const data = (await response.json()) as AuthResponse;

      if (data.token && data.user) {
        await setToken(data.token);
        await setUser(data.user);
        set({ user: data.user, isAuthenticated: true });
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Google sign-in failed. Please try again.';
      set({ error: message });
      throw err;
    }
  },

  signOut: async () => {
    await clearAll();
    set({ user: null, isAuthenticated: false, error: null });
  },

  clearError: () => {
    set({ error: null });
  },
}));
