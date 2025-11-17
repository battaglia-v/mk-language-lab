import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local for testing
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const isCI = !!process.env.CI;

// Use dedicated npm scripts that explicitly pass --webpack flag to ensure
// Playwright tests run against webpack builds (not Turbopack) for stability.
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
