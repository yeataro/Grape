/** Qualification model only. No TD, browser network, IPC, file, or GPU provider. */
import type { Json } from './contracts.ts';

export class HostFailure extends Error {
  readonly code: string;
  constructor(code: string) { super(code); this.code = code; }
}
const fail = (code: string): never => { throw new HostFailure(code); };
const copy = <T>(value: T): T => structuredClone(value);
function canonical(value: unknown): string {
  if (Array.isArray(value)) return '[' + value.map(canonical).join(',') + ']';
  if (value && typeof value === 'object') return '{' + Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([k,v]) => JSON.stringify(k)+':'+canonical(v)).join(',')+'}';
  return JSON.stringify(value);
}
const equal = (a: unknown, b: unknown) => canonical(a) === canonical(b);

export type DeploymentProfile = 'static-web' | 'node-hosted' | 'electron';
export type ServiceName = 'host-discovery' | 'target-session' | 'artifact-apply' | 'input-values' | 'control-layout' | 'preview-surface' | 'native-window' | 'document-export' | 'application-assets';
export interface ServiceProvider { readonly name: ServiceName; readonly environmentEvidence: 'fake' | 'real'; }
export class HostServices {
  private readonly services: Map<ServiceName, ServiceProvider>;
  readonly profile: DeploymentProfile;
  constructor(profile: DeploymentProfile, providers: readonly ServiceProvider[]) {
    this.profile=profile;
    this.services = new Map();
    for (const provider of providers) {
      if (this.services.has(provider.name)) fail('DUPLICATE_SERVICE');
      this.services.set(provider.name, provider);
    }
  }
  require(name: ServiceName): ServiceProvider { return this.services.get(name) ?? fail('CAPABILITY_UNAVAILABLE'); }
}

export interface TargetIdentity { hostId: string; targetId: string; incarnation: string; }
export interface BindingLease extends TargetIdentity { bindingId: string; graphId: string; loadId: string; epoch: number; }
export interface BootstrapDescriptor { expectedHostId: string; targetId: string; incarnation: string; expiresAt: number; }
export function verifyBootstrap(descriptor: BootstrapDescriptor, observed: TargetIdentity, now: number): TargetIdentity {
  if (now >= descriptor.expiresAt) fail('BOOTSTRAP_EXPIRED');
  if (descriptor.expectedHostId !== observed.hostId || descriptor.targetId !== observed.targetId || descriptor.incarnation !== observed.incarnation) fail('WRONG_INSTANCE');
  return copy(observed); // Identity comparison is NOT credential authentication.
}
export interface SourceSpec { id: string; type: string; defaultValue: Json; }
export interface HostArtifact { codeKey: string; schemaKey: string; code: string; sources: SourceSpec[]; document: Json; }
export interface Delivery { requestId: string; lease: BindingLease; intentSeq: number; expectedHostRevision: number; artifact: HostArtifact; resetSourceIds?: string[]; }
export interface ApplyReceipt { requestId: string; status: 'applied' | 'retained' | 'superseded' | 'indeterminate'; hostRevision: number; shaderUpdated: boolean; reason?: string; }
export interface PreparedCandidate { dispose(): void; }
export interface ArtifactExecutor {
  prepare(artifact: Readonly<HostArtifact>): Promise<PreparedCandidate>;
  commit(candidate: PreparedCandidate, values: Readonly<Record<string,{type:string;value:Json}>>): 'committed' | 'retained' | 'indeterminate';
}

