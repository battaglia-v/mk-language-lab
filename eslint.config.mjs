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
];

export default eslintConfig;
