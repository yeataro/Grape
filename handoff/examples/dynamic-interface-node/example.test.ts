/** THIS IS NOT THE PRODUCTION IMPLEMENTATION. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { Editor, Graph, Registry } from '../../executable-reference/core.ts';
import { builtinModule, refs } from '../../executable-reference/nodes.ts';
import { generate } from '../../executable-reference/generator.ts';
import { unwrap } from '../../executable-reference/scenario.ts';
import { dynamicNodeModule, packRef } from './example.ts';
import { ParameterWidgets } from '../../executable-reference/qualification-presentation.ts';
import type { Json } from '../../executable-reference/contracts.ts';

function fixture() {
  const registry = new Registry(); unwrap(registry.register(builtinModule)); unwrap(registry.register(dynamicNodeModule));
  const graph = new Graph({ name: 'Dynamic module sample', definitions: registry.pin(), outputType: refs.output });
  const stage = graph.stage('pixel');
  const id = unwrap(graph.change('Create pack', d => d.createNode(stage.id, packRef, {mode: 'color'})));
  const node = graph.nodeById(id)!;
  unwrap(graph.change('Connect', d => d.connect(node.output('out'), stage.nodes[0].input('color'))));
  return { graph, registry, node };
}
test('HANDOFF-DYNAMIC-01 one mode write reconciles ports, edge loss, diagnostics and History', () => {
  const {graph, registry, node} = fixture();
  const before = graph.exportJSON(), history = graph.history.length;
  assert.equal(generate(graph.snapshot()).ok, true);
  unwrap(node.parameter('mode').write('pair'));
  assert.equal(node.output('out').spec!.type, 'vec2');
  assert.equal(graph.stage('pixel').edges.length, 0);
  assert.ok(graph.snapshot().document.losses.some(x => x.edge));
  assert.ok(graph.diagnostics.some(x => x.code === 'REQUIRED_INPUT'));
  assert.equal(generate(graph.snapshot()).ok, false);
  assert.equal(graph.history.length, history + 1);
  const invalid = graph.exportJSON();
  assert.equal(unwrap(Graph.load(invalid, registry)).exportJSON(), invalid);
  unwrap(graph.history.undo()); assert.equal(graph.exportJSON(), before);
  unwrap(graph.history.redo()); assert.equal(graph.exportJSON(), invalid);
});
test('HANDOFF-DYNAMIC-02 invalid state is rejected without changing the graph', () => {
  const {graph, node} = fixture(); const before = graph.exportJSON(), revision = graph.revision;
  const result = node.parameter('mode').write('unsupported');
  assert.equal(result.ok, false);
  assert.equal(graph.exportJSON(), before); assert.equal(graph.revision, revision);
});
test('HANDOFF-DYNAMIC-03 a generic menu renderer can enumerate labels and select values from the projection', () => {
  const {graph, node} = fixture();
  const context=new Editor().open(graph), widgets=new ParameterWidgets();
  const view=widgets.project(context,node.id,'mode');
  assert.equal(view.widget,'core.menu'); assert.equal(view.fallback,false);
  assert.equal(view.field.value,'color');
  const body=view.body as {value:Json;options:{schema:string;items:{value:string;label:string}[]}};
  assert.equal(body.options.schema,'handoff.menu-items.v1');
  assert.deepEqual(body.options.items,[{value:'pair',label:'Pair (vec2)'},{value:'color',label:'Color (RGBA)'}]);
  // This generic consumer only reads widget metadata; it never inspects packRef/typeId.
  const chosen=body.options.items[0];
  assert.equal(typeof chosen.label,'string');
  unwrap(node.parameter('mode').write(chosen.value));
  assert.equal(widgets.project(context,node.id,'mode').field.value,chosen.value);
  assert.equal(node.output('out').spec!.type,'vec2');
  // The returned projection is detached UI data, not a way to change accepted model values.
  body.options.items[0].value='unsupported';
  assert.equal(node.parameter('mode').write(body.options.items[0].value).ok,false);
  const fresh=widgets.project(context,node.id,'mode').body as typeof body;
  assert.equal(fresh.options.items[0].value,'pair');
});
