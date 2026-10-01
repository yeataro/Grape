import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { builtinModules } from "node:module";
import ts from "typescript";
import { Graph, Registry } from "../core.ts";
import { builtinModule, refs } from "../nodes.ts";
import { unwrap } from "../scenario.ts";

const setup = () => {
  const registry = new Registry();
  unwrap(registry.register(builtinModule));
  return registry;
};
test("DEP01 application core modules have no Node or Electron imports", () => {
  const queue = [
    "core.ts",
    "identity.ts",
    "contracts.ts",
    "nodes.ts",
    "generator.ts",
    "generation-provenance.ts",
    ...readdirSync(new URL("../", import.meta.url)).filter(name => /^qualification-.*\.ts$/.test(name)),
  ];
  const seen = new Set<string>();
  for (const file of queue) {
    if (seen.has(file)) continue;
    seen.add(file);
    const source = readFileSync(new URL("../" + file, import.meta.url), "utf8");
    assert.doesNotMatch(
      source,
      /(?:from\s*|import\s*\(|require\s*\()\s*['"](?:node:|electron)/,
    );
    const ast = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);
    const inspect = (node: ts.Node) => {
      let specifier: ts.Expression | undefined;
      if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) specifier = node.moduleSpecifier;
      if (ts.isCallExpression(node) && (node.expression.kind === ts.SyntaxKind.ImportKeyword || ts.isIdentifier(node.expression) && node.expression.text === "require")) {
        assert.ok(node.arguments[0] && ts.isStringLiteralLike(node.arguments[0]), "Nonliteral module dependency must be reviewed: " + file);
        specifier = node.arguments[0];
      }
      if (specifier && ts.isStringLiteralLike(specifier)) {
        const name = specifier.text;
        assert.ok(!builtinModules.includes(name.replace(/^node:/, "")) && name !== "electron", file + " imports platform module " + name);
        assert.ok(name.startsWith("./") && name.endsWith(".ts"), "Undeclared core dependency: " + name);
        queue.push(name.slice(2));
      }
      ts.forEachChild(node, inspect);
    };
    inspect(ast);
  }
});
test("DEP02 bootstrap can inject identity without changing persistent model shape", () => {
  const registry = setup();
  let sequence = 0;
  const identity = { newId: () => `injected-${++sequence}` };
  const graph = new Graph({
    name: "Injected",
    definitions: registry.pin(),
    outputType: refs.output,
    identity,
  });
  identity.newId = () => {
    throw Error("descriptor was rebound");
  };
  const id = unwrap(
    graph.change("create", (d) =>
      d.createNode(graph.stage("pixel").id, refs.constant, { value: 1 }),
    ),
  );
  assert.match(id, /^injected-/);
  assert.equal("identity" in graph.snapshot().document, false);
  assert.equal("services" in graph.snapshot().document, false);
});
test("DEP03 reload preserves document IDs but allocates a fresh runtime identity", () => {
  const registry = setup();
  let counter = 0;
  const identity = { newId: () => `runtime-${++counter}` };
  const graph = new Graph({
    name: "Before reload",
    definitions: registry.pin(),
    outputType: refs.output,
    identity,
  });
  const restored = unwrap(
    Graph.load(graph.exportJSON(), registry, { identity }),
  );
  assert.equal(restored.id, graph.id);
  assert.notEqual(restored.loadId, graph.loadId);
  assert.equal(restored.exportJSON(), graph.exportJSON());
});
test("DEP04 invalid identity providers cannot construct a graph with duplicate IDs", () => {
  const registry = setup();
  assert.throws(
    () =>
      new Graph({
        name: "Bad",
        definitions: registry.pin(),
        outputType: refs.output,
        identity: { newId: () => "" },
      }),
    /IDENTITY_INVALID/,
  );
  assert.throws(
    () =>
      new Graph({
        name: "Bad",
        definitions: registry.pin(),
        outputType: refs.output,
        identity: { newId: () => "same" },
      }),
    /unique/,
  );
});
