/** THIS IS NOT THE PRODUCTION IMPLEMENTATION. Exact AC-002 NodeModule example. */
import type { Json, NodeModule, NodeType, TypeRef } from '../../executable-reference/contracts.ts';

export const scaleRef: TypeRef = {
  moduleId: 'handoff.minimal-node', typeId: 'scale', version: '1',
  fingerprint: 'handoff-minimal-node-v1',
};
const validate = (value: Json): string[] =>
  value !== null && typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0
    ? [] : ['Expected empty state'];

export const scale: NodeType = {
  ref: scaleRef, role: 'operation', stages: ['vertex', 'pixel'],
  stateCodec: { schemaVersion: 1, validate },
  initialize: () => ({ state: {} }),
  ports: () => [
    { key: 'value', direction: 'input', type: 'float', supply: 'local', default: 0 },
    { key: 'factor', direction: 'input', type: 'float', supply: 'local', default: 1 },
    { key: 'out', direction: 'output', type: 'float' },
  ],
  parameters: () => ['value', 'factor'].map(key => ({ key, target: { kind: 'input' as const, key }, presentation: 'number' as const })),
  validate,
  emit: (_state, context) => ({ outputs: {
    out: { type: 'float', code: `(${context.input('value').code} * ${context.input('factor').code})` },
  } }),
};
export const minimalNodeModule: NodeModule = {
  manifest: {
    id: scaleRef.moduleId, version: scaleRef.version, fingerprint: scaleRef.fingerprint,
    coreApiVersion: 1, dependencies: [], source: 'examples/minimal-node/example.ts',
    license: 'Architecture handoff example; not a production module',
  },
  types: [scale],
};
