/** Minimal editable Panel contribution. NOT THE PRODUCTION IMPLEMENTATION.
 * Only public Panel/view contracts: no Graph, History, operation or workspace imports at runtime. */
import type { PanelType, PanelUpdate } from '../../executable-reference/repair/public-panel-workspace.ts';
import type { PanelViewContribution } from '../../contracts/view-mount.ts';
import type { PanelGestureCommands } from '../../contracts/panel-commands.ts';
import type { Json } from '../../contracts/public-surface.ts';
import { controls } from '../view-contributions/headless-controls.ts';

export const editablePanelType: PanelType = {
  typeId: 'example.position-panel', viewStateVersion: 1,
  commandIds: ['grape.editor.move-target'],
  create: ({ id }) => {
    let latest: PanelUpdate | undefined;
    const listeners = new Set<() => void>();
    const view: PanelViewContribution<PanelUpdate | null> = {
      kind: 'panel', capture: () => latest ?? null,
      subscribe: fn => { listeners.add(fn); return () => listeners.delete(fn); },
      dispose: () => listeners.clear(),
      mount: context => {
        const ui = controls(context); let gesture: PanelGestureCommands | undefined;
        const command = () => { if (!context.commands) throw Error('PANEL_READ_ONLY'); return context.commands; };
        const lease = () => { if (!latest) throw Error('PANEL_NO_TARGET'); return latest.lease; };
        const on = (name: string, callback: (args: Json) => void) => context.scope.own(ui.on(name, context.scope.event(callback)));
        on('execute', args => command().execute(lease(), { commandId: 'grape.editor.move-target', args }));
        on('begin', args => { gesture = command().beginGesture(lease(), { commandId: 'grape.editor.move-target', args }); });
        on('update', args => { if (!gesture) throw Error('NO_GESTURE'); gesture.update(lease(), args); });
        on('commit', () => { if (!gesture) throw Error('NO_GESTURE'); gesture.commit(lease()); gesture = undefined; });
        on('cancel', () => { gesture?.cancel(); gesture = undefined; });
        return { update: projection => ui.paint({ target: projection?.target.status === 'resolved' ? projection.target.ref.object?.id ?? null : null, editable: Boolean(context.commands) }) };
      },
    };
    return {
      id, typeId: 'example.position-panel',
      restoreViewState: state => ({ restored: state !== null && typeof state === 'object' && !Array.isArray(state) && Object.keys(state).length === 0 }),
      exportViewState: () => ({}), receive: update => { latest = update; for (const fn of [...listeners]) fn(); },
      setVisible() {}, canClose: () => ({ allowed: true }), dispose: () => { latest = undefined; listeners.clear(); },
      createView: () => view,
    };
  },
};
