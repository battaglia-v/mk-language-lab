/**
 * Auth guard hook for React Native
 * 
 * Protects routes that require authentication
 * Redirects to sign-in if not authenticated
 * 
 * @see PARITY_CHECKLIST.md - Navigation guards
 */

import { useEffect } from 'react';
import { router, useSegments, useRootNavigationState } from 'expo-router';
import { useAuthStore } from '../store/auth';

/**
 * Hook to protect routes requiring authentication
 * 
 * @param options.requireAuth - If true, redirects to sign-in when not authenticated
 * @param options.redirectIfAuth - If true, redirects to home when authenticated (for sign-in pages)
 * @param options.redirectTo - Custom redirect path
 */
export function useAuthGuard(options: {
  requireAuth?: boolean;
  redirectIfAuth?: boolean;
  redirectTo?: string;
} = {}) {
  const { isAuthenticated, isLoading } = useAuthStore();
  const segments = useSegments();
  const navigationState = useRootNavigationState();

  useEffect(() => {
    // Don't redirect while navigation state is loading
    if (!navigationState?.key) return;
    
    // Don't redirect while auth is loading
    if (isLoading) return;

    const inAuthGroup = segments[0] === 'sign-in' || 
                        segments[0] === 'register' || 
                        segments[0] === 'forgot-password';

    if (options.requireAuth && !isAuthenticated) {
      // Redirect to sign-in if not authenticated
      const redirectTo = options.redirectTo || '/sign-in';
      router.replace(redirectTo as any);
    } else if (options.redirectIfAuth && isAuthenticated) {
      // Redirect away from auth pages if authenticated
      const redirectTo = options.redirectTo || '/(tabs)';
      router.replace(redirectTo as any);
    }
  }, [isAuthenticated, isLoading, segments, navigationState?.key, options]);

  return {
    isAuthenticated,
    isLoading,
  };
}

/**
 * Higher-level hook that provides standard auth protection
 * Use in screens that require authentication
 */
export function useRequireAuth(redirectTo?: string) {
  return useAuthGuard({ requireAuth: true, redirectTo });
}

/**
 * Hook for auth screens (sign-in, register)
 * Redirects to home if already authenticated
 */
export function useRedirectIfAuth(redirectTo?: string) {
  return useAuthGuard({ redirectIfAuth: true, redirectTo });
}

/**
 * Simple hook to get auth state without redirecting
 */
export function useAuth() {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  return { isAuthenticated, isLoading, user };
}
