import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "dist/**",
      "public/**",
      "coverage/**",
      ".vercel/**",
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
  // Allow raw button only in the Button component itself
  {
    files: ["components/ui/button.tsx"],
    rules: {
      "react/forbid-elements": "off"
    }
  }
];

export default eslintConfig;
