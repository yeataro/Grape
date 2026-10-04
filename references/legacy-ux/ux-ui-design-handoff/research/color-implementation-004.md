# COLOR-IMPLEMENTATION-004 — 設計與已交付預覽版的界線

Date: 2026-10-02. This is a **prior implementation result** incorporated into the design handoff. It is not a new product implementation performed during ATLAS-004, and not qualification of the rewritten product.

## Reference identity

- Function Preview `0.8.273`, commit `e005f08` (`feat: replace native color picker with shared live color panel (0.8.273)`).
- Behavior source: `docs/features/CUSTOM_COLOR_PICKER.md` in the legacy product, read only for this handoff. The normative design description is duplicated in portable form in [COLOR_PICKER_SPEC](../atlas/COLOR_PICKER_SPEC.md).
- This supersedes the ATLAS-003 statement that target integration and commit/cancel policy were wholly unimplemented/undecided. It does not supersede CEF/device/color-management evidence gaps.

## Preserved behavior

| Target | While editing | Apply / outside | × / Escape |
|---|---|---|---|
| Live Uniform / bound OP color | Valid changes update live; opening value and basis retained. | No Apply button. Outside accepts already-live result. | Attempt to restore opening value using existing conditional-write authority; stale basis must preserve external actual value and report conflict. |
| Constant, non-live/unbound OP, Note / Group custom color | Popup-local draft; no target write yet. | Explicit Apply commits; outside cancels. | Discard popup draft. |

The swatches / plane / screen-eyedropper trio is centered. × is always at upper right, with Apply next to it only for non-live targets. These are two target commit policies sharing one presentation; the popup does not become a new History owner.

RGB has no A row and uses six HEX digits. RGBA has A and always eight HEX digits; six-digit paste preserves A. All six HSV/RGB rows stay visible. Existing target kind determines color semantics; arbitrary vectors are not automatically colors. Unedited numeric precision / HDR source values must not be silently clamped or rewritten just by opening and closing the display.

Screen eyedropper is feature-detected. Unsupported environments disable that operation with a reason. Custom manual color editing does not depend on the browser-native color popup. Closing/changing target retires pending pointer and asynchronous results. External actual values remain protected by CAS / receipt / lifetime boundaries.

## Previously executed evidence (not rerun by atlas build)

| Prior evidence | Result / scope |
|---|---|
| Targeted Python/JavaScript checks | 39 passed; conversion, popup/target policy, source and authority contracts. |
| Isolated browser groups | 35 passed:16 new integration groups plus19 existing color regression groups. |
| Actual TD/browser interaction scenarios | 6 passed: live RGBA, grouped outside receipt/history, Undo/Redo with Graph/revision/dirty unchanged, ×/Escape restore, explicit RGB3 preserving physical fourth A, bound OP authority / external CAS. |
| Native TD checks | 10 new MAT/TOP checks with200 previews; previously established19 live and6 color checks also passed. |
| Launch / localization | 14 launch checks;1596 keys across5 languages. |
| Full unit regression | 680 tests,13 failures and3 errors. The same16 names reproduced at the unchanged baseline (11 modules,63 selected tests). **Not a full-suite PASS.** |

Provenance locators for detailed raw logs, if investigating prior implementation: `td/work/custom-color-picker-273/reports/{browser-custom-color-integration,td-browser-live,legacy-color-regression}` and legacy workspace private `work/color-picker-273`. They are **not required dependencies** of this portable design package and are not presented as files bundled here. This summary records a prior run; absence of those raw logs does not convert it into independently rerun evidence.

## Still not established

Real CEF, Safari, iPad, touch/pen, IME, screen capture permission/platform coverage and new color-management guarantees have not been qualified. The original CEF native-popup failure is owner-reported. A custom web panel removes that native dependency, but successful CEF operation still requires a real CEF check. Rewritten-product acceptance remains separate.

The atlas uses its own disposable local model to demonstrate both commit policies, with DOM/canvas-double checks. It does not send Host writes or claim to execute CAS. Local-demo PASS does not close these runtime gaps.
