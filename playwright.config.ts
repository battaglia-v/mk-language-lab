import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local for testing
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';
let baseHostname = 'localhost';
try {
  baseHostname = new URL(baseURL).hostname;
} catch {
  baseHostname = 'localhost';
}
const isLocalBaseUrl = baseHostname === 'localhost' || baseHostname === '127.0.0.1';

export default defineConfig({
  testDir: './e2e',
  outputDir: 'test-results/playwright',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // Retries help with flaky tests - reduced in CI for speed
  retries: process.env.CI ? 1 : 1,
  // More workers now that CI only runs desktop project
  // CI: 2 workers (faster), Local: 2 workers for speed with stability
  // Remote/prod audits should be polite by default.
  workers: isLocalBaseUrl ? 2 : 1,
  reporter: 'html',
  // Reasonable timeout for most tests
  timeout: 60000,
  globalTimeout: 15 * 60 * 1000,
  expect: {
    timeout: 15000,
  },
  use: {
    baseURL,
    trace: 'on-first-retry',
    // Take screenshot on failure for debugging
    screenshot: 'only-on-failure',
    // Add video on retry to help debug flaky tests
    video: 'on-first-retry',
    // Some corporate environments force browsers through an HTTP(S) proxy that can
    // inject interstitials or block static assets. Allow opting out for more
    // representative production audits.
    launchOptions: process.env.PLAYWRIGHT_NO_PROXY === 'true'
      ? { args: ['--no-proxy-server'] }
      : undefined,
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
    // Mobile audit project - runs tests from tests/mobile-audit
    {
      name: 'mobile-audit',
      testDir: './tests/mobile-audit',
      use: {
        ...devices['iPhone 12'],
        viewport: { width: 390, height: 844 },
      },
    },
    // Phase 2 mobile scans (slow/crawl-style)
    {
      name: 'phase2-mobile',
      testDir: './tests/phase2',
      use: {
        ...devices['iPhone 12'],
        viewport: { width: 390, height: 844 },
      },
    },
    // Release gate project - enforces 0 dead interactions and full testid coverage
    {
      name: 'release-gate',
      testDir: './tests/release-gate',
      retries: 0,
      use: {
        ...devices['iPhone 12'],
        viewport: { width: 390, height: 844 },
      },
    },
  ],

  webServer: isLocalBaseUrl
    ? {
        // Use production build for E2E tests to avoid Next.js Dev Tools interference
        // Dev tools button causes selector conflicts in accessibility tests
        command: process.env.E2E_DEV_MODE ? 'npm run dev:webpack' : 'npm run build && npm run start',
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 600000, // Allow up to 10 minutes for build/start on slower machines
      }
    : undefined,
});
