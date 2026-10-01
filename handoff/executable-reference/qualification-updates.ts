import type { GenerationResult, GraphDocument, Result, Snapshot } from './contracts.ts';
import { Graph } from './core.ts';
import { generate } from './generator.ts';

// Scheduling state is disposable; Graph and History remain the only document/undo truth.
export type UpdateReceipt = {
  status: 'generated' | 'blocked' | 'failed' | 'superseded' | 'disposed';
  revision: number;
  loadId: string;
  profile: string;
  request: number;
  artifact?: GenerationResult;
  document?: GraphDocument;
  reason?: string;
  reused?: boolean;
};
export type Compile = (snapshot: Snapshot, profile: string) => Promise<Result<GenerationResult>>;
function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object') return Object.fromEntries(
    Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => [k, canonical(v)]));
  return value;
}
export function shaderDemandKey(snapshot: Snapshot, profile: string): string {
  const doc = structuredClone(snapshot.document);
  doc.name = '';
  for (const stage of doc.stages) for (const node of stage.nodes) {
    node.name = ''; node.position = [0, 0];
  }
  // Unknown state/extensions/resources remain conservative invalidators. No module may
  // silently classify arbitrary state as non-semantic. This is a content key, not an ACK.
  return JSON.stringify(canonical({ profile, document: doc }));
}
type Request = { id: number; snapshot: Snapshot; key: string; profile: string;
  resolve: (receipt: UpdateReceipt) => void };
type Lane = { running?: Request; wanted?: Request;
  cache: Map<string, GenerationResult> };
export class Updates {
  readonly graph: Graph;
  readonly #compile: Compile;
  readonly #lanes = new Map<string, Lane>();
  #sequence = 0;
  #disposed = false;
  #unsubscribe: (() => void)[] = [];
  #autoProfiles: string[];
  readonly receipts: UpdateReceipt[] = [];
  constructor(graph: Graph, options: { compile?: Compile; policy?: 'manual' | 'operation-end'; profiles?: string[] } = {}) {
    this.graph = graph;
    this.#compile = options.compile ?? (async (snapshot) => generate(snapshot));
    this.#autoProfiles = options.profiles ?? ['gles300'];
    if (options.policy === 'operation-end') {
      this.#unsubscribe.push(graph.subscribeOperationEnd(() => this.#requestAutomatic()));
      this.#unsubscribe.push(graph.subscribe(e => { if (e.kind === 'undo' || e.kind === 'redo') this.#requestAutomatic(); }));
    }
  }
  #requestAutomatic(): void {
    // Queue the work outside the synchronous Graph notification boundary.
    queueMicrotask(() => {
      // A later gesture may already be active before this task runs. Its end event
      // will request the final snapshot; never promote its intermediate state here.
      if (!this.#disposed && !this.graph.busy) for (const profile of this.#autoProfiles) void this.flush(profile);
    });
  }
  #receipt(request: Request, status: UpdateReceipt['status'], extra: Partial<UpdateReceipt> = {}): void {
    const receipt: UpdateReceipt = { status, revision: request.snapshot.revision,
      loadId: request.snapshot.loadId, profile: request.profile, request: request.id, ...extra };
    this.receipts.push(structuredClone(receipt)); request.resolve(structuredClone(receipt));
  }
  flush(profile = 'gles300'): Promise<UpdateReceipt> {
    const snapshot = this.graph.snapshot();
    return new Promise(resolve => {
      const request: Request = { id: ++this.#sequence, snapshot, profile,
        key: shaderDemandKey(snapshot, profile), resolve };
      if (this.#disposed) return this.#receipt(request, 'disposed');
      if (snapshot.diagnostics.some(i => i.severity === 'error'))
        return this.#receipt(request, 'blocked', { reason: 'Current full-graph diagnostics contain errors' });
      let lane = this.#lanes.get(profile);
      if (!lane) this.#lanes.set(profile, lane = { cache: new Map() });
      if (lane.wanted) this.#receipt(lane.wanted, 'superseded');
      lane.wanted = request;
      if (!lane.running) void this.#pump(lane);
    });
  }
  async #pump(lane: Lane): Promise<void> {
    const request = lane.wanted;
    if (!request || this.#disposed) return;
    delete lane.wanted; lane.running = request;
    try {
      let result: Result<GenerationResult>;
      const reused = lane.cache.has(request.key);
      if (reused) result = { ok: true, value: structuredClone(lane.cache.get(request.key)!) };
      else result = await this.#compile(request.snapshot, request.profile);
      const current = this.graph.snapshot();
      const wanted = lane.wanted as Request | undefined; // flush can replace it during await
      if (this.#disposed) this.#receipt(request, 'disposed');
      else if (current.loadId !== request.snapshot.loadId ||
        shaderDemandKey(current, request.profile) !== request.key || wanted && wanted.key !== request.key)
        this.#receipt(request, 'superseded');
      else if (current.diagnostics.some(i => i.severity === 'error')) this.#receipt(request, 'blocked');
      else if (!result.ok) this.#receipt(request, 'failed', { reason: result.error.message });
      else if (!reused && (result.value.loadId !== request.snapshot.loadId || result.value.revision !== request.snapshot.revision))
        this.#receipt(request, 'failed', { reason: 'COMPILER_SNAPSHOT_MISMATCH' });
      else {
        lane.cache.delete(request.key); lane.cache.set(request.key, structuredClone(result.value));
        if (lane.cache.size > 8) lane.cache.delete(lane.cache.keys().next().value!);
        this.#receipt(request, 'generated', { reused, artifact: result.value, document: request.snapshot.document });
      }
    } catch (e) { this.#receipt(request, this.#disposed ? 'disposed' : 'failed', { reason: String(e) }); }
    finally { delete lane.running; if (!this.#disposed) void this.#pump(lane); }
  }
  dispose(): void {
    this.#disposed = true;
    for (const off of this.#unsubscribe) off(); this.#unsubscribe = [];
    for (const lane of this.#lanes.values()) if (lane.wanted) {
      this.#receipt(lane.wanted, 'disposed'); delete lane.wanted;
    }
    // An in-flight compiler cannot be declared cancelled; its result is discarded.
  }
}
