/** THIS IS NOT THE PRODUCTION IMPLEMENTATION. Memory-only ArtifactExecutor fake. */
import type { Json } from '../../executable-reference/contracts.ts';
import { FencedArtifactReceiver } from '../../executable-reference/qualification-host.ts';
import type { ArtifactExecutor, HostArtifact, PreparedCandidate, TargetIdentity } from '../../executable-reference/qualification-host.ts';

export class MemoryArtifactExecutor implements ArtifactExecutor {
  private candidates = new WeakMap<PreparedCandidate, HostArtifact>();
  active: { artifact: HostArtifact; values: Record<string,{type:string;value:Json}> } | null = null;
  prepareCount = 0;
  rejectPrepare = false;
  async prepare(artifact: Readonly<HostArtifact>): Promise<PreparedCandidate> {
    this.prepareCount++;
    if (this.rejectPrepare) throw new Error('Simulated compiler rejection before publish');
    const candidate: PreparedCandidate = { dispose: () => { this.candidates.delete(candidate); } };
    this.candidates.set(candidate, structuredClone(artifact));
    return candidate;
  }
  commit(candidate: PreparedCandidate, values: Readonly<Record<string,{type:string;value:Json}>>): 'committed' {
    const artifact = this.candidates.get(candidate);
    if (!artifact) throw new Error('Unknown or disposed candidate');
    // Only the fake memory store is changed. No native atomicity claim is made.
    this.active = { artifact: structuredClone(artifact), values: structuredClone(values) };
    return 'committed';
  }
}
export function makeMemoryHost(identity: TargetIdentity) {
  const executor = new MemoryArtifactExecutor();
  return { executor, receiver: new FencedArtifactReceiver(identity, executor) };
}
