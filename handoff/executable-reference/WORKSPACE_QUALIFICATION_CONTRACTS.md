# Workspace / authoring qualification contracts

Status: experimental additions to AB-001, not replacement of the baseline and not product migration. Product inputs are only the root `LEGACY_CAPABILITIES.json` and `LEGACY_BEHAVIOR_CONTRACTS.md`. No legacy implementation or legacy inventory workspace was read during this qualification.

The code is `qualification-workspace.ts`. Cases WS01–WS46 in `tests/qualification-workspace.test.ts` exercise real Graph, Registry, DefinitionSet, EditorContext, Parameter, History, persistence and generator APIs. The inventory mapping is `../architecture-coverage/qualification/workspace-analysis.json`. The root change ledger must record the shared core extensions before treating these additions as qualified constraints.

## Preserved boundaries

* Graph is the sole persistent truth for authored nodes, references, resources and node visual metadata. The services below own no duplicate document.
* EditorContext owns selection/navigation. Two contexts may reference the same Graph. CanvasView owns its own camera. Workspace layout and fields in progress do not become Graph history entries.
* A Graph operation may publish multiple previews while committing one history entry. Layout, selection and camera are not silently included in that history.
* Definitions and their module capabilities are immutable pinned inputs. A module cannot query a mutable global registry while generating an existing Graph.
* Uniform defaults belong to the authoring Graph; actual host live values belong to a Binding. Changing a source default never writes a host value.
* Missing resources/modules remain serializable error states. An error blocks generation; preservation is not successful execution.

## Explicit supplemental decisions and naming

| Addition | Why it exists; scope of the change |
|---|---|
| `WorkspaceQualification` | A qualification manager for placement, activation, links and panel lifetime. It is not an alternate Editor or Graph. |
| `Region → PanePlacement → tab IDs` | A binary split tree lays out empty regions. Panel content instances live in the workspace registry, independent of tab-strip location. This resolves the earlier physical-layout/ownership ambiguity. |
| `linkGroup=0` | Follows the last explicitly activated Canvas globally. Positive groups follow their own last activated Canvas. Merely opening a Parameter panel never steals activation. |
| logical inspector pin | A pin holds context + node identity. A deleted target displays nothing; Undo may make that identity available again. Normal selection is pruned on deletion and is not recreated by Undo. |
| `EditorContext.objectSelection` | The sole selection state now stores typed stable references to node, edge, frame or resource. Existing `selection` remains a derived node-only compatibility view, not a second source of truth. |
| `FieldDraftQualification` | Unfinished text and IME composition are widget state. Commit rechecks both the original value and schema, not the whole Graph revision; unrelated node movement need not invalidate a text edit. |
| `ResourceQualification` | Source and subgraph services use type-tagged Graph resources. This is a logical grouping of methods, not a second storage layer. |
| `ModuleContext.resolveType/referenceId/inputSource` | Pinned definition lookup, stable reference identity, and upstream typing are available without exposing Registry mutation or duplicating resource IDs in node state. |
| `NodeModule.resourceValidators` | Resource-only or unused definitions still need whole-document validation. A definition becomes neither valid nor executable merely because no output currently reaches it. |
| `NodeType.stateReferences` | The module owns knowledge of references encoded inside its custom state. `collect/remap` prevents a third registry drifting out of sync and prevents replacing arbitrary strings in code or notes. |
| `Draft.importNode/connectEndpoints/requireValid` | Clipboard hydration is not initialization. Imported serialized state must not be passed as presumed initializer arguments. Batch-local endpoint IDs permit connection before public handles exist. A transaction may require a completely valid final candidate before publication. |
| `Draft.replaceDocument` | Accepted import keeps the current Graph object, ID, loadId and exact module/definition pins, but replaces its authored document in one Undo entry. Destructive Reload Applied is a different lifecycle command. |

These are experimental decisions made in qualification. They must not be reported as previously confirmed conversation decisions. None makes an OS/browser/host adapter part of the application model.

