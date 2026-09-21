import 'dotenv/config';
import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.BASE_URL;
const wireMockBaseURL = process.env.WIREMOCK_BASE_URL;

if (!baseURL) {
  throw new Error('BASE_URL is missing. Copy .env.example to .env.');
}

if (!wireMockBaseURL) {
  throw new Error('WIREMOCK_BASE_URL is missing. Copy .env.example to .env.');
}
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    baseURL,
    geolocation: {
      latitude: -1.286389,
      longitude: 36.817223,
    },
    permissions: ['geolocation'],
    trace: 'on-first-retry',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      testMatch: '**/ui/**/*.spec.ts',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      testMatch: '**/ui/**/*.spec.ts',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      testMatch: '**/ui/**/*.spec.ts',
      use: { ...devices['Desktop Safari'] },
    },

    {
      name: 'Mobile Safari',
      testMatch: '**/ui/**/*.spec.ts',
      use: { ...devices['iPhone 12'] },
    },

    {
      name: 'database',
      testMatch: '**/database/**/*.spec.ts',
    },

    {
      name: 'api',
      testMatch: '**/api/**/*.spec.ts',
      use: {
        baseURL: wireMockBaseURL,
      },
    },
  ],
});