/** The RECEIVING side enforces the fence, not just the UI acknowledgement path. */
export class FencedArtifactReceiver {
  private identity: TargetIdentity;
  private executor: ArtifactExecutor;
  private lease: BindingLease;
  private epoch = 0;
  private highestSeq = 0;
  private receipts = new Map<string, { payload: string; result: Promise<ApplyReceipt> }>();
  private current: HostArtifact | null = null;
  private values = new Map<string, { type: string; value: Json }>();
  private revision = 0;
  private uncertain = false;
  private cleanupFailures = 0;
  constructor(identity: TargetIdentity, executor: ArtifactExecutor) {
    this.identity=copy(identity);this.executor=executor;
    this.lease = { ...identity, bindingId: '', graphId: '', loadId: '', epoch: 0 };
  }
  bind(bindingId: string, graphId: string, loadId: string): BindingLease {
    this.lease = { ...this.identity, bindingId, graphId, loadId, epoch: ++this.epoch };
    this.highestSeq = 0; this.receipts.clear();
    return copy(this.lease);
  }
  revoke(): void { this.epoch++; }
  replaceTarget(identity: TargetIdentity): void {
    this.revoke(); this.identity = copy(identity); this.current = null; this.values.clear(); this.revision = 0; this.uncertain = false;
  }
  observed() { return copy({ artifact: this.current, values: Object.fromEntries(this.values), revision: this.revision, uncertain: this.uncertain, cleanupFailures:this.cleanupFailures }); }
  private valid(lease: BindingLease): boolean { return this.epoch === lease.epoch && equal(this.lease, lease) && equal(this.identity, { hostId:lease.hostId,targetId:lease.targetId,incarnation:lease.incarnation }); }
  receive(input: Delivery): Promise<ApplyReceipt> {
    const request = copy(input), key = canonical(request);
    if (!this.valid(request.lease)) return Promise.reject(new HostFailure('STALE_LEASE'));
    const previous = this.receipts.get(request.requestId);
    if (previous) return previous.payload === key ? previous.result : Promise.reject(new HostFailure('REQUEST_ID_REUSED'));
    if (this.uncertain) return Promise.reject(new HostFailure('HOST_STATE_UNKNOWN'));
    if (!Number.isSafeInteger(request.intentSeq) || request.intentSeq <= this.highestSeq) return Promise.reject(new HostFailure('OLD_INTENT'));
    if (request.expectedHostRevision !== this.revision) return Promise.reject(new HostFailure('REVISION_CONFLICT'));
    this.highestSeq = request.intentSeq;
    // Promise is entered in receipt table before any asynchronous completion.
    const result = this.apply(request);
    this.receipts.set(request.requestId, { payload: key, result });
    return result;
  }
  private async apply(request: Delivery): Promise<ApplyReceipt> {
    const result = (status: ApplyReceipt['status'], reason?: string, shaderUpdated = false): ApplyReceipt => ({requestId:request.requestId,status,hostRevision:this.revision,shaderUpdated,...(reason ? {reason} : {})});
    const reconcile = () => {
      const incoming = new Map<string,{type:string;value:Json}>();
      for (const source of request.artifact.sources) {
        if (incoming.has(source.id)) fail('DUPLICATE_SOURCE');
        const previous = this.values.get(source.id);
        if (previous && previous.type !== source.type && !request.resetSourceIds?.includes(source.id)) fail('SOURCE_SHAPE_CONFLICT');
        incoming.set(source.id,{type:source.type,value:copy(previous?.type === source.type ? previous.value : source.defaultValue)});
      }
      return incoming;
    };
    try { reconcile(); } catch(e) { return result('retained',(e as HostFailure).code); }
    const signature=(a:HostArtifact)=>a.sources.map(({id,type})=>({id,type}));
    // Keys are cache hints; equal keys must never permit a changed executable payload to be skipped.
    const sameExecutable = !!this.current && this.current.codeKey === request.artifact.codeKey && this.current.schemaKey === request.artifact.schemaKey && this.current.code === request.artifact.code && equal(signature(this.current),signature(request.artifact));
    let candidate: PreparedCandidate | undefined;
    try {
      if (!sameExecutable) candidate = await this.executor.prepare(copy(request.artifact));
      if (!this.valid(request.lease) || this.highestSeq !== request.intentSeq) return result('superseded');
      if (request.expectedHostRevision !== this.revision) return result('retained','REVISION_CONFLICT');
      // Reconcile after the await, against current host values, in the receiving transaction.
      const incoming = reconcile();
      const outcome = candidate ? this.executor.commit(candidate,copy(Object.fromEntries(incoming))) : 'committed';
      if (outcome === 'indeterminate') { this.uncertain = true; return result('indeterminate','RECOVERY_REQUIRED'); }
      if (outcome === 'retained') return result('retained','COMMIT_REJECTED');
      this.current = copy(request.artifact); this.values = incoming; this.revision++;
      return result('applied',undefined,!sameExecutable);
    } catch {
      // A prepare failure may promise no publish; a thrown commit cannot make that promise.
      if (candidate) { this.uncertain = true; return result('indeterminate','COMMIT_THROW'); }
      return result('retained','PREPARE_FAILED');
    } finally { try { candidate?.dispose(); } catch { this.cleanupFailures++; } }
  }
  /** Testable host-authoritative input; Graph defaults are never updated here. */
  setObservedInput(id: string, value: Json): void { const row = this.values.get(id) ?? fail('MISSING_SOURCE'); row.value = copy(value); }
}

