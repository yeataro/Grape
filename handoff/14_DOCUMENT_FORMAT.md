# Production document format · IH-005

這是 IH-005 的 production document 契約；IHR4-B01 補齊 adaptation / loss / recovery 的 wire identity。它固定下一個實作者應採用的產品文件身分，不是正式產品實作，也不表示人類已承諾從 S01 起永久支援所有開發期文件。

## 1. 已決定的技術身分

| 項目 | 精確決策 |
|---|---|
| `format` | **`grape.document`**。不是 `grape-core-experiment`。 |
| `formatVersion` | **`{ "major": 2, "minor": 0 }`**；整數版本，獨立於 application、module、NodeType 和 GraphKind 版本。 |
| 文件單位 | 一個 envelope 包一份 `graph`；不新增 Project，也不再保存一個相同意義的 document ID。`graph.id` 是作品的穩定 ID。 |
| `graph.kind` | 已註冊 GraphKind 的 exact ref：`{moduleId, kindId, version, fingerprint}`。首批 product kind IDs 為 `grape.image`、`grape.material`；由 `grape.graph-kinds` 模組宣告。 |
| Stage 身分 | GraphKind 定義 slot key、StageKind、預設 implementation、必要 boundary。文件保存 Stage 實例與 network；不把 `vertex/pixel` 當核心封閉 union。 |
| Host | 不進入文件 format 或 GraphKind 的產品身分。TD／ISF 等 target/profile 選擇不取得 Graph ownership。 |
| 檔名 | 建議 `<name>.grape.json`，僅作 UI／媒介提示；載入必須讀 format/version，不憑副檔名推定格式。 |
| 文字編碼 | JSON，媒介採 UTF-8。Provider 在文字解碼前保留原始 bytes；解碼錯誤不重新編碼覆寫來源。 |

`grape.image` 可依 registered definition 有預設 vertex shell 與 pixel network；`grape.material` 的兩個 stage 為 network。這是初始 GraphKind 的內容，不是所有將來 kind 的永久數量限制。未來 ISF pass 設定可屬 GraphKind 的 `kindSettings`，不建立 Pass→Stage 的新 ownership。

實際發行模組的 `version/fingerprint` 必須等於登錄內容；範例測試的 `fixture-*` 字串不是產品 fingerprint，也不提供新版 fallback。

完整型別在 [contracts/document-format.ts](contracts/document-format.ts)，exact ref 共用 [public-surface.ts](contracts/public-surface.ts)，不從 experimental reference 匯入 DTO。

## 2. 資料形狀與 owner

```text
CanonicalGraphDocument
  format + formatVersion
  graph
    id, name
    kind: exact GraphKindRef
    kindSettings: GraphKind codec-owned JSON
    modules: exact ModulePin[]
    stages[]
      id, key, stageKindId, implementation
      network
        id
        nodes[]: id, name, type, state, inputValues, ports,
                 references, referencesComplete, position, extensions
        edges[]: id, from, to, adaptation, optional invalid, extensions
        extensions
      extensions
    resources[]: id, type, data, references, referencesComplete, extensions
    losses[], recovery[]
    extensions
```

Graph owns all authored data above. Node `state` and Resource `data` are exact-module codec payloads, not a parallel settings store. Resource `type` uses the same exact-ref shape to identify its owning registered Resource codec; it does not imply every Resource is an executable Node. `ports` is the last known interface snapshot for missing-definition preservation. `inputValues` is the local/default value store; it is retained when a valid Edge supplies the input. Parameter views do not serialize a second current value.

Edges are network-local endpoints `{nodeId, portKey}`; an explicit reference adds `networkId` where needed, and uses stable IDs rather than display names. `referencesComplete` describes the module's declared reference completeness; it does not grant permission to rewrite arbitrary strings in opaque payloads. IDs, array order, exact pins, invalid Edge evidence, losses and opaque data survive roundtrip. Duplicate identities in the same scope and duplicate port-direction/key pairs reject hydration rather than silently selecting one.

Module uniqueness is the **exact tuple `(moduleId, version, fingerprint)`**, not `moduleId` alone. Different exact versions can coexist in a document; each Node, Resource and GraphKind resolves its own exact ref. Conflicting runtime resource providers may still produce their own typed diagnostic; the envelope must not erase one version to resolve that conflict. Port snapshots retain `requireConstant` and `connectionPolicy` as well as type, direction, default and semantic hints; missing a definition does not erase its last declared admission rules.

