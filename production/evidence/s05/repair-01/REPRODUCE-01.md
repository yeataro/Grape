# Reproduce S05-FR-001 repair

Check out exact R identified by the Coordinator, whose implementation I is 9230f9652c2affd4c20a7dda1033baaa0d61f7e1. Use Node25.5.0 and production npm ci with the unchanged lock. Never write into handoff or old evidence directories.

Root: node tools/verify-bootstrap.mjs; node handoff/tools/check-implementation-state.mjs --current; node --test tools/verify-bootstrap.test.mjs. Production: npm run typecheck; npm run conformance; npm test; npm run build. Exact direct Node commands/exit codes are in checks/*.json. Final counts:200 unit/conformance,75 browser,10 root fixtures,471 integrity checks/411 indexed/412 frozen,53 ownership files. Post-adoption root checks passed separately.

Browser from production: set GRAPE_EVIDENCE_DIR to a NEW ABSOLUTE path containing s05, then node node_modules/@playwright/test/cli.js test --config tools/s05-playwright.config.ts --output <same-new-absolute-directory>/test-results. The finding-only file is tests/browser/s05-uniforms.spec.ts (13 cases); full suite includes prior S01-S04 and S05 cases. Disposable contexts/port4195, no Human storage or4174/4192 service changes. Platform sandbox limitations must be handled via legitimate permission, never bypassed.

Regenerate14 samples with node --experimental-transform-types tools/s05-samples.ts <new-output-dir>. Original reviewer fixture is copied exactly in tests/fixtures/s05-review-crossstage.json and under review-01. New s05-linked-webgl.ts harness records actual linked shaders, active uniforms, readback and vertex transform feedback; the immutable original probes are not rerun as-is because they contain old paths.

Verify candidate-web-01.tar.gz SHA and extract fresh scratch. Verify each build-manifest file before serving. The preserved reproduce/archive-browser-01.mjs was executed from root .verification; derive a separately named copy with NEW scratch/evidence paths, preserve its relative imports, set absolute GRAPE_EVIDENCE_DIR and GRAPE_ARCHIVE_OUTPUT as its exact guards require. It loads shared-function, generates, edits an interface, imports/inserts Personal, saves, then loads the new distinct-Uniform sample and verifies generated declarations. Three same-machine temporary HTTP origins and served artifact hashes are checked, all listeners closed. No second-device or physical GPU proof.

Original independent FAIL remains in review-01/independent-review; repair-01/review-relocation-01.json binds119 copied files to their originals. No original script, verdict or evidence was normalized. Independent targeted review is still required.
