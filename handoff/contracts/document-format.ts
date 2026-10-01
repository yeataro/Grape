/** Normative production DTO identity + bounded codec qualification. Not a production persistence implementation. */
import type { Json, NodeTypeRef, GraphKindRef, DataCodec } from './public-surface.ts';

export const DOCUMENT_FORMAT = 'grape.document' as const;
export const DOCUMENT_VERSION = Object.freeze({ major: 2, minor: 0 });
export interface ModulePin { moduleId: string; version: string; fingerprint: string; }
export interface DocumentReference { slot: string; kind: 'node' | 'resource'; targetId: string; networkId?: string; }
export interface PortSnapshot {
  key: string; direction: 'input' | 'output'; type: string;
  semantic?: string; supply?: 'local' | 'required'; defaultValue?: Json;
  requireConstant?: boolean; connectionPolicy?: 'default' | 'numeric' | 'exact';
}
export interface NodeDocument {
  id: string; name: string; type: NodeTypeRef; state: Json;
  inputValues: Record<string, Json>; ports: PortSnapshot[];
  references: DocumentReference[]; referencesComplete: boolean;
  position: [number, number]; extensions: Record<string, Json>;
}
export interface EdgeDocument {
  id: string; from: { nodeId: string; portKey: string }; to: { nodeId: string; portKey: string };
  adaptation: EdgeAdaptationDocument; invalid?: { code: string; reason: string }; extensions: Record<string, Json>;
}
/** Core-owned, explicitly adopted wire identity; not the reference Adaptation runtime shape. */
export interface EdgeAdaptationDocument {
  schema: 'grape.edge-adaptation'; version: 1;
  sourceType: string; targetType: string;
  operation: 'identity' | 'broadcast' | 'take-leading' | 'append-alpha-one' | 'numeric-cast';
  extensions: Record<string, Json>;
}
export interface NetworkDocument { id: string; nodes: NodeDocument[]; edges: EdgeDocument[]; extensions: Record<string, Json>; }
export interface StageDocument {
  id: string; key: string; stageKindId: string; implementation: 'network' | 'profile-default';
  network: NetworkDocument; extensions: Record<string, Json>;
}
export interface ResourceDocument {
  id: string; type: NodeTypeRef; data: Json;
  references: DocumentReference[]; referencesComplete: boolean; extensions: Record<string, Json>;
}
/** Evidence snapshots only. Presence never installs an Edge, value, Node or Resource. */
export type PreservedPayload =
  | { kind: 'edge'; networkId: string; edge: EdgeDocument }
  | { kind: 'input-value'; networkId: string; nodeId: string; port: PortSnapshot; value: Json }
  | { kind: 'node'; networkId: string; node: NodeDocument }
  | { kind: 'resource'; resource: ResourceDocument }
  | { kind: 'module'; owner: ModulePin; codecId: string; codecVersion: number; data: Json;
      references: DocumentReference[]; referencesComplete: boolean };
export interface LossDocument {
  schema: 'grape.loss'; version: 1; id: string; code: string; reason: string;
  payload: PreservedPayload; extensions: Record<string, Json>;
}
export interface RecoveryDocument {
  schema: 'grape.recovery'; version: 1; id: string; reason: string; lossId?: string;
  payload: PreservedPayload; extensions: Record<string, Json>;
}
/** Optional module-owned contribution, registered atomically under the module's exact manifest pin.
 * Duplicate (owner, codecId, codec.schemaVersion) rejects registration; no last-writer wins.
 */
