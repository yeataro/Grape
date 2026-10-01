/** TEST ADAPTER ONLY. This explicitly maps the bounded reference runtime to production DTOs.
 * Do not copy this adapter into production. No qualification-only union becomes a wire contract.
 * Unsupported reference resources/recovery fail closed, rather than being silently reinterpreted.
 */
import type { GraphDocument, PortSpec, NodeRecord, EdgeRecord, LossRecord, Value } from '../executable-reference/contracts.ts';
import { refs } from '../executable-reference/nodes.ts';
import type { CanonicalGraphDocument, PortSnapshot, NodeDocument, EdgeDocument, LossDocument } from './document-format.ts';
import { DOCUMENT_FORMAT, DOCUMENT_VERSION } from './document-format.ts';

const kinds = { moduleId: 'qualification.graph-kinds', version: '1', fingerprint: 'fixture-not-a-product-module' };
const typePairs = ['float', 'int', 'uint', 'bool', 'double', 'vec2', 'vec3', 'vec4'];
function wireType(type: string): string { if (!typePairs.includes(type)) throw Error('OUTSIDE_BRIDGE_TYPE_SCOPE'); return 'glsl.' + type; }
function runtimeType(type: string): string { if (!type.startsWith('glsl.') || !typePairs.includes(type.slice(5))) throw Error('OUTSIDE_BRIDGE_TYPE_SCOPE'); return type.slice(5); }
function portToWire(p: PortSpec): PortSnapshot {
  const { default: defaultValue, type, ...rest } = p;
  return { ...rest, type: wireType(type), ...(defaultValue !== undefined ? { defaultValue } : {}) };
}
function portFromWire(p: PortSnapshot): PortSpec {
  const { defaultValue, type, semantic, ...rest } = p;
  if (semantic !== undefined && !['value', 'rgb', 'rgba', 'xyz', 'uv'].includes(semantic)) throw Error('OUTSIDE_BRIDGE_SEMANTIC_SCOPE');
  return { ...rest, type: runtimeType(type), ...(semantic !== undefined ? { semantic: semantic as PortSpec['semantic'] } : {}), ...(defaultValue !== undefined ? { default: defaultValue as Value } : {}) };
}
function nodeToWire(n: NodeRecord): NodeDocument {
  return { id: n.id, name: n.name, type: n.typeRef, state: n.state, inputValues: n.values,
    ports: n.ports.map(portToWire), references: Object.entries(n.references).map(([slot, ref]) => ({ slot, ...ref })), referencesComplete: n.referencesComplete, position: n.position, extensions: {} };
}
function nodeFromWire(n: NodeDocument): NodeRecord {
  if (n.references.some(r => r.networkId !== undefined) || Object.keys(n.extensions).length) throw Error('OUTSIDE_BRIDGE_NODE_SCOPE');
  return { id: n.id, name: n.name, typeRef: n.type, state: n.state, values: n.inputValues as NodeRecord['values'], ports: n.ports.map(portFromWire), references: Object.fromEntries(n.references.map(({ slot, ...ref }) => [slot, ref])), referencesComplete: n.referencesComplete, position: n.position };
}
const operationMap = { identity: 'identity', broadcast: 'broadcast', take: 'take-leading', alpha: 'append-alpha-one', cast: 'numeric-cast' } as const;
export function edgeToWire(e: EdgeRecord): EdgeDocument {
  return { id: e.id, from: { nodeId: e.from.nodeId, portKey: e.from.key }, to: { nodeId: e.to.nodeId, portKey: e.to.key },
    adaptation: { schema: 'grape.edge-adaptation', version: 1, sourceType: wireType(e.adaptation.from), targetType: wireType(e.adaptation.to), operation: operationMap[e.adaptation.op], extensions: {} },
    ...(e.invalid ? { invalid: e.invalid } : {}), extensions: {} };
}
function edgeFromWire(e: EdgeDocument): EdgeRecord {
  if (Object.keys(e.extensions).length || Object.keys(e.adaptation.extensions).length || e.invalid && e.invalid.code !== 'INTERFACE_CHANGED') throw Error('OUTSIDE_BRIDGE_EDGE_SCOPE');
  const op = Object.entries(operationMap).find(([, wire]) => wire === e.adaptation.operation)?.[0] as EdgeRecord['adaptation']['op'] | undefined;
  if (!op) throw Error('OUTSIDE_BRIDGE_ADAPTATION_SCOPE');
  return { id: e.id, from: { nodeId: e.from.nodeId, key: e.from.portKey }, to: { nodeId: e.to.nodeId, key: e.to.portKey }, adaptation: { from: runtimeType(e.adaptation.sourceType), to: runtimeType(e.adaptation.targetType), op }, ...(e.invalid ? { invalid: { code: 'INTERFACE_CHANGED', reason: e.invalid.reason } as const } : {}) };
}
export function referenceToWire(d: GraphDocument, beforeInterfaceChange: GraphDocument = d): CanonicalGraphDocument {
  if (d.kind !== 'td.top' || d.resources.length || d.recovery.length) throw Error('OUTSIDE_BRIDGE_GRAPH_SCOPE');
  const losses: LossDocument[] = d.losses.map(l => {
    const stage = d.stages.find(s => s.nodes.some(n => n.id === l.nodeId)); if (!stage || l.resourceId) throw Error('OUTSIDE_BRIDGE_LOSS_SCOPE');
    const base = { schema: 'grape.loss' as const, version: 1 as const, id: l.id, code: 'INTERFACE_CHANGED', reason: l.reason, extensions: {} };
    if (l.edge) return { ...base, payload: { kind: 'edge', networkId: 'network:' + stage.id, edge: edgeToWire(l.edge) } };
    const port = beforeInterfaceChange.stages.flatMap(s => s.nodes).find(n => n.id === l.nodeId)?.ports.find(p => p.direction === 'input' && p.key === l.inputKey);
    if (!port || l.value === undefined) throw Error('PRIOR_INPUT_SNAPSHOT_REQUIRED');
    return { ...base, payload: { kind: 'input-value', networkId: 'network:' + stage.id, nodeId: l.nodeId, port: portToWire(port), value: l.value } };
  });
  const modules = [...new Map(d.definitions.map(({ typeId: _, ...pin }) => [JSON.stringify(pin), pin])).values()];
  return { format: DOCUMENT_FORMAT, formatVersion: { ...DOCUMENT_VERSION }, graph: { id: d.id, name: d.name, kind: { ...kinds, kindId: 'grape.image' }, kindSettings: {}, modules: [kinds, ...modules],
    stages: d.stages.map(s => ({ id: s.id, key: s.kind, stageKindId: 'grape.stage.' + s.kind, implementation: s.implementation === 'default' ? 'profile-default' : 'network', network: { id: 'network:' + s.id, nodes: s.nodes.map(nodeToWire), edges: s.edges.map(edgeToWire), extensions: {} }, extensions: {} })),
    resources: [], losses, recovery: [], extensions: {} } };
}
export function wireToReference(d: CanonicalGraphDocument): GraphDocument {
  if (d.graph.kind.moduleId !== kinds.moduleId || d.graph.kind.kindId !== 'grape.image' || d.graph.resources.length || d.graph.recovery.length) throw Error('OUTSIDE_BRIDGE_GRAPH_SCOPE');
  const stages = d.graph.stages.map(s => {
    if (!['vertex', 'pixel'].includes(s.key) || s.network.id !== 'network:' + s.id) throw Error('OUTSIDE_BRIDGE_STAGE_SCOPE');
    // This fixture GraphKind's required pixel boundary is exact refs.output. The reference's
    // boolean is reconstructed from that registered requirement; it is not a production field.
    const nodes = s.network.nodes.map(nodeFromWire).map(n => ({ ...n, ...(s.key === 'pixel' && JSON.stringify(n.typeRef) === JSON.stringify(refs.output) ? { boundary: true } : {}) }));
    return { id: s.id, kind: s.key as 'vertex' | 'pixel', implementation: s.implementation === 'profile-default' ? 'default' as const : 'network' as const, nodes, edges: s.network.edges.map(edgeFromWire) };
  });
  const losses: LossRecord[] = d.graph.losses.map(l => {
    const p = l.payload;
    if (p.kind === 'edge') return { id: l.id, reason: l.reason, nodeId: p.edge.to.nodeId, edge: edgeFromWire(p.edge) };
    if (p.kind === 'input-value') return { id: l.id, reason: l.reason, nodeId: p.nodeId, inputKey: p.port.key, value: p.value as Value };
    throw Error('OUTSIDE_BRIDGE_LOSS_SCOPE');
  });
  return { format: 'grape-core-experiment', formatVersion: 1, id: d.graph.id, name: d.graph.name, kind: 'td.top', outputType: refs.output,
    definitions: [...new Map(stages.flatMap(s => s.nodes.map(n => n.typeRef)).map(ref => [JSON.stringify(ref), ref])).values()], stages, resources: [], recovery: [], losses };
}