## Workspace operations

| Operation | Ownership and precondition | Successful result / mutation boundary | Failure and notification | Identity, lifetime and Undo |
|---|---|---|---|---|
| `registerCanvas(id, graph)` | Workspace owns a unique nonempty panel ID; Graph already exists. | Creates one EditorContext and one CanvasView referring to that Graph. Does not place the panel. | Duplicate ID returns `PANEL_ID`; no other instance changes. | Closing this Canvas later disposes its context only. No model history. |
| `registerPanel(id, kind)` | Workspace registry; supported non-Canvas kind and unique ID. | Creates content identity without a document copy. | Duplicate ID rejected. | Layout and content registration have distinct lifetimes. |
| `applyLayout(candidate)` | Candidate refers only to registered matching content kinds. Each tab is docked once; every pane occurs once in the split tree; active tab belongs to its pane; split ratios and floating dimensions are finite valid values. | Canonical copy is validated completely, then becomes the layout in one assignment. Queries return frozen detached snapshots. | Duplicate placement, invalid split, missing pane, duplicate floating tab/slot or changed kind rejects without altering prior layout. Synchronous method return is the UI-state publication boundary; Graph emits nothing. | Does not mutate Graph, history, camera or panel content. Layout persistence adapter is separate. |
| `activateCanvas` / `select` | A live, placed Canvas; selected node IDs and primary valid in that context. | Context selection changes, then activation identifies which linked panels follow it. | Validation occurs before selection to prevent a failed activation leaving partial state. | Group routing uses context identity. No model Undo. |
| `pinParameter` / `parameterTarget` | Parameter panel and live context target exist at pin creation. | Stores a logical reference; query resolves it every time. No cached old node object is authoritative. | Invalid pin rejected. Deleted/disposed target produces `null`, not a stale inspector. | Pin is UI state. Undo of deletion may restore the identity; ordinary selection stays empty. |
| `closeCanvas` | No Graph operation is active, including an operation from a different context sharing the Graph. | Editor disposes the context; registry/activation/requests/layout references are removed, empty pane collapsed. Graph and other contexts remain alive. | Busy close rejects atomically. | The model is not unloaded or discarded just because its UI tab closes. No model Undo. |
| `inspect` | Captures current Canvas context, Graph loadId/revision and stage, and increments request serial. | Runs a producer on the captured immutable snapshot. Publishes only if context, serial, load, revision and stage still match. | Stale completions return `STALE_VIEW`; errors return `INSPECTION`. No model state changes. | A fresh code panel is not a new code-generation ownership layer. Conservative revision invalidation currently includes visual-only model edits. |

`EditorContext.selectObjects` accepts typed node/edge/frame/resource references. Nodes and edges must belong to the active Stage; frame records must explicitly declare that Stage's ID; resources are Graph-scoped. Duplicate or missing references and an invalid primary reject atomically. Graph projections prune deleted references before ordinary observers run. Undo restores model objects but never reconstructs an old UI selection. Stage navigation clears the typed selection. `WorkspaceQualification.parameterObjectTarget` exposes the actual typed primary; the legacy node-only target query returns null when that primary is an edge/frame/resource. WS28–29 exercise those paths. Default/Minimal preset payloads, preference persistence, drag/drop DOM behavior and OS Fullscreen have not been implemented by this file.

## Widget drafts

`FieldDraftQualification` holds a Parameter handle, its original canonical value and complete presentation schema, and text/composition/disposed state. `setText` does not write the Graph. `commit(parse)` rejects a closed field, active composition, changed schema, changed value, deleted parameter, parse failure, or a value rejected by Parameter.write. The failed draft remains visible and the Graph and history remain unchanged. On success the existing Parameter mutation path is used, then the draft baseline refreshes. `cancel` closes the widget draft without writing.

A node move is not a conflicting value edit. A concurrent writer changing that same parameter is. A dynamic port disappearing must not redirect a stale widget to a similarly positioned neighboring input. Export always captures committed Graph data, never the text currently in the widget. This is model-level IME isolation, not a claim about actual native keyboard events.