Authored visual data remains product/document data. The following placement is required; it must not disappear because it is absent from the shader:

| Authored state | Canonical placement |
|---|---|
| Node name and position | Node record's explicit fields. |
| Graph/frame/comment notes, frame membership/geometry/color, route annotations, authored presentation settings that contain references | Registered authoring Resource codec payload with exact owning ref and declared reference completeness; validate/remap identities through that codec. The handoff does not prescribe a new module package or hidden fixed payload schema. |
| Module-specific node settings/labels/presentation metadata | Node owner codec's `state`, or its registered authoring Resource when shared; the module must expose the proper edit/persistence contract. |
| Inert optional annotations with no execution or reference semantics | Namespaced `extensions`; preserve as data even when no renderer recognizes them. |
| Selection, zoom, active tab, field draft, Panel sizes | Existing EditorContext/Layout view state contracts, outside the canonical graph envelope. |

Required authored information may not be disguised as optional `extensions` or moved into UI-private state. `DF17` qualifies preservation of a representative typed authoring Resource and its node reference. It does not claim the production authoring codec, all annotation edits, or reference-remap implementation has been delivered.

`extensions` is a dictionary keyed by namespaced ID, for example `example.notes`. This slot is **inert, non-executing metadata**: preserve its JSON, do not execute it, use it to add required semantics, assume it contains remappable references, or render HTML without normal UI escaping. Anything required to interpret execution, ownership, binding, references or values needs a registered typed module payload or a new versioned structural field; hiding it in `extensions` is a contract violation.

Do not serialize loadId, Context selection/navigation, active Panel, field draft text, callback, prototype, connection credentials, GPU object or runtime History. Those retain their existing owners and independent persistence contracts. Graph model errors are recomputed on hydration; `losses/recovery` preserve repair evidence and do not authorize generation.

## 2a. Canonical Edge adaptation wire contract

**Normative exact wire names.** These keys, schema IDs, versions and operation meanings cannot be renamed in persisted output. Runtime class/method names remain implementer freedom. Core Document Codec owns `grape.edge-adaptation` version `1`; this is independent of Node module identity. A Node emitter or Host does not redefine it.

```json
{
  "schema": "grape.edge-adaptation",
  "version": 1,
  "sourceType": "glsl.float",
  "targetType": "glsl.vec4",
  "operation": "broadcast",
  "extensions": {}
}
```

All six fields are required. `sourceType`/`targetType` use the same resolved DataType token convention as port `type`; they name the admitted types at the time the Edge is stored. They are not display labels, inferred from literal values, or arbitrary GLSL snippets. Built-in examples use `glsl.float`, `glsl.vec2`…; nominal/custom types still resolve through the existing DataType authority. Do not retokenize an existing reference silently during hydration.

| `operation` | Exact meaning / semantic validation |
|---|---|
| `identity` | Source and target resolve to the identical type, including nominal identity. No numeric or component conversion. |
| `broadcast` | Numeric scalar becomes every component of a numeric vector of the **same scalar base type**. No implicit cast or extra alpha rule. |
| `take-leading` | Retain the first `target width` components, in original order, of a wider numeric vector; target is a scalar or shorter vector of the same scalar base type. No reorder, fill or rounding. |
| `append-alpha-one` | Float vec3 → float vec4, preserving xyz/rgb and adding fourth component `1.0`. The stored operation makes the RGB→RGBA choice explicit; changing a UI style cannot reinterpret it. |
| `numeric-cast` | Scalar→scalar or same-width vector→vector numeric base conversion using the selected GLSL profile's explicit constructor semantics. No component count change, boolean, matrix, struct or array conversion. Unsupported GLSL type/profile conversions are semantic errors. |

No arbitrary `parameters`, hidden fill value or expression string is allowed in version 1. Other conversions can be represented by an explicit converter Node; extending the Edge operation wire requires an explicit versioned contract, not an inert extension field. The contract does not promise that every profile admits every numeric type.

Runtime→document: capture the **admitted Edge plan** from the same detached snapshot as endpoints. Map source and target identities and operation semantics explicitly to the six-field record. Do not persist a debug summary/hint or recompute a plan using current UI preferences while saving. For a retained invalid Edge, preserve its last admitted plan and `invalid` evidence; it remains non-executable.

