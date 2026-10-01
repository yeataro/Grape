# Module-owned localization example · IH-003

**THIS IS NOT THE PRODUCTION IMPLEMENTATION.** This sample provides text metadata for one Node and one Panel plus English/Japanese locale contributions. It does not implement their computation or workspace runtime.

- [example.ts](example.ts): one stable feature namespace, Node label/category/search/help/port/parameter metadata, Panel/actions/diagnostics metadata, separate locale payloads and a minimal view-only subscriber.
- [production shape](../../contracts/localization.ts): sole public type declarations.
- [contract](../../15_LOCALIZATION_CONTRACT.md): ownership, fallback, registration/version/lifetime and failure rules.

Bootstrap calls `registerFeatureTexts(localizationService)`. Ordinary Node/Panel registration exposes `nodePresentation` / `panelPresentation` on their type definitions. A consumer calls `resolve(TextRef)` and subscribes to localization changes; it never imports dictionaries. Additional feature locales use `addLocale`; shell and unrelated feature catalogs are untouched. Builtins follow the same process.

`SummaryTextView` is only text-projection glue, not an alternative Panel host. A real Panel uses the existing PanelWorkspace contract and cancels its text subscription during Panel.dispose. Graph and Parameter state do not participate in locale selection. User text is displayed literally and is never looked up by matching a label string.

`modeMenu` demonstrates the production `grape.ui.menu-items.v1` widget-options convention: each item has an unchanged semantic enum value and a localized `TextRef` label. The old dynamic-node `handoff.menu-items.v1` literal labels are qualification fixtures only. Field titles/help remain in `NodePresentation.parameters`; choice labels belong to their module's menu payload. `projectMenu` in the bounded qualification resolves labels without writing any selected value, Graph state or GLSL. Missing translations retain the original item value and show the reference fallback.

Run the bounded direct qualification from the package root:

```text
node --test executable-reference/repair/localization.test.ts
```

No DOM, production renderer, complete translation corpus, plural engine or all-language layout compatibility is claimed.
