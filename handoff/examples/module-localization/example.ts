/** Canonical module-owned metadata/locale payload; NOT a production Node or Panel runtime. */
import type { FeaturePresentation, LocaleContribution, LocalizationService, MenuPresentationOptions, ModulePresentation, NodePresentation, PanelPresentation, TextOwnerRef, TextRef } from '../../contracts/localization.ts';

export const owner: TextOwnerRef = Object.freeze({ moduleId: 'sample.shading', namespace: 'sample.shading', version: '1', fingerprint: 'sample-shading-v1', catalogVersion: 1 });
const ref = (key: string, fallback: string): TextRef => ({ owner, key, fallback });
const label = (key: string, fallback: string): FeaturePresentation => ({ label: ref(key, fallback) });
export const modulePresentation: ModulePresentation = { owner, defaultLocale: 'en', label: ref('module.label', 'Sample shading') };
export const nodePresentation: NodePresentation = {
  label: ref('node.scale.label', 'Scale'), description: ref('node.scale.description', 'Multiply a value by a factor.'),
  help: ref('node.scale.help', 'Connect a value or edit the local default.'),
  category: { id: 'sample.shading.math', label: ref('category.math', 'Math') },
  searchTerms: [ref('node.scale.search.multiply', 'multiply')],
  ports: { value: label('port.value', 'Value'), factor: label('port.factor', 'Factor'), out: label('port.out', 'Result') },
  parameters: { factor: label('parameter.factor', 'Factor') },
  diagnostics: { OUT_OF_RANGE: ref('diagnostic.range', 'Value {value} is outside the supported range.') },
};
export const panelPresentation: PanelPresentation = {
  label: ref('panel.summary.label', 'Shading summary'), help: ref('panel.summary.help', 'Shows the selected shading value.'),
  actions: { refresh: label('action.refresh', 'Refresh') },
  diagnostics: { UNAVAILABLE: ref('diagnostic.unavailable', 'No target is available.') },
};
/** This goes in the module's menu ParameterPresentation.options. Values are its semantic enum values. */
export const modeMenu: MenuPresentationOptions = { schema: 'grape.ui.menu-items.v1', items: [
  { value: 0, label: ref('mode.uniform', 'Uniform') },
  { value: 1, label: ref('mode.texture', 'Texture') },
] };
const messages = (data: Readonly<Record<string, string>>) => Object.entries(data).map(([key, text]) => ({ key, text }));
export const defaults: LocaleContribution = { owner, locale: 'en', revision: 1, messages: messages({
  'module.label': 'Sample shading', 'node.scale.label': 'Scale', 'node.scale.description': 'Multiply a value by a factor.',
  'node.scale.help': 'Connect a value or edit the local default.', 'category.math': 'Math', 'node.scale.search.multiply': 'multiply',
  'port.value': 'Value', 'port.factor': 'Factor', 'port.out': 'Result', 'parameter.factor': 'Factor',
  'diagnostic.range': 'Value {value} is outside the supported range.', 'panel.summary.label': 'Shading summary',
  'panel.summary.help': 'Shows the selected shading value.', 'action.refresh': 'Refresh', 'diagnostic.unavailable': 'No target is available.',
  'mode.uniform': 'Uniform', 'mode.texture': 'Texture',
}) };
/** Adding this locale edits this feature contribution only, never a central application text table. */
export const japanese: LocaleContribution = { owner, locale: 'ja', revision: 1, messages: messages({
  'node.scale.label': '倍率', 'node.scale.help': '値を接続するか、初期値を編集します。', 'category.math': '数学',
  'node.scale.search.multiply': '乗算', 'port.value': '値', 'port.factor': '係数', 'port.out': '結果', 'parameter.factor': '係数',
  'panel.summary.label': 'シェーディング概要', 'panel.summary.help': '選択された値を表示します。', 'action.refresh': '更新',
  'mode.uniform': '均一', 'mode.texture': 'テクスチャ',
}) };
export function registerFeatureTexts(service: LocalizationService): void {
  service.registerModule(modulePresentation, defaults);
  service.addLocale(japanese);
}
/** A Panel subscribes once, rerenders its own presentation, and unsubscribes on dispose. */
export class SummaryTextView {
  #service: LocalizationService;
  #unsubscribe: () => void;
  #disposed = false;
  #projection: Readonly<{ title: string; help: string; refresh: string }>;
  constructor(service: LocalizationService) {
    this.#service = service;
    this.#projection = this.#read();
    this.#unsubscribe = service.subscribe(() => { this.#projection = this.#read(); });
  }
  #read() { return Object.freeze({ title: this.#service.resolve(panelPresentation.label).text,
    help: this.#service.resolve(panelPresentation.help!).text,
    refresh: this.#service.resolve(panelPresentation.actions!.refresh.label).text }); }
  project() { if (this.#disposed) throw Error('TEXT_VIEW_DISPOSED'); return this.#projection; }
  dispose() { if (!this.#disposed) { this.#disposed = true; this.#unsubscribe(); } }
}