## Source resources and node references

The executable qualification source schema is intentionally bounded:

```ts
{ kind: 'source', sourceKind: 'uniform' | 'constant',
  name: string, valueType: 'float', default: number }
```

Names must be unique among Graph sources. Values are finite without float32 overflow. `createSource`, `setDefault`, `renameSource`, `removeSource` and `retargetSource` validate their domain-specific preconditions and then issue one Graph.change. Invalid proposals publish nothing. A source reference node has empty state and `references.source = {kind:'resource', targetId}`. A source's ID is not copied into another state field.

Uniform emission uses that stable ID. Multiple nodes referencing one Uniform declare it once. Rename/default changes leave uniform GLSL unchanged. Constant default changes change generated code. Host live values do not enter these mutations. Removing a used source leaves the node's reference intact, yielding an error that survives save/reload; Undo restores the resource and exact generated result. Retargeting is one ordinary Graph history step.

Unused source resources are also validated by module resource validators. Unknown modules preserve their source payload and node references without claiming it can execute. Vector/matrix/source-slot/native binding variants need their corresponding resource descriptors and host adapter policies; the float test does not claim those product variants have all been implemented.

## Actual subgraph Network mechanism

Graph resources contain authored definition data, not runtime compiled caches. A call node references a definition resource. The resource carries `scope`, `origin`, dependency IDs and either an initial bounded `scale` body or an executable `network` body:

```ts
{ kind: 'network', ports: PortSpec[], nodes: NodeRecord[],
  edges: { from: Endpoint, to: Endpoint }[],
  outputs: Record<outputPortKey, Endpoint> }
```

The network contains one protected input-boundary Node whose resource reference points to its own definition. Its output ports project the definition's input interface. Output projections explicitly identify internal output ports. Thus an Edge still connects Node endpoints; the boundary is not a new non-Node endpoint exception.

Validation checks the complete network, including unreachable nodes: unique node and interface keys, existing pinned modules, valid state, target/stage eligibility, local/default input validity, references, exactly one self-owned input boundary, declared dependency equality, unique input connection, endpoint compatibility, data cycles, nested definition cycles, and every output projection. Ports are derived in dependency order, with `inputSource` available for connection-inferred modules. The module layer performs this work; the Graph does not dispatch by names such as Multiply or Voronoi.

Generation invokes the pinned NodeType emitters recursively. Constant, Multiply, Source and another Subgraph call use the same interface. Local symbols include the complete call occurrence path and internal node ID. Helpers are deduplicated by definition identity rather than occurrence, and effects/statements propagate through the call. Values and type conversions use the shared type environment and adaptation rules. A reused definition must not cache an output expression across callers with different inputs.

`editNetwork` writes a proposed graph-owned definition body through one Graph.change. All call ports are recalculated from the same definition. Stable keys preserve compatible connections; deleted keys produce explicit loss records under the normal detach policy. Undo restores the whole body, all call port caches and edges together. Structure shape changes instead use the core module-specific `invalidEdgePolicy:'preserve'`; they are not conflated with interface-key deletion.

`independent(callId,newResourceId)` clones only the directly referenced definition, rewrites its own input-boundary reference, and redirects only the chosen call. Nested dependencies remain shared. No library is modified. `forkLibraryDefinition(id,replacement?)` is the user-facing semantic-edit path for library snapshots: it allocates new local identities for the target and affected nonlocal caller definitions, keeps origin attribution, rewrites every relevant Graph reference including local parents, then commits the entire replacement in one history entry. The lower-level `editNetwork` can edit an already graph-owned snapshot directly; a product UI must route first library semantic edits through the fork command. Pure visual metadata edits do not fork.

