# S03 candidate walkthrough

This is an implementer candidate, pending independent review and Human acceptance. S03 remains active. The source revision is `5a2dec1772735ce259912a0c26a9e3dc8fd2a20a`; the exact submitted head is the commit introducing `submission-01.json`. Build bytes and the complete qualification scope are in the adjacent manifests.

After technical PASS, serve the extracted `candidate-web-01.tar.gz` in a fresh directory. From `production`, the installed Vite can serve it with `node node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 4174 --outDir <absolute-extracted-directory>`. Bind only the verified artifact; do not rebuild the acceptance preview from a later working tree.

1. Add Float, Multiply and Compose. Connect Float value → Multiply a → Compose x → Image output color. Generate GLSL.
2. Select Multiply and choose **Encapsulate**. Enter the selected subgraph, select Multiply, and change **b** in the Inspector. Use the breadcrumb to return.
3. Open **Local clipboard**, copy the selected caller and paste it. Open **Second Canvas**, enter each occurrence in its own Canvas, and verify shared values with independent selection, zoom and navigation.
4. Open **Subgraph interface**, rename/reorder/change a port or remove it. Apply, inspect the callers and diagnostics/loss result, then Undo. Try a draft name and press Escape to cancel it.
5. Select a caller and choose **Make independent**. Edit its definition and verify the other caller retains its own definition. Undo restores the shared relation.
6. Open **Structures**. Create a Structure with a description and fixed-array field. Reopen it, use **Add structure node** and **Structure Help**, then try deleting a Structure still in use. Cancel a field draft, then apply a reorder and Undo it.
7. Open **Library subgraph**, enter it and arrange nodes: the definition remains library-derived. Change its Float value: the definition becomes local. Undo restores the prior graph state.
8. Copy a caller, create a new document, and paste the retained local clipboard text into it. Undo removes the complete imported closure. Save/reopen or export/import JSON to inspect persistence.

Automated evidence additionally exercises late malformed references, bad edges, capacity/stage/source failures, custom owner callback exceptions, typed remapping, stale scoped handles/layout proposals, same-ID lifetime reuse, UTF-8 byte boundaries and synthetic IME events. The acceptance control must cite the independent review and exact I/R/build; this walkthrough is not an acceptance receipt.

Limits: Windows x64 desktop headless Chromium 151.0.7922.34, Playwright 1.62.1, 1440×1000. No physical GPU/Host/native OS IME/touch/iPad/Safari qualification; no S04 Personal exchange or S05 full catalog parity. S02 legacy compatibility remains blocked, inherited Gate residuals remain, and no merge or next Slice is authorized.
