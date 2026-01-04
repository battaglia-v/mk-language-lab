'use client';

import { ThemeProvider as NextThemesProvider, useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

type ThemeProviderProps = {
  children: React.ReactNode;
};

/**
 * Theme behavior:
 * 1. Default to light mode when no preference exists
 * 2. Respect prefers-color-scheme on first load (if no saved preference)
 * 3. Persist user toggle choice and never override it
 * 4. Do not auto-switch after initial load
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"      // Respect system preference on first load
      enableSystem={true}        // Allow reading prefers-color-scheme
      disableTransitionOnChange  // Prevent flash during theme switch
      themes={['light', 'dark']}
      storageKey="mk-theme"
    >
      <ThemeBodySync />
      {children}
    </NextThemesProvider>
  );
}

// Syncs theme to body classes for our CSS variables
function ThemeBodySync() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Default to light mode if no theme resolved (light mode is primary)
    const currentTheme = resolvedTheme || 'light';
    const isLight = currentTheme === 'light';
    const html = document.documentElement;
    const body = document.body;

    // Update html classes for our CSS variables (theme works before body)
    html.classList.remove('theme-light', 'theme-dark');
    html.classList.add(isLight ? 'theme-light' : 'theme-dark');

    // Update body theme class for backwards compatibility
    body.classList.remove('theme-light', 'theme-dark');
    body.classList.add(isLight ? 'theme-light' : 'theme-dark');

    // Update html dark class for Tailwind
    if (isLight) {
      html.classList.remove('dark');
    } else {
      html.classList.add('dark');
    }
  }, [resolvedTheme, mounted]);

  return null;
}

export { useTheme };