export interface ModulePreservationContribution {
  readonly preservationCodecs: readonly { readonly codecId: string; readonly codec: DataCodec }[];
}
/** Definition-resolution service; no Graph handle or mutation capability is passed to a codec. */
export interface PreservationCodecResolver {
  resolve(owner: Readonly<ModulePin>, codecId: string, codecVersion: number): Readonly<DataCodec> | undefined;
}
export interface CanonicalGraphDocument {
  format: typeof DOCUMENT_FORMAT; formatVersion: { major: number; minor: number };
  graph: {
    id: string; name: string; kind: GraphKindRef; kindSettings: Json; modules: ModulePin[];
    stages: StageDocument[]; resources: ResourceDocument[]; losses: LossDocument[]; recovery: RecoveryDocument[];
    extensions: Record<string, Json>;
  };
}
export type DocumentRead =
  | { status: 'editable'; document: CanonicalGraphDocument; unresolvedModules: ModulePin[]; generationBlockedByMissingModules: boolean }
  | { status: 'recovery-readonly'; raw: string; reason: string; unknownPaths: string[] }
  | { status: 'foreign'; raw: string; format: string | null; reason: 'IMPORT_CONVERTER_REQUIRED' }
  | { status: 'rejected'; raw: string; reason: string };
export interface ReadOptions { availableModule?(pin: Readonly<ModulePin>): boolean; maxBytes?: number; maxDepth?: number; }
type RecordValue = Record<string, unknown>;
function fail(message: string): never { throw Error(message); }
function object(v: unknown, path: string): RecordValue {
  if (!v || typeof v !== 'object' || Array.isArray(v)) fail('OBJECT: ' + path);
  return v as RecordValue;
}
function string(v: unknown, path: string): asserts v is string { if (typeof v !== 'string' || !v.length) fail('STRING: ' + path); }
function enumMember(v: unknown, values: readonly string[]): boolean { return typeof v === 'string' && values.includes(v); }
function bool(v: unknown, path: string): void { if (typeof v !== 'boolean') fail('BOOLEAN: ' + path); }
function array(v: unknown, path: string): unknown[] { if (!Array.isArray(v)) fail('ARRAY: ' + path); return v; }
function fields(v: unknown, path: string, required: string[], optional: string[], unknowns: string[]): RecordValue {
  const o = object(v, path);
  for (const key of required) if (!Object.hasOwn(o, key)) fail('REQUIRED: ' + path + '.' + key);
  for (const key of Object.keys(o)) if (![...required, ...optional].includes(key)) unknowns.push(path + '.' + key);
  return o;
}
function unique(items: unknown[], key: string, path: string): void {
  const seen = new Set<unknown>();
  for (const v of items) { const id = object(v, path)[key]; if (seen.has(id)) fail('DUPLICATE_IDENTITY: ' + path + '.' + key); seen.add(id); }
}
function extensions(v: unknown, path: string): void {
  for (const key of Object.keys(object(v, path))) if (!/^[a-z][a-z0-9_-]*(\.[a-z][a-z0-9_-]*)+$/u.test(key)) fail('EXTENSION_NAMESPACE: ' + path + '.' + key);
}
function pin(v: unknown, path: string, extra: 'kindId' | 'typeId' | null, u: string[]): void {
  const keys = ['moduleId', 'version', 'fingerprint', ...(extra ? [extra] : [])]; const o = fields(v, path, keys, [], u);
  keys.forEach(k => string(o[k], path + '.' + k));
}
function references(v: unknown, path: string, u: string[]): void {
  const a = array(v, path); unique(a, 'slot', path);
  a.forEach((value, i) => {
    const p = path + '[' + i + ']', o = fields(value, p, ['slot', 'kind', 'targetId'], ['networkId'], u);
    string(o.slot, p); string(o.targetId, p); if (!enumMember(o.kind, ['node', 'resource'])) fail('REFERENCE_KIND: ' + p);
    if (o.networkId !== undefined) string(o.networkId, p);
  });
}
function endpoint(v: unknown, path: string, u: string[]): void {
  const o = fields(v, path, ['nodeId', 'portKey'], [], u); string(o.nodeId, path); string(o.portKey, path);
}
function portSnapshot(value: unknown, q: string, u: string[]): void {
  const port = fields(value, q, ['key', 'direction', 'type'], ['semantic', 'supply', 'defaultValue', 'requireConstant', 'connectionPolicy'], u);
  string(port.key, q); string(port.type, q); if (!enumMember(port.direction, ['input', 'output'])) fail('PORT_DIRECTION: ' + q);
  if (port.semantic !== undefined) string(port.semantic, q);
  if (port.supply !== undefined && !enumMember(port.supply, ['local', 'required'])) fail('PORT_SUPPLY: ' + q);
  if (port.requireConstant !== undefined) bool(port.requireConstant, q);
  if (port.connectionPolicy !== undefined && !enumMember(port.connectionPolicy, ['default', 'numeric', 'exact'])) fail('CONNECTION_POLICY: ' + q);
}
function nodeDocument(value: unknown, p: string, u: string[], pins: ModulePin[]): void {
  const n = fields(value, p, ['id', 'name', 'type', 'state', 'inputValues', 'ports', 'references', 'referencesComplete', 'position', 'extensions'], [], u);
  string(n.id, p); string(n.name, p); pin(n.type, p + '.type', 'typeId', u); requirePinned(n.type, pins, p);
  object(n.inputValues, p + '.inputValues'); references(n.references, p + '.references', u); bool(n.referencesComplete, p);
  const position = array(n.position, p); if (position.length !== 2 || position.some(x => typeof x !== 'number' || !Number.isFinite(x))) fail('POSITION: ' + p);
  extensions(n.extensions, p);
  const ports = array(n.ports, p + '.ports'), portKeys = new Set<string>();
  ports.forEach((value, j) => {
    const q = p + '.ports[' + j + ']'; portSnapshot(value, q, u); const port = object(value, q);
    const identity = String(port.direction) + ':' + port.key; if (portKeys.has(identity)) fail('DUPLICATE_PORT: ' + q); portKeys.add(identity);
  });
}
function wireHeader(value: RecordValue, p: string, expected: string, u: string[]): boolean {
  string(value.schema, p + '.schema');
  if (!Number.isSafeInteger(value.version) || Number(value.version) < 1) fail('WIRE_VERSION: ' + p);
  if (value.schema !== expected || value.version !== 1) { u.push(p + '.schema/version'); return false; }
  return true;
}
function edgeDocument(value: unknown, p: string, u: string[]): void {
  const e = fields(value, p, ['id', 'from', 'to', 'adaptation', 'extensions'], ['invalid'], u);
  string(e.id, p); endpoint(e.from, p + '.from', u); endpoint(e.to, p + '.to', u); extensions(e.extensions, p);
  const q = p + '.adaptation', a = object(e.adaptation, q);
  if (wireHeader(a, q, 'grape.edge-adaptation', u)) {
    fields(a, q, ['schema', 'version', 'sourceType', 'targetType', 'operation', 'extensions'], [], u);
    string(a.sourceType, q + '.sourceType'); string(a.targetType, q + '.targetType'); string(a.operation, q + '.operation'); extensions(a.extensions, q + '.extensions');
    if (!enumMember(a.operation, ['identity', 'broadcast', 'take-leading', 'append-alpha-one', 'numeric-cast'])) u.push(q + '.operation');
  }
  if (e.invalid !== undefined) { const invalid = fields(e.invalid, p + '.invalid', ['code', 'reason'], [], u); string(invalid.code, p); string(invalid.reason, p); }
}
function resourceDocument(value: unknown, p: string, u: string[], pins: ModulePin[]): void {
  const r = fields(value, p, ['id', 'type', 'data', 'references', 'referencesComplete', 'extensions'], [], u);
  string(r.id, p); pin(r.type, p + '.type', 'typeId', u); requirePinned(r.type, pins, p); references(r.references, p + '.references', u); bool(r.referencesComplete, p); extensions(r.extensions, p);
}
function preservedPayload(value: unknown, p: string, u: string[], pins: ModulePin[]): void {
  const o = object(value, p); string(o.kind, p + '.kind');
  switch (o.kind) {
    case 'edge':
      fields(o, p, ['kind', 'networkId', 'edge'], [], u); string(o.networkId, p); edgeDocument(o.edge, p + '.edge', u); break;
    case 'input-value':
      fields(o, p, ['kind', 'networkId', 'nodeId', 'port', 'value'], [], u); string(o.networkId, p); string(o.nodeId, p); portSnapshot(o.port, p + '.port', u);
      if (object(o.port, p).direction !== 'input') fail('LOSS_INPUT_DIRECTION: ' + p); break;
    case 'node':
      fields(o, p, ['kind', 'networkId', 'node'], [], u); string(o.networkId, p); nodeDocument(o.node, p + '.node', u, pins); break;
    case 'resource':
      fields(o, p, ['kind', 'resource'], [], u); resourceDocument(o.resource, p + '.resource', u, pins); break;
    case 'module':
      fields(o, p, ['kind', 'owner', 'codecId', 'codecVersion', 'data', 'references', 'referencesComplete'], [], u);
      pin(o.owner, p + '.owner', null, u); requirePinned(o.owner, pins, p); string(o.codecId, p);
      if (!Number.isSafeInteger(o.codecVersion) || Number(o.codecVersion) < 1) fail('MODULE_CODEC_VERSION: ' + p);
      references(o.references, p + '.references', u); bool(o.referencesComplete, p); break;
    default: u.push(p + '.kind'); // Future tagged payload: preserve source read-only; never reinterpret.
  }
}
function evidenceRecords(value: unknown, path: string, schema: 'grape.loss' | 'grape.recovery', u: string[], pins: ModulePin[]): void {
  const list = array(value, path); unique(list, 'id', path);
  list.forEach((value, i) => {
    const p = path + '[' + i + ']', r = object(value, p);
    // ID remains the common outer identity even when a future codec cannot be interpreted.
    string(r.id, p + '.id');
    if (!wireHeader(r, p, schema, u)) return;
    fields(r, p, ['schema', 'version', 'id', 'reason', 'payload', 'extensions', ...(schema === 'grape.loss' ? ['code'] : [])], schema === 'grape.recovery' ? ['lossId'] : [], u);
    string(r.reason, p + '.reason'); if (schema === 'grape.loss') string(r.code, p + '.code');
    if (r.lossId !== undefined) string(r.lossId, p + '.lossId');
    extensions(r.extensions, p + '.extensions'); preservedPayload(r.payload, p + '.payload', u, pins);
  });
}
function network(v: unknown, path: string, u: string[], pins: ModulePin[]): void {
  const o = fields(v, path, ['id', 'nodes', 'edges', 'extensions'], [], u); string(o.id, path); extensions(o.extensions, path);
  const nodes = array(o.nodes, path + '.nodes'), edges = array(o.edges, path + '.edges');
  unique(nodes, 'id', path); unique(nodes, 'name', path); unique(edges, 'id', path);
  nodes.forEach((value, i) => nodeDocument(value, path + '.nodes[' + i + ']', u, pins));
  edges.forEach((value, i) => edgeDocument(value, path + '.edges[' + i + ']', u));
}
function requirePinned(ref: unknown, pins: ModulePin[], path: string): void {
  const r = object(ref, path);
  if (!pins.some(p => p.moduleId === r.moduleId && p.version === r.version && p.fingerprint === r.fingerprint)) fail('UNDECLARED_EXACT_PIN: ' + path);
}
function validateDocument(value: unknown): { document: CanonicalGraphDocument; unknownPaths: string[] } {
  const u: string[] = [], e = fields(value, '$', ['format', 'formatVersion', 'graph'], [], u);
  const version = fields(e.formatVersion, '$.formatVersion', ['major', 'minor'], [], u);
  if (e.format !== DOCUMENT_FORMAT || version.major !== DOCUMENT_VERSION.major || version.minor !== DOCUMENT_VERSION.minor) fail('FORMAT_VERSION');
  const g = fields(e.graph, '$.graph', ['id', 'name', 'kind', 'kindSettings', 'modules', 'stages', 'resources', 'losses', 'recovery', 'extensions'], [], u);
  string(g.id, '$.graph.id'); string(g.name, '$.graph.name'); pin(g.kind, '$.graph.kind', 'kindId', u); extensions(g.extensions, '$.graph.extensions');
  const pins = array(g.modules, '$.graph.modules') as ModulePin[];
  const exactPins = new Set<string>();
  for (const p of pins) {
    const key = JSON.stringify([p.moduleId, p.version, p.fingerprint]);
    if (exactPins.has(key)) fail('DUPLICATE_EXACT_PIN'); exactPins.add(key);
  }
  pins.forEach((p, i) => pin(p, '$.graph.modules[' + i + ']', null, u)); requirePinned(g.kind, pins, '$.graph.kind');
  const stages = array(g.stages, '$.graph.stages'); unique(stages, 'id', '$.graph.stages'); unique(stages, 'key', '$.graph.stages');
  stages.forEach((value, i) => { const p = '$.graph.stages[' + i + ']', s = fields(value, p, ['id', 'key', 'stageKindId', 'implementation', 'network', 'extensions'], [], u);
    ['id', 'key', 'stageKindId'].forEach(k => string(s[k], p + '.' + k));
    if (!enumMember(s.implementation, ['network', 'profile-default'])) fail('STAGE_IMPLEMENTATION: ' + p);
    network(s.network, p + '.network', u, pins); extensions(s.extensions, p);
  });
  unique(stages.map(s => object(s, '').network), 'id', '$.graph.networks');
  const resources = array(g.resources, '$.graph.resources'); unique(resources, 'id', '$.graph.resources');
  resources.forEach((value, i) => resourceDocument(value, '$.graph.resources[' + i + ']', u, pins));
  evidenceRecords(g.losses, '$.graph.losses', 'grape.loss', u, pins);
  evidenceRecords(g.recovery, '$.graph.recovery', 'grape.recovery', u, pins);
  return { document: value as CanonicalGraphDocument, unknownPaths: u };
}

