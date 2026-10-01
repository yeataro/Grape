/** Direct M2/i18n qualification. No DOM or production renderer. */
import test from 'node:test';
import assert from 'node:assert/strict';
import type { LocaleContribution, TextOwnerRef, TextRef } from '../../contracts/localization.ts';
import { QualificationLocalization as Localizer, projectMenu } from './localization.ts';
import { defaults, japanese, modeMenu, modulePresentation, nodePresentation, owner, panelPresentation, registerFeatureTexts, SummaryTextView } from '../../examples/module-localization/example.ts';
import { Graph, Registry } from '../core.ts';
import { builtinModule, refs } from '../nodes.ts';
import { generate } from '../generator.ts';
import { unwrap } from '../scenario.ts';

const setup = (locale = 'en') => { const service = new Localizer(locale); registerFeatureTexts(service); return service; };
const textRef = (key: string, fallback = 'Safe fallback', alternate: TextOwnerRef = owner): TextRef => ({ owner: alternate, key, fallback });
const contribution = (locale: string, text: string, revision = 1): LocaleContribution => ({ owner, locale, revision, messages: [{ key: 'node.scale.label', text }] });

test('L10N-01 Node catalog/help/search/ports/parameters and Panel metadata are module-owned', () => {
  const service = setup('ja');
  assert.equal(service.resolve(nodePresentation.label).text, '倍率');
  assert.equal(service.resolve(nodePresentation.category!.label).text, '数学');
  assert.equal(service.resolve(nodePresentation.searchTerms![0]).text, '乗算');
  assert.equal(service.resolve(nodePresentation.ports!.value.label).text, '値');
  assert.equal(service.resolve(nodePresentation.parameters!.factor.label).text, '係数');
  assert.match(service.resolve(nodePresentation.help!).text, /初期値/);
  assert.equal(service.resolve(panelPresentation.actions!.refresh.label).text, '更新');
  assert.equal(nodePresentation.category!.id, 'sample.shading.math');
});
test('L10N-02 adding a feature locale uses only contribution registration and updates existing views', () => {
  const service = setup('fr'), view = new SummaryTextView(service);
  assert.equal(view.project().title, 'Shading summary');
  service.addLocale({ ...contribution('fr', 'Échelle'), messages: [{ key: 'panel.summary.label', text: 'Résumé' }] });
  assert.equal(view.project().title, 'Résumé');
  assert.equal(view.project().help, 'Shows the selected shading value.');
  view.dispose(); service.setLocale('ja'); assert.throws(() => view.project(), /TEXT_VIEW_DISPOSED/);
});
test('L10N-03 exact locale then parents then module default then inline fallback are deterministic', () => {
  const service = setup('zh-Hant-TW');
  service.addLocale(contribution('zh', '缩放')); service.addLocale(contribution('zh-Hant', '縮放'));
  assert.deepEqual(service.resolve(nodePresentation.label), { text: '縮放', source: 'parent-locale', resolvedLocale: 'zh-Hant', notices: ['LOCALE_FALLBACK'] });
  service.addLocale(contribution('zh-Hant-TW', '比例')); assert.equal(service.resolve(nodePresentation.label).source, 'locale');
  assert.equal(service.resolve(panelPresentation.label).source, 'module-default');
  assert.equal(service.resolve(textRef('missing')).source, 'inline-fallback');
  service.setLocale('JA-jp-u-nu-latn'); assert.equal(service.locale, 'ja-JP'); assert.equal(service.resolve(nodePresentation.label).text, '倍率');
});
test('L10N-04 exact module version/fingerprint/catalog identity isolates simultaneous versions', () => {
  const service = setup();
  const nextOwner = { ...owner, version: '2', fingerprint: 'sample-shading-v2' };
  service.registerModule({ owner: nextOwner, defaultLocale: 'en' }, { ...contribution('en', 'Scale v2'), owner: nextOwner });
  assert.equal(service.resolve(nodePresentation.label).text, 'Scale');
  assert.equal(service.resolve(textRef('node.scale.label', 'fallback', nextOwner)).text, 'Scale v2');
  assert.equal(service.resolve(textRef('node.scale.label', 'wrong pin', { ...owner, fingerprint: 'other' })).text, 'wrong pin');
  assert.equal(service.resolve(textRef('node.scale.label', 'future schema', { ...owner, catalogVersion: 2 })).text, 'future schema');
});
test('L10N-05 duplicate owner/locale and namespace spoof fail atomically', () => {
  const service = setup(); let events = 0; service.subscribe(() => events++);
  assert.throws(() => service.registerModule(modulePresentation, defaults), /DUPLICATE_TEXT_OWNER/);
  assert.throws(() => service.addLocale(japanese), /DUPLICATE_LOCALE/);
  assert.throws(() => service.addLocale({ ...japanese, owner: { ...owner, namespace: 'grape.shell' } }), /INVALID_TEXT_OWNER/);
  assert.equal(events, 0); assert.equal(service.resolve(nodePresentation.label).text, 'Scale');
});
test('L10N-06 malformed/duplicate messages cannot partially install a locale', () => {
  const service = setup('de'); let events = 0; service.subscribe(() => events++);
  assert.throws(() => service.addLocale({ ...contribution('de', 'Skala'), messages: [{ key: 'node.scale.label', text: 'Skala' }, { key: 'node.scale.label', text: 'other' }] }), /DUPLICATE_TEXT_KEY/);
  assert.throws(() => service.addLocale({ ...contribution('de', ''), revision: 0 }), /INVALID_LOCALE_PACK/);
  assert.throws(() => service.addLocale(contribution('not_a_locale', 'bad')), /INVALID_LOCALE/);
  assert.equal(events, 0); assert.equal(service.resolve(nodePresentation.label).text, 'Scale');
  service.addLocale(contribution('de', 'Skala')); assert.equal(service.resolve(nodePresentation.label).text, 'Skala');
});
test('L10N-07 locale replacement is atomic expected-revision CAS, not implicit last-wins', () => {
  const service = setup('ja'); let events = 0; service.subscribe(() => events++);
  assert.throws(() => service.replaceLocale(contribution('ja', '新規', 2), 9), /STALE_LOCALE_REVISION/);
  assert.throws(() => service.replaceLocale(contribution('ja', '新規', 1), 1), /LOCALE_REVISION_NOT_ADVANCED/);
  assert.equal(events, 0); service.replaceLocale(contribution('ja', '新しい倍率', 2), 1);
  assert.equal(events, 1); assert.equal(service.resolve(nodePresentation.label).text, '新しい倍率');
});
test('L10N-08 missing module/key uses reference fallback and never another owner or raw undefined', () => {
  const service = setup('ja'); service.unregisterModule(owner);
  assert.equal(service.resolve(nodePresentation.label).text, 'Scale');
  assert.deepEqual(service.resolve(nodePresentation.label).notices, ['MISSING_TEXT_OWNER']);
  registerFeatureTexts(service); assert.equal(service.resolve(nodePresentation.label).text, '倍率');
  assert.deepEqual(service.resolve(textRef('no.key')).notices, ['MISSING_TEXT_KEY']);
});
test('L10N-09 shell common and feature namespaces coexist through the same contract', () => {
  const service = setup('ja');
  const shell = { ...owner, moduleId: 'grape.shell', namespace: 'grape.shell' };
  service.registerModule({ owner: shell, defaultLocale: 'en' }, { owner: shell, locale: 'en', revision: 1, messages: [{ key: 'action.close', text: 'Close' }] });
  service.addLocale({ owner: shell, locale: 'ja', revision: 1, messages: [{ key: 'action.close', text: '閉じる' }] });
  assert.equal(service.resolve(textRef('action.close', 'Close', shell)).text, '閉じる');
  assert.equal(service.resolve(panelPresentation.actions!.refresh.label).text, '更新');
  service.unregisterModule(shell); assert.equal(service.resolve(nodePresentation.label).text, '倍率');
});
test('L10N-10 locale change does not mutate Graph/document/History/GLSL or user-authored names', () => {
  const registry = new Registry(); unwrap(registry.register(builtinModule));
  const graph = new Graph({ name: 'ユーザーの {node.name}', definitions: registry.pin(), outputType: refs.output });
  const stage = graph.stage('pixel');
  const id = unwrap(graph.change('Create value', d => d.createNode(stage.id, refs.constant, { value: 0.5 }, 'Scale')));
  unwrap(graph.change('Connect value', d => d.connect(graph.nodeById(id)!.output('out'), stage.nodes[0].input('color'))));
  const before = { json: graph.exportJSON(), revision: graph.revision, history: graph.historyCounts, shader: unwrap(generate(graph.snapshot())).pixel };
  let changed = 0; const unsub = graph.subscribe(() => changed++);
  const service = setup(); service.setLocale('ja'); service.replaceLocale(contribution('ja', '更新', 2), 1);
  assert.deepEqual({ json: graph.exportJSON(), revision: graph.revision, history: graph.historyCounts, shader: unwrap(generate(graph.snapshot())).pixel }, before);
  assert.equal(changed, 0); unsub();
});
test('L10N-11 params remain plain text; missing placeholders and invalid params are explicit', () => {
  const service = setup(); const ref = nodePresentation.diagnostics!.OUT_OF_RANGE;
  assert.match(service.resolve({ ...ref, params: { value: '<b>{other}</b>' } }).text, /<b>\{other\}<\/b>/);
  assert.deepEqual(service.resolve(ref).notices, ['MISSING_TEXT_PARAM:value']);
  assert.throws(() => service.resolve({ ...ref, params: { value: Infinity } }), /INVALID_TEXT_PARAMS/);
  assert.throws(() => service.resolve({ ...ref, fallback: '' }), /INVALID_TEXT_FALLBACK/);
});
test('L10N-12 notifications follow atomic publication, isolate callback errors and reject own reentry', () => {
  const service = setup(); const seen: string[] = [];
  service.subscribe(() => { service.setLocale('en'); });
  service.subscribe(() => { throw Error('bad observer'); });
  service.subscribe(event => { assert.equal(Object.isFrozen(event), true); seen.push(service.resolve(nodePresentation.label).text); });
  service.setLocale('ja'); assert.deepEqual(seen, ['倍率']); assert.equal(service.observerErrors.length, 2);
  assert.equal(service.locale, 'ja'); service.setLocale('ja'); assert.equal(seen.length, 1);
});
test('L10N-13 subscription cleanup and service lifetime are explicit', () => {
  const service = setup(); let seen = 0; const off = service.subscribe(() => seen++); off(); off(); service.setLocale('ja'); assert.equal(seen, 0);
  service.dispose(); service.dispose(); assert.throws(() => service.resolve(nodePresentation.label), /LOCALIZATION_DISPOSED/);
  assert.throws(() => service.subscribe(() => {}), /LOCALIZATION_DISPOSED/);
  assert.throws(() => service.setLocale('en'), /LOCALIZATION_DISPOSED/);
});
test('L10N-14 registrations clone contribution data and projections are immutable', () => {
  const service = setup('it'); const input = { ...contribution('it', 'Scala'), messages: [{ key: 'node.scale.label', text: 'Scala' }] };
  service.addLocale(input); input.messages[0].text = 'mutated outside';
  assert.equal(service.resolve(nodePresentation.label).text, 'Scala');
  const result = service.resolve(nodePresentation.label); assert.equal(Object.isFrozen(result), true); assert.equal(Object.isFrozen(result.notices), true);
});