Document→runtime: structural decoding first; then Graph hydration resolves exact definitions/types, checks live endpoint existence and port type agreement, confirms the stored operation's legality and admission policy, and derives diagnostics before publication. A stale/mismatched plan does not become a valid connection merely because the JSON is `editable`. The hydrator must not silently replace it with a different conversion. Saveable semantic error + blocked generation is appropriate when the model represents it; an unrepresentable candidate fails atomically. Generator independently consumes the admitted snapshot and rejects invalid plans; it never repairs Graph.

## 2b. Canonical loss / recovery wire contract

Loss and recovery are **inactive preservation evidence**, not another active network or History stack. Their payload must never be replayed on load. Presence of a loss is not itself an Error that blocks generation: diagnostics follow the current model (for example a detached required output is an Error, while a repaired graph can generate with historical loss warnings).

```typescript
// Exact structural keys, not pseudonyms. The complete definitions are in document-format.ts.
type LossDocument = {
  schema: 'grape.loss'; version: 1;
  id: string; code: string; reason: string;
  payload: PreservedPayload; extensions: Record<string, Json>;
};
type RecoveryDocument = {
  schema: 'grape.recovery'; version: 1;
  id: string; reason: string; lossId?: string;
  payload: PreservedPayload; extensions: Record<string, Json>;
};
```

Core Document Codec owns these two schema IDs/version 1. All shown non-optional keys are required. `id` is stable within its loss/recovery collection; duplicates in that collection reject. Array order is preserved. `code` is a nonempty producer diagnostic identifier, not executable code. `reason` is nonempty preserved fallback evidence, not a command or current diagnostic authority. `lossId`, when present, names `graph.losses[].id`; it does not change payload ownership. A missing referenced loss is diagnosable evidence, not permission to drop the recovery record.

There is no separate mutable subject that can contradict the payload address. Each payload variant provides its own stable address:

| `payload.kind` | Required remaining keys | Meaning |
|---|---|---|
| `edge` | `networkId`, `edge: EdgeDocument` | A detached/preserved complete Edge snapshot, including the exact adaptation codec above and optional invalid evidence. |
| `input-value` | `networkId`, `nodeId`, `port: PortSnapshot`, `value: Json` | Prior **input** port snapshot and its lost local/default value, even if it no longer fits the new type. The prior type/semantic/policy are retained; never guess from the new port. |
| `node` | `networkId`, `node: NodeDocument` | Detached Node snapshot with exact definition ref, opaque state, values, ports, references and authored position. |
| `resource` | `resource: ResourceDocument` | Detached Resource snapshot with exact owning ref and declared references. |
| `module` | `owner: ModulePin`, `codecId: string`, `codecVersion: positive integer`, `data: Json`, `references: DocumentReference[]`, `referencesComplete: boolean` | Module-specific preservation payload. Exact `(moduleId, version, fingerprint, codecId, codecVersion)` identifies its owner codec. `owner` must appear in `graph.modules`. |

Each variant has exactly the listed keys plus `kind`. Nested Edge/Node/Resource/Port records use **the same complete structural schema** as active records, not a weaker arbitrary JSON snapshot. The distinction is placement: snapshots under evidence do not occupy active node names, input slots or network membership. Stable addresses may refer to entities no longer present; preserving this evidence is intentional. General clone/remap must use these addresses and declared references, not string search in opaque data.

`module.data` is an explicitly opaque extensible region. The generic codec preserves it as JSON without knowing its private keys; when available, only the exact owning codec validates/interprets it. Missing codec/module does not delete evidence or invent restoration; `referencesComplete: false` prevents unsafe remap. The owning module feature or explicit repair command supplies a reviewed repair candidate through ordinary Graph Operations; DataCodec only validates data and does not create repair candidates or mutate Graph during hydration. The registration shape is `ModulePreservationContribution.preservationCodecs[] = {codecId, codec: DataCodec}` under the contributing module's exact manifest pin; `codec.schemaVersion` equals `payload.codecVersion`. Registration is atomic with module definitions and duplicate exact codec identities reject, rather than overriding an earlier owner. The existing definition-resolution service exposes `PreservationCodecResolver.resolve(owner, codecId, codecVersion)`; unavailable exact codec returns `undefined`, with no fallback by name or nearest version. This optional contribution does not give the codec a Graph handle. Semantic validation passes detached/read-only `data` to `DataCodec.validate`; codec exceptions become owner-scoped diagnostics, never partial hydration or mutation. A missing or invalid codec leaves data preserved and restoration disabled; loaded active graph errors remain governed by ordinary diagnostics. No repair operation is inferred from the mere existence of a validator. The complete module pin list remains conservative: missing exact modules retain the existing generation block until resolution.

