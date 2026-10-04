# S06 B01 targeted repair

Candidate: `S06-debug-0f4ea44`, implementation `0f4ea44d5bdb69866f271ebfbadea2ceac2523ec`.
This is an engineering submission for independent targeted review. S06 remains active and unaccepted.

## What changed

- Resizing between two Canvas groups keeps native focus and pointer capture. Repeated keys and Escape rollback work throughout one gesture.
- Retrying an unavailable Panel guards the entire replacement lifecycle against synchronous Workspace reentry.
- A live Panel's valid `null` private state survives current-layout save. Invalid/throwing exports still reject the complete save.

The original [independent FAIL](../b01-review-01/INDEPENDENT_REVIEW_RESULT.json) remains unchanged. Detailed [finding mapping](finding-mapping-01.json), [impact](impact-01.json), [checks](checks-01.json) and [preservation](preservation-01.json) distinguish each repaired case and the limits of its evidence.

## Open the exact candidate

Use [candidate-web.tar.gz](build-01/candidate-web.tar.gz) with [build manifest](build-01/build-manifest-01.json). Extract into a fresh disposable directory under repository `.verification`, verify every file, and serve on an unused loopback port. The existing preview services must stay untouched.

The recorded [self-check configuration](archive-smoke-config-01.json) and [archive packaging script](package-archive-01.mjs) document the verified helper and extraction. The packaging script is an original run record, not an instruction to overwrite its existing output. For a replay, copy the configuration to a new file, change only the isolated extraction path and unused port, and serve it with `node production/evidence/coordinator/s06/preview-05/serve-local-preview.mjs <absolute-config-path>` from the repository root. Copy [START-HERE.html](START-HERE.html) into that extraction alongside `index.html` and retain its listed hash. Verify the brand row says `S06-debug-0f4ea44` before testing. The self-check configuration's provisional `submittedR=I` is explicitly not independent review or deployment identity; the final submission commit is recorded by the postcommit receipt.

## Public walkthrough

1. Open the editor. Choose **Project actions → Second Canvas**. Two Canvas groups share the document.
2. Click the narrow horizontal separator between those groups. Press ArrowDown twice, then Shift+ArrowDown. Each press changes the split; focus remains on the separator. Home/End reach its bounds. Escape restores its value from before the first key.
3. Drag the same separator continuously about 70px, then release. The split remains changed. Start another drag and press Escape while holding the mouse; releasing afterward retains the previous committed split. Double-click resets this pair only.
4. In the first Canvas title's **Panel options**, choose **Move group later**. The new separator still responds to repeated keys. Drag a node and press Escape naturally; its position returns and no drag History entry is added.
5. Use **Project actions → Add Parameters**, edit a selected Float, and use **Export current layout**, **Save current layout**, and **Restore current layout**. Click the intended Canvas Tab again after restore to explicitly activate its provider. Parameters Tab activation does not choose a Canvas.
6. For a ready example, use **Project actions → Open file** with [workspace.grape.json](samples/workspace.grape.json), review it and open in a new session. Then **Import current layout** with [current-layout.json](samples/current-layout.json). These two files belong together because layout hints identify that document. A layout from a different document keeps unresolved placeholders rather than guessing a target.

Panel retry reentry and live `null` export are registered-Panel contract tests; the ordinary built-in UI does not offer a fake failing Panel or arbitrary JSON private-state editor. Their exact tests are named in the finding mapping. They preserve Tabs, owned Contexts, stale authority rejection, saved ACK, Graph History and Redo.

## Verification and limits

- 269 unit/conformance cases; typecheck, module pins and ownership boundaries passed.
- 29 unique source browser cases passed. 24 of those cases repeated against the immutable compiled archive passed; these are not 24 additional unique behaviors.
- Four direct/wrapped desktop/narrow archive walkthroughs verified true build identity, public editing, layout roundtrip and generation.
- Original failures, interrupted setup run, all 404 review objects and four read-only scout pairs are retained. Scouts do not activate other product work.
- Windows Chromium 151 headless portable profile only. Synthetic composition/lifecycle injections are labelled; no physical touch/IME, arbitrary external Panel, native Host/TD or multi-browser qualification is claimed.
- G-PD-2 named presets, whole AT-S06-03/full S06/catalog, OC11 and other deferred work remain excluded. LAN/Tailscale obligations were removed by the Owner; no network retry was performed.
- Continuous-run authority permits a normal descendant work push only. No Human acceptance, main merge or release is inferred.