/** JSON scanner rejects duplicate keys before JSON.parse can erase evidence. No dynamic evaluation. */
function strictJson(raw: string, maxDepth: number): unknown {
  let at = 0;
  const ws = () => { while (/[\t\n\r ]/u.test(raw[at] ?? '') && at < raw.length) at++; };
  const text = (): string => {
    const start = at++; for (; at < raw.length; at++) {
      if (raw[at] === '\\') { at++; continue; }
      if (raw[at] === '"') { at++; return JSON.parse(raw.slice(start, at)); }
    } return fail('JSON_STRING');
  };
  const item = (depth: number): void => {
    if (depth > maxDepth) fail('JSON_DEPTH'); ws();
    if (raw[at] === '{') {
      at++; ws(); const seen = new Set<string>(); if (raw[at] === '}') { at++; return; }
      while (true) { if (raw[at] !== '"') fail('JSON_KEY'); const key = text(); if (seen.has(key)) fail('DUPLICATE_JSON_KEY: ' + key); seen.add(key);
        ws(); if (raw[at++] !== ':') fail('JSON_COLON'); item(depth + 1); ws(); const c = raw[at++]; if (c === '}') return; if (c !== ',') fail('JSON_OBJECT'); ws(); }
    }
    if (raw[at] === '[') { at++; ws(); if (raw[at] === ']') { at++; return; } while (true) { item(depth + 1); ws(); const c = raw[at++]; if (c === ']') return; if (c !== ',') fail('JSON_ARRAY'); } }
    if (raw[at] === '"') { text(); return; }
    const match = /^(?:true|false|null|-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?)/u.exec(raw.slice(at));
    if (!match) fail('JSON_TOKEN'); const parsed = JSON.parse(match[0]); if (typeof parsed === 'number' && !Number.isFinite(parsed)) fail('JSON_NONFINITE'); at += match[0].length;
  };
  item(0); ws(); if (at !== raw.length) fail('JSON_TRAILING'); return JSON.parse(raw);
}
function frozen<T>(value: T): T { const result = structuredClone(value); const visit = (x: unknown): void => { if (x && typeof x === 'object') { Object.values(x).forEach(visit); Object.freeze(x); } }; visit(result); return result; }

