/** Test/example document construction, not an application resolver. */
import { Editor, Graph, Registry } from '../core.ts';
import type { Json, NodeRecord, Result, TypeRef } from '../contracts.ts';
import { builtinModule, refs } from '../nodes.ts';
import { NestedNetworkEditorQualification, ResourceQualification, workspaceModule, workspaceRefs } from '../qualification-workspace.ts';
import type { SubgraphRecord } from '../qualification-workspace.ts';
export function value<T>(r: Result<T>): T { if (!r.ok) throw Error(r.error.code + ': ' + r.error.message); return r.value; }
function node(id: string, typeRef: TypeRef, state: Json = {}, references: NodeRecord['references'] = {}): NodeRecord {
  return { id, name: id, typeRef, state, references, referencesComplete: true, ports: [], values: {}, position: [0, 0] };
}
export function scopedFixture(scope: 'local' | 'library' = 'local') {
  const registry = new Registry(); value(registry.register(builtinModule)); value(registry.register(workspaceModule));
  const graph = new Graph({ name: 'Scoped Inspector', definitions: registry.pin(), outputType: refs.output });
  const service = new ResourceQualification(graph);
  const definition: SubgraphRecord = { kind: 'subgraph', name: 'Scale', scope,
    origin: scope === 'library' ? { id: 'library.scale', version: '1' } : null, dependencies: [], body: {
      kind: 'network', ports: [{ key: 'value', direction: 'input', type: 'float', supply: 'local', default: 1 }, { key: 'result', direction: 'output', type: 'float' }],
      nodes: [node('input', workspaceRefs.networkInput, {}, { subgraph: { kind: 'resource', targetId: 'shared' } }),
        node('constant', refs.constant, { value: 2 }), node('multiply', refs.multiply), node('compose', refs.compose, { mode: 'color' })],
      edges: [{ from: { nodeId: 'input', key: 'value' }, to: { nodeId: 'multiply', key: 'a' } }], outputs: { result: { nodeId: 'multiply', key: 'out' } },
    } };
  value(service.createSubgraph('shared', definition));
  const ids = value(graph.change('Create occurrences', d => {
    const root = d.createNode(graph.stage('pixel').id, refs.multiply);
    const a = d.createNode(graph.stage('pixel').id, workspaceRefs.subgraph, { resourceId: 'shared' }, 'a');
    const b = d.createNode(graph.stage('pixel').id, workspaceRefs.subgraph, { resourceId: 'shared' }, 'b');
    return { root, a, b };
  }));
  const editor = new Editor(), rootContext = editor.open(graph), left = editor.open(graph), right = editor.open(graph);
  value(new NestedNetworkEditorQualification(left).enter(ids.a));
  value(new NestedNetworkEditorQualification(right).enter(ids.b));
  return { registry, graph, service, editor, rootContext, left, right, ...ids };
}
