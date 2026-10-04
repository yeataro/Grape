# Grape

Grape is a shader graph authoring application. The product owns its documents, model values and editing History; hosts such as TouchDesigner are external execution/integration targets.

This directory is the repository root. It is ready for Git initialization and GitHub publication; no directory restructuring is needed.

- **Accepted architecture:** [handoff/00_README.md](handoff/00_README.md), revision **IH-005**.
- **Owner-approved external amendments:** [DEC-GRAPE-002](decisions/DEC-GRAPE-002.md) records float/vector Edge conversions and Image Output admission; [AC-GRAPE-001](decisions/AC-GRAPE-001.md) specifies their versioned contract amendment. Requirements are implemented and Human Owner accepted within bounded S04 at I `0c13932150bf1b78f215e25721292962e6c4263a`, independently reviewed R `985357be67cce2f2ecc232e827e83e5cdbb521ab`. IH-005 remains frozen. This documentation grants no Slice authority and does not change the current production format below.
- **Owner-approved subgraph emission amendment:** [DEC-GRAPE-003](decisions/DEC-GRAPE-003.md) and [AC-GRAPE-002](decisions/AC-GRAPE-002.md) define optional function emission, constant qualification, persistent Library choices and atomic mode-change recovery. Decision references are assigned to the explicitly authorized early S05 function-mode batch. The legacy-sample delivery repair is self-checked at I `b0d61c61d35908f6332b439aae539ce87bf854c5`, pending targeted independent review and Human acceptance. The prior Uniform repair PASS remains bound to I `9230f9652c2affd4c20a7dda1033baaa0d61f7e1` / R `4df5492d4283c2fac7005fc583760ebe143f13bd`; its original FAIL and all historical evidence remain preserved; S04 owner-coded data preservation remains its unchanged accepted scope.
- **Writable document format:** **grape.document 2.1**. Version 1.0 is recovery-readonly unless processed by an explicit supported converter. See [document contract](handoff/14_DOCUMENT_FORMAT.md).
- **Mutable project state:** [implementation-state.json](implementation-state.json). **S01 is completed and Human Owner accepted** at implementation `c1ecb3cd1a4cd1685e3fb1d9ba2a17b4108e68c3`, reviewed PR HEAD `ab0216436d66ab1282758d51dceb38d0283c1965`. Its accepted evidence remains unchanged. **S02 is completed and Human Owner accepted as bounded scope** at implementation `e23a997f53a17f3e00bf7f83de489cfaeb367251`, reviewed PR HEAD `45c08a5b27beb9c57797975cea8007c35640e16c`, following targeted independent re-review PASS. See `production/evidence/acceptance/s02/README.md`. AT-S02-03 legacy compatibility remains **NOT DELIVERED / BLOCKED** (Classification A); G-VERSION-COMPAT remains unresolved for that branch. **S03 is completed and Human Owner accepted within its reviewed scope** at implementation I `80ee116b8f809c9160aa9cc311801cce15923cee`, independently reviewed R `c209bba451149b9d54a6a54c3b35dd28f39225f3`; AT-S03-01 through AT-S03-04 and the original environment/limitations are bound by `production/evidence/acceptance/s03/closeout-20261004-01/accepted-scope-01.json`. **S04 is completed and Human Owner accepted within its reviewed scope** at implementation I `0c13932150bf1b78f215e25721292962e6c4263a`, independently reviewed R `985357be67cce2f2ecc232e827e83e5cdbb521ab`; the eleven acceptance families, DEC-GRAPE-002/AC-GRAPE-001 and [DEC-GRAPE-004](decisions/DEC-GRAPE-004.md) bounded Personal roundtrip behavior are bound by [S04 accepted scope](production/evidence/acceptance/s04/closeout-20261004-01/accepted-scope-01.json). [Current operation guide](production/evidence/acceptance/s04/closeout-20261004-01/OPERATOR-GUIDE-01.md) supplements the accepted delivery. Current production format remains **grape.document 2.1**. Accepted S01-S03 scopes are unchanged. S04 PR #5 is merged at `6aa6abbdc46d55753111d5ef5ca9899870a8805a`. **S05 is explicitly authorized and active**, beginning the complete DEC-GRAPE-003/AC-GRAPE-002 function-mode batch; this is not completion of the full S05 catalog. S06 has not started. S05 acceptance, publication, merge and the next Slice are not granted.
- **AI working instructions:** [AGENTS.md](AGENTS.md).
- **Non-normative working notes:** [Open questions](notes/OPEN_QUESTIONS.md). Unverified discussion only; not implementation assignments, Slice authorization or acceptance criteria.
- **Acceptance record:** [HANDOFF_ACCEPTANCE.json](HANDOFF_ACCEPTANCE.json) binds the owner's accepted targeted-review PASS to the exact frozen index. Frozen review-time `pending`/`READY FOR TARGETED RE-REVIEW` labels are historical; they do not override this acceptance. Acceptance does not pass runtime Gates or authorize production work.

