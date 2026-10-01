/** Selection Summary feature: renderer never imports or checks this class. */
import type { Panel, PanelType, PanelUpdate } from '../../executable-reference/repair/public-panel-workspace.ts';
import type { PanelViewContribution } from '../../contracts/view-mount.ts';
import type { Json } from '../../contracts/public-surface.ts';
import { controls,label } from './headless-controls.ts';
class SelectionSummary implements Panel {
  readonly typeId='example.selection-summary';readonly id:string;
  #update:PanelUpdate|null=null;#listeners=new Set<()=>void>();
  constructor(id:string){this.id=id;}
  restoreViewState(state:Json){return {restored:!!state&&typeof state==='object'&&!Array.isArray(state)&&Object.keys(state).length===0,reason:'SELECTION_STATE'};} exportViewState(){return {};}
  receive(update:PanelUpdate){this.#update=update;for(const fn of this.#listeners)fn();}
  setVisible(){} canClose(){return {allowed:true};} dispose(){this.#listeners.clear();}
  createView():PanelViewContribution {
    return {kind:'panel',capture:()=>({ids:this.#update?.target.status==='resolved'?this.#update.target.selection.map(x=>x.id):[]}),
      subscribe:fn=>{this.#listeners.add(fn);return()=>this.#listeners.delete(fn);},dispose(){},
      mount:ctx=>{const view=controls(ctx);return {update:(projection,frame)=>view.paint({title:frame.text(label('selection.title','Selection Summary')),selection:(projection as {ids:string[]}).ids})};},
    };
  }
}
export const selectionSummary:PanelType={typeId:'example.selection-summary',viewStateVersion:1,create:({id})=>new SelectionSummary(id)};
