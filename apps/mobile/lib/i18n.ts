/**
 * i18n infrastructure for React Native
 * 
 * Mirrors PWA's next-intl setup but uses react-i18next pattern.
 * For now, implements a lightweight solution without external dependencies.
 * 
 * @see PARITY_CHECKLIST.md - i18n parity
 */

import { getLocales } from 'expo-localization';

export const locales = ['en', 'mk'] as const;
export type Locale = (typeof locales)[number];

// Get device locale, fallback to English
function getDeviceLocale(): Locale {
  try {
    const deviceLocales = getLocales();
    const primaryLocale = deviceLocales[0]?.languageCode?.toLowerCase();
    if (primaryLocale && locales.includes(primaryLocale as Locale)) {
      return primaryLocale as Locale;
    }
  } catch {
    // Fallback silently
  }
  return 'en';
}

// Current locale state
let currentLocale: Locale = getDeviceLocale();

export function getLocale(): Locale {
  return currentLocale;
}

export function setLocale(locale: Locale): void {
  if (locales.includes(locale)) {
    currentLocale = locale;
  }
}

// Translation messages (subset of PWA messages for mobile)
const messages: Record<Locale, Record<string, Record<string, string>>> = {
  en: {
    nav: {
      home: 'Home',
      learn: 'Learn',
      practice: 'Practice',
      reader: 'Reader',
      translate: 'Translate',
      resources: 'Resources',
      profile: 'Profile',
      settings: 'Settings',
    },
    common: {
      loading: 'Loading...',
      error: 'Something went wrong',
      retry: 'Retry',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      confirm: 'Confirm',
      back: 'Back',
      next: 'Next',
      done: 'Done',
      close: 'Close',
    },
    auth: {
      signIn: 'Sign In',
      signUp: 'Sign Up',
      signOut: 'Sign Out',
      email: 'Email',
      password: 'Password',
      forgotPassword: 'Forgot Password?',
      noAccount: "Don't have an account?",
      hasAccount: 'Already have an account?',
      createAccount: 'Create Account',
      continueWithGoogle: 'Continue with Google',
      invalidCredentials: 'Invalid email or password',
    },
    practice: {
      title: 'Practice',
      startSession: 'Start Practice',
      continueSession: 'Continue',
      correct: 'Correct!',
      incorrect: 'Incorrect',
      tryAgain: 'Try Again',
      showAnswer: 'Show Answer',
      nextQuestion: 'Next',
      sessionComplete: 'Session Complete!',
      xpEarned: 'XP Earned',
      accuracy: 'Accuracy',
    },
    translate: {
      title: 'Translate',
      placeholder: 'Enter text to translate...',
      translating: 'Translating...',
      copy: 'Copy',
      copied: 'Copied!',
      swap: 'Swap languages',
      history: 'History',
      clearHistory: 'Clear History',
      save: 'Save phrase',
      saved: 'Saved!',
    },
    reader: {
      title: 'Reader',
      stories: 'Stories',
      difficulty: 'Difficulty',
      readTime: 'min read',
    },
    profile: {
      title: 'Profile',
      stats: 'Statistics',
      streak: 'Day Streak',
      totalXp: 'Total XP',
      lessonsCompleted: 'Lessons',
      wordsLearned: 'Words',
      settings: 'Settings',
      editProfile: 'Edit Profile',
    },
    lesson: {
      close: 'Close',
      progress: 'Progress',
      complete: 'Complete',
    },
  },
  mk: {
    nav: {
      home: 'Дома',
      learn: 'Учи',
      practice: 'Вежбај',
      reader: 'Читач',
      translate: 'Преведи',
      resources: 'Ресурси',
      profile: 'Профил',
      settings: 'Поставки',
    },
    common: {
      loading: 'Вчитување...',
      error: 'Нешто тргна наопаку',
      retry: 'Обиди се повторно',
      cancel: 'Откажи',
      save: 'Зачувај',
      delete: 'Избриши',
      confirm: 'Потврди',
      back: 'Назад',
      next: 'Следно',
      done: 'Готово',
      close: 'Затвори',
    },
    auth: {
      signIn: 'Најави се',
      signUp: 'Регистрирај се',
      signOut: 'Одјави се',
      email: 'Е-пошта',
      password: 'Лозинка',
      forgotPassword: 'Заборавена лозинка?',
      noAccount: 'Немаш сметка?',
      hasAccount: 'Веќе имаш сметка?',
      createAccount: 'Креирај сметка',
      continueWithGoogle: 'Продолжи со Google',
      invalidCredentials: 'Невалидна е-пошта или лозинка',
    },
    practice: {
      title: 'Вежбање',
      startSession: 'Започни вежба',
      continueSession: 'Продолжи',
      correct: 'Точно!',
      incorrect: 'Неточно',
      tryAgain: 'Обиди се повторно',
      showAnswer: 'Покажи одговор',
      nextQuestion: 'Следно',
      sessionComplete: 'Сесијата е завршена!',
      xpEarned: 'Освоени XP',
      accuracy: 'Точност',
    },
    translate: {
      title: 'Преведувач',
      placeholder: 'Внеси текст за превод...',
      translating: 'Се преведува...',
      copy: 'Копирај',
      copied: 'Копирано!',
      swap: 'Замени јазици',
      history: 'Историја',
      clearHistory: 'Избриши историја',
      save: 'Зачувај фраза',
      saved: 'Зачувано!',
    },
    reader: {
      title: 'Читач',
      stories: 'Приказни',
      difficulty: 'Тежина',
      readTime: 'мин читање',
    },
    profile: {
      title: 'Профил',
      stats: 'Статистика',
      streak: 'Денови по ред',
      totalXp: 'Вкупно XP',
      lessonsCompleted: 'Лекции',
      wordsLearned: 'Зборови',
      settings: 'Поставки',
      editProfile: 'Уреди профил',
    },
    lesson: {
      close: 'Затвори',
      progress: 'Напредок',
      complete: 'Заврши',
    },
  },
};

/**
 * Get a translation by namespace and key
 * 
 * @example
 * t('nav', 'home') // "Home" or "Дома"
 * t('auth', 'signIn') // "Sign In" or "Најави се"
 */
export function t(namespace: string, key: string): string {
  const localeMessages = messages[currentLocale];
  const namespaceMessages = localeMessages?.[namespace];
  const translation = namespaceMessages?.[key];
  
  // Fallback to English if translation missing
  if (!translation && currentLocale !== 'en') {
    return messages.en?.[namespace]?.[key] ?? `${namespace}.${key}`;
  }
  
  return translation ?? `${namespace}.${key}`;
}

/**
 * Hook-like function to get translations for a namespace
 * Returns a function that takes a key and returns the translation
 * 
 * @example
 * const t = useTranslations('nav');
 * t('home') // "Home"
 */
export function useTranslations(namespace: string) {
  return (key: string) => t(namespace, key);
}

/**
 * Get all translations for a namespace
 */
export function getNamespaceTranslations(namespace: string): Record<string, string> {
  return messages[currentLocale]?.[namespace] ?? messages.en?.[namespace] ?? {};
}