export interface InputField { id: string; shapeId: string; driverId: string; type: 'float'|'int'|'bool'|'string'; value: Json; writable: boolean; revision: number; }
export interface ExpectedField { id: string; shapeId: string; driverId: string; revision: number; }
export interface ValueChange { expected: ExpectedField; value: Json; }
const ref = (f: ExpectedField): ExpectedField => ({id:f.id,shapeId:f.shapeId,driverId:f.driverId,revision:f.revision});
export class InputValueStore {
  private fields = new Map<string,InputField>();
  seed(field: InputField): void { this.fields.set(field.id,copy(field)); }
  read(id: string): InputField { return copy(this.fields.get(id) ?? fail('MISSING_SOURCE')); }
  private validValue(type: InputField['type'], value: Json): boolean {
    if (type === 'bool') return typeof value === 'boolean';
    if (type === 'string') return typeof value === 'string';
    return typeof value === 'number' && Number.isFinite(value) && (type === 'int' ? Number.isInteger(value) && value >= -2147483648 && value <= 2147483647 : Number.isFinite(Math.fround(value)));
  }
  write(changes: readonly ValueChange[]): InputField[] {
    const seen = new Set<string>();
    for (const change of changes) {
      const f = this.fields.get(change.expected.id) ?? fail('MISSING_SOURCE');
      if (seen.has(f.id)) fail('DUPLICATE_COMPONENT'); seen.add(f.id);
      if (!f.writable || !equal(ref(f),ref(change.expected))) fail('VALUE_CONFLICT');
      if (!this.validValue(f.type,change.value)) fail('INVALID_VALUE');
    }
    return changes.map(c => {
      const f = this.fields.get(c.expected.id)!;
      if (!equal(f.value,c.value)) { f.value=copy(c.value); f.revision++; }
      return copy(f);
    });
  }
}
interface Gesture { id: string; clientId:string; before: InputField[]; latest: InputField[]; sequence: number; }
export interface ValueReceipt { id: string; before: InputField[]; after: InputField[]; }
export class LiveGestures {
  private active = new Map<string,Gesture>();
  private completed = new Map<string,ValueReceipt | null>();
  private writers = new Map<string,string>();
  private clients = new Map<string,string>();
  private store: InputValueStore;
  constructor(store: InputValueStore) {this.store=store;}
  begin(id: string, expected: readonly ExpectedField[], clientId=id): void {
    if (this.active.has(id) || this.completed.has(id)) fail('GESTURE_ID_REUSED');
    if (!expected.length || new Set(expected.map(x=>x.id)).size !== expected.length) fail('BAD_GESTURE_COMPONENTS');
    const before=expected.map(e=>this.store.read(e.id));
    before.forEach((f,i)=>{if(!f.writable || !equal(ref(f),ref(expected[i])))fail('VALUE_CONFLICT');});
    if(this.clients.has(clientId))fail('CLIENT_BUSY');
    if(before.some(f=>this.writers.has(f.id)))fail('COMPONENT_BUSY');
    before.forEach(f=>this.writers.set(f.id,id));this.clients.set(clientId,id);
    this.active.set(id,{id,clientId,before,latest:copy(before),sequence:0});
  }
  update(id: string, sequence: number, values: readonly Json[]): void {
    const g=this.active.get(id)??fail('NO_GESTURE');
    if (!Number.isSafeInteger(sequence)||sequence<=g.sequence)fail('OLD_SEQUENCE');
    if(values.length!==g.latest.length)fail('WRONG_COMPONENT_COUNT');
    g.latest=this.store.write(g.latest.map((f,i)=>({expected:ref(f),value:values[i]}))); g.sequence=sequence;
  }
  finish(id: string, cancel=false): ValueReceipt | null {
    if(this.completed.has(id))return copy(this.completed.get(id)!);
    const g=this.active.get(id)??fail('NO_GESTURE');
    if(cancel){this.store.write(g.latest.map((f,i)=>({expected:ref(f),value:g.before[i].value})));this.release(g);this.completed.set(id,null);return null;}
    const receipt=g.before.every((f,i)=>equal(f.value,g.latest[i].value))?null:{id,before:copy(g.before),after:copy(g.latest)};
    this.release(g);this.completed.set(id,receipt);return copy(receipt);
  }
  private release(g:Gesture){this.active.delete(g.id);this.clients.delete(g.clientId);g.before.forEach(f=>this.writers.delete(f.id));}
  disconnect(): ValueReceipt[] { return [...this.active.keys()].map(id=>this.finish(id)).filter((r):r is ValueReceipt=>r!==null); }
}

/** Provider supplies trusted origin/session facts; core never treats a URL as proof of authority. */
export interface AccessPolicy {requireCredential:boolean;credential:string|null;allowedOrigins:readonly string[];allowedActions:readonly string[];maxBytes:number;}
export interface AccessAttempt {origin:string;credential:string|null;action:string;bytes:number;}
export function authorize(policy:AccessPolicy, attempt:AccessAttempt):void{
  if(!Number.isSafeInteger(attempt.bytes)||attempt.bytes<0||attempt.bytes>policy.maxBytes)fail('PAYLOAD_LIMIT');
  if(!policy.allowedOrigins.includes(attempt.origin))fail('ORIGIN_DENIED');
  if(!policy.allowedActions.includes(attempt.action))fail('ACTION_DENIED');
  if(policy.requireCredential&&(!policy.credential||attempt.credential!==policy.credential))fail('CREDENTIAL_DENIED');
}

/** Provider's host-affine event loop invokes drain(); deadlines use its monotonic clock. */
export class OwnerQueue {
  private epoch=0;private stopped=false;
  private waiting:{epoch:number;deadline:number;run:()=>unknown;resolve:(v:unknown)=>void;reject:(e:unknown)=>void}[]=[];
  private capacity:number;
  constructor(capacity:number){if(!Number.isInteger(capacity)||capacity<1)fail('BAD_CAPACITY');this.capacity=capacity;}
  submit<T>(deadline:number,run:()=>T):Promise<T>{
    if(this.stopped)return Promise.reject(new HostFailure('HOST_STOPPED'));
    if(!Number.isFinite(deadline))return Promise.reject(new HostFailure('BAD_DEADLINE'));
    if(this.waiting.length>=this.capacity)return Promise.reject(new HostFailure('HOST_BUSY'));
    return new Promise<T>((resolve,reject)=>this.waiting.push({epoch:this.epoch,deadline,run,resolve:resolve as (v:unknown)=>void,reject}));
  }
  drain(now:number):void{
    const pending=this.waiting;this.waiting=[];
    for(const job of pending){
      if(this.stopped||job.epoch!==this.epoch){job.reject(new HostFailure('HOST_STOPPED'));continue;}
      if(now>=job.deadline){job.reject(new HostFailure('DEADLINE'));continue;}
      try{job.resolve(job.run());}catch(e){job.reject(e);}
    }
  }
  stop(){this.stopped=true;this.epoch++;for(const job of this.waiting)job.reject(new HostFailure('HOST_STOPPED'));this.waiting=[];}
}