test('L10N-15 cleanup during notification prevents a disposed consumer from receiving that event', () => {
  const service = setup(); let seen = 0;
  let unsubscribeOther = () => {};
  service.subscribe(() => unsubscribeOther());
  unsubscribeOther = service.subscribe(() => { seen++; });
  service.setLocale('ja'); assert.equal(seen, 0);
});

test('L10N-16 menu labels localize independently of their stable enum values and options data', () => {
  const service = setup(), before = JSON.stringify(modeMenu);
  const english = projectMenu(modeMenu, service);
  service.setLocale('ja'); const japaneseItems = projectMenu(modeMenu, service);
  assert.deepEqual(english.map(x => x.label), ['Uniform', 'Texture']);
  assert.deepEqual(japaneseItems.map(x => x.label), ['均一', 'テクスチャ']);
  assert.deepEqual(japaneseItems.map(x => x.value), [0, 1]);
  assert.equal(JSON.stringify(modeMenu), before);
  assert.equal(Object.isFrozen(japaneseItems), true); assert.equal(Object.isFrozen(japaneseItems[0]), true);
});
test('L10N-17 missing menu text fallback preserves values; malformed value/schema is an explicit failure', () => {
  const service = setup('ja');
  const missing = projectMenu({ schema: 'grape.ui.menu-items.v1', items: [
    { value: 7, label: textRef('missing.mode', 'Special') },
    { value: 'custom', label: textRef('mode.uniform', 'Unavailable mode', { ...owner, fingerprint: 'absent' }) },
  ] }, service);
  assert.equal(missing[0].value, 7); assert.equal(missing[0].label, 'Special'); assert.deepEqual(missing[0].notices, ['MISSING_TEXT_KEY']);
  assert.equal(missing[1].value, 'custom'); assert.equal(missing[1].label, 'Unavailable mode'); assert.deepEqual(missing[1].notices, ['MISSING_TEXT_OWNER']);
  assert.throws(() => projectMenu({ ...modeMenu, items: [modeMenu.items[0], modeMenu.items[0]] }, service), /DUPLICATE_MENU_VALUE/);
  assert.throws(() => projectMenu({ ...modeMenu, items: [{ value: Infinity, label: nodePresentation.label }] }, service), /INVALID_MENU_VALUE/);
  assert.throws(() => projectMenu({ ...modeMenu, items: [] }, service), /INVALID_MENU_OPTIONS/);
});
