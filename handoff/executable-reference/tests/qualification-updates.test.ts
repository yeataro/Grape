import test from 'node:test';
import assert from 'node:assert/strict';
import { exercise, unwrap } from '../scenario.ts';
import { generate } from '../generator.ts';
import { Updates } from '../qualification-updates.ts';
import { FencedArtifactReceiver } from '../qualification-host.ts';
import type { GenerationResult, Result } from '../contracts.ts';
const tick = () => new Promise<void>(resolve => setImmediate(resolve));

test('UQ01 fifteen published gesture batches create one automatic generation at operation end', async () => {
  const { graph, ids } = await exercise(); let calls = 0;
  const updates = new Updates(graph, { policy: 'operation-end', compile: async s => { calls++; return generate(s); } });
  const operation = unwrap(graph.beginOperation('slider'));
  for (let i = 0; i < 15; i++) unwrap(graph.nodeById(ids.constant)!.parameter('value').write(i / 20, operation));
  await tick(); assert.equal(calls, 0);
  unwrap(operation.commit()); await tick(); assert.equal(calls, 1);
  assert.equal(updates.receipts.at(-1)!.status, 'generated');
  const r = graph.revision; unwrap(graph.history.undo()); await tick();
  assert.equal(graph.revision, r + 1); assert.equal(calls, 2); updates.dispose();
});

test('UQ02 rename/move reuse shader; document export remains latest and each flush has a fresh intent', async () => {
  const { graph, ids } = await exercise(); let calls = 0;
  const updates = new Updates(graph, { compile: async s => { calls++; return generate(s); } });
  const first = await updates.flush();
  unwrap(graph.change('layout and name', d => { d.move(ids.constant, [80, 90]); d.rename(ids.constant, 'Display only'); }));
  const second = await updates.flush();
  assert.equal(calls, 1); assert.equal(second.reused, true);
  assert.ok(second.request > first.request); assert.ok(second.revision > first.revision);
  assert.equal(second.artifact!.revision, first.artifact!.revision); // origin is not the delivery revision
  assert.match(graph.exportJSON(), /Display only/); updates.dispose();
});

test('UQ07 deferred operation-end task cannot capture a later still-open gesture', async () => {
  const { graph, ids } = await exercise(); let calls = 0;
  const updates = new Updates(graph, { policy:'operation-end', compile:async s => { calls++; return generate(s); } });
  unwrap(graph.nodeById(ids.constant)!.parameter('value').write(0.11));
  const gesture = unwrap(graph.beginOperation('next gesture'));
  unwrap(graph.nodeById(ids.constant)!.parameter('value').write(0.22,gesture));
  await tick(); assert.equal(calls,0);
  unwrap(gesture.commit()); await tick(); assert.equal(calls,1); updates.dispose();
});

test('UQ03 queue coalesces; stale generation cannot publish after later edit; profiles isolate jobs', async () => {
  const { graph, ids } = await exercise();
  const deferred: (() => void)[] = [];
  const updates = new Updates(graph, { compile: s => new Promise(resolve => deferred.push(() => resolve(generate(s)))) });
  const a = updates.flush();
  unwrap(graph.nodeById(ids.constant)!.parameter('value').write(0.21));
  const b = updates.flush();
  unwrap(graph.nodeById(ids.constant)!.parameter('value').write(0.42));
  const c = updates.flush();
  assert.equal((await b).status, 'superseded'); assert.equal(deferred.length, 1);
  const other = updates.flush('different-profile'); assert.equal(deferred.length, 2);
  deferred[0](); assert.equal((await a).status, 'superseded');
  await tick(); assert.equal(deferred.length, 3);
  deferred[1](); deferred[2]();
  assert.equal((await c).status, 'generated'); assert.equal((await other).status, 'generated'); updates.dispose();
});

test('UQ04 cached content cannot override current errors; failed compiler does not poison retries', async () => {
  const { graph, ids } = await exercise(); let failing = true;
  const updates = new Updates(graph, { compile: async s => { if (failing) throw Error('compiler failed'); return generate(s); } });
  assert.equal((await updates.flush()).status, 'failed'); failing = false;
  assert.equal((await updates.flush()).status, 'generated');
  unwrap(graph.nodeById(ids.compose)!.parameter('mode').write('pair'));
  assert.equal((await updates.flush()).status, 'blocked');
  unwrap(graph.history.undo()); assert.equal((await updates.flush()).status, 'generated'); updates.dispose();
});