DEC-GRAPE-001 is already part of IH-005: G-MIXED-HISTORY and LC-UI-100 are `DEFERRED_BY_PRODUCT_DECISION`. Current behavior is domain-separated History, with runtime observations outside Graph History. No duplicate decision is added to current state. LU-UI-009, stale replies, CAS, conditional writes, receipts and divergence protections remain required.

Read the relevant contracts and [implementation plan](handoff/08_IMPLEMENTATION_PLAN.md) when a slice is authorized. First implementation will be the host-free S01 document → graph → node → parameter → connection → generation → save/reload path. Architecture review is complete; real contract conflicts use the accepted change workflow. Framework, production folder layout and production package manager have not been selected by this bootstrap.

## Verify

Use **Node 25.5.0**, the version used for the accepted qualification. These commands are portable Node commands and do not need the original workspace or a TouchDesigner installation:

```sh
node tools/verify-bootstrap.mjs
node handoff/tools/check-implementation-state.mjs --current
node --test tools/verify-bootstrap.test.mjs
```

The first command is read-only: it verifies every indexed file, the accepted index digest, current-state rules and relocated Handoff integrity checks. It is **not** a full runtime qualification. [BOOTSTRAP_VALIDATION.json](BOOTSTRAP_VALIDATION.json) records the packaging checks actually performed.

For a full qualification replay, use the staging wrapper:

```sh
node tools/verify-handoff.mjs --install-tools --install-browser
```

This opt-in command downloads the Handoff's locked test tools and Playwright **1.62.1**, and installs Chromium. It copies the frozen files into a unique OS temporary directory, runs the existing runner there, reports results and rechecks the original. New logs/dependencies stay in that disposable directory, **outside this repository**. Required browser system libraries must be available; missing dependencies or skipped browser tests are never a full PASS. Use `--package-only` to deliberately omit sealed reference/browser qualification; its result is labeled separately. These are qualification-tool choices, not production dependencies or a UI framework choice.

Offline/existing tooling may instead be explicitly supplied through `GRAPE_QUALIFICATION_NODE_MODULES` (locked `executable-reference` development dependencies), `GRAPE_PLAYWRIGHT_PATH` (Playwright `index.mjs`) and `GRAPE_BROWSER_CHANNEL`. Otherwise the wrapper gives a prerequisite error; it does not use hidden machine-specific fallback paths. Historical browser evidence used Windows/Edge/SwiftShader; a Chromium/cloud replay must be judged on its own recorded environment, not assumed equivalent to physical GPU/TD integration.

`handoff/` contains all accepted provenance/evidence needed for implementation. Historical external source paths describe origins; they are not setup dependencies. Do not run the frozen reconstruction or finalizer, and do not run its write-producing qualification runners directly inside `handoff/`. `.gitattributes` preserves exact frozen bytes across Git checkouts.

The current-state field `currentRecord: "../implementation-state.json"` is the accepted **Handoff-relative locator**: resolved from `handoff/`, it names the root file. It is intentionally unchanged. `implementationBaseline: null` means production has not started; accepted Handoff identity is separately recorded in `handoffRevision` and the acceptance record. Once S01 is explicitly authorized, record real progress using the existing schema and validators; do not invent a baseline/build/evidence in advance.
