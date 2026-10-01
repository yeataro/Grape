# Executable reference — exact AC-002 closure plus IH-002 additive repair

**THIS IS NOT THE PRODUCTION IMPLEMENTATION.** This directory contains the exact sealed source closure plus explicitly separate IH-002 repair contracts/examples. It is not a production core, migration, deployment adapter or coverage revision. A passing run qualifies the listed contracts and cases; Independent Re-review and production acceptance remain separate.

## Source closure

`SOURCE_PROVENANCE.json` records all **37 copied source, contract, test and configuration files** with their accepted SHA-256. Reconstruction uses AB-001 captures, overlaid by accepted AC-001 and AC-002 changes. AC-002 is a delta capture rather than a standalone project. These 37 sealed files retain their original bytes; the source ledger does not claim that every new file in this directory was already part of AC-002.

The separate `repair/` directory is **IH-002 additive executable specification** for Independent Review B01/M01: `public-panel-workspace.ts` and its cases close public Panel composition; `scoped-parameter.ts` and its cases close root/nested Inspector reads/projection/writes; `scoped-fixtures.ts` only constructs isolated test documents. The canonical Panel/Widget examples use these public contracts. These additions are recorded in the Handoff revision and file index, never silently presented as sealed AC-002 behavior. Normative composition/ordering is in [Extension Model](../04_EXTENSION_MODEL.md); Graph/History ownership remains unchanged.

**Explicit missing-capture recovery:** AC-001 did not save a physical capture. Its inherited `identity.ts` is needed by AC-002 and is absent from AB-001/AC-002 captures. The copy was accepted only after its bytes matched AC-001's sealed ledger hash `c901ec3820d44c1f9d7a5e5f4709caf162a85f3254d08d1537ea0401adfc067f`. No other active-prototype source is used as a fallback. Reconstruction fails if that hash differs; there is no silent latest-version substitution. The resulting copy is included in this package, so running the package does not need the original workspace.

Source files and contracts retain their exact bytes, including experimental names and original relative documentation references. Those references describe historical context; package-local navigation starts here and in the handoff contract documents. The seven `*_CONTRACTS.md` files are the actual AC-002 contracts. They remain experimental, not promises of complete legacy behavior.

`reconstruct.mjs` records the one-time packaging procedure and requires the original research tree; it is **not a setup or verification prerequisite**. A fresh Context uses the included files and the package root runner below. It must not rebuild from active/legacy source or run reconstruction to start production work.

## Run

Verified runtime: **Node 25.5.0**. Node runs erasable TypeScript directly. The copied lockfile pins **TypeScript 5.9.3**, `@types/node` 25.9.8, Prettier 3.6.2 and `undici-types` 7.24.6; these are development tools, not application runtime dependencies.

```powershell
# From executable-reference:
npm ci --ignore-scripts --no-audit --no-fund
# Verify only the unchanged sealed closure and its node/host examples:
node verify-reference.mjs
# Then from the handoff package root, run the complete IH-002 verification:
cd ..
node tools/run-handoff.mjs
```

For an existing npm cache, add `--offline --cache <cache-directory>` to `npm ci`. Verification checks all copied hashes, runs strict typecheck, the entire copied test suite, the demo and the sealed contract sample, then typechecks/runs the three small node/host examples. No source or sealed baseline is changed.

`verify-reference.mjs` alone does **not** prove B01/M01 repaired. The package root `tools/run-handoff.mjs` includes direct repair cases, canonical Panel/Widget examples, strict typechecks, boundary checks, progress-locator cases, handoff integrity checks and the sealed regression wrapper. Its report is `../audit/evidence/RUN_HANDOFF.json`. `--package-only` deliberately omits the sealed regression and cannot replace a full rerun. Commands are instructions, not evidence of successful execution; use the actual dated report and logs. No command creates a production checkout or starts S01.

Two copied tests require Playwright plus a browser. The package verification wrapper **does not use the original tests' implicit Codex runtime fallback**. It selects either an explicit `GRAPE_PLAYWRIGHT_PATH` or `browser-tools/node_modules/playwright/index.mjs` within this directory, and records the selected provider, package version/hash, browser channel and observed browser diagnostics. Absence is recorded as skipped; the full verification report will not pass. Nothing is silently downloaded.

The verified tooling is **Playwright 1.62.1** with Edge **154.0.4258.48**, ANGLE SwiftShader. To obtain an independent local provider (requires network access for installation), from this directory:

```powershell
npm install --prefix browser-tools --ignore-scripts --no-audit --no-fund playwright@1.62.1
# Edge must already be installed; the documented default channel is msedge.
node verify-reference.mjs
```

That command generates a separate browser-tools package/lock; it does not change the sealed reference package-lock. Alternatively point to an already installed Playwright package explicitly:

```powershell
$env:GRAPE_PLAYWRIGHT_PATH = 'C:/tools/playwright/node_modules/playwright/index.mjs'
$env:GRAPE_BROWSER_CHANNEL = 'msedge'
node verify-reference.mjs
```

For a different supported environment, install its browser using `node browser-tools/node_modules/playwright/cli.js install chromium` and explicitly select `GRAPE_BROWSER_CHANNEL=chromium`. Its new verification result applies to that recorded browser, not to the previously verified Edge runtime. Playwright/browser prerequisites are outside the sealed development lockfile. A successful software renderer run still does not prove TD or physical-GPU compatibility.

The first handoff rerun used the original implicit fallback before this packaging guard was added. Its report and logs remain in `evidence/prior-implicit-browser-run`; `TOOLING_NOTE.json` labels the later metadata inspection honestly. The current wrapper's report records selection at execution time.

The frozen compute test writes a relative sibling evidence path. The verification wrapper therefore stages exact source/test bytes in `evidence/runs/<run>/architecture-core-prototype`; all resulting outputs stay under this directory's `evidence`. Dependencies resolve from this directory's installed locked tools. Do not use the copied historical `validate.ts` as the handoff verification command: its original path assumptions differ. `verify-reference.mjs` is a packaging wrapper, not a new architecture implementation.

## Zero-install runtime examples

From the handoff root:

```powershell
node --test examples/minimal-node/example.test.ts examples/dynamic-interface-node/example.test.ts examples/minimal-host-adapter/example.test.ts
```

These examples use only Node built-ins and copied TypeScript interfaces. They require no npm modules and do not launch a browser or host. Their scope is registration, fixed/dynamic ports, Graph mutation/History/reload, and a fake receiving-host provider. They cannot certify production adapters.

`evidence/PACKAGE_VALIDATION.json` and the referenced logs distinguish this package rerun from the historical AC-002 evidence. A successful rerun does not resolve any inventory UNKNOWN, alter CQ-001 or authorize Migration.

## IH-003 production boundary

Public normativity and closed-bound replacement are classified in [13](../13_PRODUCTION_CONTRACT_SURFACE.md). `contracts.ts` and the 37 sealed files remain evidence, not a production starting codebase. Do not copy core.ts or qualification class structure into production; port contracts and behavior tests to the new implementation. Additional IH-003 localization/open-surface probes live in repair; production DTO/codec qualification lives in ../contracts. Their implementations are still bounded examples, not a ready production persistence/UI/registry. Run the root runner for the complete current revision.
