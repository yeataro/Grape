/** Canonical ordinary Panel contribution. NOT THE PRODUCTION IMPLEMENTATION.
 * Uses the same public Workspace registry, routing, restore and lifecycle as all Panel types.
 */
import type { Json } from '../../executable-reference/contracts.ts';
import type { Panel, PanelType, PanelUpdate, PanelServices, RestoreResolver, TargetLease } from '../../executable-reference/repair/public-panel-workspace.ts';

export class SelectionSummaryPanel implements Panel {
  readonly typeId = 'handoff.selection-summary';
  readonly id: string;
  #prefix = 'Selection';
  #disposed = false;
  #visible = true;
  #services: PanelServices;
  #update: PanelUpdate | null = null;
  constructor(id: string, services: PanelServices) { this.id = id; this.#services = services; }
  restoreViewState(state: Json, _resolver: RestoreResolver): { restored: boolean; reason?: string } {
    if (!state || typeof state !== 'object' || Array.isArray(state) || Object.keys(state).length !== 1 || typeof state.prefix !== 'string' || state.prefix.length > 80)
      return { restored: false, reason: 'PANEL_STATE_INVALID' };
    this.#prefix = state.prefix; return { restored: true };
  }
  exportViewState(): Json { return { prefix: this.#prefix }; }
  receive(update: Readonly<PanelUpdate>): void {
    if (this.#disposed) throw Error('PANEL_CLOSED');
    this.#update = update;
  }
  project(): { title: string; primary: string | null; count: number; missing: boolean; visible: boolean } {
    if (this.#disposed) throw Error('PANEL_CLOSED');
    const target = this.#update?.target;
    return { title: this.#prefix, primary: target?.status === 'resolved' ? target.ref.object?.id ?? null : null,
      count: target?.status === 'resolved' ? target.selection.length : 0,
      missing: target?.status !== 'resolved', visible: this.#visible };
  }
  get lease(): TargetLease | null { return this.#update?.lease ?? null; }
  accept(lease: TargetLease, callback: () => void): boolean { return this.#services.accept(lease, callback); }
  setVisible(visible: boolean): void { this.#visible = visible; }
  canClose(): { allowed: true } { return { allowed: true }; }
  dispose(): void { this.#disposed = true; this.#update = null; }
}
export const selectionSummaryType: PanelType = {
  typeId: 'handoff.selection-summary', viewStateVersion: 1,
  create: ({ id, services }) => new SelectionSummaryPanel(id, services),
};
