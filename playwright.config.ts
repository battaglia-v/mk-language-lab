import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local for testing
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // Retries help with flaky dev server issues
  retries: process.env.CI ? 2 : 1,
  // More workers now that CI only runs desktop project
  // CI: 2 workers (faster), Local: 2 workers for speed with stability
  workers: 2,
  reporter: 'html',
  // Reasonable timeout for most tests
  timeout: 45000,
  expect: {
    timeout: 10000,
  },
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    // Take screenshot on failure for debugging
    screenshot: 'only-on-failure',
    // Add video on retry to help debug flaky tests
    video: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile-320',
      use: {
        browserName: 'chromium',
        viewport: { width: 320, height: 568 },
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 10_3_1 like Mac OS X) AppleWebKit/603.1.30 (KHTML, like Gecko) Version/10.0 Mobile/14E304 Safari/602.1',
      },
    },
    {
      name: 'mobile-360',
      use: {
        ...devices['Pixel 5'],
        viewport: { width: 360, height: 800 },
      },
    },
    {
      name: 'mobile-390',
      use: {
        ...devices['iPhone 12'],
        viewport: { width: 390, height: 844 },
      },
    },
  ],

  webServer: {
    // Use production build for E2E tests to avoid Next.js Dev Tools interference
    // Dev tools button causes selector conflicts in accessibility tests
    command: process.env.E2E_DEV_MODE ? 'npm run dev:webpack' : 'npm run build && npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000, // Allow 2 minutes for build
  },
});