/** Native definitions are adapter-neutral records, never native object pointers or live-value snapshots. */
export interface NativeRecord {
  id:string;incarnation:string;kind:'page'|'source'|'control'|'row';owner:'managed'|'external';editable:boolean;
  externalReferences:string[];data:Json;sourceId?:string;pageId?:string;shapeId?:string;sourceKind?:'uniform'|'specialization'|'texture';
  active?:boolean;tombstone?:boolean;
}
export interface NativePatch {id:string;expectedRevision:number;next:NativeRecord|null;}
export interface NativePlan {id:string;epoch:number;patches:NativePatch[];inputGuards:Omit<ExpectedField,'revision'>[];}
export interface NativeReceipt {id:string;before:NativePatch[];after:NativePatch[];inputGuards:Omit<ExpectedField,'revision'>[];}

export class NativeDefinitions {
  private records=new Map<string,NativeRecord>();private versions=new Map<string,number>();
  private plans=new Map<string,{plan:NativePlan;key:string;receipt?:NativeReceipt}>();
  private epoch=1;private sequence=0;private inputs:InputValueStore;private lastGood=new Set<string>();
  constructor(inputs:InputValueStore){this.inputs=inputs;}
  read(id:string){return copy({revision:this.versions.get(id)??0,record:this.records.get(id)??null});}
  all(){return copy([...this.records.values()]);}
  /** Fake provider observation, not an editor mutation API. */
  observe(record:NativeRecord){this.records.set(record.id,copy(record));this.versions.set(record.id,(this.versions.get(record.id)??0)+1);}
  setLastGoodSources(ids:readonly string[]){this.lastGood=new Set(ids);}
  replaceTarget(){this.epoch++;this.records.clear();this.versions.clear();this.plans.clear();this.lastGood.clear();}
  private guards(ids:readonly string[]){return ids.map(id=>{const f=this.inputs.read(id);return{id:f.id,shapeId:f.shapeId,driverId:f.driverId};});}
  private validate(plan:NativePlan):Map<string,NativeRecord>{
    if(plan.epoch!==this.epoch)fail('STALE_NATIVE_TARGET');
    const draft=new Map([...this.records].map(([id,r])=>[id,copy(r)])),seen=new Set<string>();
    for(const patch of plan.patches){
      if(seen.has(patch.id))fail('DUPLICATE_PATCH');seen.add(patch.id);
      if(patch.expectedRevision!==(this.versions.get(patch.id)??0))fail('NATIVE_CONFLICT');
      const old=this.records.get(patch.id);
      if(old?.kind==='page'&&!equal(old,patch.next)&&[...this.records.values()].some(c=>c.kind==='control'&&c.pageId===old.id&&!c.editable))fail('NATIVE_PROTECTED_PAGE');
      if(old&&(old.owner!=='managed'||!old.editable)&&!equal(old,patch.next))fail('NATIVE_PROTECTED');
      if(old&&old.externalReferences.length&&(!patch.next||old.incarnation!==patch.next.incarnation||old.shapeId!==patch.next.shapeId))fail('NATIVE_REFERENCED');
      if(old&&patch.next&&(old.owner!==patch.next.owner||old.editable!==patch.next.editable||!equal(old.externalReferences,patch.next.externalReferences)))fail('AUTHORITY_MUTATION');
      if(patch.next){if(patch.next.id!==patch.id)fail('NATIVE_ID_MISMATCH');draft.set(patch.id,copy(patch.next));}
      else if(old?.kind==='source'&&this.lastGood.has(old.id))draft.set(old.id,{...copy(old),active:false,tombstone:true});
      else draft.delete(patch.id);
    }
    for(const guard of plan.inputGuards){const f=this.inputs.read(guard.id);if(!equal(guard,{id:f.id,shapeId:f.shapeId,driverId:f.driverId}))fail('NATIVE_DRIVER_CONFLICT');}
    const textureControls=new Set<string>();
    for(const row of draft.values()){
      if(row.kind==='control'){
        const source=draft.get(row.sourceId??'')??fail('NATIVE_MISSING_SOURCE'),page=draft.get(row.pageId??'');
        if(source.kind!=='source'||source.tombstone)fail('NATIVE_MISSING_SOURCE');
        if(!page||page.kind!=='page')fail('NATIVE_MISSING_PAGE');
        if(row.shapeId!==source.shapeId)fail('NATIVE_SHAPE_MISMATCH');
        if(source.sourceKind==='texture'){
          if(textureControls.has(source.id))fail('DUPLICATE_TEXTURE_CONTROL');textureControls.add(source.id);
        }
      }
    }
    return draft;
  }
  plan(patches:readonly NativePatch[],inputIds:readonly string[]=[]):NativePlan{
    const plan={id:'native-plan-'+ ++this.sequence,epoch:this.epoch,patches:copy([...patches]),inputGuards:this.guards(inputIds)};
    this.validate(plan);this.plans.set(plan.id,{plan:copy(plan),key:canonical(plan)});return copy(plan);
  }
  ensureControl(sourceId:string,proposed:NativeRecord):{existing:NativeRecord}|{plan:NativePlan}{
    const existing=[...this.records.values()].find(r=>r.kind==='control'&&r.sourceId===sourceId);
    if(existing)return{existing:copy(existing)};
    if(proposed.kind!=='control'||proposed.sourceId!==sourceId)fail('INVALID_PROMOTION');
    return{plan:this.plan([{id:proposed.id,expectedRevision:0,next:proposed}])};
  }
  commit(input:NativePlan):NativeReceipt{
    const entry=this.plans.get(input.id)??fail('UNKNOWN_PLAN');
    if(entry.key!==canonical(input))fail('PLAN_CHANGED');
    if(entry.receipt)return copy(entry.receipt); // Lost reply must not rewrite a later external change.
    const plan=entry.plan,draft=this.validate(plan);
    const before:NativePatch[]=[],after:NativePatch[]=[];
    for(const patch of plan.patches){
      before.push({id:patch.id,expectedRevision:this.read(patch.id).revision,next:this.read(patch.id).record});
      this.versions.set(patch.id,(this.versions.get(patch.id)??0)+1);
      const next=draft.get(patch.id);if(next)this.records.set(patch.id,next);else this.records.delete(patch.id);
      after.push({id:patch.id,expectedRevision:this.read(patch.id).revision,next:this.read(patch.id).record});
    }
    entry.receipt={id:plan.id,before,after,inputGuards:copy(plan.inputGuards)};return copy(entry.receipt);
  }
  restore(receipt:NativeReceipt,direction:'undo'|'redo',expected:readonly NativePatch[]):NativeReceipt{
    const original=this.plans.get(receipt.id);
    if(!original?.receipt||!equal(original.receipt,receipt))fail('NATIVE_RECEIPT');
    const desired=direction==='undo'?receipt.before:receipt.after;
    const patches=desired.map((p,i)=>({id:p.id,expectedRevision:expected[i].expectedRevision,next:copy(p.next)}));
    // Do not recapture changed driver/shape as if it were the original operation's authority.
    const plan:NativePlan={id:'native-plan-'+ ++this.sequence,epoch:this.epoch,patches,inputGuards:copy(receipt.inputGuards)};
    this.validate(plan);this.plans.set(plan.id,{plan:copy(plan),key:canonical(plan)});return this.commit(plan);
  }
}

