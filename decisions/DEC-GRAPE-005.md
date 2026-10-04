# DEC-GRAPE-005 — Optional Image Output color, exact revision 0.3

Status: accepted bounded product requirement; implementation acceptance not granted.
Slice: S06, Owner corrections OC01. Source: `production/evidence/coordinator/s06/owner-corrections-01/human-control-01.json`, SHA256 `b1e1efcb141795df3555a10ff62783669f26831b6787ad35d56b0ad0e7f75527`; execution scope is `implementer-packet-02.json` SHA256 `86c624f0951e15866c3d20a36c701ee4f93de6063f2240640b5b7d7835a96404`.

The Human Owner requires an unconnected Image Output color to be valid and output RGBA `(0, 0, 0, 0)`, including zero alpha. This supersedes only the required-connection wording of DEC-GRAPE-002 and AC-GRAPE-001 for the new exact Image Output and GraphKind revision. Those accepted documents and their existing 0.1/0.2 pins remain immutable and retain their original behavior.

The mandatory stage boundary still emits `glsl.vec4`. Connected float/vec2/vec3/vec4 conversions retain the accepted table. Other required inputs, Vertex Output, adaptation admission, capability/profile limits, and canonical Graph ownership do not change.

New documents adopt the additive 0.3 definitions. Existing documents keep their exact definitions when opened. An explicit **Upgrade Image Output** command may migrate a supported old image GraphKind, its boundary schema/default and compatible image source descriptor owners together into a validated new load. It preserves authored node/resource IDs, connections and their plans, settings, inactive loss/recovery evidence and old module entries; it is not a one-Undo content replacement. The original **Upgrade subgraph owners** command retains its resource-only scope. Save persists the explicitly adopted new pins.

The new source owner delegates the already supported portable source descriptor rules under the new exact GraphKind. This adds no native runtime, source kinds, type conversions or provider fallback. Old owner definitions remain unchanged.

The broader Owner correction round is delivered for Human-first localhost inspection after self-checks. It is not independent technical PASS, whole-S06 acceptance, publication or merge. OC11 layering and the right-click socket placement route remain deferred; automatic code generation remains withdrawn.
