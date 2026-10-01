/** IH-004 executable architecture specification. NOT THE PRODUCTION IMPLEMENTATION. */
import type { LocalizationService } from '../../contracts/localization.ts';
import type { MountContext, MountedView, MountScope, MountSurface, MountTicket, PanelViewContribution, ParameterWidgetViewContribution, ParameterWidgetViewType, ViewFrame, ViewIssue, ViewStatus, WidgetCommands, WidgetDraft, WidgetReadBinding } from '../../contracts/view-mount.ts';
import type { ParameterView } from '../qualification-presentation.ts';
import type { Json, Result } from '../contracts.ts';
import { PanelWorkspace, type Panel } from './public-panel-workspace.ts';
import { ScopedFieldDraft, ScopedParameterTarget, ScopedParameterWidgets } from './scoped-parameter.ts';
import type { PanelCommandMountAuthority, PanelCommands } from '../../contracts/panel-commands.ts';
const unwrap = <T>(r: Result<T>): T => { if (!r.ok) throw Error(r.error.code); return r.value; };
const copy = <T>(v:T):T => { const c=structuredClone(v); const freeze=(x:unknown):void=>{if(x&&typeof x==='object'){Object.values(x).forEach(freeze);Object.freeze(x);}};freeze(c);return c; };
let nextMount = 0;
type AnyContribution = PanelViewContribution | ParameterWidgetViewContribution;

