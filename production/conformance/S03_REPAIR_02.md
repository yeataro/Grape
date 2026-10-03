# S03 repair round2: preserve narrow source clipboard admission

This bounded repair retains finding group `S03-FR-7c6c6ce-01:FR01-FR03-EG01`, with one unsuccessful repair/re-review round before round2. The independent round1 report closed FR01–FR03 and left EG01 open for cross-Graph/new-load inline array constants.

The existing exact-owner source policy now admits only inline scalar/vector/matrix numeric constants and uniforms on clipboard import. Valid inline array construction, document load and same Graph+load source reuse are unchanged. Native-array descriptors remain a separate positive branch with their established element, typed extent and path rules. No contract or scope decision changed.

Two old positive expectations were corrected: symbolic closure transfer uses an admitted native-array descriptor; a2049-element inline array remains valid for construction and same-load reuse but rejects cross-Graph clipboard import. New tests use actual distinct destination Graphs and fresh loads, not a changed packet identity alone. They assert full snapshot/revision/resources, History, seeded Redo and notifications, retain the source Graph, and cover implicit constants, explicit constants and uniforms for both float[2] and vec2[2]. Adjacent scalar/vector/matrix controls succeed in real different Graphs and new loads with one Undo operation. Browser regressions expose SOURCE_CLIPBOARD_DENIED and preserve Redo for both array types.

Historical repair01 mappings and evidence remain unchanged. New repair02 coverage corrects the prior overbroad phrase numeric-array transfer. Required full checks retain the native descriptor and closed FR01–FR03 regressions. Technical re-review, Human acceptance and remote publication remain separate from this implementation record.