Remaining limitations: full cross-boundary selected-node gathering, free spare-port creation UI, every per-type reshape policy and complete nested Canvas rendering have not been implemented here. The bounded closed-selection grouping below qualifies the admission/transaction boundary. The scoped editor mechanism below is exercised with actual graph-owned networks. No TD shader backend or GPU result is claimed by the workspace Node generator assertions.

### Interface edits invalidate nested callers too

WS44 exposed a gap in the first interface-edit path: root call ports reconciled, but calls stored in another definition retained old values and edges, including unused definitions. WS45 exposed the corresponding library-fork defect: an ancestor was strictly validated before its now-obsolete incoming edge could be reconciled, so a legal child interface edit rejected the fork.

`reconcileDefinitionCallers` now builds the affected closure over declared dependencies and actual call references in one detached Graph candidate, orders definitions child-first, and calls the existing `reconcileNetworkModel` for every affected ancestor. Its old-port evidence comes from the original document; newly renamed definition IDs map back to those original identities. Every parent is processed once, including shared, unused, local and library ancestors. Unrelated definitions remain byte-equivalent. The explicitly edited body is reviewed first; invalid authoring results induced in callers are diagnosed at publication instead of reverting only part of the edit. Recursive or missing dependencies and unavailable prior shape fail planning without changing the Graph, History or notifications. There is no second Graph or propagation History.

The service publishes edited resources, parent ports/values/edges, all resource-scoped losses and root reference rewrites through **one** Graph transaction; normal root Stage reconciliation runs on that same candidate before observers. Library fork allocates/rebinds local identities in the same batch. Undo/Redo and save/reload retain all propagated state. A saved recursive document is still loadable and diagnosable even though a new cyclic replacement/fork is refused. WS44–46 exercise direct and transitive callers, repeated references, stable-key type changes, deleted keys, explicit value recovery, unrelated resources, publication coherence, library/local callers and cycle rollback.

The default reconciler uses the declared default when an old value no longer fits and records the old value. These tests do not claim every product matrix/vector reshape recipe; those remain module command policies which must prepare values before publication. The qualification proves the dependency closure and single-transaction path that such policies must use, not lossless arbitrary conversion.

## Nested editing and occurrence identity

`EditorContext.activeNetwork` is view state. Root has the existing Stage ID and an empty occurrence path; a nested path is the ordered call-node IDs from that Stage, not a resource ID. Repeated calls can therefore show the same definition while retaining independent selection and navigation. `NetworkSelectionScope` is a module-supplied read-only resolver; the core owns its installed path, validates it before selection, and knows nothing about the subgraph schema. This adds no second Graph or duplicated editable document.

`NestedNetworkEditorQualification.enter(callId)`, `up()` and `root()` resolve the entire proposed path before changing the Context. A missing/non-network/recursive occurrence, closed Context or open Graph operation rejects without clearing the previous path or selection. Successful navigation clears only that Context's selection and increments its view-only `navigationRevision`; it creates no Graph History entry. Graph projection checks the scope before ordinary observers: deleting a containing call returns that Context to root and clears selection. Undo restores model data but never automatically re-enters an old path.

`WorkspaceQualification.parameterTarget` includes `networkPath`; `parameterEditor` routes an ordinary selected node to its Graph Parameter and a nested selected node to `ScopedParameterQualification`. FieldDraft consumes the shared minimal `EditableParameter` surface (`spec/read/write`), rather than requiring the concrete root-Node wrapper. A scoped handle captures the Graph load identity, occurrence path, referenced definition ID, node ID and parameter key. Missing modules/parameters, changed path or definition retargeting invalidates it. It does not keep a writable snapshot. Each read resolves the current resource. Each write clones a candidate, validates its edited state with the registered state codec (or validates a local input value), applies clamp, then invokes the same shared network reconciliation used by root Stages. Publication remains the same Graph transaction/History. An otherwise valid authoring operation may produce a model-error document, just as at root level; saving is still permitted and generation is blocked.