export class NativeDefinitionHistory {
  private model:NativeDefinitions;private receipt:NativeReceipt;private expected:NativePatch[];private undone=false;
  constructor(model:NativeDefinitions,receipt:NativeReceipt){this.model=model;this.receipt=copy(receipt);this.expected=copy(receipt.after);}
  restore(direction:'undo'|'redo'){
    if((direction==='undo')===this.undone)fail('HISTORY_DIRECTION');
    const applied=this.model.restore(this.receipt,direction,this.expected);this.expected=copy(applied.after);this.undone=!this.undone;
  }
}

/** Review tickets bind the reviewed immutable plan/content to a target revision. They are not permission grants. */
export class ReviewTickets {
  private sequence=0;private tickets=new Map<string,{key:string;used:boolean}>();
  issue(target:TargetIdentity,revision:number,before:Json,after:Json):string{
    const id='review-'+ ++this.sequence;this.tickets.set(id,{key:canonical({target,revision,before,after}),used:false});return id;
  }
  confirm(id:string,target:TargetIdentity,revision:number,before:Json,after:Json):void{
    const ticket=this.tickets.get(id)??fail('UNKNOWN_REVIEW');
    if(ticket.used)fail('REVIEW_USED');
    if(ticket.key!==canonical({target,revision,before,after}))fail('REVIEW_CHANGED');
    ticket.used=true;
  }
}
export class HostValueHistory {
  private store: InputValueStore;
  private receipt: ValueReceipt;
  private expected: InputField[];
  private undone=false;
  private blocked=false;
  constructor(store:InputValueStore, receipt: ValueReceipt){this.store=store;this.receipt=copy(receipt);this.expected=copy(receipt.after);}
  restore(direction:'undo'|'redo'): void {
    if(this.blocked)fail('HISTORY_BLOCKED');
    if((direction==='undo')===this.undone)fail('HISTORY_DIRECTION');
    const target=direction==='undo'?this.receipt.before:this.receipt.after;
    try {this.expected=this.store.write(this.expected.map((f,i)=>({expected:ref(f),value:target[i].value})));this.undone=!this.undone;}
    catch(e){this.blocked=true;throw e;}
  }
}

