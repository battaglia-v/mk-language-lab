'use client';

import { ThemeProvider as NextThemesProvider, useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

type ThemeProviderProps = {
  children: React.ReactNode;
};

export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
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

    const currentTheme = resolvedTheme || 'dark';
    const isLight = currentTheme === 'light';

    // Update body theme class for our CSS variables
    document.body.classList.remove('theme-light', 'theme-dark');
    document.body.classList.add(isLight ? 'theme-light' : 'theme-dark');

    // Update html dark class for Tailwind
    if (isLight) {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  }, [resolvedTheme, mounted]);

  return null;
}

export { useTheme };