The first semantic edit of a library definition invokes the existing shared fork operation: the affected definition and nonlocal ancestors get local identities, all referring calls retarget together, and the mutation is one Undo step. Both Contexts remain in the same call-ID paths; a previously obtained handle in the other Context becomes stale and must be queried again. The writing handle updates its expected definition after successful publication. Undo/Redo restore resource data and references; handles whose expected definition no longer matches fail instead of writing to another object. Re-querying after projection gives the current target. Continuous gestures use an ordinary Graph Operation once the definition is local; an initial library fork must complete before opening that gesture. This is an explicit experimental constraint, not an invisible second History.

An inspection request captures navigationRevision in addition to request serial, Context/load/Graph revision and Stage. Leaving and returning to the same occurrence still invalidates a pending artifact (the ABA case). This was an executed failure of the first extension, not a hypothetical risk: `workspace-navigation-before.txt` fails WS34, while `workspace-navigation-after.txt` passes after the new guard.

The qualified pin API still pins root logical Node references; a nested pin presentation is not claimed by these cases. Likewise nested edge/frame-specific interaction, breadcrumb widgets, camera fit and pointer cancellation remain view-module work. They must use the same scoped model and cannot silently dispatch nested IDs to root Graph.nodeById.

## Dynamic nested mutation and recovery parity

The initial scoped edit path incorrectly called full `validateNetwork` as a mutation precondition. A Compose mode change removing an input therefore rejected the entire edit instead of applying the NodeType's normal policy. WS38 and WS39 executed that failure (`workspace-dynamic-before.txt`). This was a real responsibility mismatch with ordinary root editing, not a fixture exception.

Core now exports `reconcileNetworkModel(candidate, definitions, identity, contextForNode, resources)`, and the root Stage reconciler itself calls it. The nested service supplies a candidate Network and the same pinned definitions/type rules. Dependency-order port derivation, local-value defaulting, removed-value recovery, automatic Edge adaptation and `invalidEdgePolicy` have one implementation. It mutates only the candidate and returns losses; it does not own publication or History.

Nested edges receive persistent local IDs and explicit prior adaptation evidence when entering this authoring path. Default policy detaches a now-invalid edge and records its previous data. A module's preserve policy retains the edge with an invalid marker; restoring the interface removes that marker and retains the same edge ID. A removed or changed local value produces a recovery record. `Draft.recordLoss` appends records to the Graph's existing loss collection with `resourceId` plus internal `nodeId`, avoiding collisions between two definitions with the same internal names. Diagnostics carry the same scope. Resources, cached ports/values, edges and losses publish together in one change; Undo/Redo restore all of them exactly.

Full-definition replacement (`editNetwork`) remains a strict reviewed replacement command. Ordinary scoped Parameter mutation is an authoring command with the root mutation semantics above; it must not use strict replacement as a shortcut. Its library first-edit path may fork an error document in the same atomic change, but cannot replace, remove or rebind the protected network input boundary. Codec-invalid state fails before any publication. WS38–40 prove save/reload of error states, generation refusal, detach versus preserve, interface repair, local and library first-edit Undo, one notification and scoped recovery. The first WS40 assertion used an invented diagnostic code; the actual warning contract is CONNECTION_LOSS with scoped lossId/resourceId, and the fixture was corrected without changing implementation.

`NestedNetworkEditorQualification.resolvedNodes()` is a read-only projection of inferred ports for view algorithms, including port-order-sensitive layout. It returns frozen records, never another writable node collection. A position-only layout command may write the original resource's position fields through a Graph transaction without triggering a semantic library fork; its proposal must carry the Context/network/Graph stamps and become stale on semantic retargeting.

## Stage eligibility and generated provenance

A reusable definition has no forced Pixel ownership. Source reference, subgraph call and network-input boundary NodeTypes are stage-capable; the contained pinned NodeTypes determine its actual permitted Stage set. A detached/unused definition must validate in at least one Stage. Every occurrence then validates against the actual containing Stage, including nested calls. Thus a Vertex-only definition can be kept and edited, but a Pixel occurrence is an error. Mixed incompatible requirements yielding no valid Stage reject definition creation. No persisted guessed Stage flag overrides that derivation. The original Pixel-only implementation failed WS35; `workspace-vertex-before.txt` and `workspace-vertex-after.txt` record the change.

