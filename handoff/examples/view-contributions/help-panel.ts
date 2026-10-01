/** Help feature owns expanded state; state never resides in renderer or Graph. */
import type { Panel, PanelType, PanelUpdate } from '../../executable-reference/repair/public-panel-workspace.ts';
import type { PanelViewContribution } from '../../contracts/view-mount.ts';
import type { Json } from '../../contracts/public-surface.ts';
import { controls,label } from './headless-controls.ts';
class HelpPanel implements Panel {
  readonly typeId='example.help';readonly id:string;#expanded=true;#target:string|null=null;#listeners=new Set<()=>void>();
  constructor(id:string){this.id=id;}
  #changed(){for(const fn of this.#listeners)fn();}
  restoreViewState(state:Json){
    if(!state||typeof state!=='object'||Array.isArray(state))return {restored:false,reason:'HELP_STATE'};
    const keys=Object.keys(state);if(keys.length===0)return {restored:true};
    if(keys.length!==1||keys[0]!=='expanded'||typeof state.expanded!=='boolean')return {restored:false,reason:'HELP_STATE'};
    this.#expanded=state.expanded;return {restored:true};
  }
  exportViewState(){return {expanded:this.#expanded};}
  receive(update:PanelUpdate){this.#target=update.target.status==='resolved'?update.target.ref.object?.id??null:null;this.#changed();}
  setVisible(){} canClose(){return {allowed:true};} dispose(){this.#listeners.clear();}
  createView():PanelViewContribution {return {kind:'panel',capture:()=>({expanded:this.#expanded,target:this.#target}),
    subscribe:fn=>{this.#listeners.add(fn);return()=>this.#listeners.delete(fn);},dispose(){},
    mount:ctx=>{const view=controls(ctx);ctx.scope.own(view.on('expand',ctx.scope.event(()=>{this.#expanded=!this.#expanded;this.#changed();})));
      return {update:(projection,frame)=>view.paint({title:frame.text(label('help.title','Help')),...projection as {expanded:boolean;target:string|null}})};
    },
  };}
}
export const helpPanel:PanelType={typeId:'example.help',viewStateVersion:1,create:({id})=>new HelpPanel(id)};
