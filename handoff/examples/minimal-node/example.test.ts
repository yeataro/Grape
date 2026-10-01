/** THIS IS NOT THE PRODUCTION IMPLEMENTATION. No third-party runtime dependency. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { Graph, Registry } from '../../executable-reference/core.ts';
import { builtinModule, refs } from '../../executable-reference/nodes.ts';
import { generate } from '../../executable-reference/generator.ts';
import { unwrap } from '../../executable-reference/scenario.ts';
import { minimalNodeModule, scaleRef } from './example.ts';

test('HANDOFF-NODE-01 fixed module: registration → local inputs → Edge → generation → undo/reload', () => {
  const registry = new Registry();
  unwrap(registry.register(builtinModule));
  unwrap(registry.register(minimalNodeModule));
  const graph = new Graph({ name: 'Fixed module sample', definitions: registry.pin(), outputType: refs.output });
  const stage = graph.stage('pixel');
  const id = unwrap(graph.change('Create scale', draft => {
    const id = draft.createNode(stage.id, scaleRef, {}, 'scale1');
    draft.setInput(id, 'value', 0.25);
    draft.setInput(id, 'factor', 2);
    return id;
  }));
  const node = graph.nodeById(id)!;
  unwrap(graph.change('Connect', draft => draft.connect(node.output('out'), stage.nodes[0].input('color'))));
  assert.equal(graph.diagnostics.some(x => x.severity === 'error'), false);
  assert.match(unwrap(generate(graph.snapshot())).pixel, /0\.25 \* 2\.0/);
  const before = graph.exportJSON();
  unwrap(node.parameter('factor').write(3));
  assert.equal(node.parameter('factor').read(), 3);
  unwrap(graph.history.undo());
  assert.equal(graph.exportJSON(), before);
  const reloaded = unwrap(Graph.load(before, registry));
  assert.equal(reloaded.nodeById(id)!.parameter('factor').read(), 2);
  assert.equal(unwrap(generate(reloaded.snapshot())).pixel, unwrap(generate(graph.snapshot())).pixel);
});

test('HANDOFF-NODE-02 exact module absence preserves data and blocks generation', () => {
  const registry = new Registry(); unwrap(registry.register(builtinModule)); unwrap(registry.register(minimalNodeModule));
  const graph = new Graph({ name: 'Missing module sample', definitions: registry.pin(), outputType: refs.output });
  const id = unwrap(graph.change('Create', d => d.createNode(graph.stage('pixel').id, scaleRef, {})));
  const absent = new Registry(); unwrap(absent.register(builtinModule));
  const loaded = unwrap(Graph.load(graph.exportJSON(), absent));
  assert.deepEqual(loaded.nodeById(id)!.record.typeRef, scaleRef);
  assert.equal(generate(loaded.snapshot()).ok, false);
  assert.equal(loaded.exportJSON(), graph.exportJSON());
});