Nested emitters forward the generation profile's `requireCapability`, and apply both declared NodeType requirements and dynamic emitter requirements. Matching port types alone does not establish backend support. Code fragments carry the full relative call path, definition ID and port key into the generator's trace facility. The generator adds the root occurrence and resolves physical lines after profile assembly. WS36 uses two real shared nested calls and resolves a simulated compiler line to the correct occurrence; WS37 verifies that a nested backend requirement cannot bypass the outer profile. These tests validate provenance and contracts; no native compiler error or TD readback is asserted.

## Import and archive

`strictJson` enforces a one-MiB byte ceiling, bounded nesting, no duplicate object keys including escaped equivalents, valid JSON, and finite serializable values. These limits belong to this experiment, not a hidden replacement of every legacy entry-specific limit. An archive field is copied without executing its contents.

`inspectQualificationDocument` returns the original raw text, a validated envelope loaded into a detached Graph and its model error count. It may inspect a document with missing modules without changing the working Graph. A malformed envelope is rejected.

Constructing `ImportReviewQualification` requires a successful inspection and captures the destination loadId and complete canonical document. Constructor failure is an ApiError and creates no review object. `accept()` returns Result; it requires the same base document and load, an open review, zero unresolved candidate model errors, and matching destination module/definition/output pins. It calls Draft.replaceDocument once, preserving the working Graph identity and both EditorContext references. A failed or cancelled review changes nothing. Successful accept closes the review and creates one Undo step; repeat accept fails. Save/reload remains a separate lifecycle.

This is deliberately different from LC-UI-101 Reload Applied, which discards the editing session and clears history after explicit confirmation. It also does not implement module-upgrade conversion: old/new exact pin migration is a separate reviewed plan, not permission to replace pinned modules during normal import.

## Selection packets and typed remapping

`GraphPacketQualification.export(stageId, nodeIds)` creates a detached, frozen packet. It collects selected non-boundary nodes, only edges internal to that selection, declared resources, nested definition dependencies and nominal/symbolic type dependencies. A missing resource, recursive dependency, unknown module, unknown resource traversal contract, external node reference outside the selection or incomplete reference ownership rejects export. Ordinary save/export of the original Graph still works; unsafe cross-graph copying is not preservation.

`paste(packet, stageId, expectedLoadId)` validates format, stage and destination ownership. Same Graph *and same load* may reuse existing resource identities and must not overwrite their current values. A different Graph/load allocates independent resource identities; source names are uniquified locally. Only declared Node references, module-owned state reference fields, port type tokens, nominal struct fields, symbolic array extents and subgraph dependency/self-boundary references are remapped. Arbitrary strings in notes, source code and comments are not rewritten.

Every known NodeType implicitly promises that all references are in declared reference/port fields unless it supplies `stateReferences.collect/remap` for additional custom-state references. These callbacks are part of its pinned definition, not a mutable auxiliary type registry. Opaque/incomplete state cannot make this promise.

The entire paste uses one Graph.change: resources, hydrated nodes with fresh IDs, remapped node references, then edges through batch-local endpoints. `Draft.requireValid` rejects any final model error before publishing or history mutation. The destination must therefore be valid after paste, including any errors that predated it. A late bad edge cannot leave orphaned inserted resources. Undo removes the entire paste and restores the preceding document. Node initialization is not invoked to reconstruct serialized state.

Packet checksum, PNG transport, system clipboard permission, file naming and personal-library enumeration are adapter/codec contracts not exercised by these model cases. Source recipe transfer and native source identity are separate concerns; no host identity is copied by this packet schema.

### Grouping admission is separate from preservation and personal export

