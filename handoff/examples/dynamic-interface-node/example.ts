/** THIS IS NOT THE PRODUCTION IMPLEMENTATION. Exact AC-002 dynamic NodeType example. */
import type { Json, NodeModule, NodeType, PortSpec, TypeRef } from '../../executable-reference/contracts.ts';

export const packRef: TypeRef = { moduleId: 'handoff.dynamic-node', typeId: 'pack', version: '1', fingerprint: 'handoff-dynamic-node-v1' };
const object = (v: Json): v is { [key: string]: Json } => v !== null && typeof v === 'object' && !Array.isArray(v);
const validate = (state: Json): string[] => object(state) && Object.keys(state).length === 1 && (state.mode === 'pair' || state.mode === 'color') ? [] : ['Expected mode pair or color'];
const keys = (state: Json) => object(state) && state.mode === 'color' ? ['r', 'g', 'b', 'a'] : ['r', 'g'];
const ports = (state: Json): PortSpec[] => [
  ...keys(state).map((key): PortSpec => ({ key, direction: 'input', type: 'float', supply: 'local', default: key === 'a' ? 1 : 0 })),
  { key: 'out', direction: 'output', type: keys(state).length === 4 ? 'vec4' : 'vec2' },
];
export const pack: NodeType = {
  ref: packRef, role: 'operation', stages: ['vertex', 'pixel'], invalidEdgePolicy: 'detach',
  stateCodec: { schemaVersion: 1, validate },
  initialize: args => ({ state: args === null ? { mode: 'color' } : structuredClone(args) }),
  ports,
  parameters: state => [
    {
      key: 'mode', target: { kind: 'state', key: 'mode' },
      presentation: {
        widget: 'core.menu', fallback: 'none',
        // Handoff template convention carried by the sealed free-form options field.
        // A renderer can enumerate these choices without inspecting this NodeType.
        options: {
          schema: 'handoff.menu-items.v1',
          items: [
            { value: 'pair', label: 'Pair (vec2)' },
            { value: 'color', label: 'Color (RGBA)' },
          ],
        },
      },
    },
    ...keys(state).map(key => ({ key, target: { kind: 'input' as const, key }, presentation: 'number' as const })),
  ],
  validate,
  emit: (state, context) => {
    const type = keys(state).length === 4 ? 'vec4' : 'vec2';
    return { outputs: { out: { type, code: `${type}(${keys(state).map(key => context.input(key).code).join(', ')})` } } };
  },
};
export const dynamicNodeModule: NodeModule = {
  manifest: { id: packRef.moduleId, version: packRef.version, fingerprint: packRef.fingerprint, coreApiVersion: 1, dependencies: [], source: 'examples/dynamic-interface-node/example.ts', license: 'Architecture handoff example; not a production module' },
  types: [pack],
};