export type MirrorReport = {epoch:number;schemaId:string;revision:number;kind:'snapshot';values:Record<string,Json>} | {epoch:number;schemaId:string;revision:number;kind:'delta';baseRevision:number;values:Record<string,Json>};
export class InputMirror {
  private epoch: number; private schemaId: string;
  private values:Record<string,Json>={};private revision=-1;
  needsSnapshot=true;
  constructor(epoch:number,schemaId:string){this.epoch=epoch;this.schemaId=schemaId;}
  receive(report:MirrorReport): boolean {
    if(report.epoch!==this.epoch||report.schemaId!==this.schemaId)return false;
    if(report.revision<=this.revision)return false;
    if(report.kind==='delta'&&(this.needsSnapshot||report.baseRevision!==this.revision)){this.needsSnapshot=true;return false;}
    this.values=copy(report.kind==='snapshot'?report.values:{...this.values,...report.values});this.revision=report.revision;this.needsSnapshot=false;return true;
  }
  read(){return copy({values:this.values,revision:this.revision});}
}

export interface ControlDefinition {id:string;sourceId:string;page:string;label:string;style:string;section:boolean;externalReferences:number;definitionEditable:boolean;}
export class ControlLayout {
  private controls:ControlDefinition[]=[];private undo:ControlDefinition[][]=[];private redo:ControlDefinition[][]=[];
  private readonly values:InputValueStore;
  constructor(values:InputValueStore){this.values=values;}
  read(){return copy(this.controls);}
  edit(change:(controls:ControlDefinition[])=>void):void{
    const before=copy(this.controls), draft=copy(before);change(draft);
    const ids=new Set<string>(),sources=new Set<string>();
    for(const c of draft){
      if(ids.has(c.id)||sources.has(c.sourceId))fail('DUPLICATE_CONTROL');ids.add(c.id);sources.add(c.sourceId);
      if(!c.page.trim()||!c.label.trim())fail('INVALID_CONTROL');this.values.read(c.sourceId);
    }
    for(const previous of before){
      const next=draft.find(c=>c.id===previous.id);
      if(!previous.definitionEditable&&!equal(previous,next))fail('PROTECTED_DEFINITION');
      if(!next&&previous.externalReferences)fail('EXTERNAL_REFERENCES');
    }
    if(!equal(before,draft)){this.controls=copy(draft);this.undo.push(before);this.redo=[];}
  }
  restore(direction:'undo'|'redo'):void{
    const from=direction==='undo'?this.undo:this.redo, to=direction==='undo'?this.redo:this.undo;
    const candidate=from.at(-1)??fail('EMPTY_HISTORY');
    // Value state is never part of a layout snapshot; native identity guards remain provider responsibility.
    candidate.forEach(c=>this.values.read(c.sourceId));from.pop();to.push(copy(this.controls));this.controls=copy(candidate);
  }
}

export interface PreviewLease { identity:TargetIdentity;epoch:number; }
export interface PointerMessage { lease:PreviewLease;sequence:number;kind:'down'|'move'|'up';pointerId:number;x:number;y:number; }
export class PreviewSession {
  private lease:PreviewLease|null=null;private generation=0;private sequence=0;private points=new Map<number,{x:number;y:number}>();
  private visible=true;private holds=new Set<string>();
  readonly events:{kind:string;pointerId?:number;dx?:number;dy?:number}[]=[];
  claim(identity:TargetIdentity):PreviewLease{
    const changed=!this.lease||!equal(this.lease.identity,identity);this.release();this.holds.clear();
    this.lease={identity:copy(identity),epoch:++this.generation};this.sequence=0;
    if(changed)this.events.push({kind:'home'});return copy(this.lease);
  }
  receive(message:PointerMessage):void{
    if(!this.visible||!this.lease||!equal(message.lease,this.lease))fail('STALE_PREVIEW');
    if(!Number.isSafeInteger(message.sequence)||message.sequence<=this.sequence)fail('OLD_SEQUENCE');
    if(!Number.isFinite(message.x)||!Number.isFinite(message.y)||message.x<0||message.x>1||message.y<0||message.y>1)fail('INVALID_COORDINATE');
    const old=this.points.get(message.pointerId);
    if(message.kind==='down') {if(old)fail('POINTER_ALREADY_DOWN');this.points.set(message.pointerId,{x:message.x,y:message.y});this.events.push({kind:'down',pointerId:message.pointerId});}
    else {const origin=old??fail('NO_POINTER_ORIGIN');this.events.push({kind:message.kind,pointerId:message.pointerId,dx:message.x-origin.x,dy:message.y-origin.y});if(message.kind==='up')this.points.delete(message.pointerId);else this.points.set(message.pointerId,{x:message.x,y:message.y});}
    this.sequence=message.sequence;
  }
  release(){for(const pointerId of this.points.keys())this.events.push({kind:'release',pointerId});this.points.clear();}
  setVisible(value:boolean){this.visible=value;if(!value)this.release();}
  disconnect(){this.release();this.lease=null;this.generation++;this.holds.clear();}
  hold():()=>void {const token=String(++this.generation);const lease=this.lease;this.holds.add(token);return()=>{if(this.lease===lease)this.holds.delete(token);};}
  isCurrent(lease:PreviewLease):boolean{return !!this.lease&&equal(this.lease,lease);}
  captureAllowed(){return !!this.lease&&this.visible&&!this.holds.size;}
}

