/** Draft lifetime belongs to this field contribution, independent of mount lifetime. */
import type { ParameterWidgetViewType, WidgetDraft } from '../../contracts/view-mount.ts';
import type { ParameterView } from '../../executable-reference/qualification-presentation.ts';
import { controls,label } from './headless-controls.ts';
export const numberWidget:ParameterWidgetViewType<ParameterView>={widgetId:'core.number',create:({binding})=>{
  let draft:WidgetDraft|null=null;const local=new Set<()=>void>();const changed=()=>{for(const fn of local)fn();};
  return {kind:'parameter-widget',capture:()=>binding.capture(),subscribe:fn=>{local.add(fn);const off=binding.subscribe(fn);return()=>{local.delete(fn);off();};},dispose(){draft=null;local.clear();},
    mount:ctx=>{const view=controls(ctx);
      ctx.scope.own(view.on('input',ctx.scope.event(value=>{draft??=ctx.commands.draft();draft.setText(String(value));changed();})));
      ctx.scope.own(view.on('commit',ctx.scope.event(()=>{if(draft){draft.commit(text=>{const n=Number(text);if(!Number.isFinite(n))throw Error('NUMBER_REQUIRED');return n;});draft=null;changed();}})));
      ctx.scope.own(view.on('cancel',ctx.scope.event(()=>{draft?.cancel();draft=null;changed();})));
      return {update:(snapshot,frame)=>view.paint({title:frame.text(label('number.title','Value')),text:draft?.text??String(snapshot.projection.field.value),writable:snapshot.writable})};
    },
  };
}};
