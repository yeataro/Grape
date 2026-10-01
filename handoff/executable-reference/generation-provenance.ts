import type { GenerationResult, Result } from "./contracts.ts";
import { ComputeContractError } from "./qualification-compute.ts";

type Span = NonNullable<GenerationResult["diagnosticMap"]>["spans"][number];
type Origin = Omit<Span, "stage" | "startLine" | "endLine">;
const immutable = <T>(v: T): T => {
  const result = structuredClone(v);
  const freeze = (x: any): void => { if (x && typeof x === "object") { Object.values(x).forEach(freeze); Object.freeze(x); } };
  freeze(result); return result;
};
const reject = (code: string, message: string): never => { throw new ComputeContractError(code, message); };

/** Mark code before profile assembly; strip only markers afterwards, retaining exact line numbers. */
export class GeneratedProvenance {
  #origins: Origin[] = [];
  mark(origin: { path: readonly string[]; definitionId?: string; portKey?: string }, code: string): string {
    if (!origin.path.length || origin.path.some(id => !id) || typeof code !== "string") reject("SOURCE_ORIGIN", "A trace requires a nonempty occurrence path and code");
    const id = this.#origins.length;
    this.#origins.push(immutable({ ...origin, path: [...origin.path] }));
    return `/*__grape_trace_begin_${id}__*/${code}/*__grape_trace_end_${id}__*/`;
  }
  finish(rendered: { vertex: string; pixel: string }, requiredCode?: string): { vertex: string; pixel: string; spans: Span[] } {
    const spans: Span[] = [], seen = new Set<number>();
    const clean = (stage: "vertex" | "pixel", text: string): string => {
      if (/^\s*#\s*line\b/m.test(text)) reject("SOURCE_LINE_DIRECTIVE", "A #line backend needs its own declared logical-to-physical line mapping");
      const stack: { id: number; line: number }[] = [];
      let prior = 0, line = 1, code = "";
      for (const token of text.matchAll(/\/\*__grape_trace_(begin|end)_(\d+)__\*\//g)) {
        const chunk = text.slice(prior, token.index); code += chunk;
        line += (chunk.match(/\n/g) ?? []).length; prior = token.index! + token[0].length;
        const id = Number(token[2]);
        if (!this.#origins[id]) reject("SOURCE_MARKER", "Unknown source marker");
        if (token[1] === "begin") stack.push({ id, line });
        else {
          const start = stack.pop();
          if (!start || start.id !== id) reject("SOURCE_MARKER", "Profile altered source marker nesting");
          seen.add(id); spans.push({ ...this.#origins[id], stage, startLine: start!.line, endLine: Math.max(start!.line, code.endsWith("\n") ? line - 1 : line) });
        }
      }
      if (stack.length) reject("SOURCE_MARKER", "Unclosed source marker");
      return code + text.slice(prior);
    };
    const vertex = clean("vertex", rendered.vertex), pixel = clean("pixel", rendered.pixel);
    const required = requiredCode === undefined ? this.#origins.map((_, id) => id) : [...requiredCode.matchAll(/\/\*__grape_trace_begin_(\d+)__\*\//g)].map(match => Number(match[1]));
    if (required.some(id => !seen.has(id))) reject("SOURCE_MARKER", "Profile discarded a mapped code fragment");
    return { vertex, pixel, spans: immutable(spans) };
  }
}

export interface DiagnosticTarget {
  hostId: string; targetId: string; incarnation: string; epoch: number;
}
export interface DiagnosticBindingSpec {
  target: DiagnosticTarget;
  requestId: string;
  shapeId: string;
  loadId: string;
  deliveryRevision: number;
  sources: { sourceId: string; stage: "vertex" | "pixel"; lineOffset: number }[];
}
export interface NativeDiagnosticReceipt {
  target: DiagnosticTarget;
  requestId: string;
  shapeId: string;
  artifactKey: string;
  sourceId: string;
  line: number;
  message: string;
}

/** An adapter binds actual compiler-source names/offsets to one delivery, never to Graph.current. */
export function bindGeneratedDiagnostics(artifact: GenerationResult, spec: DiagnosticBindingSpec) {
  if (!artifact.diagnosticMap) reject("SOURCE_MAP_MISSING", "Artifact has no line provenance");
  if (spec.loadId !== artifact.loadId || !spec.requestId || !spec.shapeId || !Number.isInteger(spec.deliveryRevision) || spec.deliveryRevision < artifact.revision)
    reject("SOURCE_BINDING", "Delivery and artifact provenance do not match");
  if (new Set(spec.sources.map(s => s.sourceId)).size !== spec.sources.length || spec.sources.some(s => !s.sourceId || !["vertex", "pixel"].includes(s.stage) || !Number.isInteger(s.lineOffset) || s.lineOffset < 0))
    reject("SOURCE_BINDING", "Compiler source binding must have unique names and nonnegative prefix line offsets");
  const data = immutable(artifact), binding = immutable(spec);
  const sameTarget = (target: DiagnosticTarget) => target.hostId === binding.target.hostId && target.targetId === binding.target.targetId && target.incarnation === binding.target.incarnation && target.epoch === binding.target.epoch;
  return Object.freeze({
    resolve(receipt: NativeDiagnosticReceipt): Result<{ message: string; spans: Span[]; artifactRevision: number; deliveryRevision: number; loadId: string }> {
      if (!sameTarget(receipt.target) || receipt.requestId !== binding.requestId || receipt.shapeId !== binding.shapeId || receipt.artifactKey !== data.diagnosticMap!.artifactKey)
        return { ok: false, error: { code: "STALE_DIAGNOSTIC", message: "Diagnostic does not belong to this exact artifact delivery and target shape" } };
      const source = binding.sources.find(s => s.sourceId === receipt.sourceId);
      if (!source || !Number.isInteger(receipt.line) || receipt.line < 1)
        return { ok: false, error: { code: "DIAGNOSTIC_SOURCE", message: "Unknown compiler source or line" } };
      const line = receipt.line - source.lineOffset;
      const spans = data.diagnosticMap!.spans.filter(span => span.stage === source.stage && span.startLine <= line && span.endLine >= line).sort((a, b) => b.path.length - a.path.length);
      return { ok: true, value: immutable({ message: receipt.message, spans, artifactRevision: data.revision, deliveryRevision: binding.deliveryRevision, loadId: data.loadId }) };
    },
  });
}
