# S01 contract map and review checkpoints

The accepted baseline is IH-005. Root `HANDOFF_ACCEPTANCE.json` establishes acceptance; root `implementation-state.json` is mutable progress truth. The Human Owner's subsequent explicit S01 authorization is recorded by S01's active state. Historical bootstrap prose and frozen review-time labels do not override those records.

## Production owners

| Contract / immutable invariant                                                                                                                                                    | Production entry                                                      | Evidence                                                                                                                  |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| One canonical Graph; synchronous poisoned Draft; atomic values, ports, edges, losses, diagnostics; immutable snapshots                                                            | `src/model/graph.ts`                                                  | `tests/unit/model.test.ts`: AT-01/02/03/08, boundary and invalid-module cases                                             |
| Exact pinned definitions, open stage/kind/type identities, shared adaptation; no Node-name dispatch                                                                               | `src/definitions/registry.ts`, `types.ts`; `src/modules/`             | Model type admission, missing definition and malformed plan tests                                                         |
| Graph Operations group batches; no-op/cancel preserve redo; selection/camera stay outside Graph History                                                                           | Graph plus `EditorContext` in `src/application/editor.ts`             | AT-04/06; browser pointer cancel and two-Canvas tests                                                                     |
| Application owns editing authority; Panel requests do not grant it; latest lease + mounted synchronous event required                                                             | `src/ui/workspace.ts`, `src/application/editor.ts`, `src/ui/mount.ts` | `tests/conformance/ui.test.ts`: denied grants/readonly/busy, stale/cross-Panel lease, same-ID reuse, async/render fencing |
| Gesture origin guards Context/Panel lifetime; mount failure cancels only unfinished origin gesture; publications drain before workspace action returns                            | Workspace command-depth cleanup queue and Graph Operation             | Hide/move/detach, render-failure and lease tests                                                                          |
| Canvas/Inspector use registry → factory → restore → receive → createView → shared mount                                                                                           | `src/features/`, `src/ui/`, `apps/web/main.ts`                        | Two independent Panel contributions, distinct Widget contributions, actual Chromium UI, shared failure/retry              |
| A scoped field supplies spec/value/type/link/token/write; local draft is not model authority; ABA, busy, readonly and dead targets reject                                         | Application `parameter`, `FieldDraft`; WidgetRegistry/WidgetSlot      | Scoped token tests; browser scalar draft/IME/readonly; target invalidation                                                |
| One projection/mount contract; reverse cleanup, failure isolation, stale tickets, reentrancy placeholder; no concrete feature imports in renderer                                 | `src/ui/mount.ts`, `widgets.ts`                                       | VM tests plus injected DOM failure/retry                                                                                  |
| Snapshot-only generation, full-model error admission before reachability pruning, declared boundary maps, keyed artifacts and provenance                                          | `src/generation/compiler.ts`, `src/modules/image.ts`                  | AT-01/03, unused error and missing boundary emission tests; real UI output                                                |
| Exact 2.0 wire schema and six-field adaptation; inactive tagged loss/recovery; unknown structural input remains readonly, malformed input rejected; module-private JSON preserved | `src/persistence/codec.ts`, `src/sdk/document.ts`                     | `tests/unit/persistence.test.ts`; error-bearing browser save/reopen and original-byte recovery                            |
| Persistent IDs survive; new loadId and empty History; stale targets cannot attach to new load                                                                                     | Application open + Graph hydration                                    | AT-05 model and browser; delayed-open revision/lifetime fence                                                             |
| Save captures before await; ACK names that content; rejection/SAVE_BUSY/download cannot clear newer dirty                                                                         | Application save + `BrowserStorage` transaction completion            | AT-07 model and browser, delayed ACK and quota denial                                                                     |
| TextRef belongs to exact feature owner; menu enum values are independent of translated labels; UI locale cannot mutate model                                                      | `src/localization/service.ts`, feature catalogs, shell-only catalog   | `tests/conformance/localization.test.ts`; common ViewFrame text resolver                                                  |
| Production dependency policy against real source roots                                                                                                                            | `conformance/ownership.json`, `tools/boundaries.mjs`                  | Actual manifest plus generator→Graph, model→DOM, and ordinary-extension→core negative probes                              |

The manifest's public classifications were reviewed: Graph/definition construction are services; Draft is mutation; Application/Context and editing views are commands; browser adapter objects/functions are environment capabilities; DTOs and pure module contribution declarations are contracts. An export marked `contract` is not a blanket permission for a module callback to mutate Graph. The static checker explicitly cannot prove callback purity, a truthful manifest, DOM semantics or malicious-plugin isolation; the behavioral tests and source review complement it.

## Independent implementation and declaration provenance

