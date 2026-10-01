/** Renderer glue uses the same public scoped target for root and nested parameters. */
import { Actions } from '../../executable-reference/qualification-presentation.ts';
import type { ActionContext, ParameterView } from '../../executable-reference/qualification-presentation.ts';
import { captureScope, ScopedFieldDraft, ScopedParameterTarget, ScopedParameterWidgets } from '../../executable-reference/repair/scoped-parameter.ts';
import { canonical } from '../../executable-reference/core.ts';

export function registerPercentWidget(widgets: ScopedParameterWidgets): void {
  widgets.register({
    id: 'handoff.percent',
    accepts: field => field.dataType?.kind === 'scalar' && field.dataType.scalar === 'float',
    project: field => ({ text: `${Number(field.value) * 100}%`, value: field.value, unit: '%' }),
  });
}

/** UI owns uncommitted text; values stay behind Parameter.write and its model validation. */
export class PercentFieldController {
  #input: ActionContext;
  #target: ScopedParameterTarget;
  #widgets: ScopedParameterWidgets;
  #actions = new Actions();
  #draft: ScopedFieldDraft | null = null;
  #text = '';
  #disposed = false;
  constructor(input: ActionContext, target: ScopedParameterTarget, widgets: ScopedParameterWidgets) {
    if (canonical(captureScope(input.context)) !== canonical(target.scope)) throw Error('FIELD_CONTEXT_MISMATCH');
    this.#input = input; this.#target = target; this.#widgets = widgets;
    this.#actions.register({
      id: 'handoff.percent.commit', allowTextFocus: true,
      enabled: () => !!this.#draft && !this.#disposed,
      invoke: () => {
        const result = this.#draft!.commit(text => {
          if (!text.trim()) throw Error('NUMBER_REQUIRED');
          const value = Number(text) / 100;
          if (!Number.isFinite(value)) throw Error('FINITE_NUMBER_REQUIRED');
          return value;
        });
        if (!result.ok) throw Error(`${result.error.code}: ${result.error.message}`);
        this.#draft = null;
      },
    });
  }
  project(): ParameterView {
    if (this.#disposed) throw Error('FIELD_CLOSED');
    return this.#widgets.projectTarget(this.#target, { widget: 'handoff.percent', fallback: 'auto' });
  }
  input(text: string): void {
    if (this.#disposed || this.#input.context.disposed) throw Error('FIELD_CLOSED');
    if (!this.#draft) this.#draft = new ScopedFieldDraft(this.#target);
    this.#text = text; this.#draft.setText(text);
  }
  get editingText(): string { return this.#text; }
  commit(): 'executed' | 'blocked' { return this.#actions.run('handoff.percent.commit', this.#input); }
  cancel(): void { this.#draft?.cancel(); this.#draft = null; this.#text = ''; }
  dispose(): void { this.cancel(); this.#target.dispose(); this.#disposed = true; }
}
