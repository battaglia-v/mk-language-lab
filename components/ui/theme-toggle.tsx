"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Theme = "light" | "dark" | "system";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("system");
  const [mounted, setMounted] = useState(false);

  // Get stored theme preference or default to system
  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("theme") as Theme | null;
    if (stored) {
      setTheme(stored);
      applyTheme(stored);
    } else {
      applyTheme("system");
    }
  }, []);

  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement;

    // Remove existing theme classes
    root.classList.remove("theme-light", "theme-dark");

    if (newTheme === "system") {
      // Check system preference
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
      root.classList.add(`theme-${systemTheme}`);
    } else {
      root.classList.add(`theme-${newTheme}`);
    }
  };

  const toggleTheme = () => {
    // Cycle through: light -> dark -> system -> light
    const nextTheme: Theme =
      theme === "light" ? "dark" : theme === "dark" ? "system" : "light";

    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    applyTheme(nextTheme);
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9"
        disabled
        aria-label="Theme toggle loading"
      >
        <Sun className="h-4 w-4" aria-hidden="true" />
      </Button>
    );
  }

  const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className={cn(
        "h-9 w-9 transition-all duration-200",
        "hover:bg-accent/10",
      )}
      title={`Current theme: ${theme} (Click to change)`}
    >
      {isDark ? (
        <Moon className="h-4 w-4 transition-transform duration-200 rotate-0" aria-hidden="true" />
      ) : (
        <Sun className="h-4 w-4 transition-transform duration-200 rotate-0" aria-hidden="true" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}

// Simple version for mobile nav (just light/dark toggle)
export function ThemeToggleSimple() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("theme") as Theme | null;
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";

    const effectiveTheme = stored === "system" || !stored ? systemTheme : stored;
    setTheme(effectiveTheme);
    document.documentElement.classList.add(`theme-${effectiveTheme}`);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);

    const root = document.documentElement;
    root.classList.remove("theme-light", "theme-dark");
    root.classList.add(`theme-${nextTheme}`);
  };

  if (!mounted) {
    return <div className="h-9 w-9" />;
  }

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
        "hover:bg-accent/10",
      )}
      title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      {theme === "dark" ? (
        <Moon className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Sun className="h-4 w-4" aria-hidden="true" />
      )}
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}