/** Does not hydrate a Graph, initialize modules, install code, change History, or acknowledge storage. */
export function readDocument(raw: string, options: ReadOptions = {}): DocumentRead {
  try {
    const maxBytes = options.maxBytes ?? 16_777_216, maxDepth = options.maxDepth ?? 128;
    if (!Number.isSafeInteger(maxBytes) || maxBytes <= 0 || !Number.isSafeInteger(maxDepth) || maxDepth <= 0) fail('READ_LIMIT');
    if (new TextEncoder().encode(raw).byteLength > maxBytes) fail('DOCUMENT_SIZE');
    const root = object(strictJson(raw, maxDepth), '$');
    if (root.format !== DOCUMENT_FORMAT) return { status: 'foreign', raw, format: typeof root.format === 'string' ? root.format : null, reason: 'IMPORT_CONVERTER_REQUIRED' };
    const version = object(root.formatVersion, '$.formatVersion');
    if (!Number.isSafeInteger(version.major) || !Number.isSafeInteger(version.minor) || Number(version.major) < 1 || Number(version.minor) < 0) fail('VERSION_SHAPE');
    if (version.major !== DOCUMENT_VERSION.major || version.minor !== DOCUMENT_VERSION.minor)
      return { status: 'recovery-readonly', raw, reason: 'UNSUPPORTED_FORMAT_VERSION', unknownPaths: [] };
    const checked = validateDocument(root);
    if (checked.unknownPaths.length) return { status: 'recovery-readonly', raw, reason: 'UNKNOWN_STRUCTURAL_FIELDS', unknownPaths: checked.unknownPaths };
    const unresolvedModules = checked.document.graph.modules.filter(p => !options.availableModule?.(frozen(p)));
    return { status: 'editable', document: frozen(checked.document), unresolvedModules: frozen(unresolvedModules), generationBlockedByMissingModules: unresolvedModules.length > 0 };
  } catch (error) { return { status: 'rejected', raw, reason: String(error) }; }
}

