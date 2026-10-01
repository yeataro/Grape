# Minimal fixed-interface node

**THIS IS NOT THE PRODUCTION IMPLEMENTATION.** This is a small contributor example against the copied AC-002 interfaces, not another core or a shader compatibility claim.

`example.ts` exports one `NodeModule` containing a fixed-interface Scale operation. The module owns its pure definition and lowering. Graph owns instance identity, values, connections and History. Parameter writes enter the existing Graph mutation boundary; `emit` only reads its context.

From the handoff root, with Node 25.5.0 (the verified runtime):

```powershell
node --test examples/minimal-node/example.test.ts
```

No npm install is needed for these two runtime tests. They validate registration, generation, one-step Undo, exact-reference reload and missing-module preservation. They do not compile on TD or a GPU. Fingerprints here are fixed example identities; they are not a production module packaging/versioning implementation.