test('UQ05 disposing in-flight work rejects late success and pending demands; no graph mutation', async () => {
  const { graph } = await exercise(); const before = graph.exportJSON();
  let release!: (r: Result<GenerationResult>) => void;
  const updates = new Updates(graph, { compile: () => new Promise(resolve => { release = resolve; }) });
  const a = updates.flush(), b = updates.flush(); updates.dispose();
  assert.equal((await b).status, 'disposed'); release(generate(graph.snapshot()));
  assert.equal((await a).status, 'disposed'); assert.equal((await updates.flush()).status, 'disposed');
  assert.equal(graph.exportJSON(), before);
});

test('UQ06 Graph→Updates→receiver: Undo A while B compiles requires fresh receiver intent even for cached A', async () => {
  const { graph, ids } = await exercise();
  const updates = new Updates(graph); let waitForB: (() => void) | undefined, prepared = 0;
  const receiver = new FencedArtifactReceiver({hostId:'H',targetId:'T',incarnation:'I'}, {
    prepare: async () => { if (++prepared === 2) await new Promise<void>(r => { waitForB = r; }); return { dispose() {} }; },
    commit: () => 'committed',
  });
  const lease = receiver.bind('binding',graph.snapshot().document.id,graph.loadId);
  const deliver = async (receipt: Awaited<ReturnType<Updates['flush']>>) => receiver.receive({
    requestId: `request-${receipt.request}`, lease, intentSeq: receipt.request, expectedHostRevision: receiver.observed().revision,
    artifact: { codeKey: receipt.artifact!.pixel, schemaKey:'none', code:receipt.artifact!.pixel, sources:[], document:JSON.parse(JSON.stringify(receipt.document)) },
  });
  const a = await updates.flush(); assert.equal((await deliver(a)).status, 'applied');
  unwrap(graph.nodeById(ids.constant)!.parameter('value').write(0.83));
  const b = await updates.flush(), inFlightB = deliver(b); await tick();
  unwrap(graph.history.undo()); const restored = await updates.flush();
  assert.equal(restored.reused, true);
  assert.equal(restored.artifact!.pixel, a.artifact!.pixel); assert.ok(restored.request > b.request);
  assert.equal((await deliver(restored)).status, 'applied'); waitForB!();
  assert.equal((await inFlightB).status, 'superseded'); assert.equal(receiver.observed().artifact!.code, a.artifact!.pixel);
  updates.dispose();
});

test('UQ08 receipt owns the same-demand document; later edits cannot pair new graph with old shader',async()=>{
 const {graph,ids}=await exercise(),updates=new Updates(graph);
 const receipt=await updates.flush(),captured=JSON.stringify(receipt.document);
 unwrap(graph.nodeById(ids.constant)!.parameter('value').write(0.99));
 assert.notEqual(graph.revision,receipt.revision);assert.equal(JSON.stringify(receipt.document),captured);
 assert.notEqual(JSON.stringify(JSON.parse(graph.exportJSON())),captured);
 assert.deepEqual(receipt.document!.stages.flatMap(s=>s.nodes).find(n=>n.id===ids.constant)!.state,{value:0.4});
 updates.dispose();
});
test('UQ09 fresh compiler result from another revision/load cannot poison content cache',async()=>{
 const {graph,ids}=await exercise();const old=unwrap(generate(graph.snapshot()));
 unwrap(graph.nodeById(ids.constant)!.parameter('value').write(0.77));let wrong=true;
 const updates=new Updates(graph,{compile:async s=>wrong?{ok:true,value:old}:generate(s)});
 const bad=await updates.flush();assert.equal(bad.status,'failed');assert.equal(bad.reason,'COMPILER_SNAPSHOT_MISMATCH');
 wrong=false;const good=await updates.flush();assert.equal(good.status,'generated');assert.equal(good.reused,false);updates.dispose();
});