Runtime→document is explicit and lossless:

1. During dynamic interface reconciliation, the same model Operation captures the old Edge or old input port **before** replacing it. It constructs the corresponding tagged loss, stable ID and reason/code alongside the new Node interface and active edge set. Undo restores all of that atomically via existing History semantics.
2. The detached capture serializes those typed records unchanged. It must not discard a removed value because it is invalid for the *new* interface. Node/resource removal evidence uses their full record variants. Other evidence requires an exact module codec; arbitrary unowned JSON is forbidden.
3. A recovery item is another explicit inactive snapshot, optionally linked to a loss. Saving it does not attempt repair; loading it does not reactivate it. User-confirmed repair later validates a candidate and uses one ordinary model Operation; recoverability never authorizes bypassing ownership/admission.
4. The format reader recursively validates envelope and known snapshots. Graph hydration checks active semantics, addresses and codec availability; a recovery view projects warnings and available repair affordances. A Panel/renderer cannot interpret opaque payloads or restore them directly.

The reference runtime's `{from,to,op}` and `{reason,nodeId,edge?,inputKey?,value?}` **are not adopted wire shapes**. [document-wire.qualification.ts](contracts/document-wire.qualification.ts) is a test-only explicit adapter: `take`→`take-leading`, `alpha`→`append-alpha-one`, `cast`→`numeric-cast`; type tokens and endpoints are explicitly mapped. It requires the pre-change port snapshot for a removed input because the reference loss record alone lacks that information. Production must capture that snapshot inside the interface-change transaction. This identifies a real serialization information requirement; the test does not guess or smuggle it into `extensions`. The adapter reconstructs the reference-only boundary boolean from its fixture GraphKind's exact required output definition. It is not a production importer, hydrator or copyable production foundation.

## 2c. Structural vs opaque subfields and evolution

The distinction is recursive, including adaptation nested inside an Edge inside loss/recovery:

| Case | Exact outcome |
|---|---|
| All known required structure; known tagged wire payload | `editable` structural document, subject to separate semantic hydration. |
| Unknown field in adaptation, loss/recovery outer record, tagged payload wrapper, owner ref, snapshot, endpoint, port or reference | `recovery-readonly`; original text preserved. The writer refuses to normalize/erase it. |
| Unknown adaptation operation / payload discriminant, or well-formed unsupported schema ID or positive codec version of a core record | `recovery-readonly`; never interpret as a closest known operation. |
| Missing required key, malformed known value/type, zero/noninteger core/module codec version, duplicate evidence identity, non-input port in `input-value`, undeclared exact owner pin | `rejected`; original source remains exportable. |
| Unknown keys **inside** opaque `module.data`, Node `state`, Resource `data`, GraphKind `kindSettings`, or an inert namespaced `extensions` value | Preserved; does not itself fence structural editing. Owner codec semantics remain separate. |

Malformed known required structure takes precedence over unknown-field recovery when both are present. No path may silently discard either kind of evidence.

`grape.document` is now **2.0**: replacing untyped required payload meanings with explicit required wire schemas is incompatible. This follows the already adopted major-version rule, not a new Human product decision. IH-003/IH-004 1.0 snapshots remain unchanged and 1.0 input is read-only until a separately declared converter exists. Merely changing its version field is not conversion, even when a particular old fixture has empty losses.

Future added operation/tag/core-codec version requires documented semantics and a document version increase (minor only for additive preserved meanings, major for incompatible meanings/requirements). Existing core codec IDs/versions are immutable. Module-private payload evolution uses exact owner+codec version and its explicit converter. Unknown module data cannot be used to add mandatory active Edge semantics. The external stability-commitment Gate is unchanged.

## 3. Read outcomes and forward-compatibility safety

