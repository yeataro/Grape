import type { Json, Snapshot, ParameterPresentation, ParameterSpec } from './contracts.ts';
import type { EditorContext } from './core.ts';
import { canonical } from './core.ts';
import {TypeEnvironment} from './qualification-compute.ts';
import type {DataType} from './qualification-compute.ts';

export interface ParameterProjection {
  nodeId:string;key:string;target:ParameterSpec['target'];value:Json;hasValue:boolean;
  dataType:DataType|null;semantic:string|null;connected:boolean;writable:boolean;
  presentation:ParameterPresentation;min:number|null;max:number|null;clamp:boolean;
}
export interface ParameterWidget {
  id:string;
  accepts(field:Readonly<ParameterProjection>):boolean;
  project(field:Readonly<ParameterProjection>):Json;
}
export interface ParameterView {
  requestedWidget:string;widget:string;fallback:boolean;writable:boolean;field:ParameterProjection;body:Json;notice:string|null;
}
const frozenCopy=<T>(v:T):T=>{
  const result=structuredClone(v);const freeze=(x:any):void=>{if(x&&typeof x==='object'){Object.values(x).forEach(freeze);Object.freeze(x);}};
  freeze(result);return result;
};
/** Parameter widgets receive descriptions only. They neither own values nor bypass Parameter.write. */
export class ParameterWidgets {
  #widgets=new Map<string,ParameterWidget>();
  constructor(){
    const valueBody=(f:Readonly<ParameterProjection>):Json=>({value:f.value,options:f.presentation.options??{}});
    this.register({id:'core.number',accepts:f=>f.dataType?f.dataType.kind==='scalar'&&f.dataType.scalar!=='bool':typeof f.value==='number',project:valueBody});
    this.register({id:'core.boolean',accepts:f=>f.dataType?f.dataType.kind==='scalar'&&f.dataType.scalar==='bool':typeof f.value==='boolean',project:valueBody});
    this.register({id:'core.text',accepts:f=>!f.dataType&&typeof f.value==='string',project:valueBody});
    this.register({id:'core.menu',accepts:f=>['number','string','boolean'].includes(typeof f.value),project:valueBody});
    this.register({id:'core.components',accepts:f=>f.dataType?.kind==='vector',project:valueBody});
    this.register({id:'core.color',accepts:f=>f.dataType?.kind==='vector'&&['float','double'].includes(f.dataType.scalar)&&[3,4].includes(f.dataType.width),project:valueBody});
    this.register({id:'core.matrix',accepts:f=>f.dataType?.kind==='matrix',project:f=>({value:f.value,type:f.dataType as unknown as Json,major:'column'})});
    this.register({id:'core.readonly',accepts:()=>true,project:valueBody});
  }
  register(widget:ParameterWidget):void {
    if(!widget.id.trim()||this.#widgets.has(widget.id))throw Error('DUPLICATE_PARAMETER_WIDGET');
    this.#widgets.set(widget.id,Object.freeze({...widget}));
  }
  project(context:EditorContext,nodeId:string,key:string,override?:ParameterPresentation):ParameterView {
    if(context.disposed)throw Error('CONTEXT_CLOSED');
    const node=context.graph.nodeById(nodeId);if(!node)throw Error('MISSING_NODE');
    const parameter=node.parameter(key),spec=parameter.spec,snapshot=context.graph.snapshot();
    const requested=override??(typeof spec.presentation==='string'?{widget:'core.'+spec.presentation}:spec.presentation);
    canonical(requested);
    if(!requested||typeof requested.widget!=='string'||!requested.widget.trim()||requested.fallback!==undefined&&!['auto','none'].includes(requested.fallback))throw Error('PARAMETER_PRESENTATION');
    const port=spec.target.kind==='input'?node.record.ports.find(p=>p.direction==='input'&&p.key===spec.target.key):undefined;
    if(spec.target.kind==='input'&&!port)throw Error('MISSING_PORT');
    const dataType=port?new TypeEnvironment(snapshot.document.resources).resolve(port.type):null;
    const connected=!!port&&snapshot.document.stages.some(s=>s.edges.some(e=>!e.invalid&&e.to.nodeId===nodeId&&e.to.key===port.key));
    const value=parameter.read(),hasValue=value!==undefined;
    const field:ParameterProjection={nodeId,key,target:structuredClone(spec.target),value:hasValue?structuredClone(value) as Json:null,hasValue,dataType,semantic:port?.semantic??null,connected,writable:hasValue&&!connected&&dataType?.kind!=='resource',presentation:structuredClone(requested),min:spec.min??null,max:spec.max??null,clamp:!!spec.clamp};
    canonical(field);const input=frozenCopy(field);
    const fallback=()=>{
      if(!field.writable||requested.fallback==='none')return'core.readonly';
      for(const name of ['core.matrix','core.components','core.boolean','core.number','core.text'])if(this.#widgets.get(name)!.accepts(input))return name;
      return'core.readonly';
    };
    let selected=requested.widget,notice:string|null=null,body:Json;
    try{const widget=this.#widgets.get(selected);if(!widget||!widget.accepts(input)){selected=fallback();notice='Requested presentation unavailable or incompatible';}body=this.#widgets.get(selected)!.project(input);canonical(body);}
    catch(error){selected=fallback();notice='Widget failed: '+String(error);body=this.#widgets.get(selected)!.project(input);canonical(body);}
    return structuredClone({requestedWidget:requested.widget,widget:selected,fallback:selected!==requested.widget,writable:field.writable&&selected!=='core.readonly',field,body,notice});
  }
}

export interface DisplayServices {
  translate(key: string, locale: string): string;
  measure(text: string, font: string): number;
}
export interface ViewDescriptor { id: string; text: string; enabled: boolean; style: Record<string,string|number>; }
export interface WidgetDefinition {
  id: string;
  project(input: Readonly<{snapshot:Snapshot;primary:string|null;locale:string;preferences:Json}>,services:DisplayServices):ViewDescriptor;
}
/** UI modules project immutable model data; renderer can be DOM or desktop webview. */
export class WidgetRegistry {
  #definitions=new Map<string,WidgetDefinition>();
  register(definition:WidgetDefinition):void {
    if(!definition.id||this.#definitions.has(definition.id))throw Error('DUPLICATE_WIDGET');
    this.#definitions.set(definition.id,Object.freeze({...definition}));
  }
  project(id:string,context:EditorContext,locale:string,preferences:Json,services:DisplayServices):ViewDescriptor {
    if(context.disposed)throw Error('CONTEXT_CLOSED');
    const definition=this.#definitions.get(id);
    if(!definition)return {id,text:`Missing widget: ${id}`,enabled:false,style:{}};
    const descriptor=definition.project(Object.freeze({snapshot:context.graph.snapshot(),primary:context.selection.primary,locale,preferences:structuredClone(preferences)}),services);
    canonical(descriptor);return structuredClone(descriptor);
  }
}
export class Preferences {
  #value:Record<string,Json>={};
  readonly #validate:(proposal:Readonly<Record<string,Json>>)=>void;
  #listeners=new Set<()=>void>();
  readonly observerErrors:string[]=[];
  constructor(validate:(proposal:Readonly<Record<string,Json>>)=>void){this.#validate=validate;}
  snapshot(){return structuredClone(this.#value);}
  update(patch:Record<string,Json>):void {
    const candidate={...this.#value,...structuredClone(patch)};canonical(candidate);
    this.#validate(structuredClone(candidate));this.#value=candidate;
    for(const fn of [...this.#listeners])try{fn();}catch(e){this.observerErrors.push(String(e));}
  }
  subscribe(fn:()=>void):()=>void{this.#listeners.add(fn);return()=>this.#listeners.delete(fn);}
  serialize():string{return JSON.stringify(this.#value);}
  restore(text:string):void {const candidate=JSON.parse(text);if(!candidate||typeof candidate!=='object'||Array.isArray(candidate))throw Error('PREFERENCE_FORMAT');canonical(candidate);this.#validate(structuredClone(candidate));this.#value=structuredClone(candidate);for(const fn of [...this.#listeners])try{fn();}catch(e){this.observerErrors.push(String(e));}}
}
export interface ActionContext { context:EditorContext; readonly:boolean; ime:boolean; textFocus:boolean; }
export interface Action {
  id:string; allowTextFocus?:boolean;
  enabled(input:ActionContext):boolean;
  invoke(input:ActionContext):void;
}
export class Actions {
  #actions=new Map<string,Action>();
  register(action:Action):void{if(this.#actions.has(action.id))throw Error('DUPLICATE_ACTION');this.#actions.set(action.id,Object.freeze({...action}));}
  run(id:string,input:ActionContext):'executed'|'blocked' {
    const action=this.#actions.get(id);if(!action)throw Error('MISSING_ACTION');
    if(input.context.disposed||input.readonly||input.ime||input.context.graph.busy||input.textFocus&&!action.allowTextFocus||!action.enabled(input))return 'blocked';
    action.invoke(input);return 'executed';
  }
}
