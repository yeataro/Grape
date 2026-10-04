import { defineConfig } from "@playwright/test";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const evidence = process.env.GRAPE_EVIDENCE_DIR;
if (!evidence || !path.isAbsolute(evidence) || !evidence.includes("s06"))
  throw Error("S06_ABSOLUTE_EVIDENCE_REQUIRED");
export default defineConfig({
  testDir: path.join(root, "tests/browser"),
  fullyParallel: false,
  workers: 1,
  timeout: 30000,
  retries: 0,
  reporter: [
    ["list"],
    ["json", { outputFile: path.join(evidence, "browser-results.json") }],
  ],
  use: {
    baseURL: process.env.GRAPE_BASE_URL ?? "http://127.0.0.1:4206",
    viewport: { width: 1440, height: 1000 },
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { browserName: "chromium" } }],
});
