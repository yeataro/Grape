/** A toggle is an event-driven control, not a string/number projection convention. */
import type { ParameterWidgetViewType } from '../../contracts/view-mount.ts';
import type { ParameterView } from '../../executable-reference/qualification-presentation.ts';
import { controls,label } from './headless-controls.ts';
export const toggleWidget:ParameterWidgetViewType<ParameterView>={widgetId:'core.boolean',create:({binding})=>{
  return {kind:'parameter-widget',capture:()=>binding.capture(),subscribe:fn=>binding.subscribe(fn),dispose(){},
    mount:ctx=>{const view=controls(ctx);let token='',checked=false;
      ctx.scope.own(view.on('toggle',ctx.scope.event(()=>ctx.commands.commit(!checked,token))));
      return {update:(snapshot,frame)=>{token=snapshot.editToken;checked=snapshot.projection.field.value===true;view.paint({title:frame.text(label('toggle.title','Enabled')),checked,writable:snapshot.writable});}};
    },
  };
}};
