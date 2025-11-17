import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local for testing
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const isCI = !!process.env.CI;

// Next.js defaults to webpack whenever the Turbopack flag is omitted, so we rely on
// dedicated npm scripts instead of passing the unsupported `--webpack` flag directly.
const ciWebServerCommand = 'npm run build:webpack && npm start';
const localWebServerCommand = 'npm run dev:webpack';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: isCI ? ciWebServerCommand : localWebServerCommand,
    url: 'http://localhost:3000',
    reuseExistingServer: !isCI,
    timeout: 180 * 1000,
  },
});
