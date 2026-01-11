'use client';

import { useEffect, useCallback, useRef } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: GoogleOneTapConfig) => void;
          prompt: (callback?: (notification: PromptNotification) => void) => void;
          cancel: () => void;
          renderButton: (
            element: HTMLElement,
            options: GoogleButtonOptions
          ) => void;
        };
      };
    };
  }
}

interface GoogleOneTapConfig {
  client_id: string;
  callback: (response: GoogleCredentialResponse) => void;
  auto_select?: boolean;
  cancel_on_tap_outside?: boolean;
  context?: 'signin' | 'signup' | 'use';
  itp_support?: boolean;
  use_fedcm_for_prompt?: boolean;
}

interface GoogleCredentialResponse {
  credential: string;
  select_by: string;
  clientId: string;
}

interface PromptNotification {
  isDisplayed: () => boolean;
  isNotDisplayed: () => boolean;
  getNotDisplayedReason: () => string;
  isSkippedMoment: () => boolean;
  getSkippedReason: () => string;
  isDismissedMoment: () => boolean;
  getDismissedReason: () => string;
}

interface GoogleButtonOptions {
  type?: 'standard' | 'icon';
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  size?: 'large' | 'medium' | 'small';
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
  shape?: 'rectangular' | 'pill' | 'circle' | 'square';
  logo_alignment?: 'left' | 'center';
  width?: number;
}

interface GoogleOneTapProps {
  /** Google Client ID */
  clientId: string;
  /** Callback URL after successful sign-in */
  callbackUrl?: string;
  /** Whether to show One Tap prompt automatically */
  autoPrompt?: boolean;
  /** Context for the prompt */
  context?: 'signin' | 'signup' | 'use';
}

export function GoogleOneTap({
  clientId,
  callbackUrl = '/en/learn',
  autoPrompt = true,
  context = 'signin',
}: GoogleOneTapProps) {
  const scriptId = 'google-one-tap-script';
  const { status } = useSession();
  const pathname = usePathname();
  const initializedRef = useRef(false);

  const handleCredentialResponse = useCallback(
    async (_response: GoogleCredentialResponse) => {
      // Google One Tap provides an ID token, but NextAuth's Google provider
      // uses OAuth. When user selects their account via One Tap, we trigger
      // the OAuth flow which will be fast since they're already authenticated.
      try {
        await signIn('google', { callbackUrl, redirect: true });
      } catch (error) {
        console.error('[GoogleOneTap] Sign-in error:', error);
      }
    },
    [callbackUrl]
  );

  useEffect(() => {
    // Don't show One Tap if user is already authenticated
    if (status === 'authenticated') return;

    // Don't show on sign-in/sign-up pages (redundant)
    if (pathname?.includes('/auth/')) return;

    // Only initialize once
    if (initializedRef.current) return;

    const initializeGoogleOneTap = () => {
      if (initializedRef.current) return;
      if (!window.google?.accounts?.id) {
        console.warn('[GoogleOneTap] Google Identity Services not loaded');
        return;
      }

      initializedRef.current = true;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        auto_select: false, // Don't auto-select, let user choose
        cancel_on_tap_outside: true,
        context,
        itp_support: true,
        use_fedcm_for_prompt: false, // Disable FedCM - can cause issues on some devices
      });

      if (autoPrompt) {
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed()) {
            console.log(
              '[GoogleOneTap] Not displayed:',
              notification.getNotDisplayedReason()
            );
          }
          if (notification.isSkippedMoment()) {
            console.log(
              '[GoogleOneTap] Skipped:',
              notification.getSkippedReason()
            );
          }
          if (notification.isDismissedMoment()) {
            console.log(
              '[GoogleOneTap] Dismissed:',
              notification.getDismissedReason()
            );
          }
        });
      }

    };

    const existingScript = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (existingScript) {
      if (window.google?.accounts?.id) {
        initializeGoogleOneTap();
      } else {
        existingScript.addEventListener('load', initializeGoogleOneTap, { once: true });
      }
      return;
    }

    // Load Google Identity Services script
    const script = document.createElement('script');
    script.id = scriptId;
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = initializeGoogleOneTap;
    document.head.appendChild(script);

    return () => {
      // Cleanup
      if (window.google?.accounts?.id) {
        window.google.accounts.id.cancel();
      }
    };
  }, [clientId, status, pathname, autoPrompt, context, handleCredentialResponse]);

  // This component doesn't render anything visible
  // The One Tap prompt is rendered by Google's SDK
  return null;
}

/**
 * Google Sign-In Button using Google Identity Services
 * Alternative to One Tap - renders a button in a specific container
 */
export function GoogleSignInButton({
  clientId,
  callbackUrl = '/en/learn',
  containerId = 'google-signin-button',
  theme = 'outline',
  size = 'large',
  text = 'continue_with',
  shape = 'rectangular',
  width,
}: GoogleOneTapProps & {
  containerId?: string;
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  size?: 'large' | 'medium' | 'small';
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
  shape?: 'rectangular' | 'pill';
  width?: number;
}) {
  const handleCredentialResponse = useCallback(
    async () => {
      await signIn('google', { callbackUrl, redirect: true });
    },
    [callbackUrl]
  );

  useEffect(() => {
    const initializeButton = () => {
      const container = document.getElementById(containerId);
      if (!container || !window.google?.accounts?.id) return;

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
      });

      window.google.accounts.id.renderButton(container, {
        type: 'standard',
        theme,
        size,
        text,
        shape,
        width,
        logo_alignment: 'center',
      });
    };

    // Load script if not already loaded
    if (window.google?.accounts?.id) {
      initializeButton();
    } else {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initializeButton;
      document.head.appendChild(script);
    }
  }, [clientId, containerId, theme, size, text, shape, width, handleCredentialResponse]);

  return <div id={containerId} className="flex justify-center" />;
}