`SubgraphTransferPolicyQualification` consults pinned NodeType role and declared resource/reference closure. `groupClosedSelection` rejects protected boundaries and direct source-reference nodes before mutation. It deliberately covers only a selection with no crossing edges and one explicitly chosen output. On success it creates a real definition/input boundary/call, removes the selected root nodes, and commits once with `requireValid`. Undo restores exactly the prior document. Full gather deduplication, frames and crossing-edge routing are not implemented by this bounded probe.

`personalPacket` uses the existing typed packet dependency walk and rejects a source dependency anywhere in the closure. It neither samples live host values nor invokes storage. This is a strict self-contained policy probe; native built-in exceptions, codec and library distribution policy remain separate contracts. Ordinary Graph load/save and normal clipboard packet export do **not** call these admission policies. WS42–43 prove that an existing nested source can survive load/save and generate normally even though new direct-source grouping and personal export reject it. No source is silently deleted merely because a creation menu excludes it.

### Type locks and shape backups are authored Node state

LC-NODE-376/377 cannot be owned by EditorContext merely because a UI edits them. WS41 supplies a module recipe storing a manual type-lock and per-shape input backup in the existing serialized Node metadata. Two contexts see the same lock/backup and current values; their selection remains independent. Editing visible components does not require reverting them to the older backup when restoring hidden components. Graph save/reload and one Graph History restore the complete authored state. This verifies ownership/storage/transaction, not a new universal type-reshape algorithm. Workspace/context persistence must not become the sole home of these values.

## Executed validation and failures

The current 46-case workspace suite has passed with zero skipped tests; output is `../architecture-coverage/qualification/workspace-callers-after.txt`. Strict TypeScript checking also passed after integration. An earlier full `node --test tests/*.test.ts` run passed 186/186 tests with zero failures/skips; its exact output is `../architecture-coverage/qualification/workspace-regression.txt`. That earlier full run predates WS41–46 and later simultaneous contributions; it is not a claim of final whole-suite validation. Root reruns the complete gate after the final shared changes.

