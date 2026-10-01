/** THIS IS NOT THE PRODUCTION IMPLEMENTATION. */
import test from 'node:test';
import assert from 'node:assert/strict';
import type { HostArtifact } from '../../executable-reference/qualification-host.ts';
import { makeMemoryHost } from './example.ts';
const identity = { hostId:'example-host', targetId:'example-target', incarnation:'session-1' };
const artifact = (code:string): HostArtifact => ({codeKey:code, schemaKey:'gain-float-v1', code, sources:[{id:'gain',type:'float',defaultValue:0.5}], document:{label:code}});

test('HANDOFF-HOST-01 publish retry is idempotent and next compile preserves current host values', async () => {
  const {receiver, executor}=makeMemoryHost(identity);
  const lease=receiver.bind('binding-1','graph-1','load-1');
  const first={requestId:'request-1',lease,intentSeq:1,expectedHostRevision:0,artifact:artifact('A')};
  assert.equal((await receiver.receive(first)).status,'applied');
  assert.equal((await receiver.receive(first)).hostRevision,1); assert.equal(executor.prepareCount,1);
  receiver.setObservedInput('gain',0.8);
  assert.equal((await receiver.receive({requestId:'request-2',lease,intentSeq:2,expectedHostRevision:1,artifact:artifact('B')})).status,'applied');
  assert.equal(executor.active!.values.gain.value,0.8);
});
test('HANDOFF-HOST-02 prepare failure retains last successful artifact', async () => {
  const {receiver,executor}=makeMemoryHost(identity); const lease=receiver.bind('b','g','l');
  await receiver.receive({requestId:'a',lease,intentSeq:1,expectedHostRevision:0,artifact:artifact('A')});
  executor.rejectPrepare=true;
  const result=await receiver.receive({requestId:'b',lease,intentSeq:2,expectedHostRevision:1,artifact:artifact('B')});
  assert.equal(result.status,'retained'); assert.equal(result.reason,'PREPARE_FAILED');
  assert.equal(receiver.observed().artifact!.code,'A'); assert.equal(executor.active!.artifact.code,'A');
});
test('HANDOFF-HOST-03 target replacement rejects the old lease before prepare', async () => {
  const {receiver,executor}=makeMemoryHost(identity); const lease=receiver.bind('b','g','l');
  receiver.replaceTarget({...identity,incarnation:'session-2'});
  await assert.rejects(receiver.receive({requestId:'old',lease,intentSeq:1,expectedHostRevision:0,artifact:artifact('A')}),/STALE_LEASE/);
  assert.equal(executor.prepareCount,0); assert.equal(executor.active,null);
});
