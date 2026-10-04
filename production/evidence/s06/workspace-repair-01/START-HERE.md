# S06 workspace repair candidate

Build **S06-repair-11e43c8**, implementation **11e43c8f3bda995ba017b5a4790ddb461a3ebd62**. This is a tested candidate awaiting independent re-review; S06 is active and unaccepted. The currently served4197 version remains the prior candidate. Coordinator will provide the matching localhost entry after review; this repair did not change that service.

- Open **Shortcuts**. Press outside the left edge, drag into the dialog and release: Help stays open.
- Press inside Help, drag outside and release: Help stays open.
- Click entirely outside: Help closes and focus returns to the opener. Escape and **Close shortcuts** also return focus. Reopen using the keyboard; Tab stays inside.
- Create a Multiply node, repeat these Help gestures, then Undo: only the node creation is undone. Redo restores it. Help adds no graph History.
- Open **Second Canvas**, invoke **Keyboard shortcuts** from its object menu or toolbar, and close it. Focus returns to that Canvas/opener without opening or closing the other Canvas help.
- Existing natural drag Escape remains included: during a primary node drag press Escape and release. The node returns to its starting position with no committed drag History entry.
- The directly available [color sample](samples/workspace-color.grape.json) can be opened with **Open file → Review document → Open in new session**, then **Generate GLSL**. This exercises the existing supported profile; no native host is required.

Automatic evidence: source51, archived public33, archive5 (including actual WebGL2 readback64/128/191/255), unit/conformance239, root fixtures10. Counts overlap and are not distinct acceptance totals. Pointercancel/blur injections exercise event boundaries; they are not a physical-device claim. Original failed runs and independent FAIL are preserved. The14 old missing attachments are added as original bytes, not reconstructed.

Unchanged exclusions: full99UI/391catalog, additional Panel/layout/preset scope, native TouchDesigner, physical GPU/device/all-IME qualification and global Gate closure. G-PD-2 remains open. Owner removed LAN/Tailscale delivery requirements; historical checks remain NOT_EXECUTED. No Human acceptance, deployment or remote publication is claimed.

Reviewer reproduction from repository root: copy the archived harnesses to the same filenames in .verification, then run the browser harness with archive mode, a NEW output name, build-01/build-manifest.json and production's s06-help.spec.ts (see execution.json for exact arguments). It verifies and extracts the archive, starts a temporary127.0.0.1 listener, uses a disposable browser/cwd, and closes the listener. Every run requires a new absolute S06 evidence/output path. The built-in production/tools/s06-archive-check.ts accepts explicit --manifest, --output and --scratch plus GRAPE_EVIDENCE_DIR; its exact invocation is bound in submission. Never run against Human storage or replace4197.
