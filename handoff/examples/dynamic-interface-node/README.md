# Minimal dynamic-interface node

**THIS IS NOT THE PRODUCTION IMPLEMENTATION.** `example.ts` contributes a NodeModule through the exact copied AC-002 interfaces. It does not implement another mutation/reconciliation system.

The module defines `mode`, its state codec, derived ports, parameters and lowering. Changing color (`vec4`) to pair (`vec2`) uses `Parameter.write`. Core then updates ports, records the removed connection/value losses, publishes diagnostics and records one History entry. The module deliberately requests the existing `detach` policy. Save/reload preserves the invalid authored state; generation refuses it. Undo restores the entire valid state.

```powershell
# From the handoff root; Node 25.5.0, no npm runtime dependencies
node --test examples/dynamic-interface-node/example.test.ts
```

Three tests verify the lifecycle, atomic rejection of unsupported mode, and enumeration/selection through the real `ParameterWidgets` projection.

The mode parameter uses the sealed `ParameterPresentation` object form instead of bare `"menu"`:

```ts
{
  widget: 'core.menu',
  fallback: 'none',
  options: {
    schema: 'handoff.menu-items.v1',
    items: [
      { value: 'pair', label: 'Pair (vec2)' },
      { value: 'color', label: 'Color (RGBA)' }
    ]
  }
}
```

`handoff.menu-items.v1` is an explicitly named **handoff-template convention**, carried by the already available JSON `presentation.options` field. It is not a newly sealed core enum API. The copied `core.menu` widget transports these options to `ParameterView.body.options`; a generic menu renderer reads `schema` and `items`, displays each `label`, and sends the selected `value` to the existing `Parameter.write` boundary. It needs no special case for Pack or this module's type ID. The template's `items` is an ordered list of `{value: string, label: string}`; the state codec remains authoritative for allowed values. Labels do not enter GLSL or the authored mode value.

The core does not validate this example-specific options schema or provide the actual dropdown DOM renderer. A renderer must check the schema before using it; unknown presentation data must not become arbitrary accepted model state. Production localization, other enum value types and a shared public menu-options standard are outside this tiny example. No sealed core code changed, and these tests do not assert browser interaction, GPU support or complete legacy dynamic-node coverage.
