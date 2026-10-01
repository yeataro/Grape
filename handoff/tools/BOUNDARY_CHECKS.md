# Static architecture boundary checks

**THIS IS NOT THE PRODUCTION IMPLEMENTATION.** This checker verifies a declared source boundary. It does not infer architectural ownership and does not certify a product merely because the handoff reference passes.

Install the handoff reference's locked development tools first (`npm ci` in `executable-reference`). The checker uses its TypeScript 5.9.3 AST locally; it does not fetch packages or inspect legacy code.

```powershell
# From the handoff root: exact declared handoff/reference scope
node tools/check-boundaries.mjs
node --test tools/boundaries.test.mjs

# Inspect an actual implementation, with its own reviewed ownership manifest
node tools/check-boundaries.mjs --manifest C:/project/architecture-ownership.json
```

Exit 0 means the inspected files satisfy these static checks. Exit 1 means a boundary violation, missing/unclassified input, parse error or unavailable tooling. JSON output includes each import's type/runtime classification, findings, source hashes and the manifest hash. No product files are modified.

## Manifest, not folder names, assigns ownership

The default manifest is `examples/conformance-manifest.json`. It inspects reference top-level JS/TS and the five example contributions. Copied test directories, `.test.ts`, `test.ts`, and the two named packaging tools (`reconstruct.mjs`, `verify-reference.mjs`) are explicitly out of default scope. Other new `.mjs`/JS/TS modules are still discovered. These exclusions are **not** permission to use them in a production manifest without review. In a production project list every source root that belongs to the application; otherwise this checker cannot know about code outside its declared scope.

```json
{
  "version": 1,
  "scope": "Project X application source",
  "base": ".",
  "roots": [{"path": "src", "recursive": true}],
  "ignoreDirectories": ["node_modules", ".git"],
  "excludeBasenames": [],
  "excludeSuffixes": [],
  "files": {
    "src/model.ts": "core",
    "src/contracts.ts": "contracts",
    "src/operations.ts": "module",
    "src/lowering.ts": "generator",
    "src/workflow.ts": "application",
    "src/view.ts": "ui",
    "src/native-provider.ts": "adapter"
  },
  "externals": {"node:*": {"runtimeRoles": ["adapter"]}}
}
```

`base` resolves relative to the manifest; paths under `files` resolve relative to that base. Every discovered JS/TS source needs an explicit role. Every role declaration must correspond to an inspected source. Local imports must resolve into the inspected set, including standard `.js` specifiers resolving to `.ts`. External packages must be explicitly listed with approved runtime roles. `node:*` is an explicit rule for Node built-ins, not arbitrary external packages. Symlinks in inspected roots are rejected instead of silently escaping scope.

Roles `contracts`, `core`, `module`, `generator`, `application` are platform-free for these checks. They cannot import `ui`, `adapter` or `harness` runtime code, native Node/Electron packages, or directly use common DOM/Node/network globals. UI may use DOM; native operations belong to `adapter` (test/demo tooling may be `harness`). These are existing application-core/platform boundaries, not a proposed production folder layout or a complete dependency architecture. Platform-neutral injected services remain ordinary pure-role interfaces.

The checker resolves TypeScript syntax for imports, exports, literal dynamic imports and CommonJS `require`. Type-only imports are recorded and their targets must still be classified, but they do not count as runtime dependency edges. Mixed imports containing any value remain runtime edges. Type annotations do not count as DOM use. Symbol lookup prevents a local GraphDocument parameter named `document` from being mistaken for the browser document. The accepted Web Crypto bootstrap is not classified as native leakage. Direct and simple aliased `globalThis` environment access is checked; unresolved dynamic import/global lookup fails closed.

## What a pass cannot prove

- The manifest itself assigns honest roles or includes every relevant source root. Calling production code `harness` or omitting it requires human review; the checker is not a security sandbox.
- A UI reads projections rather than holding a second model; a module's state schema or lowering is semantically correct; Graph transactions publish atomically; an adapter obeys authority, History, cancellation, native-thread or rollback contracts.
- Indirect aliases, reflection, generated code, external package internals or malicious JavaScript cannot hide environmental behavior. The tool catches common static violations, not arbitrary program behavior.
- TD, GPU, browser or deployment compatibility. Run the separate behavioral and integration gates for their scope.

The synthetic self-tests cover forbidden dependencies, native/DOM leakage, type erasure, unclassified files, unknown dependencies, unresolved imports, and adding a module through unchanged public contracts. They are checker tests, not additional product capabilities or new architecture validation claims.
