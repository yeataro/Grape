import type {ParameterSpec} from './contracts.ts';
// Compile-time witness: presentation metadata is not a GLSL value type.
export const booleanPresentation:ParameterSpec={key:'enabled',target:{kind:'input',key:'enabled'},presentation:{widget:'core.boolean',fallback:'auto'}};
export const colorPresentation:ParameterSpec={key:'color',target:{kind:'input',key:'color'},presentation:{widget:'core.color',options:{labels:['R','G','B']}}};
export const matrixPresentation:ParameterSpec={key:'matrix',target:{kind:'input',key:'matrix'},presentation:{widget:'core.matrix',options:{major:'column'}}};
