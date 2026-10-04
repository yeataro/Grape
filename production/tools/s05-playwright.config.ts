import { defineConfig } from "@playwright/test";
import { resolve } from "node:path";
import base from "../playwright.config.ts";
if (
  !process.env.GRAPE_EVIDENCE_DIR ||
  !process.env.GRAPE_EVIDENCE_DIR.includes("s05")
)
  throw Error("S05_EVIDENCE_DIR_REQUIRED");
export default defineConfig({
  ...base,
  testDir: "../tests/browser",
  reporter: [
    ["list"],
    [
      "json",
      {
        outputFile: resolve(
          process.cwd(),
          process.env.GRAPE_EVIDENCE_DIR,
          "browser-results.json",
        ),
      },
    ],
  ],
  use: { ...base.use, baseURL: "http://127.0.0.1:4195" },
  webServer: {
    command:
      "node node_modules/vite/bin/vite.js --host 0.0.0.0 --port 4195 --strictPort",
    url: "http://127.0.0.1:4195",
    reuseExistingServer: false,
    cwd: process.cwd(),
  },
});
