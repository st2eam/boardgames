import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  fullyParallel: false,
  use: {
    baseURL: "http://127.0.0.1:3000",
    // The development Macs already ship Chrome. Using that channel avoids a
    // second, large browser download while retaining Playwright's mobile APIs.
    channel: "chrome",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "android-compact", use: { viewport: { width: 360, height: 640 } } },
    { name: "phone-portrait", use: { viewport: { width: 390, height: 844 } } },
    { name: "phone-landscape", use: { viewport: { width: 844, height: 390 } } },
  ],
  webServer: {
    command: "npm run dev -- --hostname 127.0.0.1",
    url: "http://127.0.0.1:3000/boardgames/zh/",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
