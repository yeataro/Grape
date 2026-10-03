S04 delivers Personal/Library subgraph assets with validated dependency closure and reference remapping, including literal, source-bound, input-bound and nested portable roundtrips. It also adds the accepted float/vector edge conversions and current Image Output admission, with document 2.1 / codec-v2 compatibility while preserving old exact definitions.

Human Owner accepted this tested scope and requested the PR in message 01a103fe-206e-7f43-9627-43b0d2197de0: “測試通過OK，請發起PR。” Current state records S04 complete and no active Slice. Merge and the next Slice are not authorized.

- Implementation I: `0c13932150bf1b78f215e25721292962e6c4263a`
- Independent reviewed R: `985357be67cce2f2ecc232e827e83e5cdbb521ab`; S04-FR-985357b-01 PASS, no remaining findings/evidence gaps.
- Evidence persistence P: `1f55f73dde5dbf14ab77b1856fee161bf10a28a0`
- Completion B: `835726428f0259462c36833e0aaf9d1e72160bab`
- Published metadata head B: `9a04ae7068d436c0a2ca953c89f9ad1c6e227923`; the final four-file followup preserves late operational receipts. Source/tests/tools/config/dependencies/build/decisions/handoff and original evidence are unchanged from R. Product PASS remains bound to I/R.
- Build: `S04-web-0c13932`, archive SHA256 `24b1420e04871cd76cc2a3745b1d7100aadba43db632dfa809975327e312d3b1`.

Independent validation passed all 11 acceptance families: 179 unit/conformance tests, 54 browser tests, 10 bootstrap fixtures, 9 additional reviewer counterexample groups and an exact archived-build UI check. Closeout root verification passed 471 checks (411 indexed files), current-state validation and 10 fixture tests; 1,479 original R blobs remain exact. Newly authored metadata passes whitespace checks. Raw Coordinator CRLF bytes are deliberately preserved, with default Git whitespace diagnostics recorded rather than normalized.

[Accepted scope](https://github.com/yeataro/Grape/blob/9a04ae7068d436c0a2ca953c89f9ad1c6e227923/production/evidence/acceptance/s04/closeout-20261004-01/accepted-scope-01.json) · [Operator guide and exact samples](https://github.com/yeataro/Grape/blob/9a04ae7068d436c0a2ca953c89f9ad1c6e227923/production/evidence/acceptance/s04/closeout-20261004-01/OPERATOR-GUIDE-01.md) · [Original independent report](https://github.com/yeataro/Grape/blob/9a04ae7068d436c0a2ca953c89f9ad1c6e227923/production/evidence/s04/review-01/independent-review/INDEPENDENT_REVIEW_RESULT.json)

Scope remains Windows x64 / Chromium 151.0.7922.34 / WebGL2 / browser-origin storage. Personal insertion requires a fully valid destination graph; nested means nested graph/reference dependencies, not arrays-of-arrays. Storage ACK is transaction completion, not disk/crash/cloud durability. Full DEC003/AC002 function mode is NOT_DELIVERED, its 10 cases remain REQUIRED_NOT_EXECUTED. S02 legacy converter remains blocked; full Legacy catalog, native Host/TouchDesigner and other platform/device qualification are excluded. No global Gate closure. Appearance work remains for separately authorized S06 with the Legacy UI/UX reference requirement; S05/S06 are not started.