/** Serializes a detached current snapshot, never strips unknown keys silently. Module payload safety remains codec-owned. */
export function writeDocument(document: CanonicalGraphDocument): string {
  const ancestors = new Set<object>();
  const requireJson = (value: unknown): void => {
    if (value === null || typeof value === 'string' || typeof value === 'boolean') return;
    if (typeof value === 'number') { if (!Number.isFinite(value)) fail('NON_JSON_VALUE'); return; }
    if (!value || typeof value !== 'object') fail('NON_JSON_VALUE');
    if (ancestors.has(value)) fail('JSON_CYCLE');
    const isArray = Array.isArray(value), prototype = Object.getPrototypeOf(value);
    if (isArray ? prototype !== Array.prototype : ![Object.prototype, null].includes(prototype)) fail('NON_JSON_PROTOTYPE');
    if (Object.getOwnPropertySymbols(value).length) fail('NON_JSON_SYMBOL');
    ancestors.add(value);
    for (const key of Object.getOwnPropertyNames(value)) {
      const descriptor = Object.getOwnPropertyDescriptor(value, key)!;
      if (isArray && key === 'length') continue;
      if (!Object.hasOwn(descriptor, 'value')) fail('NON_JSON_ACCESSOR');
      if (!descriptor.enumerable) fail('NON_JSON_HIDDEN_PROPERTY');
      if (isArray && (!/^(0|[1-9]\d*)$/u.test(key) || Number(key) >= value.length)) fail('NON_JSON_ARRAY');
      requireJson(descriptor.value);
    }
    if (isArray && Object.keys(value).length !== value.length) fail('NON_JSON_ARRAY');
    ancestors.delete(value);
  };
  requireJson(document);
  const plain = JSON.stringify(document, (_key, value: unknown) => {
    if (value === undefined || typeof value === 'function' || typeof value === 'symbol' || typeof value === 'bigint' || typeof value === 'number' && !Number.isFinite(value)) fail('NON_JSON_VALUE');
    return value;
  });
  const result = readDocument(plain);
  if (result.status !== 'editable') fail('UNWRITABLE_DOCUMENT: ' + result.reason);
  return JSON.stringify(result.document, null, 2) + '\n';
}

/** Unknown structural data may only be re-exported as original recovery bytes, never saved as a modified known Graph. */
export function exportRecovery(source: Extract<DocumentRead, { status: 'recovery-readonly' | 'foreign' | 'rejected' }>): string { return source.raw; }
