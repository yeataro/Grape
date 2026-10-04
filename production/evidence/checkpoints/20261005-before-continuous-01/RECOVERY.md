# Checkpoint before continuous contract delivery

This checkpoint preserves the current repository and its unfinished S06 work before switching workflows. It does **not** accept S06, transfer an old technical PASS to the current candidate, or start the continuous contract run.

## Identity and scope

- Existing engineering submission: `a4a6e72b1a7ade9ee3c4b2f782c1da4358faa3e3`.
- Current implementation: `30c867945c992d25956a2a32825de34571f7749e`; build `S06-debug-30c8679`.
- S01-S05 retain their previously accepted bounded scopes and residuals. S06 remains active and unaccepted. The current Owner-corrections candidate has self-check evidence but no independent review. Historical PASS and FAIL reports retain their original revisions.
- Includes the workflow transition, current manual pilot, imported Legacy UX reference material and previously uncommitted evidence. Reference material and pilot documentation do not become accepted product requirements by being preserved here.
- [Publication control](publication-control-01.json) records the Owner's checkpoint-only authorization. [Capture manifest](capture-manifest-01.json) records preserved files and exclusions. [Recovery verification](recovery-verification-01.json) records the actual isolated recovery checks.

The immutable recovery point is the **full merge commit of the checkpoint PR**, recorded in the PR and final handoff. Do not use a moving `main` name as the only locator. The source snapshot and verification commits remain ancestors of that merge. No ongoing product state is maintained in this folder.

## Restore without disturbing ongoing work

Use a separate directory and the exact checkpoint commit. Do not reset the existing work checkout. For example, clone the repository into a new directory, then use `git switch --detach <checkpoint-merge-SHA>`. Run the root read-only verification commands before using the restored copy:

```text
node tools/verify-bootstrap.mjs
node handoff/tools/check-implementation-state.mjs --current
node --test --test-isolation=none tools/verify-bootstrap.test.mjs
```

Use Node.js **25.5.0**. In `production`, install the locked dependencies with `npm ci`, then run `npm run typecheck`. To reproduce the candidate with its visible build identity, run `node tools/build-candidate.mjs <absolute-fresh-output-directory> <absolute-path-to-production/evidence/s06/owner-corrections-01/build-01/build-metadata.json>`. Compare the generated files with the hashes in the existing build manifest. Plain `npm run dev` is useful for development but is not proof that the historical candidate artifact was reproduced.

The already-built candidate is also preserved at `production/evidence/s06/owner-corrections-01/build-01/candidate-web.tar.gz`; verify its SHA-256 against the adjacent build manifest, extract it into a fresh directory, and serve it over localhost HTTP. The `preview-extras` folder here preserves the current guide and sample documents previously available only in the ignored local preview directory. Copy those beside the extracted entry if the guide is needed. Absolute paths and process IDs in old preview receipts are historical; allocate a new localhost endpoint when restoring.

## Deliberately outside the repository snapshot

Dependency installations, generated `dist`, temporary verification checkouts, test-run caches, live server processes and the transient `production/debug.log` are not source requirements. Recreate dependencies/builds from the lockfile and the preserved artifact. The capture manifest records their disposition; the debug log is retained locally without publishing it.

This is a repository/build checkpoint, not an image of the entire computer or browser profile. Credentials, browser IndexedDB/Personal data, unsaved browser graphs and external TouchDesigner state are not copied or claimed recoverable here. Do not infer native Host, physical-device or full UX qualification from the localhost recovery check.

## Next workflow

After the merge is verified, continue on the existing `work` branch under [CONTINUOUS_DELIVERY](../../../../workflow/CONTINUOUS_DELIVERY.md). The Owner will paste a direct run instruction into **Grape Coordinator**; PM must not relay a dispatch or start the run as part of this checkpoint. The Coordinator first recovers actual state and current unreviewed obligations, then follows the new policy once that direct instruction is received.
