import type { PlaywrightTestConfig } from '@playwright/test';
import { devices } from '@playwright/test'

const config: PlaywrightTestConfig = {
  retries: 3,
  webServer: {
    command: 'npm run test:server',
    port: 8080,
    timeout: 60 * 1000,
    reuseExistingServer: !process.env.CI
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
}

export default config;