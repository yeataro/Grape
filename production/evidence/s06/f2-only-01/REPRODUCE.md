# Reproduce the F2-only candidate

Use Node25.5.0 and the exact locked production dependencies in a disposable checkout of submitted R. No existing Human browser profile or preview is used. Commands are from repository root unless stated.

1. `node tools/verify-bootstrap.mjs`; `node handoff/tools/check-implementation-state.mjs --current`; `node --test --test-isolation=none tools/verify-bootstrap.test.mjs`.
2. In production: `npm run typecheck`, `npm run conformance`, `npm test`. The module pins and dependency lock are unchanged.
3. Build with `node production/tools/build-candidate.mjs <absolute-fresh-output> <absolute-build-02/build-metadata.json>`. Compare the three file hashes in build-02/build-manifest.json; the identical reconstruction result is saved. Archive compression metadata need not reproduce the gzip container hash; served file bytes must match.
4. Source and archive browser commands, exact absolute evidence/output paths, environment and temporary loopback origins are recorded in final-source-01/execution.json and archive-public-01/execution.json. To replay their orchestration, copy harnesses/s06-f2-browser.mjs into the checkout .verification folder (its module-relative Vite import assumes that location) and supply fresh run names/paths; do not replay a wx-writing old name. Run the explicit specs from those records. Do not use the package default browser command/evidence path.
5. Run production/tools/s06-archive-check.ts with fresh absolute --manifest, --output, --scratch and GRAPE_EVIDENCE_DIR paths containing s06, with cwd in disposable .verification. This serves only extracted exact manifest bytes at127.0.0.1 and verifies5 public/numeric/Escape cases.
6. delivery-01/config.json and its hashed unchanged helper identity document the8 direct/wrapped viewport cases and12 live-focus F2 routes. A fresh isolated config must retain a real START-HERE.html route, correct repository helper cwd and archive identities. No current Human preview should be changed.

Editing/commit helper scripts are historical operation records, not qualification replay commands. Original failures and the rejected build prefix remain under this evidence directory. Source-only adapted responses/fault/lifecycle fixtures are marked, and their counts overlap with public archive cases. No independent PASS or Human acceptance is implied.
