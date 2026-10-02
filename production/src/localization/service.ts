import type {
  LocalizationService,
  ModulePresentation,
  LocaleContribution,
  TextOwnerRef,
  TextRef,
  LocalizationResolution,
  LocalizationChange,
} from "../sdk/localization.ts";
import { Signal, demand, detached, plain } from "../sdk/kernel.ts";
const identity = (owner: TextOwnerRef) =>
  JSON.stringify([
    owner.moduleId,
    owner.version,
    owner.fingerprint,
    owner.namespace,
    owner.catalogVersion,
  ]);
const canonical = (locale: string) => new Intl.Locale(locale).baseName;
function validateOwner(owner: TextOwnerRef): void {
  plain(owner);
  demand(
    owner &&
      [owner.moduleId, owner.version, owner.fingerprint, owner.namespace].every(
        (x) => typeof x === "string" && x.length > 0,
      ) &&
      owner.namespace === owner.moduleId &&
      Number.isSafeInteger(owner.catalogVersion) &&
      owner.catalogVersion > 0,
    "CATALOG_IDENTITY",
  );
}
export class Localization implements LocalizationService {
  #locale = "en";
  #revision = 0;
  #live = true;
  #modules = new Map<
    string,
    {
      presentation: ModulePresentation;
      catalogs: Map<string, LocaleContribution>;
    }
  >();
  #signal = new Signal<LocalizationChange>();
  get locale(): string {
    return this.#locale;
  }
  private guard(): void {
    demand(this.#live && !this.#signal.notifying, "LOCALIZATION_BUSY");
  }
  private validate(c: LocaleContribution): void {
    plain(c);
    validateOwner(c.owner);
    demand(
      c.owner.namespace === c.owner.moduleId &&
        c.owner.catalogVersion > 0 &&
        c.revision > 0 &&
        Number.isSafeInteger(c.revision),
      "CATALOG_IDENTITY",
    );
    canonical(c.locale);
    const keys = new Set<string>();
    demand(Array.isArray(c.messages), "CATALOG_MESSAGE");
    for (const m of c.messages) {
      demand(
        typeof m.key === "string" &&
          m.key.length > 0 &&
          typeof m.text === "string" &&
          m.text.length > 0 &&
          !keys.has(m.key),
        "CATALOG_MESSAGE",
      );
      keys.add(m.key);
    }
  }
  private notify(reason: "locale" | "catalog"): void {
    this.#signal.emit({
      revision: ++this.#revision,
      locale: this.#locale,
      reason,
    });
  }
  registerModule(p: ModulePresentation, defaults: LocaleContribution): void {
    this.guard();
    plain(p);
    validateOwner(p.owner);
    this.validate(defaults);
    const id = identity(p.owner);
    demand(
      !this.#modules.has(id) &&
        id === identity(defaults.owner) &&
        canonical(p.defaultLocale) === canonical(defaults.locale),
      "CATALOG_REGISTRATION",
    );
    this.#modules.set(id, {
      presentation: detached(p),
      catalogs: new Map([[canonical(defaults.locale), detached(defaults)]]),
    });
    this.notify("catalog");
  }
  addLocale(c: LocaleContribution): void {
    this.guard();
    this.validate(c);
    const m = this.#modules.get(identity(c.owner));
    demand(m && !m.catalogs.has(canonical(c.locale)), "CATALOG_REGISTRATION");
    m.catalogs.set(canonical(c.locale), detached(c));
    this.notify("catalog");
  }
  replaceLocale(c: LocaleContribution, expected: number): void {
    this.guard();
    this.validate(c);
    const m = this.#modules.get(identity(c.owner)),
      old = m?.catalogs.get(canonical(c.locale));
    demand(
      m && old?.revision === expected && c.revision > expected,
      "CATALOG_STALE",
    );
    m.catalogs.set(canonical(c.locale), detached(c));
    this.notify("catalog");
  }
  unregisterModule(owner: TextOwnerRef): void {
    this.guard();
    this.#modules.delete(identity(owner));
    this.notify("catalog");
  }
  setLocale(locale: string): void {
    this.guard();
    const next = canonical(locale);
    if (next === this.#locale) return;
    this.#locale = next;
    this.notify("locale");
  }
  resolve(ref: TextRef): LocalizationResolution {
    plain(ref);
    validateOwner(ref.owner);
    demand(
      Object.values(ref.params ?? {}).every(
        (x) =>
          typeof x === "string" ||
          typeof x === "boolean" ||
          (typeof x === "number" && Number.isFinite(x)),
      ),
      "TEXT_PARAMETER",
    );
    demand(
      this.#live &&
        typeof ref.key === "string" &&
        ref.key.length > 0 &&
        typeof ref.fallback === "string" &&
        ref.fallback.length > 0 &&
        ref.owner.namespace === ref.owner.moduleId,
      "TEXT_REF",
    );
    const module = this.#modules.get(identity(ref.owner)),
      notices: string[] = [];
    let text = ref.fallback,
      source: LocalizationResolution["source"] = "inline-fallback",
      resolvedLocale: string | null = null;
    const candidates: string[] = [];
    let locale = this.#locale;
    while (locale) {
      candidates.push(locale);
      const i = locale.lastIndexOf("-");
      locale = i < 0 ? "" : locale.slice(0, i);
    }
    if (module) candidates.push(canonical(module.presentation.defaultLocale));
    else notices.push("MISSING_OWNER");
    for (const candidate of new Set(candidates)) {
      const found = module?.catalogs
        .get(candidate)
        ?.messages.find((m) => m.key === ref.key);
      if (found) {
        text = found.text;
        resolvedLocale = candidate;
        source =
          candidate === this.#locale
            ? "locale"
            : candidate === canonical(module!.presentation.defaultLocale)
              ? "module-default"
              : "parent-locale";
        break;
      }
    }
    if (source !== "locale") notices.push("TEXT_FALLBACK");
    if (module && source === "inline-fallback") notices.push("MISSING_KEY");
    text = text.replace(/\{([\w.-]+)\}/g, (match, key) => {
      const value = ref.params?.[key];
      if (value === undefined) {
        notices.push("MISSING_PARAMETER:" + key);
        return match;
      }
      demand(
        typeof value === "string" ||
          typeof value === "boolean" ||
          (typeof value === "number" && Number.isFinite(value)),
        "TEXT_PARAMETER",
      );
      return String(value);
    });
    return detached({ text, source, resolvedLocale, notices });
  }
  subscribe(fn: (change: LocalizationChange) => void): () => void {
    demand(this.#live, "LOCALIZATION_DISPOSED");
    return this.#signal.subscribe(fn);
  }
  dispose(): void {
    if (!this.#live) return;
    this.guard();
    this.#live = false;
    this.#modules.clear();
    this.#signal.clear();
  }
}
