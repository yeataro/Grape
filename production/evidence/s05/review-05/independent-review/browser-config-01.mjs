export default {
  "testDir": "C:\\Users\\user\\.codex\\worktrees\\s05-values-review-01\\Grape\\.verification\\s05-values-review-01\\runtime\\production\\tests\\browser",
  "fullyParallel": false,
  "workers": 1,
  "timeout": 60000,
  "retries": 0,
  "reporter": [
    [
      "list"
    ],
    [
      "json",
      {
        "outputFile": "C:\\Users\\user\\.codex\\worktrees\\s05-values-review-01\\Grape\\.verification\\s05-values-review-01\\browser-full-01\\browser-results.json"
      }
    ]
  ],
  "use": {
    "baseURL": "http://127.0.0.1:4317",
    "viewport": {
      "width": 1440,
      "height": 1000
    },
    "trace": "retain-on-failure",
    "screenshot": "only-on-failure"
  },
  "webServer": {
    "command": "node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 4317 --strictPort",
    "cwd": "C:\\Users\\user\\.codex\\worktrees\\s05-values-review-01\\Grape\\.verification\\s05-values-review-01\\runtime\\production",
    "url": "http://127.0.0.1:4317",
    "reuseExistingServer": false
  },
  "projects": [
    {
      "name": "chromium",
      "use": {
        "browserName": "chromium"
      }
    }
  ]
};
