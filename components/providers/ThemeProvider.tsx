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
      // Map next-themes classes to our theme classes
      value={{
        light: 'theme-light',
        dark: 'theme-dark dark',
      }}
      storageKey="mk-theme"
    >
      <ThemeBodySync />
      {children}
    </NextThemesProvider>
  );
}

// Syncs theme to body classes for our CSS variables
function ThemeBodySync() {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const body = document.body;
    const currentTheme = resolvedTheme || theme || 'dark';

    // Remove old theme classes
    body.classList.remove('theme-light', 'theme-dark');

    // Add new theme class
    body.classList.add(currentTheme === 'light' ? 'theme-light' : 'theme-dark');
  }, [theme, resolvedTheme, mounted]);

  return null;
}

export { useTheme };
