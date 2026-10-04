# Exact candidate replay

Implementation I: `8ffbea96bdc76e307d59eaa8514f3c6432a7d34d`. Resolve R as the exact commit introducing `production/evidence/s05/catalog-values-01/submission-01.json`. Use a separate checkout of R and Node 25.5.0 with the locked production dependencies. Do not execute checks in frozen Handoff source copies except the read-only root commands below. Do not write to any original evidence directory.

```powershell
node tools/verify-bootstrap.mjs
node handoff/tools/check-implementation-state.mjs --current
node --test --test-isolation=none tools/verify-bootstrap.test.mjs
npm --prefix production run typecheck
npm --prefix production run conformance
npm --prefix production test
npm --prefix production run build
```

The executed browser configuration is preserved as `browser-config-01.mjs`. Make a disposable copy and replace its repository paths with the review checkout paths; select an unused test port and use the same port for `baseURL`, `webServer`, and `GRAPE_TEST_HTTP_PORT`. The original run used port 4176, not the live Human preview ports 4193/4194/4195. Set `GRAPE_EVIDENCE_DIR` to a fresh absolute directory, and pass `--output` with a separate fresh absolute browser artifact directory on every run.

```powershell
$env:GRAPE_EVIDENCE_DIR='<absolute-new-review-evidence>'
$env:GRAPE_TEST_HTTP_PORT='<same-unused-port>'
node production/node_modules/@playwright/test/cli.js test --config '<disposable-config>' --output '<absolute-new-browser-results>'
```

Run from the production working directory or preserve `webServer.cwd` and `testDir` in the disposable configuration. The 108-test full run includes all current S01–S05 browser tests, legacy public sample import/upgrade/replacement, source admission, Personal exchange and linked cross-stage Uniform cases. Raw final results are in `browser-full-02`; earlier failed/interrupted development runs are deliberately retained and are not counted as final PASS.

For the exact archive, run from repository root with fresh absolute paths:

```powershell
$env:GRAPE_EVIDENCE_DIR='<absolute-new-archive-evidence>'
node --experimental-transform-types production/tools/s05-values-archive-check.ts --manifest '<absolute-path-to-build-manifest-01.json>' --scratch '<absolute-new-extraction-directory>' --output '<absolute-new-archive-evidence>/result.json'
```

The tool verifies the archive and every extracted build/sample hash before serving bytes on a temporary random localhost port. It opens a separate browser context for each of the 13 samples, exercises public file review/new-session/edit/Undo/Redo/generation/save/reopen/JSON operations, writes evidence, closes those contexts and stops only its own listener. It does not access Human browser storage or preview services. `samples-02` is the final sample set; `samples` is a retained development set with overlapping shared-call layout and must not be presented as the final delivery.

`specialization-probe-01.ts` is an additional frozen-I negative witness. To replay, copy it to a disposable location and adapt only its relative imports and unique output path; never run it in place because it intentionally refuses to overwrite the original result. It proves four ordinary fixed-value node identities cannot substitute for a declared symbolic extent resource (`TYPE_UNKNOWN`, atomic rejection).

The first sandbox browser run completed a test assertion failure but stalled during Windows child-process teardown. Its exact disposable server was identified and terminated; subsequent browser checks used the legitimately escalated execution environment and completed normally. One partial full run was stopped after raw trace evidence showed overlapping fixture nodes intercepting clicks; final nonoverlapping fixtures and the entire suite passed. Neither development issue is an independent review finding or reset of existing counters.
