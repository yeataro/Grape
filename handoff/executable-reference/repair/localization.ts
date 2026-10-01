/** THIS IS NOT THE PRODUCTION IMPLEMENTATION. Bounded IH-003 localization qualification. */
import type { LocaleContribution, LocalizationChange, LocalizationResolution, LocalizationService, MenuPresentationOptions, ModulePresentation, TextOwnerRef, TextRef } from '../../contracts/localization.ts';

type Pack = { revision: number; messages: Map<string, string> };
type Catalog = { owner: TextOwnerRef; defaultLocale: string; locales: Map<string, Pack> };
const token = /^[A-Za-z0-9][A-Za-z0-9._/-]*$/;
function fail(code: string): never { throw new Error(code); }
function key(value: unknown): asserts value is string {
  if (typeof value !== 'string' || !token.test(value)) fail('INVALID_TEXT_KEY');
}
export function canonicalLocale(value: string): string {
  try { return new Intl.Locale(value).baseName; } catch { return fail('INVALID_LOCALE'); }
}
function ownerKey(owner: TextOwnerRef): string {
  if (!owner || typeof owner !== 'object') fail('INVALID_TEXT_OWNER');
  key(owner.moduleId);
  if (owner.namespace !== owner.moduleId || typeof owner.version !== 'string' || !owner.version || typeof owner.fingerprint !== 'string' || !owner.fingerprint || !Number.isSafeInteger(owner.catalogVersion) || owner.catalogVersion < 1) fail('INVALID_TEXT_OWNER');
  return JSON.stringify([owner.namespace, owner.version, owner.fingerprint, owner.catalogVersion]);
}
function cloneOwner(owner: TextOwnerRef): TextOwnerRef { ownerKey(owner); return Object.freeze({ ...owner }); }
function pack(input: LocaleContribution): Pack {
  if (!Number.isSafeInteger(input.revision) || input.revision < 1 || !Array.isArray(input.messages)) fail('INVALID_LOCALE_PACK');
  const messages = new Map<string, string>();
  for (const entry of input.messages) {
    if (!entry || typeof entry !== 'object') fail('INVALID_MESSAGE');
    key(entry.key);
    if (messages.has(entry.key)) fail('DUPLICATE_TEXT_KEY');
    if (typeof entry.text !== 'string' || !entry.text.trim()) fail('INVALID_MESSAGE');
    messages.set(entry.key, entry.text);
  }
  return { revision: input.revision, messages };
}
function checkRef(ref: TextRef): void {
  ownerKey(ref.owner); key(ref.key);
  if (typeof ref.fallback !== 'string' || !ref.fallback.trim()) fail('INVALID_TEXT_FALLBACK');
  if (ref.params !== undefined) {
    if (!ref.params || typeof ref.params !== 'object' || Array.isArray(ref.params)) fail('INVALID_TEXT_PARAMS');
    for (const [name, value] of Object.entries(ref.params)) {
      key(name);
      if (!['string', 'number', 'boolean'].includes(typeof value) || typeof value === 'number' && !Number.isFinite(value)) fail('INVALID_TEXT_PARAMS');
    }
  }
}
function interpolate(text: string, params: TextRef['params'], notices: string[]): string {
  // Plain substitution only. Values are never reparsed as templates or HTML.
  return text.replace(/\{([A-Za-z0-9][A-Za-z0-9._/-]*)\}/g, (literal, name: string) => {
    if (!params || !Object.hasOwn(params, name)) { notices.push('MISSING_TEXT_PARAM:' + name); return literal; }
    return String(params[name]);
  });
}
/** Pure Widget projection; does not own or choose the selected value and never emits GLSL. */
export function projectMenu(options: MenuPresentationOptions, service: LocalizationService): readonly Readonly<{ value: string | number | boolean; label: string; notices: readonly string[] }>[] {
  if (!options || options.schema !== 'grape.ui.menu-items.v1' || !Array.isArray(options.items) || options.items.length === 0) fail('INVALID_MENU_OPTIONS');
  const seen = new Set<string>();
  const items = options.items.map(item => {
    if (!item || !['string', 'number', 'boolean'].includes(typeof item.value) || typeof item.value === 'number' && !Number.isFinite(item.value)) fail('INVALID_MENU_VALUE');
    const identity = JSON.stringify([typeof item.value, item.value]);
    if (seen.has(identity)) fail('DUPLICATE_MENU_VALUE');
    seen.add(identity);
    const resolved = service.resolve(item.label);
    return Object.freeze({ value: item.value, label: resolved.text, notices: resolved.notices });
  });
  return Object.freeze(items);
}
export class QualificationLocalization implements LocalizationService {
  #locale: string;
  #catalogs = new Map<string, Catalog>();
  #listeners = new Set<(change: LocalizationChange) => void>();
  #disposed = false;
  #notifying = false;
  #revision = 0;
  readonly observerErrors: unknown[] = [];
  constructor(locale = 'en') { this.#locale = canonicalLocale(locale); }
  get locale(): string { this.#live(); return this.#locale; }
  #live(): void { if (this.#disposed) fail('LOCALIZATION_DISPOSED'); }
  #write(): void { this.#live(); if (this.#notifying) fail('LOCALIZATION_REENTRANT'); }
  #emit(reason: LocalizationChange['reason']): void {
    const change = Object.freeze({ revision: ++this.#revision, locale: this.#locale, reason });
    this.#notifying = true;
    try { for (const listener of [...this.#listeners]) { if (this.#disposed) break; if (!this.#listeners.has(listener)) continue; try { listener(change); } catch (error) { this.observerErrors.push(error); } } }
    finally { this.#notifying = false; }
  }
  registerModule(presentation: ModulePresentation, defaults: LocaleContribution): void {
    this.#write(); const id = ownerKey(presentation.owner);
    if (this.#catalogs.has(id)) fail('DUPLICATE_TEXT_OWNER');
    if (ownerKey(defaults.owner) !== id) fail('TEXT_OWNER_MISMATCH');
    const locale = canonicalLocale(presentation.defaultLocale);
    if (canonicalLocale(defaults.locale) !== locale) fail('DEFAULT_LOCALE_MISMATCH');
    if (presentation.label) checkRef(presentation.label);
    const candidate = pack(defaults);
    this.#catalogs.set(id, { owner: cloneOwner(presentation.owner), defaultLocale: locale, locales: new Map([[locale, candidate]]) });
    this.#emit('catalog');
  }
  addLocale(contribution: LocaleContribution): void {
    this.#write(); const catalog = this.#catalogs.get(ownerKey(contribution.owner));
    if (!catalog) fail('MISSING_TEXT_OWNER');
    const locale = canonicalLocale(contribution.locale);
    if (catalog.locales.has(locale)) fail('DUPLICATE_LOCALE');
    const candidate = pack(contribution); catalog.locales.set(locale, candidate); this.#emit('catalog');
  }
  replaceLocale(contribution: LocaleContribution, expectedRevision: number): void {
    this.#write(); const catalog = this.#catalogs.get(ownerKey(contribution.owner));
    if (!catalog) fail('MISSING_TEXT_OWNER');
    const locale = canonicalLocale(contribution.locale), previous = catalog.locales.get(locale);
    if (!previous) fail('MISSING_LOCALE');
    if (previous.revision !== expectedRevision) fail('STALE_LOCALE_REVISION');
    if (contribution.revision <= previous.revision) fail('LOCALE_REVISION_NOT_ADVANCED');
    const candidate = pack(contribution); catalog.locales.set(locale, candidate); this.#emit('catalog');
  }
  unregisterModule(owner: TextOwnerRef): void {
    this.#write(); if (this.#catalogs.delete(ownerKey(owner))) this.#emit('catalog');
  }
  setLocale(locale: string): void {
    this.#write(); const normalized = canonicalLocale(locale);
    if (normalized === this.#locale) return;
    this.#locale = normalized; this.#emit('locale');
  }
  resolve(ref: TextRef): LocalizationResolution {
    this.#live(); checkRef(ref);
    const catalog = this.#catalogs.get(ownerKey(ref.owner)), notices: string[] = [];
    let text = ref.fallback;
    let source: LocalizationResolution['source'] = 'inline-fallback';
    let resolvedLocale: string | null = null;
    if (!catalog) notices.push('MISSING_TEXT_OWNER');
    else {
      const locales: string[] = []; let cursor = this.#locale;
      while (cursor) { locales.push(cursor); const cut = cursor.lastIndexOf('-'); cursor = cut === -1 ? '' : cursor.slice(0, cut); }
      if (!locales.includes(catalog.defaultLocale)) locales.push(catalog.defaultLocale);
      for (const locale of locales) {
        const value = catalog.locales.get(locale)?.messages.get(ref.key);
        if (value === undefined) continue;
        text = value; resolvedLocale = locale;
        source = locale === this.#locale ? 'locale' : locale === catalog.defaultLocale && !this.#locale.startsWith(locale + '-') ? 'module-default' : 'parent-locale';
        break;
      }
      if (resolvedLocale === null) notices.push('MISSING_TEXT_KEY');
      else if (resolvedLocale !== this.#locale) notices.push('LOCALE_FALLBACK');
    }
    return Object.freeze({ text: interpolate(text, ref.params, notices), source, resolvedLocale, notices: Object.freeze(notices) });
  }
  subscribe(listener: (change: LocalizationChange) => void): () => void {
    this.#live(); this.#listeners.add(listener); return () => { this.#listeners.delete(listener); };
  }
  dispose(): void { if (this.#disposed) return; this.#write(); this.#disposed = true; this.#listeners.clear(); this.#catalogs.clear(); }
}
