# Reproduce the bounded S05 replacement repair

Use Node25.5.0 and the locked production dependencies. Read submission-01.json for exact I/R and hashes. Preserve historical evidence; create fresh absolute output directories for every replay.

- Root: node tools/verify-bootstrap.mjs; node handoff/tools/check-implementation-state.mjs --current; node --test --test-isolation=none tools/verify-bootstrap.test.mjs.
- In production: node node_modules/typescript/bin/tsc --noEmit; node --experimental-transform-types --test --test-isolation=none tests/unit/*.test.ts tests/conformance/*.test.ts; node tools/module-pins.mjs; node tools/boundaries.mjs; node node_modules/vite/bin/vite.js build.
- Set GRAPE_EVIDENCE_DIR to a fresh absolute S05 directory and pass an explicit --output. Focused Playwright selection: tests/browser/s05-replacement.spec.ts tests/browser/s02.spec.ts. Affected selection: tests/browser/s04.spec.ts tests/browser/s05.spec.ts tests/browser/s05-uniforms.spec.ts tests/browser/s05-delivered.spec.ts. Both use --config tools/s05-playwright.config.ts and disposable port4195.
- Exact archive evidence: archive-public-flows-01/result.json records14 unchanged sample flows and3 destination cases from verified tar bytes. Harness copy reproduce/archive-public-flows-01.mjs imports only public test helpers; copy it to workspace scratch and change all hardcoded evidence/scratch/output locations to fresh paths before replay.
- reproduce/original-reproduction-01.mjs is the historical4194 probe for R3, not a future live-server test. Never rerun it unchanged against a later Human service. Parse-failed visual harness01 is retained as diagnostic; use inspected visual02 adaptation with fresh paths.

Browser flows use visible controls/file inputs/downloads. Archived shell does not expose private loadId; unit tests assert Application load/Context identity directly. No internal hydration substitutes for public file admission. New source validity remains separate from destination Replace eligibility.
