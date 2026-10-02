# Grape production editor

A Host-free TypeScript browser editor built independently against accepted IH-005. The declared S01 scope is **independently reviewed PASS, Human Owner accepted, and completed** at implementation `c1ecb3cd1a4cd1685e3fb1d9ba2a17b4108e68c3`, reviewed PR HEAD `ab0216436d66ab1282758d51dceb38d0283c1965`. See the separate [acceptance records](evidence/acceptance/README.md). **S02 is active, unreviewed and unaccepted.** No later Slice is authorized. Historical S01 evidence is preserved. The [S02 contract map](conformance/S02_CONTRACT_MAP.md) records current-format scope and the unresolved legacy compatibility branch.

## Run

Use **Node.js 25.5.0** (also recorded in `.node-version` and package engines). Every npm entry point checks the effective runtime and rejects another version.

```sh
cd production
npm ci
npm run dev
```

In this Cloud task, the verified runtime is `/workspace/.grape-environment/node-v25.5.0-linux-x64/bin/node`; prepend its directory to `PATH`. Dependencies are locked in `package-lock.json`. The app is served at the URL printed by Vite.

Create Float, Multiply, and Compose nodes with the action bar. Click an output port then an input to connect; Shift replaces an occupied input. Click a node for its Inspector. Enter commits a scalar draft; Escape cancels. Drag a node for one Undo operation. Drag empty space to pan, scroll to zoom, H frames the graph, and F frames selected nodes. Keyboard focus and Enter also select nodes. The read-only lock prevents Graph edits while keeping inspection, export, and saving available.

Generate GLSL shows the current result and locatable diagnostics; later edits mark earlier output stale. Save waits for an IndexedDB transaction acknowledgement. Open saved reopens that document. Export JSON starts a download without clearing dirty; Open file inspects JSON or PNG in a detached review. Cancel preserves the current Graph; Accept replacement checks the original base and records one Undo. Malformed positions have an explicit proposal. Open in new session permits error-bearing documents, including missing exact modules, to be moved, renamed and re-saved with generation blocked. Restoring the exact module requires reloading with it available. Export PNG previews a readable root Canvas image with the complete document embedded. Unsupported structural formats and malformed input retain their original content for export. Second Canvas shares the Graph and has independent selection and camera.

## Declared scope

The acceptance environment is the recorded Linux desktop Chromium build at 1440 × 1000. The production entry exposes an image Graph's pixel network, Float/Multiply/Compose, protected output boundary, scalar and dynamic shape editing, domain-separated Graph Undo/Redo, GLSL ES 3.00 text generation, browser-local persistence, and file roundtrip. Vertex topology retains the IH-005 network/default declaration; S01 does not add a Stage-switching UI.

Root Inspector targets are delivered through the scoped target contract. No nested authoring, material editor, full workspace manager, legacy converter, Host integration, preview, Mixed History, PWA or Electron implementation is claimed. GPU compilation, physical touch devices, Safari and native OS IME remain unqualified. Simulated composition events test browser event handling only. The built-in profile admits float/vec2/vec3/vec4; shared type resolution can register nominal definitions without adding Node-name switches. Larger shader families remain later-slice work.

No external document-stability promise is made. Module manifests use exact source-unit fingerprints, checked by `tools/module-pins.mjs`; they are distinct from the build/source-set digest. Changing module behavior requires a deliberate manifest identity update. The fingerprint algorithm is SHA-256 of that module source unit with its digest literals replaced by `sha256:<self>`.

## Verify

```sh
npm run build
npm test
npm run conformance
npx playwright install chromium
npm run test:browser
```

The Cloud browser cache is `/workspace/.grape-environment/browsers`; set `PLAYWRIGHT_BROWSERS_PATH` accordingly. Browser tests drive the actual production entry with DOM, focus, pointer, keyboard, IndexedDB and downloads; they do not use an exposed application test handle. Controlled storage/DOM faults are injected at browser adapter boundaries. Tests use Node's TypeScript transformation with process isolation disabled so individual test cases, rather than only file wrappers, are reported in this environment.

`node tools/verify-s02.mjs` runs the validation set after the implementation sources have been committed and writes **unreviewed** evidence under `evidence/s02/`. It explicitly reports AT-S02-03 as blocked. The older `verify.mjs` is the historical S01 runner; do not use it to overwrite accepted S01 artifacts. The root verification commands run unchanged with Node 25.5.0. The production boundary checker runs on the real source manifest using unchanged Handoff tools copied to a disposable temporary directory. It never installs dependencies or writes inside `handoff/`.

See [contract map](conformance/CONTRACT_MAP.md) and [review package](evidence/REVIEW.md). Only an accepted review may add `acceptedEvidence` or a completed slice to the root state.