| Input | Outcome | Permitted actions |
|---|---|---|
| Known 2.0 envelope and known fields | `editable` structural document | Hydrate once through Graph's semantic validation; save model even with expressible diagnostics. `editable` does **not** mean generated shader is valid. |
| Known envelope, unavailable exact module | `editable` plus unresolved module list | Preserve payload/pin/last ports; ordinary safe name/position edits may proceed. Generation remains blocked until missing definitions and other model errors resolve. No initializer, automatic module install or same-name substitution. |
| Unknown field outside declared opaque/inert payload areas | `recovery-readonly`, original text retained | Display recovery status and export original data. Do not discard fields, edit known subset then overwrite, or assume unknown semantics are optional. |
| Future major/minor, or older unsupported production version | `recovery-readonly`, original text retained | Use a declared version converter when available; never downcast automatically. |
| Legacy format, experimental format, or unrecognized format | `foreign` / converter required | S02 explicit import review. Never change only format/kind strings and claim successful conversion. |
| Invalid JSON, duplicate keys, malformed/ambiguous identity, nonfinite number | `rejected`, original text retained | Report precise failure; recovery export remains available. No partial Graph, no automatic rewrite. |

The reference scanner catches duplicate keys before `JSON.parse` can erase them, including escaped-equivalent spellings. Writer rejects non-JSON values, executable accessors/functions/custom prototypes and cycles before serialization can silently omit them. Missing required structural fields fail; valid but semantically dangling references can remain Graph diagnostics/loss evidence after hydration.

The writer examines all own property descriptors, including non-enumerable properties, and checks array prototypes and dense numeric indices. It rejects hidden `toJSON` hooks and getters without calling them. This is a bounded plain-data contract check, not a security sandbox for arbitrary executable objects/Proxy traps or a modified JavaScript realm.

Unknown **module payload fields** differ from unknown **document structure**. A missing module's opaque `state/data` preserves its exact JSON value across save and outer node rename/move; this does not promise original whitespace or property formatting. The generic document codec does not inspect those private fields. Its owner codec decides their semantics when the exact module is available. If references cannot safely be enumerated/remapped, cross-document clone/paste remains blocked or reviewed by the existing reference-completeness contract; the loader must not guess. This restriction does not prevent preserving the whole document or changing an unrelated known field.

The qualification decoder's default 16 MiB and nesting 128 are explicit configurable intake budgets, not format-level product limits. Exceeding them returns failure with untouched source, never a truncated document. A production adapter must document its own resource budget and retain recovery bytes. Hashes/digests used by storage are not embedded canonical authority; avoid a second mutable integrity field in the envelope.

## 4. Version policy and conversion

- **Minor** increases for additive documented structural changes that preserve the meanings of existing fields. Readers that do not understand the new minor version preserve it read-only; forward compatibility is lossless recovery, not speculative editing.
- **Major** increases for changed meaning, removed fields, incompatible required data or changed identity interpretation. Same numeric version must never silently change its schema meaning, even before a public compatibility promise.
- Module state evolution increments the owning module/codec identity and follows its explicit conversion rules. It does not automatically increment the document envelope version or reinterpret old exact pins.
- Converter output is a detached candidate with source version/identity, explicit transformations and losses. Review/accept applies through the existing one-operation Graph replacement contract; ordinary load does not mutate a running Graph. The original remains available. No converter is implied merely because both formats contain nodes.
- S02 maps Legacy behavior into `grape.document`; no Legacy field layout, Host ownership or historical `td.top` tag becomes canonical by copying it. LC-NODE-370 revision mapping and other existing import Gates still apply. Experimental reference documents are test artifacts and require a separately explicit converter if someone ever chooses to import them.

Format version says how to interpret data; it does not promise how long a release supports it. These are separate decisions.

## 5. Exact S01 save/reload acceptance

The primary product path is **ACK-backed save then reopen**:

1. Create one product Graph with `grape.image` definition, stable IDs and exact module pins; use its declared stages/boundaries.
2. Add fixed/dynamic nodes, parameter values, Edges and authored positions. Preserve semantic errors as diagnostics if the model permits them.
3. Capture the current published Graph as a detached 2.0 document; `writeDocument` or the conforming production codec serializes it. Capture is independent of Generator and Host.
4. `StorageAdapter.write(documentKey, text)` succeeds only with an acknowledgement for **that captured content**. Application's saved baseline tracks that capture; later Graph edits remain dirty. Failed/late writes do not falsely clear dirty.
5. A minimal Open action chooses a known storage document key from adapter enumeration or an explicit key entry. Adapter read returns the persisted text; decode and model validation complete before a new Graph lifetime is exposed. Stable document IDs are retained, runtime loadId is new, runtime History empty, old field/Context handles cannot attach themselves to the new Graph by name.
6. Compare all authored values, dynamic state/ports, IDs, Edges, pin references, resource data and losses against the acknowledged capture. Repeat generation through the same exact definitions/profile and compare semantic output; this last check belongs to product S01, not just this envelope codec.