| Observation | Classification and correction |
|---|---|
| A scale-only resource can show shared identity but cannot validate arbitrary node composition. | Architecture counterexample found in review. Added actual Network, pinned definition lookup, boundary projection, nested calls, occurrence namespaces and full network validation; WS19–22 now exercise them. |
| Importing serialized state through initializer arguments cannot reconstruct a Source whose initializer takes resourceId but whose state is empty. | Architecture counterexample. Added core importNode hydration plus batch-local connectEndpoints; WS24–26 use those paths. |
| A copied Node state may contain nominal/extent references that ordinary references alone cannot find. | Architecture counterexample. Added pinned per-NodeType StateReferenceCodec; WS26 proves precise remapping without replacing identical text in comments. |
| Checking only reachable call nodes omits an invalid unused resource. | Architecture counterexample. Added module resource validators before generation pruning; WS23 and WS27 cover preservation plus rejection. |
| Paste originally had only ordinary Graph acceptance, which permits invalid authoring documents. | Policy composition counterexample. Added transaction-level requireValid before publication; WS27 verifies no event/document change on bad unused packet data. |
| Initial WS17 malformed pin fixture threw at inspection, before accept. | Fixture expectation failure, not a runtime bypass. Added explicit inspection rejection and a structurally valid mismatched-pin candidate; acceptance still fails. Updated module-pin fields when that shared contract was added. |
| Initial WS19/21 attempted to edit a frozen resource snapshot. | Test misuse caught the intended immutability boundary. Tests now clone a proposal before calling the mutation service; frozen reads remain unchanged. |
| Adding requireValid rejected cross-paste fixtures with an unconnected required output. | Validity precondition failure. Destination fixtures now deliberately establish a valid initial output. Malformed final candidates still reject, rather than weakening requireValid. |
| A separate constant formatter would emit `1e+21.0` for a large integral float. | Design-review defect; replaced it with the shared TypeEnvironment literal formatter. WS27 guards the exponential case. No claim this was first discovered by a previously executed GPU test. |
| A node-only EditorContext selection cannot represent an edge primary or selected frame/resource without a second UI selection truth. | Architecture counterexample. Added typed objectSelection to the existing Context and kept selection as a derived compatibility view; WS28–29 prove projection timing, scope, independent contexts and no selection resurrection by Undo. |
| Duplicate source names loaded directly as unused resources escaped createSource's service-only check. | Executed architecture failure. Added graph-wide resource validation through the read-only module context query. WS30 fails in workspace-source-uniqueness-before.txt and passes in workspace-source-uniqueness-after.txt. |
| Actual reusable networks could generate but had no nested editing path or Parameter target without constructing another Graph. | Design-review counterexample. Added Context-owned occurrence scope and module-owned scoped Parameter resolution; WS31–33 use the existing Graph and shared History. |
| Graph/stage/revision guards accepted a pending root artifact after entering a nested scope. | Executed failure WS34. Added navigationRevision and leave/return invalidation; before/after evidence retained. |
| Subgraph resource creation and module eligibility hard-coded Pixel, rejecting a valid Vertex-only definition. | Executed failure WS35. Infer the definition's valid Stage set; validate each call in its real Stage. |
| The first WS31 fixture called a nonexistent FieldDraft.set instead of setText/commit(parse). | Fixture API mistake, corrected without changing the contract. |
| WS35 initially tried to insert into the profile's default, noneditable Vertex shell after fixing definition eligibility. | Fixture precondition mistake, corrected by explicitly opting into the editable Vertex network. No Stage restriction bypass was added. |
| Scoped dynamic edits rejected schema changes that ordinary Graph editing reconciles and saves as error states. | Executed architecture failure WS38/39, followed by shared core reconciliation rather than a second algorithm. WS38–40 now pass; before/after files are preserved. |
| Interface edits reconciled only root callers; library fork rejected ancestors before updating their old edges. | Executed architecture failures WS44/45 in workspace-callers-before.txt. Added child-first affected-definition reconciliation using the same core algorithm and one Graph transaction. WS44–46 pass in workspace-callers-after.txt. |
| Source CRUD tests cannot prove grouping/export admission differs from load preservation. | Review counterexample; added typed policy boundary and WS42/43. No invented pre-fix runtime failure is claimed. |
| Type-lock and per-shape backup were assigned to EditorContext in the mapping. | Ownership review correction, not a missing storage API. WS41 demonstrates shared serialized Node metadata and Graph History using existing APIs. |
| A concurrent CQ20 provider-version fixture briefly failed during integration. | Recorded separately in workspace-regression-cq20-before.txt; the owning agent corrected explicit version pins. No workspace/baseline rule was weakened. |

## Deployment and unresolved evidence

The workspace/model/resource/packet code imports no Node, Electron, DOM, TD or filesystem APIs. InputSurface, PreferenceStore, Clipboard, DocumentInput/Output, LibraryStore and HostBinding are separate requested capabilities. Static Web may provide download/user-mediated input and browser storage but cannot assume arbitrary directory enumeration, TD's same-origin identity, or a host-project save API. Node hosting adds providers; it does not make native browser events or host identities portable. Electron may supply IPC/OS providers without changing Graph, EditorContext, resources or generator ownership.

No real DOM, iPad Safari, native IME, touch/pointer, file API, project-save, TD, GPU, or real multi-peer transport evidence was produced by these tests. The 16 UI/DATA UNKNOWNs and three global audit UNKNOWNs remain explicit in the analysis JSON. LU-DATA-007 symbolic-scope behavior is architecturally significant: typed remapping is now exercised, but the legacy personal-packet failure and intended acceptance range are not thereby resolved. LU-UI-008/009 require lifecycle and host async guards; a passed model import test cannot prove those old host races absent.

The mapping records exact leaf failure, persistence, Undo and edge-case requirements. A shared path is not permission to merge different behaviors or erase those distinctions. Coverage refers to the qualified boundary mechanism, never an assertion that all 164 product features are already implemented.
