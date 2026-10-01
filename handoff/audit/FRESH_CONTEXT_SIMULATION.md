# IH-005 package-only implementation walk-through

**Self-check and peer cross-check, not fresh blind independent acceptance.** Answers use only files in this package. Historical IH-004 self-check remains in previous-IH-004/.

| Implementer's question | Current answer / entry |
|---|---|
| What is the product? | Product-owned shader Graph authoring application, external execution targets. 00 / 01. |
| Why refactor? | Preserve observable product intent while making ownership and extension boundaries maintainable. Legacy supplies evidence, not architecture. 00 / 11. |
| Where is canonical state? | Graph owns Node/Parameter values, references and semantic History. Application persistence owns document I/O. Neither UI nor Host has a second canonical model. 02 / 03. |
| What is Host? | External execution/integration target with its own runtime actual state; Binding carries authority, conditional intents and receipts. 06. |
| How do Parameter edits work? | Same ScopedParameterTarget resolves spec/value/link/projection/write; UI uses scoped field commands; Application/Graph Operation commits semantic edit. 04 / scoped contract / 16. |
| How does an ordinary Node register? | Exact module/NodeType definition, feature presentation/locales, normal registry wiring; initialization/ports/validation/emission through public SDK. 04 / 13 / minimal-node. |
| How does a Dynamic Node change shape? | Module derives candidate schema; Graph transaction reconciles ports/values/Edges/diagnostics/losses coherently. Capture prior port snapshot for removed values. 04 / 14 / dynamic example. |
| How does an ordinary Panel appear? | Register feature type; workspace factory/restore/initial routing; Panel creates view; generic renderer mounts/captures/updates without feature-specific switch. 04 / 16 / minimal-panel. |
| How does an editable Panel issue a command? | Type requests IDs, Application grants, workspace captures instance and target; renderer injects optional commands bound to current event. No Graph/Operation/private workspace access. 17 / editable-panel. |
| What happens on hide or failed rendering during a gesture? | Application cancels that unfinished pointer Operation, not Widget drafts or committed edits. Cleanup publication drains to fresh leases before workspace returns. PC12/PC13 / 17. |
| How does a Widget join? | Registered presentation/projection plus feature view type, same scoped Parameter read/write authority, localization owner and mount semantics. 04 / 15 / 16 / widget examples. |
| How does a profile extend generation? | GLSLProfile consumes immutable admitted Snapshot/Stage programs; exact artifact outputs and diagnostics, no Graph mutation. No arbitrary-language promise. 13. |
| What does S01 actually save? | grape.document 2.0, exact fields in contracts/document-format.ts, product GraphKind identity independent of Host. Captured ACK semantics; new loadId on reload. 14 / DF tests. |
| What is serialized adaptation? | Six required fields with core schema grape.edge-adaptation@1, sourceType/targetType, named operation and inert extensions. Same-snapshot admitted plan, not runtime object/debug text. 14 section2a / DW01. |
| What is serialized loss/recovery? | Versioned inactive records with typed edge/input-value/node/resource/module payloads. Exact owner/codec for module payload. Never automatically replay; semantic validation recomputed. 14 section2b / DW02-13. |
| What happens with unknown or malformed subfields? | Unknown structural semantics: recovery-readonly retaining raw source. Wrong known required type/shape: reject. Explicit opaque regions preserve data; missing module retains opaque placeholder. Editable syntax is not a generation grant. 14 section2c / DW tests. |
| How to attach Host? | Capability discovery, explicit exact Target/session/authority, Binding, immutable generation/publication, receipt/readback. 06; unsafe runtimes remain gated. |
| Static / Node / Electron difference? | Same application core; bootstrap/capability providers/bridges differ. Platform APIs stay outside core. 07. |
| What starts implementation? | Separately authorized S01 host-free create/edit/connect/generate/save/reload; use current IH-005 contracts and external current-state locator. This repair does not authorize starting. 08 / template / checker. |
| Is Mixed History needed to finish current S08/S09? | No. DEC-GRAPE-001 defers coordinator/LC-UI-100/original AT-S09-03. Ten domain-separated cases are required, unexecuted. LU-UI-009/CAS/receipt/load fences remain. 08-12 / decision README / data indices. |
| What remains gated? | Real TD/native/GPU/browser/TOE/TOX/runtime integration and separate public schema stability promise. 10. None requires S01 to invent architecture or obtain Host evidence. |
| What must be rejected? | Host canonical Graph, second UI parameter truth, generator mutation, private module access, broad type-name switches, core native APIs, qualification-code foundation, spoofed or stale Panel authority. 03 / 09 / 13 / 17. |

Peer checks reproduced two actual defects (nested enum coercion and cleanup publication routing), now fixed and directly tested. No remaining contradictory canonical answer was found in this walk-through. **S01 architecture decisions still to invent: NONE. S01 blocking external information: NONE.** This is a scoped sufficiency judgment, not acceptance, performance qualification, or permission to start implementation.