/** A target-selection command owns navigation intent; it does not own Graph data or browser origin. */
export interface TargetDraftStore {write(target:TargetIdentity,raw:string):Promise<void>;read(target:TargetIdentity):Promise<string|null>;}
export interface TargetSelectionProviders {
 drafts:TargetDraftStore;
 apply(target:TargetIdentity,snapshot:import('./contracts.ts').Snapshot):Promise<{status:string}>;
 open(target:TargetIdentity):Promise<{identity:TargetIdentity;graph:import('./core.ts').Graph}>;
}
function abortable<T>(promise:Promise<T>,signal?:AbortSignal):Promise<T>{
 if(!signal)return promise;if(signal.aborted)return Promise.reject(new HostFailure('CANCELLED'));
 return new Promise((resolve,reject)=>{const abort=()=>reject(new HostFailure('CANCELLED'));signal.addEventListener('abort',abort,{once:true});promise.then(resolve,reject).finally(()=>signal.removeEventListener('abort',abort));});
}
async function idle(graph:import('./core.ts').Graph,signal?:AbortSignal):Promise<void>{
 if(!graph.busy)return;let unsubscribe=()=>{};try{await abortable(new Promise<void>(resolve=>{unsubscribe=graph.subscribeOperationEnd(()=>{if(!graph.busy)resolve();});}),signal);}finally{unsubscribe();}
}
export class TargetSelection {
 private target:TargetIdentity;private graph:import('./core.ts').Graph;private intent=0;
 constructor(target:TargetIdentity,graph:import('./core.ts').Graph){this.target=copy(target);this.graph=graph;}
 current(){return Object.freeze({identity:copy(this.target),graph:this.graph});}
 async switchTo(target:TargetIdentity,choice:'keep'|'apply'|'cancel',providers:TargetSelectionProviders,signal?:AbortSignal):Promise<'switched'|'cancelled'>{
  target=copy(target);const intent=++this.intent;if(choice==='cancel')return 'cancelled';const old=this.graph,identity=copy(this.target);
  while(old.busy)await idle(old,signal);if(signal?.aborted)fail('CANCELLED');if(intent!==this.intent||old!==this.graph||!equal(identity,this.target))fail('SWITCH_SUPERSEDED');
  const snapshot=old.snapshot(),raw=JSON.stringify(snapshot.document,null,2)+'\n';
  const guard=()=>{if(signal?.aborted)fail('CANCELLED');if(intent!==this.intent||old!==this.graph||!equal(identity,this.target)||old.loadId!==snapshot.loadId||old.revision!==snapshot.revision||old.busy)fail('SWITCH_STALE');};
  if(choice==='keep'){await abortable(providers.drafts.write(identity,raw),signal);guard();if(await abortable(providers.drafts.read(identity),signal)!==raw)fail('DRAFT_NOT_PRESERVED');guard();}
  if(choice==='apply'){const receipt=await abortable(providers.apply(identity,snapshot),signal);guard();if(receipt.status!=='applied')fail('APPLY_NOT_CONFIRMED');}
  const opened=await abortable(providers.open(copy(target)),signal);guard();if(!equal(opened.identity,target))fail('WRONG_INSTANCE');
  this.target=copy(target);this.graph=opened.graph;return 'switched';
 }
}
export interface TargetDocumentView {target:TargetIdentity;mode:'fresh'|'editable'|'readonly';reason:string|null;raw:string|null;document:Json|null;}
const inspectionClaims=new WeakMap<TargetDocumentView,{mode:TargetDocumentView['mode'];target:TargetIdentity;active:boolean}>();
export function invalidateTargetDocument(view:TargetDocumentView):void{const claim=inspectionClaims.get(view);if(claim)claim.active=false;}
/** Classification never mutates the raw record or the active executable. Freshness is explicit host evidence. */
export function inspectTargetDocument(target:TargetIdentity,record:{fresh:boolean;version:string;raw:string|null},supportedVersion:string,parse:(raw:string)=>Json):TargetDocumentView{
 const version=(s:string)=>/^\d+\.\d+\.\d+$/.test(s)?s.split('.').map(Number):null;
 const current=version(record.version),supported=version(supportedVersion);let reason:string|null=null,document:Json|null=null;
 if(!current||!supported)reason='INVALID_VERSION';else {let newer=false;for(let i=0;i<3;i++){if(current[i]!==supported[i]){newer=current[i]>supported[i];break;}}if(newer)reason='FUTURE_VERSION';}
 if(!reason&&record.fresh&&record.raw!==null)reason='FRESH_STATE_CONFLICT';
 if(!reason&&!record.fresh){try{if(record.raw===null||record.raw==='')throw Error('empty');document=copy(parse(record.raw));}catch{reason='CORRUPT_DOCUMENT';}}
 const view:TargetDocumentView=Object.freeze({target:Object.freeze(copy(target)),mode:reason?'readonly':record.fresh?'fresh':'editable',reason,raw:record.raw,document});inspectionClaims.set(view,{mode:view.mode,target:copy(target),active:true});return view;
}
export function publishInspected(view:TargetDocumentView,receiver:FencedArtifactReceiver,delivery:Delivery):Promise<ApplyReceipt>{
 const claim=inspectionClaims.get(view);if(!claim||!claim.active)return Promise.reject(new HostFailure('STALE_INSPECTION'));
 if(claim.mode==='readonly')return Promise.reject(new HostFailure('READ_ONLY_TARGET'));
 if(!equal(claim.target,{hostId:delivery.lease.hostId,targetId:delivery.lease.targetId,incarnation:delivery.lease.incarnation}))return Promise.reject(new HostFailure('WRONG_INSTANCE'));
 return receiver.receive(delivery);
}
export interface CaptureJob {identity:TargetIdentity;ready:Promise<void>;read():Promise<Uint8Array>;dispose():void;}
export interface CaptureProvider {create(identity:TargetIdentity):CaptureJob;}
/** Readback ownership stays on PreviewSession; cancellation never authorizes reading another identity. */
export async function capturePreview(session:PreviewSession,lease:PreviewLease|null,provider:CaptureProvider,signal?:AbortSignal):Promise<Uint8Array>{
 if(!lease)return new Uint8Array();lease=copy(lease);const valid=()=>{if(signal?.aborted)fail('CANCELLED');if(!session.isCurrent(lease))fail('STALE_PREVIEW');};valid();const job=provider.create(copy(lease.identity));
 try{if(!equal(job.identity,lease.identity))fail('WRONG_INSTANCE');await abortable(job.ready,signal);valid();const bytes=await abortable(job.read(),signal);valid();return new Uint8Array(bytes);}finally{job.dispose();}
}
export interface ResourceIdentity {id:string;incarnation:string;}
export interface ResolvedTexture extends ResourceIdentity {kind:string;ownership:'external'|'internal';locator:string;}
export interface TextureResolver {resolve(locator:string):Promise<ResolvedTexture|null>;inspect(identity:ResourceIdentity):ResolvedTexture|null;}
export interface TextureState {target:TargetIdentity;epoch:number;sourceId:string;shapeId:string;driverId:string;revision:number;resource:ResolvedTexture|null;}
export interface TextureReceipt {before:TextureState;after:TextureState;}
export class TextureBinding {
 private state:TextureState;private fallback:ResolvedTexture;private receipts=new Set<string>();
 constructor(state:TextureState,fallback:ResolvedTexture){this.state=copy(state);this.fallback=copy(fallback);}
 snapshot():TextureState{return copy(this.state);}
 rebind(state:TextureState):void{this.state=copy(state);this.receipts.clear();}
 private expected(expected:TextureState):void{if(!equal(expected,this.state))fail('TEXTURE_CONFLICT');}
 private available(value:ResolvedTexture,resolver:TextureResolver):boolean{const current=resolver.inspect(value);return !!current&&current.id===value.id&&current.incarnation===value.incarnation&&current.kind==='texture2d'&&current.ownership===value.ownership;}
 async write(expected:TextureState,locator:string,resolver:TextureResolver):Promise<TextureReceipt>{
  expected=copy(expected);this.expected(expected);if(typeof locator!=='string'||locator.length>2048||/[\u0000-\u001f\u007f]/.test(locator))fail('TEXTURE_LOCATOR');
  const next=locator?await resolver.resolve(locator):null;this.expected(expected);
  if(locator&&(!next||next.kind!=='texture2d'||next.ownership!=='external'||!this.available(next,resolver)))fail('TEXTURE_RESOURCE');
  if(!locator&&!this.available(this.fallback,resolver))fail('FALLBACK_UNAVAILABLE');
  const before=this.snapshot();this.state={...this.state,resource:copy(next),revision:this.state.revision+1};const nextReceipt={before,after:this.snapshot()};this.receipts.add(canonical(nextReceipt));return nextReceipt;
 }
 effective(resolver:TextureResolver):{resource:ResolvedTexture;invalid:boolean}{const current=this.state.resource;if(current&&this.available(current,resolver))return{resource:copy(current),invalid:false};if(!this.available(this.fallback,resolver))fail('FALLBACK_UNAVAILABLE');return{resource:copy(this.fallback),invalid:current!==null};}
 undo(receipt:TextureReceipt,resolver:TextureResolver):TextureReceipt{
  if(!this.receipts.has(canonical(receipt)))fail('TEXTURE_RECEIPT');this.expected(receipt.after);for(const value of [receipt.before.resource,receipt.after.resource])if(value&&!this.available(value,resolver))fail('RESOURCE_IDENTITY_CHANGED');if(!receipt.before.resource&&!this.available(this.fallback,resolver))fail('FALLBACK_UNAVAILABLE');const before=this.snapshot();this.state={...this.state,resource:copy(receipt.before.resource),revision:this.state.revision+1};const nextReceipt={before,after:this.snapshot()};this.receipts.add(canonical(nextReceipt));return nextReceipt;
 }
}