Only production-facing declarations seed `src/sdk/public-surface.ts`, `localization.ts`, `view-mount.ts`, `panel-commands.ts`, and the DTO prefix of `document.ts`. Their authoritative sources are the matching IH-005 files under `handoff/contracts/`. `document.ts` excludes the Handoff codec implementation. All model, codec, compiler, registry, application, UI, browser adapters, and tests were written in production. No Legacy or qualification implementation is imported or copied as the production foundation.

The tools copied into a temporary directory are the unchanged `check-production-boundaries.mjs` and its `check-boundaries.mjs` dependency. Their role is validation only. Node modules remain in `production/node_modules`, and all frozen source bytes are checked by root verification.

## Six implementation boundaries

1. **Scaffold/contracts:** separate production root, strict Node pin, locked TypeScript/Vite/Playwright, SDK declarations and explicit ownership manifest. Check runtime, TypeScript and real source boundary policy.
2. **Walking skeleton:** exact built-in definitions, new image Graph, action/Canvas/Inspector/Code contributions, snapshot generation, ACK save and reopen. Exercise AT-01 and AT-05 through the real entry.
3. **Editing:** shared fixed/dynamic mutation, port admission, local drafts, complete loss capture, grouped movement, Undo/Redo. Exercise AT-02/03/04, including error-bearing save and generation refusal.
4. **Context/lifetime:** two contexts, selection cleanup before observers, event/lease authority, mount revocation, rendering failures and retry. Exercise AT-06/08 and PC/VM negatives.
5. **Persistence:** strict codec, opaque data, readonly/raw recovery, exact adaptation, async save/open fences. Exercise AT-05/07, wire corpus, quota denial and byte-preserving recovery.
6. **Browser/review:** declared Chromium desktop scope, focus/keyboard/pointer/composition event tests, exported JSON, source/build hashes, root integrity. Prepare evidence for review; do not mark S01 complete.

## Gates and decisions

No new architecture or product decision was required. DEC-GRAPE-001 remains inherited: mixed History is deferred; S01 uses Graph-domain History only, retaining the applicable load/lifetime/CAS protections.

- **G-UI-CONFORMANCE / G-EXTENSION-PANEL:** production Chromium and conformance evidence is supplied for the declared S01 scope, pending review. It is not global Gate closure or S06 acceptance.
- **G-LU-UI-001:** desktop Chromium pointer/focus/fractional zoom evidence only. Physical iPad/Safari, touchscreen and platform-specific controls remain open.
- **G-LU-UI-003:** declared S01 readonly/history-busy actions and field guards, draft handling and simulated composition events are exercised. Native OS IME and every later public action/native-busy cross-product remain open.
- **G-LU-NODE-005:** no claim that the old Legacy fixture failure or Auto/typed-value family was resolved; the new Float/Multiply/Compose path uses the specified semantics. The old fixture is not a foundation or dependency.
- **G-EXTENSION-WIDGET-SCOPE:** root scope is the permitted S01 delivery scope; nested rendering remains unqualified. Scope/load/Context/token identity is retained now.
- **G-HANDOFF-CQ-OWNERSHIP / HC-001:** normative Graph/Generator/save responsibilities are followed; quarantined source-summary wording is not used as authority. Source correction is not claimed.
- **G-DOCUMENT-STABILITY:** internal 2.0 persistence does not make an external/permanent compatibility promise.

Remaining Gates do not authorize S02+, Host integration or a release. No Gate resolution or accepted evidence is inserted into current state by this implementation.

## Authoritative repository sources

- Root `AGENTS.md`, `README.md`, `implementation-state.json`, `HANDOFF_ACCEPTANCE.json`.
- `handoff/00_README.md`, `01_PRODUCT_MODEL.md`, `02_ARCHITECTURE_SPEC.md`, `03_RESPONSIBILITY_AND_DEPENDENCY.md`, `04_EXTENSION_MODEL.md`, `05_DATA_AND_LIFECYCLE.md`.
- `handoff/08_IMPLEMENTATION_PLAN.md`, `09_ACCEPTANCE_AND_CONFORMANCE.md`, `10_KNOWN_GATES.md`, `12_DECISION_LOG.md`, `13_PRODUCTION_CONTRACT_SURFACE.md`, `14_DOCUMENT_FORMAT.md`, `15_LOCALIZATION_CONTRACT.md`, `16_VIEW_MOUNT_CONTRACT.md`, `17_PANEL_COMMAND_CONTRACT.md`.
- `handoff/data/production-contract-ledger.json`, `data/slices.json`, `data/gates.json`, and `audit/HANDOFF_CONFLICTS.md`.
- `handoff/contracts/public-surface.ts`, `document.ts`, `localization.ts`, `view-mount.ts`, `panel-commands.ts`; `handoff/tools/check-implementation-state.mjs`, `check-production-boundaries.mjs`, `check-boundaries.mjs`; root `tools/verify-bootstrap.mjs` and its tests.

Implementation bugs discovered during conformance review were fixed as engineering defects. No counterexample requiring an architecture change was found.
