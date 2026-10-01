/** Qualification command/projection boundaries; pure core, injected delivery, no DOM/host API. */
import { ApiError, canonical, copy, freeze } from "./core.ts";
import type { Graph, EditorContext } from "./core.ts";
import type {
  Result,
  GraphDocument,
  Snapshot,
  NodeRecord,
  Json,
} from "./contracts.ts";
import { NestedNetworkEditorQualification } from "./qualification-workspace.ts";
const ok = <T>(value: T): Result<T> => ({ ok: true, value });
const bad = (code: string, message: string): Result<never> => ({
  ok: false,
  error: { code, message },
});
function requireIt(
  value: unknown,
  code: string,
  message: string,
): asserts value {
  if (!value) throw new ApiError(code, message);
}
function attempt<T>(fn: () => T): Result<T> {
  try {
    return ok(fn());
  } catch (e) {
    return bad(e instanceof ApiError ? e.code : "ACTION_FAILED", String(e));
  }
}

export interface LayoutNode {
  id: string;
  order: number;
  position: [number, number];
  width: number;
  height: number;
  inputKeys: string[];
  outputKeys: string[];
}
export interface LayoutWire {
  from: { nodeId: string; key: string };
  to: { nodeId: string; key: string };
}
export interface LayoutInput {
  nodes: LayoutNode[];
  edges: LayoutWire[];
  reverse: boolean;
  gap: [number, number];
}
export interface LayoutPositions {
  positions: { id: string; position: [number, number] }[];
}
export type LayoutAlgorithm = (input: Readonly<LayoutInput>) => LayoutPositions;
/** Bounded demonstrator: SCC condensation, selected-only weak components, stable graph order. */
export const rankedLayout: LayoutAlgorithm = (input) => {
  const nodes = [...input.nodes].sort((a, b) => a.order - b.order),
    byId = new Map(nodes.map((n) => [n.id, n]));
  const links = input.edges.filter(
    (e) => byId.has(e.from.nodeId) && byId.has(e.to.nodeId),
  );
  const forward = new Map(nodes.map((n) => [n.id, [] as string[]]));
  for (const e of links)
    forward
      .get(input.reverse ? e.to.nodeId : e.from.nodeId)!
      .push(input.reverse ? e.from.nodeId : e.to.nodeId);
  const index = new Map<string, number>(),
    low = new Map<string, number>(),
    stack: string[] = [],
    active = new Set<string>(),
    scc: string[][] = [];
  let serial = 0;
  function visit(id: string) {
    index.set(id, serial);
    low.set(id, serial++);
    stack.push(id);
    active.add(id);
    for (const to of forward.get(id)!) {
      if (!index.has(to)) {
        visit(to);
        low.set(id, Math.min(low.get(id)!, low.get(to)!));
      } else if (active.has(to))
        low.set(id, Math.min(low.get(id)!, index.get(to)!));
    }
    if (low.get(id) === index.get(id)) {
      const group: string[] = [];
      let member: string;
      do {
        member = stack.pop()!;
        active.delete(member);
        group.push(member);
      } while (member !== id);
      scc.push(group.sort((a, b) => byId.get(a)!.order - byId.get(b)!.order));
    }
  }
  nodes.forEach((n) => {
    if (!index.has(n.id)) visit(n.id);
  });
  const groupOf = new Map(
      scc.flatMap((g, i) => g.map((id) => [id, i] as const)),
    ),
    ranks = new Map<number, number>();
  function rank(g: number): number {
    const old = ranks.get(g);
    if (old !== undefined) return old;
    let value = 0;
    for (const [from, tos] of forward)
      for (const to of tos)
        if (groupOf.get(to) === g && groupOf.get(from) !== g)
          value = Math.max(value, rank(groupOf.get(from)!) + 1);
    ranks.set(g, value);
    return value;
  }
  scc.forEach((_, i) => rank(i));
  const weak = new Map(nodes.map((n) => [n.id, new Set<string>()]));
  for (const e of links) {
    weak.get(e.from.nodeId)!.add(e.to.nodeId);
    weak.get(e.to.nodeId)!.add(e.from.nodeId);
  }
  const seen = new Set<string>(),
    components: string[][] = [];
  for (const n of nodes) {
    if (seen.has(n.id)) continue;
    const queue = [n.id],
      component: string[] = [];
    seen.add(n.id);
    for (let i = 0; i < queue.length; i++) {
      const id = queue[i];
      component.push(id);
      for (const to of weak.get(id)!) {
        if (!seen.has(to)) {
          seen.add(to);
          queue.push(to);
        }
      }
    }
    components.push(component);
  }
  components.sort(
    (a, b) =>
      Number(!a.some((id) => weak.get(id)!.size)) -
        Number(!b.some((id) => weak.get(id)!.size)) ||
      Math.min(...a.map((id) => byId.get(id)!.order)) -
        Math.min(...b.map((id) => byId.get(id)!.order)),
  );
  const origin: [number, number] = [
    Math.min(...nodes.map((n) => n.position[0])),
    Math.min(...nodes.map((n) => n.position[1])),
  ];
  const positions: LayoutPositions["positions"] = [];
  let top = origin[1];
  for (const component of components) {
    const cols = new Map<number, LayoutNode[]>();
    for (const id of component) {
      const r = ranks.get(groupOf.get(id)!)!;
      cols.set(r, [...(cols.get(r) || []), byId.get(id)!]);
    }
    let left = origin[0],
      height = 0;
    for (const r of [...cols.keys()].sort((a, b) => a - b)) {
      const column = cols.get(r)!;
      const portOrder = (n: LayoutNode) => {
        const incoming = links
          .filter((e) => (input.reverse ? e.from.nodeId : e.to.nodeId) === n.id)
          .map((e) => {
            const source = byId.get(
              input.reverse ? e.to.nodeId : e.from.nodeId,
            )!;
            return (
              source.order * 10000 +
              (input.reverse
                ? source.inputKeys.indexOf(e.to.key)
                : source.outputKeys.indexOf(e.from.key))
            );
          });
        return incoming.length ? Math.min(...incoming) : n.order * 10000;
      };
      column.sort((a, b) => portOrder(a) - portOrder(b) || a.order - b.order);
      let y = top;
      for (const n of column) {
        positions.push({ id: n.id, position: [left, y] });
        y += n.height + input.gap[1];
      }
      height = Math.max(height, y - top);
      left += Math.max(...column.map((n) => n.width)) + input.gap[0];
    }
    top += height + input.gap[1];
  }
  return { positions };
};
export interface NetworkLayoutCapture {
  graphId: string;
  loadId: string;
  revision: number;
  stageId: string;
  scopeId: string;
  path: string[];
  navigationRevision: number;
  resourceId: string | null;
  nodes: readonly NodeRecord[];
  edges: LayoutWire[];
}
/** Adapter owns scoped read/validate/write; the algorithm sees only geometry, never a Graph clone. */
export interface NetworkLayoutTarget {
  capture(context: EditorContext): NetworkLayoutCapture;
  validate(context: EditorContext, capture: NetworkLayoutCapture): void;
  apply(
    context: EditorContext,
    capture: NetworkLayoutCapture,
    positions: LayoutPositions["positions"],
  ): Result<void>;
}
function captureStamp(
  context: EditorContext,
): Omit<NetworkLayoutCapture, "nodes" | "edges" | "resourceId"> {
  requireIt(!context.disposed, "CONTEXT_CLOSED", "Context is closed");
  const snapshot = context.graph.snapshot(),
    scope = context.activeNetwork;
  return {
    graphId: snapshot.document.id,
    loadId: snapshot.loadId,
    revision: snapshot.revision,
    stageId: context.stageId,
    scopeId: scope.id,
    path: [...scope.path],
    navigationRevision: context.navigationRevision,
  };
}
function validateStamp(
  context: EditorContext,
  capture: NetworkLayoutCapture,
): void {
  const current = captureStamp(context);
  requireIt(
    canonical(current) ===
      canonical({
        graphId: capture.graphId,
        loadId: capture.loadId,
        revision: capture.revision,
        stageId: capture.stageId,
        scopeId: capture.scopeId,
        path: capture.path,
        navigationRevision: capture.navigationRevision,
      }),
    "STALE_LAYOUT",
    "Graph or network occurrence changed",
  );
}
function validateLayoutPositions(
  capture: NetworkLayoutCapture,
  positions: LayoutPositions["positions"],
): void {
  requireIt(
    new Set(positions.map((p) => p.id)).size === positions.length &&
      positions.every(
        (p) =>
          capture.nodes.some((n) => n.id === p.id) &&
          Array.isArray(p.position) &&
          p.position.length === 2 &&
          p.position.every(Number.isFinite),
      ),
    "LAYOUT_RESULT",
    "Positions must be finite, unique and scoped",
  );
}
export class RootNetworkLayoutTarget implements NetworkLayoutTarget {
  capture(context: EditorContext): NetworkLayoutCapture {
    const stamp = captureStamp(context);
    requireIt(
      !stamp.path.length,
      "LAYOUT_TARGET",
      "Root adapter cannot capture a nested scope",
    );
    const stage = context.activeStage.record;
    return freeze({
      ...stamp,
      resourceId: null,
      nodes: copy(stage.nodes),
      edges: copy(stage.edges),
    });
  }
  validate(context: EditorContext, capture: NetworkLayoutCapture): void {
    validateStamp(context, capture);
    requireIt(
      capture.resourceId === null && !capture.path.length,
      "LAYOUT_TARGET",
      "Root scope expected",
    );
  }
  apply(
    context: EditorContext,
    capture: NetworkLayoutCapture,
    positions: LayoutPositions["positions"],
  ): Result<void> {
    const check = attempt(() => {
      this.validate(context, capture);
      validateLayoutPositions(capture, positions);
    });
    if (!check.ok) return check;
    return context.change("Arrange nodes", (draft) => {
      for (const p of positions) draft.move(p.id, p.position);
    });
  }
}
export class NestedNetworkLayoutTarget implements NetworkLayoutTarget {
  capture(context: EditorContext): NetworkLayoutCapture {
    const stamp = captureStamp(context),
      editor = new NestedNetworkEditorQualification(context),
      view = editor.inspectPath();
    requireIt(
      stamp.path.length &&
        view.resourceId &&
        view.resource?.body.kind === "network",
      "LAYOUT_TARGET",
      "Nested network expected",
    );
    return freeze({
      ...stamp,
      resourceId: view.resourceId,
      nodes: copy(editor.resolvedNodes()),
      edges: copy(view.resource.body.edges),
    });
  }
  validate(context: EditorContext, capture: NetworkLayoutCapture): void {
    validateStamp(context, capture);
    const current = new NestedNetworkEditorQualification(context).inspectPath();
    requireIt(
      capture.resourceId !== null &&
        current.resourceId === capture.resourceId &&
        current.resource?.body.kind === "network",
      "STALE_LAYOUT",
      "Nested definition identity changed",
    );
  }
  apply(
    context: EditorContext,
    capture: NetworkLayoutCapture,
    positions: LayoutPositions["positions"],
  ): Result<void> {
    return attempt(() => {
      this.validate(context, capture);
      validateLayoutPositions(capture, positions);
      const view = new NestedNetworkEditorQualification(context).inspectPath(),
        next = copy(view.resource!);
      requireIt(
        next.body.kind === "network",
        "LAYOUT_TARGET",
        "Nested network expected",
      );
      for (const p of positions) {
        const node = next.body.nodes.find((n) => n.id === p.id);
        requireIt(node, "LAYOUT_NODE", "Scoped node missing");
        node.position = copy(p.position);
      }
      const result = context.change("Arrange nested nodes", (draft) =>
        draft.putResource(view.resourceId!, next as unknown as Json),
      );
      if (!result.ok)
        throw new ApiError(result.error.code, result.error.message);
    });
  }
}
export interface LayoutProposal {
  contextId: string;
  scope: NetworkLayoutCapture;
  geometryRevision: number;
  selection: string[];
  positions: LayoutPositions["positions"];
}
export class AutoLayout {
  #algorithm: LayoutAlgorithm;
  #target: NetworkLayoutTarget;
  #issued = new WeakSet<LayoutProposal>();
  constructor(
    algorithm: LayoutAlgorithm = rankedLayout,
    target: NetworkLayoutTarget = new RootNetworkLayoutTarget(),
  ) {
    this.#algorithm = algorithm;
    this.#target = target;
  }
  propose(
    context: EditorContext,
    extent: Record<string, { width: number; height: number }>,
    geometryRevision: number,
    reverse = false,
  ): Result<LayoutProposal> {
    return attempt(() => {
      const scope = this.#target.capture(context),
        selection = [...context.selection.items];
      requireIt(
        selection.length >= 2,
        "LAYOUT_SELECTION",
        "Select at least two nodes",
      );
      requireIt(
        Number.isSafeInteger(geometryRevision),
        "LAYOUT_GEOMETRY",
        "Invalid geometry revision",
      );
      const nodes = scope.nodes
        .filter((n) => selection.includes(n.id))
        .map((n) => {
          const size = extent[n.id];
          requireIt(
            size &&
              Number.isFinite(size.width) &&
              size.width > 0 &&
              Number.isFinite(size.height) &&
              size.height > 0,
            "LAYOUT_GEOMETRY",
            "Missing finite card size",
          );
          return {
            id: n.id,
            order: scope.nodes.indexOf(n),
            position: copy(n.position),
            ...size,
            inputKeys: n.ports
              .filter((p) => p.direction === "input")
              .map((p) => p.key),
            outputKeys: n.ports
              .filter((p) => p.direction === "output")
              .map((p) => p.key),
          };
        });
      requireIt(
        nodes.length === selection.length,
        "LAYOUT_SELECTION",
        "Selection not in captured scope",
      );
      const result = this.#algorithm(
        freeze({ nodes, edges: copy(scope.edges), reverse, gap: [96, 48] }),
      );
      requireIt(
        result.positions.length === selection.length &&
          new Set(result.positions.map((p) => p.id)).size ===
            selection.length &&
          result.positions.every(
            (p) =>
              selection.includes(p.id) &&
              Array.isArray(p.position) &&
              p.position.length === 2 &&
              p.position.every(Number.isFinite),
          ),
        "LAYOUT_RESULT",
        "Algorithm may propose exactly the selected positions",
      );
      const proposal = freeze({
        contextId: context.id,
        scope,
        geometryRevision,
        selection,
        positions: copy(result.positions),
      });
      this.#issued.add(proposal);
      return proposal;
    });
  }
  apply(
    context: EditorContext,
    proposal: LayoutProposal,
    geometryRevision: number,
  ): Result<void> {
    const check = attempt(() => {
      requireIt(
        this.#issued.has(proposal),
        "LAYOUT_PROPOSAL",
        "Proposal was not issued or already applied",
      );
      requireIt(
        context.id === proposal.contextId &&
          geometryRevision === proposal.geometryRevision &&
          canonical(context.selection.items) === canonical(proposal.selection),
        "STALE_LAYOUT",
        "Context/selection/geometry changed",
      );
      this.#target.validate(context, proposal.scope);
    });
    if (!check.ok) return check;
    const applied = this.#target.apply(
      context,
      proposal.scope,
      proposal.positions,
    );
    if (applied.ok) this.#issued.delete(proposal);
    return applied;
  }
}

