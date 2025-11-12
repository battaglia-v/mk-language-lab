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
      "android/**",
      "ios/**",
      "next-env.d.ts",
      "scripts/**/*.js",
      "scripts/**/*.mjs",
      "scripts/**/*.ts",
      "scripts/**/*.tsx",
      "e2e/**",
      "**/*.config.js",
      "**/*.config.ts",
      "**/*.config.mjs",
      "sentry.*.config.ts",
      "**/*.test.ts",
      "**/*.test.tsx",
    ],
  },
];

export default eslintConfig;