Separately, **Export/download → file import/open** produces and reads the same envelope. Starting a browser download is not a persistent save acknowledgement and must not clear dirty. Static Web's ACK-backed storage may be browser-local; Node/Electron use their selected storage adapter. There is no requirement to add Host or Node-specific APIs to canonical Graph for saving.

`DF02` directly qualifies content capture/ACK/newer-dirty/roundtrip with a bounded in-memory adapter. It does not claim a production browser storage UI or Graph runtime hydration implementation exists. Those remain S01 acceptance responsibilities.

## 6. Narrow human Gate: external compatibility commitment

**`G-DOCUMENT-STABILITY-COMMITMENT` — unresolved product policy.** Human owner must decide the milestone from which released user documents receive an external compatibility/support promise (and that promise's intended duration/scope). Technical format identity, version policy, unknown-data safety and S01 behavior above are already decided; implementers must not postpone them or invent another format.

This Gate blocks an external statement such as “all documents saved from release X will remain supported,” and blocks labeling an initial release format as stable before that decision. It **does not block** internal implementation/qualification of S01 once separately authorized, writing internal 2.0 fixtures, or subsequent slices independent of a public guarantee. It does not authorize starting S01 in this repair task.

If the owner later chooses an earlier commitment milestone, retain the corresponding fixtures and supply tested explicit migrations before incompatible releases. If a later milestone is chosen, still increment technical versions for incompatible changes and preserve unsupported source data; the choice never permits silent schema mutation or destructive load.

## 7. Evidence and limits

[document-format.test.ts](contracts/document-format.test.ts) qualifies product identity, roundtrip and ordered data, captured ACK semantics, opaque missing-module preservation plus rename/move, unknown-field fences, future versions, Legacy separation, inert metadata, duplicate-key rejection, exact pins/identity failure, invalid-model evidence, JSON shape safety, intake limits and version-shape failures.

Adversarial review identified two gaps in the first draft: module-ID-only uniqueness incorrectly rejected coexisting exact versions, and enumerable-only object inspection missed hidden serialization hooks/array prototype changes. The corrected contracts use exact tuple uniqueness and descriptor/dense-array validation; `DF15`/`DF16` directly verify these cases. They are new regressions, not claims that the original 14 tests had covered the counterexamples. `DF17` also adds explicit preservation evidence for authored metadata and complete port policies.

[document-wire.test.ts](contracts/document-wire.test.ts), **DW01–DW13**, adds direct connected broadcast adaptation save/reload/regeneration; real reference dynamic mode change producing detached-edge and removed-value losses; error-preserving reload; explicit repair followed by regeneration with historical losses; nested unknown-field fences; malformed known payload rejection; unsupported codec/version/tag recovery; opaque exact-owner payload roundtrip; nested Node/Resource validation; old 1.0 retention; and a semantically forged plan that remains generation-blocked. These run the existing reference Graph/Generator through an explicit qualification adapter, not a new production Graph. DOM, GPU and Host evidence are unaffected.

An adversarial cross-review found string-coercing enum checks could accept arrays such as `direction: ["input"]` inside a preserved Node, falsely returning `editable` for a nonconforming DTO. All closed structural enums now require an actual string before membership checking; DW13 directly rejects coercible arrays in nested port direction/supply/policy, reference kind, and stage implementation. This was a decoder defect, not permission to widen the wire contract.

The first qualification bridge run exposed a missing reference-only protected-boundary reconstruction (four tests rejected `PROFILE_BOUNDARY`); the adapter now reconstructs it from the exact fixture GraphKind requirement. No production schema or frozen reference Graph was weakened to pass. The removed-value test also requires prior port metadata rather than pretending the reference loss contains it. Direct tests now pass with strict TypeScript checking; the complete regression is recorded by the parent IH-005 repair evidence.

The codec is a small executable contract, not production persistence, model hydration, module verification, migration tooling or UI. Fingerprint authenticity, available modules, semantic Graph validation, storage durability and browser/native integration require their own acceptance tests. No test here closes a TD/GPU/TOE/TOX Gate or the human compatibility commitment.