export type TokenKind =
  | "plain"
  | "comment"
  | "directive"
  | "string"
  | "number"
  | "type"
  | "keyword"
  | "builtin"
  | "function";
export interface TextToken {
  kind: TokenKind;
  text: string;
}
export interface TokenSpan {
  kind: TokenKind;
  start: number;
  end: number;
}
export type CodeTokenizer = (text: string) => TokenSpan[];
const kinds = new Set<TokenKind>([
  "plain",
  "comment",
  "directive",
  "string",
  "number",
  "type",
  "keyword",
  "builtin",
  "function",
]);
export class CodeProjection {
  #tokenizers = new Map<string, CodeTokenizer>();
  register(id: string, tokenizer: CodeTokenizer): void {
    requireIt(
      id && !this.#tokenizers.has(id),
      "TOKENIZER_ID",
      "Duplicate/empty tokenizer",
    );
    this.#tokenizers.set(id, tokenizer);
  }
  project(
    language: string,
    text: string,
  ): Result<Readonly<{ language: string; text: string; tokens: TextToken[] }>> {
    return attempt(() => {
      const spans = this.#tokenizers.get(language)?.(text) || [
        { kind: "plain" as const, start: 0, end: text.length },
      ];
      let end = 0;
      for (const s of spans) {
        requireIt(
          kinds.has(s.kind) &&
            Number.isInteger(s.start) &&
            Number.isInteger(s.end) &&
            s.start === end &&
            s.end >= s.start &&
            s.end <= text.length,
          "TOKEN_SPAN",
          "Token partition must preserve all source text",
        );
        end = s.end;
      }
      requireIt(end === text.length, "TOKEN_SPAN", "Tokens lost source suffix");
      return freeze({
        language,
        text,
        tokens: spans.map((s) => ({
          kind: s.kind,
          text: text.slice(s.start, s.end),
        })),
      });
    });
  }
}
/** Small replaceable lexer: token support demonstration, not the full GLSL language grammar. */
export const glslTokens: CodeTokenizer = (text) => {
  const re =
    /(\/\*[\s\S]*?\*\/|\/\/[^\n]*|^[ \t]*#[^\n]*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?\b|\b[A-Za-z_]\w*\b)/gm;
  const out: TokenSpan[] = [];
  let end = 0;
  for (const m of text.matchAll(re)) {
    const start = m.index!;
    if (start > end) out.push({ kind: "plain", start: end, end: start });
    const token = m[0];
    let kind: TokenKind = "plain";
    if (token.startsWith("//") || token.startsWith("/*")) kind = "comment";
    else if (token.trimStart().startsWith("#")) kind = "directive";
    else if (/^['"]/.test(token)) kind = "string";
    else if (/^(?:\d|\.\d)/.test(token)) kind = "number";
    else if (
      /^(?:float|int|uint|bool|double|[biud]?vec[234]|mat[234])$/.test(token)
    )
      kind = "type";
    else if (
      /^(?:void|return|if|else|for|while|uniform|in|out|const)$/.test(token)
    )
      kind = "keyword";
    else if (/^(?:sin|cos|dot|mix|normalize|texture|clamp)$/.test(token))
      kind = "builtin";
    else if (/^\s*\(/.test(text.slice(start + token.length))) kind = "function";
    out.push({ kind, start, end: start + token.length });
    end = start + token.length;
  }
  if (end < text.length)
    out.push({ kind: "plain", start: end, end: text.length });
  return out;
};

export interface HelpSubject {
  kind: string;
  id: string;
}
export interface HelpQuery {
  networkPath: string[];
  scopeId: string;
  navigationRevision: number;
  contextId: string;
  stageId: string;
  subject: HelpSubject;
  locale: string;
  snapshot: Snapshot;
}
export interface HelpContent {
  title: string;
  paragraphs: string[];
}
export type HelpResolver = (
  query: Readonly<HelpQuery>,
) => HelpContent | Promise<HelpContent>;
export class HelpView {
  #resolvers = new Map<string, HelpResolver>();
  #request = 0;
  #value: HelpContent | null = null;
  #currentValid: (() => boolean) | null = null;
  register(kind: string, resolver: HelpResolver): void {
    requireIt(
      kind && !this.#resolvers.has(kind),
      "HELP_KIND",
      "Duplicate/empty resolver",
    );
    this.#resolvers.set(kind, resolver);
  }
  get value(): HelpContent | null {
    return this.#value && this.#currentValid?.()
      ? freeze(copy(this.#value))
      : null;
  }
  async show(
    context: EditorContext,
    subject: HelpSubject,
    locale: string,
  ): Promise<Result<HelpContent>> {
    const serial = ++this.#request;
    this.#value = null;
    this.#currentValid = null;
    const snap = context.graph.snapshot(),
      stageId = context.stageId,
      scope = context.activeNetwork,
      navigationRevision = context.navigationRevision,
      selection = canonical(context.objectSelection);
    if (context.disposed) return bad("CONTEXT_CLOSED", "Context is closed");
    const resolver = this.#resolvers.get(subject.kind);
    if (!resolver)
      return bad("HELP_UNAVAILABLE", "No resolver for this subject");
    try {
      const content = await resolver(
        freeze({
          contextId: context.id,
          stageId,
          subject: copy(subject),
          locale,
          snapshot: snap,
          networkPath: [...scope.path],
          scopeId: scope.id,
          navigationRevision,
        }),
      );
      requireIt(
        !context.disposed &&
          serial === this.#request &&
          context.graph.loadId === snap.loadId &&
          context.graph.revision === snap.revision &&
          context.stageId === stageId &&
          context.activeNetwork.id === scope.id &&
          context.navigationRevision === navigationRevision &&
          canonical(context.objectSelection) === selection,
        "STALE_HELP",
        "Context or request changed",
      );
      requireIt(
        typeof content.title === "string" &&
          Array.isArray(content.paragraphs) &&
          content.paragraphs.every((x) => typeof x === "string"),
        "HELP_CONTENT",
        "Help must be plain text",
      );
      this.#value = freeze({
        title: content.title,
        paragraphs: [...content.paragraphs],
      });
      this.#currentValid = () =>
        !context.disposed &&
        serial === this.#request &&
        context.graph.loadId === snap.loadId &&
        context.graph.revision === snap.revision &&
        context.stageId === stageId &&
        context.activeNetwork.id === scope.id &&
        context.navigationRevision === navigationRevision &&
        canonical(context.objectSelection) === selection;
      return ok(this.value!);
    } catch (e) {
      return bad(e instanceof ApiError ? e.code : "HELP_FAILED", String(e));
    }
  }
}
export interface DocumentPacket {
  requestId: string;
  graphId: string;
  loadId: string;
  revision: number;
  filename: string;
  mediaType: "application/json";
  bytes: Uint8Array;
}
export interface DocumentOutput {
  deliver(
    packet: DocumentPacket,
  ): Promise<{ status: "delivered" | "cancelled" }>;
}
export type DocumentNaming = (document: Readonly<GraphDocument>) => string;
export const grapeDocumentName: DocumentNaming = (document) =>
  document.kind === "td.mat" ? "Grape-MAT.json" : "Grape-TOP.json";
export class SnapshotDownload {
  #output: DocumentOutput;
  #serial = 0;
  #naming: DocumentNaming;
  constructor(
    output: DocumentOutput,
    naming: DocumentNaming = grapeDocumentName,
  ) {
    this.#output = output;
    this.#naming = naming;
  }
  async deliver(graph: Graph): Promise<
    Result<{
      requestId: string;
      revision: number;
      status: "delivered" | "cancelled";
    }>
  > {
    // Capture all fields before the first await; never call Graph.save or acknowledge dirty state.
    try {
      const snap = graph.snapshot(),
        requestId = graph.identity.newId() + ":" + ++this.#serial,
        filename = this.#naming(snap.document);
      requireIt(
        typeof filename === "string" &&
          filename.length > 0 &&
          !/[\\/\u0000-\u001f]/.test(filename),
        "OUTPUT_NAME",
        "Name must be a plain filename, not a path",
      );
      const text = JSON.stringify(snap.document, null, 2) + "\n",
        packet: DocumentPacket = {
          requestId,
          graphId: snap.document.id,
          loadId: snap.loadId,
          revision: snap.revision,
          filename,
          mediaType: "application/json",
          bytes: new TextEncoder().encode(text),
        };
      const receipt = await this.#output.deliver(packet);
      requireIt(
        receipt.status === "delivered" || receipt.status === "cancelled",
        "OUTPUT_RECEIPT",
        "Unknown output status",
      );
      return ok({ requestId, revision: snap.revision, status: receipt.status });
    } catch (e) {
      return bad("OUTPUT_FAILED", String(e));
    }
  }
}
