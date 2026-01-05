import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = [
  ...nextCoreWebVitals,
  // Disable React 19 strict rules that are too noisy for existing codebase
  {
    rules: {
      "react-hooks/purity": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/preserve-manual-memoization": "off",
      "react-hooks/immutability": "off",
    }
  },
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "dist/**",
      "playwright-report/**",
      "test-results/**",
      "public/**",
      "coverage/**",
      ".vercel/**",
      "apps/mobile/.expo/**",
      "next-env.d.ts",
      "e2e/**",
      "**/*.config.js",
      "**/*.config.ts",
      "**/*.config.mjs",
      "sentry.*.config.ts",
      "**/*.test.ts",
      "**/*.test.tsx",
    ],
  },
  // Phase 9: Canonical Button System - prevent raw <button> usage
  {
    files: ["**/*.tsx"],
    rules: {
      "react/forbid-elements": ["warn", {
        forbid: [{
          element: "button",
          message: "Use <Button> from @/components/ui/button instead of raw <button>. Exception: components/ui/button.tsx"
        }]
      }]
    }
  },
  // Allow raw button in UI component primitives and specialized interactive components
  {
    files: [
      // Core UI primitives
      "components/ui/**/*.tsx",
      "packages/ui/**/*.tsx",
      // Specialized interactive components
      "components/lesson/steps/**/*.tsx",
      "components/learn/**/*.tsx",
      "components/practice/**/*.tsx",
      "components/reader/**/*.tsx",
      "components/gamification/**/*.tsx",
      "components/support/**/*.tsx",
      "components/shell/**/*.tsx",
      "components/auth/**/*.tsx",
      "components/admin/**/*.tsx",
      "components/monetization/**/*.tsx",
      "components/profile/**/*.tsx",
      "components/layout/**/*.tsx",
      "components/WelcomeBanner.tsx",
      // Pages with custom interactive elements
      "app/**/onboarding/**/*.tsx",
      "app/**/feedback/**/*.tsx",
      "app/**/settings/**/*.tsx",
      "app/**/test-sentry/**/*.tsx",
      "app/**/translate/**/*.tsx",
      "app/offline/**/*.tsx"
    ],
    rules: {
      "react/forbid-elements": "off"
    }
  }
];

export default eslintConfig;
