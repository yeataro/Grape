/** IH-003 normative presentation/localization shapes. No runtime or environment imports. */
export interface TextOwnerRef {
  readonly moduleId: string;
  readonly version: string;
  readonly fingerprint: string;
  /** Stable module-owned namespace; equals moduleId, not a translated label. */
  readonly namespace: string;
  readonly catalogVersion: number;
}
export interface TextRef {
  readonly owner: TextOwnerRef;
  readonly key: string;
  /** Nonempty safe text when the exact catalog or key is unavailable. */
  readonly fallback: string;
  readonly params?: Readonly<Record<string, string | number | boolean>>;
}
export interface FeaturePresentation {
  readonly label: TextRef;
  readonly description?: TextRef;
  readonly help?: TextRef;
  readonly searchTerms?: readonly TextRef[];
}
export interface NodePresentation extends FeaturePresentation {
  readonly category?: { readonly id: string; readonly label: TextRef };
  /** Map keys are the same stable keys returned by the node's port/parameter schema. */
  readonly ports?: Readonly<Record<string, FeaturePresentation>>;
  readonly parameters?: Readonly<Record<string, FeaturePresentation>>;
  readonly actions?: Readonly<Record<string, FeaturePresentation>>;
  /** Diagnostic code remains semantic identity; only its displayed message is localized. */
  readonly diagnostics?: Readonly<Record<string, TextRef>>;
}
export interface PanelPresentation extends FeaturePresentation {
  readonly actions?: Readonly<Record<string, FeaturePresentation>>;
  readonly diagnostics?: Readonly<Record<string, TextRef>>;
}
export interface ModulePresentation {
  readonly owner: TextOwnerRef;
  readonly defaultLocale: string;
  readonly label?: TextRef;
}
/** Feature-owned menu contents within ParameterPresentation.options; field title remains in NodePresentation. */
export interface MenuPresentationOptions {
  readonly schema: 'grape.ui.menu-items.v1';
  readonly items: readonly {
    /** Semantic enum value; finite for numbers. Never translated or derived from the label. */
    readonly value: string | number | boolean;
    readonly label: TextRef;
  }[];
}
export interface LocaleContribution {
  readonly owner: TextOwnerRef;
  readonly locale: string;
  /** Positive monotonic revision within one exact owner+locale. */
  readonly revision: number;
  /** Entries retain duplicate-key evidence; a parser must not silently last-win. */
  readonly messages: readonly { readonly key: string; readonly text: string }[];
}
export interface LocalizationResolution {
  readonly text: string;
  readonly source: 'locale' | 'parent-locale' | 'module-default' | 'inline-fallback';
  readonly resolvedLocale: string | null;
  readonly notices: readonly string[];
}
export interface LocalizationChange {
  readonly revision: number;
  readonly locale: string;
  readonly reason: 'locale' | 'catalog';
}
/** Application/UI service; no Graph, History or Generator dependency. */
export interface LocalizationService {
  readonly locale: string;
  registerModule(presentation: ModulePresentation, defaults: LocaleContribution): void;
  addLocale(contribution: LocaleContribution): void;
  replaceLocale(contribution: LocaleContribution, expectedRevision: number): void;
  unregisterModule(owner: TextOwnerRef): void;
  setLocale(locale: string): void;
  resolve(ref: TextRef): LocalizationResolution;
  subscribe(listener: (change: LocalizationChange) => void): () => void;
  dispose(): void;
}