/** Shared lifecycle only. Neither projections nor concrete feature classes are interpreted here. */
export class ViewSession {
  readonly issues: ViewIssue[] = [];
  #contribution: AnyContribution; #locale: LocalizationService; #mount?: MountedView; #scope?: MountScope;
  #cleanup: (()=>void)[]=[]; #offs:(()=>void)[]=[]; #status:ViewStatus='unmounted'; #revision=0; #mountId=0;
  #surface?:MountSurface; #rendering=false; #eventDepth=0; #refreshing=false; #pending=false;
  #commands?:WidgetCommands;
  #panelCommands?: (mount: PanelCommandMountAuthority) => PanelCommands | undefined;
  constructor(contribution: AnyContribution, locale: LocalizationService, commands?:WidgetCommands, panelCommands?: (mount: PanelCommandMountAuthority) => PanelCommands | undefined) {
    this.#contribution=contribution;this.#locale=locale;this.#commands=commands;
    this.#panelCommands=panelCommands;
    try { this.#offs.push(contribution.subscribe(()=>this.refresh()));this.#offs.push(locale.subscribe(()=>this.refresh())); }
    catch(e){for(const off of this.#offs.splice(0))this.#cleanupOne(off);this.#cleanupOne(()=>contribution.dispose());throw e;}
  }
  get status():ViewStatus{return this.#status;}
  get revision():number{return this.#revision;}
  #issue(phase:string,e:unknown):void{this.issues.push({phase,message:String(e)});}
  #cleanupOne(fn:()=>void):void{try{fn();}catch(e){this.#issue('cleanup',e);}}
  #revoke():void { this.#revision++;this.#mountId=0;this.#scope=undefined;this.#mount=undefined;for(const fn of this.#cleanup.splice(0).reverse())this.#cleanupOne(fn); }
  #fail(phase:string,e:unknown):void{this.#issue(phase,e);this.#revoke();if(this.#status!=='disposed')this.#status='placeholder';}
  #guard():void{if(this.#status!=='mounted'||!this.#mountId||this.#rendering||!this.#eventDepth)throw Error('VIEW_EDIT_AUTHORITY');}
  #guardedCommands():WidgetCommands {
    const c=this.#commands;if(!c)throw Error('WIDGET_COMMANDS_MISSING');
    return {commit:(v,t)=>{this.#guard();c.commit(v,t);},draft:()=>{this.#guard();const d=c.draft();return {
      get text(){return d.text;},setText:t=>{this.#guard();d.setText(t);},composition:a=>{this.#guard();d.composition(a);},
      commit:p=>{this.#guard();d.commit(p);},cancel:()=>{d.cancel();},
    };}};
  }
  mount(surface:MountSurface):void {
    if(this.#status==='disposed')throw Error('VIEW_DISPOSED');
    this.unmount();this.#surface=surface;const id=++nextMount;this.#mountId=id;this.#status='mounted';
    const live=()=>this.#status==='mounted'&&this.#mountId===id;
    const scope:MountScope={
      own:fn=>{if(live())this.#cleanup.push(fn);else this.#cleanupOne(fn);},
      ticket:()=>Object.freeze({mount:id,revision:this.#revision}),
      accept:(t,fn)=>{if(!live()||t.mount!==id||t.revision!==this.#revision||this.#rendering)return false;try{fn();return true;}catch(e){this.#fail('async-reply',e);return false;}},
      event:fn=>(...args)=>{if(!live()||this.#rendering)return;this.#eventDepth++;try{fn(...args);}catch(e){this.#issue('event',e);}finally{this.#eventDepth--;}}
    };this.#scope=scope;
    try {
      this.#rendering=true;
      const ctx:MountContext={surface,scope};
      const mounted=this.#contribution.kind==='panel'?this.#contribution.mount({...ctx,commands:this.#panelCommands?.({assertEvent:()=>{if(!live())throw Error('VIEW_EDIT_AUTHORITY');this.#guard();},own:scope.own})}):this.#contribution.mount({...ctx,commands:this.#guardedCommands()});
      if(!live()){if(mounted.unmount)this.#cleanupOne(()=>mounted.unmount!());return;}
      this.#mount=mounted;if(mounted.unmount)scope.own(()=>mounted.unmount!());
    }catch(e){this.#fail('mount',e);}finally{this.#rendering=false;}
    if(this.#status==='mounted')this.refresh();
  }
  refresh():void {
    if(this.#status==='disposed')return;
    this.#revision++; // Also revoke work while hidden/unmounted; no catch-up replay.
    if(this.#status!=='mounted')return;
    if(this.#refreshing||this.#rendering){this.#fail('invalidation',Error('VIEW_RENDER_REENTRANCY'));return;}
    this.#refreshing=true;
    try{do{this.#pending=false;this.#rendering=true;try{
      const projection=copy(this.#contribution.capture());
      const frame:ViewFrame=Object.freeze({revision:this.#revision,locale:this.#locale.locale,text:(r:Parameters<LocalizationService['resolve']>[0])=>this.#locale.resolve(r).text});
      this.#mount!.update(projection,frame);
    }catch(e){this.#fail('update',e);}finally{this.#rendering=false;}}while(this.#pending&&this.#status==='mounted');}
    finally{this.#refreshing=false;}
  }
  unmount():void{if(this.#status==='disposed')return;this.#revoke();this.#status='unmounted';}
  retry():void{if(this.#status!=='placeholder'||!this.#surface)throw Error('VIEW_NOT_RETRYABLE');this.mount(this.#surface);}
  dispose():void{if(this.#status==='disposed')return;this.#revoke();this.#status='disposed';for(const off of this.#offs.splice(0))this.#cleanupOne(off);this.#cleanupOne(()=>this.#contribution.dispose());}
}

/** Normal shell wiring. Only public workspace placement, lifecycle, and Panel.createView are used. */
export class PanelRenderer {
  #workspace:PanelWorkspace;#locale:LocalizationService;#surface:(panelId:string,paneId:string)=>MountSurface;
  #entries=new Map<string,{panel:Panel;session?:ViewSession;paneId:string;visible:boolean;error?:string}>();#offs:(()=>void)[]=[];#disposed=false;
  constructor(workspace:PanelWorkspace,locale:LocalizationService,surface:(panelId:string,paneId:string)=>MountSurface){
    this.#workspace=workspace;this.#locale=locale;this.#surface=surface;
    this.#offs=[workspace.beforePanelDispose(panel=>this.#retire(panel.id,panel)),workspace.subscribe(()=>this.#sync())];this.#sync();
  }
  #retire(id:string,panel?:Panel):void{const e=this.#entries.get(id);if(e&&(!panel||e.panel===panel)){e.session?.dispose();this.#entries.delete(id);}}
  #sync():void{
    if(this.#disposed)return;
    const records=this.#workspace.panels(),panes=this.#workspace.panes();const live=new Set(records.map(p=>p.id));
    for(const id of this.#entries.keys())if(!live.has(id))this.#retire(id);
    for(const p of records){const panel=this.#workspace.panel(p.id)!;let e=this.#entries.get(p.id);
      if(e&&e.panel!==panel){this.#retire(p.id);e=undefined;}
      if(!e){e={panel,paneId:p.paneId,visible:false};this.#entries.set(p.id,e);try{if(!panel.createView)throw Error('PANEL_VIEW_UNAVAILABLE');e.session=new ViewSession(panel.createView(),this.#locale,undefined,mount=>this.#workspace.bindPanelCommands(p.id,mount));}catch(error){e.error=String(error);}}
      const visible=!p.hidden&&panes.find(x=>x.id===p.paneId)?.activeTab===p.id;
      if(e.session){if(!visible){if(e.visible)e.session.unmount();}else if(!e.visible||e.paneId!==p.paneId){this.#mountEntry(p.id,p.paneId,e);}}
      e.visible=visible;e.paneId=p.paneId;
    }
  }
  #mountEntry(id:string,paneId:string,e:{session?:ViewSession;error?:string}):void{
    e.session!.unmount();delete e.error;
    try{e.session!.mount(this.#surface(id,paneId));}catch(error){e.error=String(error);}
  }
  status(id:string):ViewStatus|undefined{const e=this.#entries.get(id);return e?.error?'placeholder':e?.session?.status;}
  issues(id:string):readonly ViewIssue[]{const e=this.#entries.get(id);return e?.error?[{phase:'create-view',message:e.error}]:e?.session?.issues??[];}
  retry(id:string):void{const e=this.#entries.get(id);if(!e)throw Error('PANEL_VIEW_MISSING');if(!e.visible)throw Error('VIEW_NOT_VISIBLE');if(e.error){if(e.session)this.#mountEntry(id,e.paneId,e);else{this.#retire(id);this.#sync();}}else e.session!.retry();}
  /** Detach shell resources without closing application Panels. */
  dispose():void{if(this.#disposed)return;this.#disposed=true;this.#offs.forEach(off=>off());for(const id of [...this.#entries.keys()])this.#retire(id);}
}

/** Widget shell slot captures factory/unavailable errors as an explicit retryable placeholder. */
export class WidgetViewSlot {
  #factory:()=>ViewSession;#session?:ViewSession;#surface?:MountSurface;#error?:string;#disposed=false;#visible=false;
  constructor(factory:()=>ViewSession){this.#factory=factory;this.#create();}
  #create():void{try{this.#session=this.#factory();this.#error=undefined;}catch(e){this.#error=String(e);}}
  get status():ViewStatus{return this.#disposed?'disposed':this.#error?'placeholder':this.#session?.status??'unmounted';}
  get issues():readonly ViewIssue[]{return this.#error?[{phase:'create-widget-view',message:this.#error}]:this.#session?.issues??[];}
  mount(surface:MountSurface):void{if(this.#disposed)throw Error('VIEW_DISPOSED');this.#visible=true;this.#surface=surface;if(this.#session)this.#session.mount(surface);}
  unmount():void{this.#visible=false;this.#session?.unmount();}
  refresh():void{this.#session?.refresh();}
  retry():void{if(this.#disposed||!this.#visible||!this.#surface)throw Error('VIEW_NOT_VISIBLE');if(this.#error){this.#create();if(this.#session)this.#session.mount(this.#surface);}else this.#session!.retry();}
  dispose():void{if(this.#disposed)return;this.#disposed=true;this.#session?.dispose();}
}

/** Feature widget identity registry; no built-in kind switch. Read/write stay on the same scoped target. */
export class WidgetRenderer {
  #types=new Map<string,ParameterWidgetViewType<ParameterView>>();#locale:LocalizationService;#projections:ScopedParameterWidgets;
  constructor(locale:LocalizationService,projections=new ScopedParameterWidgets()){this.#locale=locale;this.#projections=projections;}
  register(type:ParameterWidgetViewType<ParameterView>):void{if(!type.widgetId||this.#types.has(type.widgetId))throw Error('WIDGET_VIEW_DUPLICATE');this.#types.set(type.widgetId,Object.freeze({...type}));}
  open(widgetId:string,target:ScopedParameterTarget):WidgetViewSlot {return new WidgetViewSlot(()=>this.#create(widgetId,target));}
  #create(widgetId:string,target:ScopedParameterTarget):ViewSession {
    const initial=this.#projections.projectTarget(target,{widget:widgetId});
    const selected=initial.widget,type=this.#types.get(selected);if(!type)throw Error('WIDGET_VIEW_MISSING');
    const binding:WidgetReadBinding<ParameterView>={capture:()=>{const snap=target.capture();const projection=this.#projections.projectTarget(target,{widget:widgetId});if(projection.widget!==selected)throw Error('WIDGET_VIEW_CHANGED');return {projection,editToken:snap.editToken,writable:projection.writable};},subscribe:fn=>target.subscribe(()=>fn())};
    const commands:WidgetCommands={commit:(value,token)=>{unwrap(target.commit(value,token));},draft:()=>{
      const d=new ScopedFieldDraft(target);return {get text(){return d.text;},setText:t=>{unwrap(d.setText(t));},composition:a=>d.composition(a),commit:p=>{unwrap(d.commit(p));},cancel:()=>d.cancel()};
    }};
    return new ViewSession(type.create({binding}),this.#locale,commands);
  }
}
