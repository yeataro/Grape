/** Qualification-only UI technology protocol. A production renderer chooses DOM/React/etc instead. */
import type { MountContext } from '../../contracts/view-mount.ts';
import type { Json } from '../../contracts/public-surface.ts';
export interface HeadlessControls {
  open(): { paint(value:Json):void; on(name:string,callback:(value:Json)=>void):()=>void; dispose():void };
}
export function controls(context:MountContext){
  if(context.surface.protocol!=='qualification.controls.v1')throw Error('UNSUPPORTED_VIEW_SURFACE');
  const target=context.surface.target as HeadlessControls;
  if(!target||typeof target.open!=='function')throw Error('INVALID_VIEW_SURFACE');
  const view=target.open();context.scope.own(()=>view.dispose());return view;
}
export const textOwner={moduleId:'example.views',namespace:'example.views',version:'1',fingerprint:'sample-only',catalogVersion:1} as const;
export const label=(key:string,fallback:string)=>({owner:textOwner,key,fallback});
