import { clickAction } from "../fixtures/public-actions.ts";
import { createNode } from "./create-node.ts";
import { test, expect } from "@playwright/test";
import fs from "node:fs/promises";
const evidence = process.env.GRAPE_EVIDENCE_DIR!;
test("S04 DEC002 all sixteen conversions execute on WebGL2 with correct components", async ({
  page,
  browser,
}) => {
  await page.goto("/");
  const result = await page.evaluate(async () => {
    const { conversionFixture } = await import("/tests/fixtures/s04.ts"),
      { compile } = await import("/src/generation/compiler.ts"),
      { esProfile } = await import("/src/modules/image.ts");
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    const gl = canvas.getContext("webgl2", {
      premultipliedAlpha: false,
      antialias: false,
    })!;
    if (!gl) throw Error("WEBGL2_UNAVAILABLE");
    const rows = [];
    for (const from of ["glsl.float", "glsl.vec2", "glsl.vec3", "glsl.vec4"])
      for (const to of ["glsl.float", "glsl.vec2", "glsl.vec3", "glsl.vec4"]) {
        const s = conversionFixture(from, to),
          before = JSON.stringify(s.graph.capture()),
          out = compile(s.graph.capture(), s.fixed, esProfile);
        if (out.status !== "success")
          throw Error(JSON.stringify(out.diagnostics));
        const program = gl.createProgram()!,
          shaders = out.artifacts.map((a) => {
            const sh = gl.createShader(
              a.key === "vertex" ? gl.VERTEX_SHADER : gl.FRAGMENT_SHADER,
            )!;
            gl.shaderSource(sh, a.text);
            gl.compileShader(sh);
            if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS))
              throw Error(gl.getShaderInfoLog(sh)!);
            gl.attachShader(program, sh);
            return sh;
          });
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS))
          throw Error(gl.getProgramInfoLog(program)!);
        gl.useProgram(program);
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(
          gl.ARRAY_BUFFER,
          new Float32Array([-1, -1, 3, -1, -1, 3]),
          gl.STATIC_DRAW,
        );
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
        gl.viewport(0, 0, 1, 1);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        const pixels = new Uint8Array(4);
        gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
        rows.push({
          from,
          to,
          expected: s.expected.map((v) => Math.round(v * 255)),
          pixels: [...pixels],
          unchanged: JSON.stringify(s.graph.capture()) === before,
          artifacts: out.artifacts,
        });
        gl.deleteBuffer(buffer);
        shaders.forEach((sh) => gl.deleteShader(sh));
        gl.deleteProgram(program);
      }
    return {
      rows,
      version: gl.getParameter(gl.VERSION),
      renderer: gl.getParameter(gl.RENDERER),
    };
  });
  for (const row of result.rows) {
    expect(row.unchanged).toBe(true);
    row.pixels.forEach((v, i) =>
      expect(Math.abs(v - row.expected[i])).toBeLessThanOrEqual(1),
    );
  }
  await fs.writeFile(
    evidence + "/s04-webgl16.json",
    JSON.stringify({ browser: browser.version(), ...result }, null, 2),
  );
});
test("S04 DEC004 actual Personal literal source input nested shaders compile after export import reopen", async ({
  page,
  browser,
}) => {
  await page.goto("/");
  const result = await page.evaluate(async () => {
    const { arrayFixture, nestedArrayFixture, currentSetup } =
        await import("/tests/fixtures/s04.ts"),
      { buildPersonal, readPersonal, qualifyPackage, packagePacket } =
        await import("/src/application/personal.ts"),
      { probeDefinitions } = await import("/src/modules/package-probe.ts"),
      { esProfile } = await import("/src/modules/image.ts"),
      { nodeRef } = await import("/src/modules/nodes.ts"),
      { Graph } = await import("/src/model/graph.ts"),
      { callResource } = await import("/src/sdk/networks.ts"),
      { writeDocument, readDocument } =
        await import("/src/persistence/codec.ts");
    const gl = document.createElement("canvas").getContext("webgl2")!;
    if (!gl) throw Error("WEBGL2_UNAVAILABLE");
    const rows = [];
    for (const mode of [
      "literal",
      "source",
      "direct-source",
      "input",
      "nested",
    ]) {
      const s =
          mode === "nested" ? nestedArrayFixture() : arrayFixture(mode as any),
        root = "root" in s ? s.root : s.id,
        asset = await readPersonal(
          JSON.stringify(
            await buildPersonal(
              s.graph.capture(),
              s.fixed,
              root,
              esProfile,
              probeDefinitions,
            ),
          ),
          s.fixed,
          esProfile,
          probeDefinitions,
        );
      const target = currentSetup();
      let inserted: string[] = [];
      target.graph.change("Valid", (d) => {
        const f = d.add(target.network, nodeRef("float"), [0, 0]);
        d.connect(
          target.network,
          { nodeId: f, portKey: "value" },
          {
            nodeId: target.graph.resolveNetwork(target.network).nodes[0].id,
            portKey: "color",
          },
        );
      });
      target.graph.change("Import", (d) => {
        inserted = d.insertLibrary(
          target.network,
          packagePacket(asset, target.graph.capture().document, target.fixed),
          asset.contentHash,
        );
      });
      const read = readDocument(writeDocument(target.graph.capture().document));
      if (read.status !== "editable") throw Error("REOPEN");
      const reopened = new Graph(read.document, target.fixed, target.identity),
        id = callResource(
          reopened
            .resolveNetwork(target.network)
            .nodes.find((n) => n.id === inserted[0])!,
          target.fixed,
        )!;
      const round = await buildPersonal(
          reopened.capture(),
          target.fixed,
          id,
          esProfile,
          probeDefinitions,
        ),
        compiled = qualifyPackage(
          round,
          target.fixed,
          esProfile,
          probeDefinitions,
        ),
        shaders = [];
      for (const c of compiled)
        for (const a of c.artifacts) {
          const shader = gl.createShader(
            a.key === "vertex" ? gl.VERTEX_SHADER : gl.FRAGMENT_SHADER,
          )!;
          gl.shaderSource(shader, a.text);
          gl.compileShader(shader);
          shaders.push({
            key: a.key,
            compiled: !!gl.getShaderParameter(shader, gl.COMPILE_STATUS),
            log: gl.getShaderInfoLog(shader),
            text: a.text,
          });
          gl.deleteShader(shader);
        }
      rows.push({
        mode,
        hashSame: round.contentHash === asset.contentHash,
        shaders,
        resources: round.resources,
      });
    }
    return {
      rows,
      version: gl.getParameter(gl.VERSION),
      renderer: gl.getParameter(gl.RENDERER),
    };
  });
  for (const row of result.rows) {
    expect(row.hashSame).toBe(true);
    expect(
      row.shaders.every((s) => s.compiled),
      JSON.stringify(row.shaders),
    ).toBe(true);
  }
  await fs.writeFile(
    evidence + "/s04-personal-webgl.json",
    JSON.stringify({ browser: browser.version(), ...result }, null, 2),
  );
});
test("S04 actual IndexedDB collision concurrency relist quotas and failure isolation", async ({
  page,
}) => {
  await page.goto("/");
  const result = await page.evaluate(async () => {
    const { BrowserLibraryStore } =
        await import("/src/adapters/browser/library.ts"),
      { PersonalLibrary, buildPersonal } =
        await import("/src/application/personal.ts"),
      { arrayFixture } = await import("/tests/fixtures/s04.ts"),
      { probeDefinitions } = await import("/src/modules/package-probe.ts"),
      { esProfile } = await import("/src/modules/image.ts");
    const store = new BrowserLibraryStore("s04-test-" + crypto.randomUUID()),
      s = arrayFixture("literal"),
      asset = await buildPersonal(
        s.graph.capture(),
        s.fixed,
        s.id,
        esProfile,
        probeDefinitions,
      ),
      lib = new PersonalLibrary(store, s.fixed, esProfile, probeDefinitions);
    await store.publish("Portable_array.sgrape-function.json", "broken");
    const saved = await lib.save(asset),
      same = await lib.save(asset),
      listed = await lib.list();
    const race = await Promise.all([
      store.publish("Race.sgrape-function.json", "a"),
      store.publish("race.sgrape-function.json", "b"),
    ]);
    for (let i = (await store.list()).length; i < 64; i++)
      await store.publish("invalid" + i + ".sgrape-function.json", "bad");
    const before = JSON.stringify(await store.list());
    let count = "";
    try {
      await store.publish("overflow.sgrape-function.json", "bad");
    } catch (e) {
      count = (e as Error).name;
    }
    const fullReuse = await lib.save(asset),
      unchanged = JSON.stringify(await store.list()) === before;
    const total = new BrowserLibraryStore("s04-total-" + crypto.randomUUID());
    for (let i = 0; i < 15; i++)
      await total.publish(i + ".sgrape-function.json", "x".repeat(256000));
    await total.publish("15.sgrape-function.json", "x".repeat(160000));
    let budget = "",
      single = "";
    try {
      await total.publish("16.sgrape-function.json", "x");
    } catch (e) {
      budget = (e as Error).name;
    }
    try {
      await total.publish("17.sgrape-function.json", "x".repeat(256001));
    } catch (e) {
      single = (e as Error).name;
    }
    return {
      saved,
      same,
      listed: listed.items.map((x) => x.name),
      issues: listed.issues,
      race,
      count,
      fullReuse,
      unchanged,
      budget,
      single,
      totalBytes: (await total.list()).reduce(
        (n, f) => n + new TextEncoder().encode(f.text).length,
        0,
      ),
    };
  });
  expect(result.saved.name).toBe("Portable_array_2.sgrape-function.json");
  expect(result.same.reused).toBe(true);
  expect(result.race.sort()).toEqual(["created", "exists"]);
  expect(result.count).toBe("PERSONAL_FILE_LIMIT");
  expect(result.budget).toBe("PERSONAL_TOTAL_SIZE");
  expect(result.single).toBe("PERSONAL_SIZE");
  expect(result.totalBytes).toBe(4000000);
  expect(result.fullReuse.reused && result.unchanged).toBe(true);
  expect(result.issues).toHaveLength(1);
  await fs.writeFile(
    evidence + "/s04-provider.json",
    JSON.stringify(result, null, 2),
  );
});

async function exported(page: any) {
  const event = page.waitForEvent("download");
  await clickAction(page, "Export JSON");
  return JSON.parse(await fs.readFile((await (await event).path())!, "utf8"));
}
test("S04 DEC002 actual Canvas four shapes to current ImageOutput and edge identity Undo Redo", async ({
  page,
}) => {
  const rows = [];
  for (const shape of ["float", "vec2", "vec3", "vec4"]) {
    await page.goto("/");
    const name = shape === "float" ? "Float" : "Compose";
    await createNode(page, name);
    if (shape === "vec2" || shape === "vec3")
      await page.locator('[data-parameter="mode"]').selectOption(shape);
    await page
      .getByRole("button", {
        name: name + " output " + (shape === "float" ? "value" : "result"),
        exact: true,
      })
      .click();
    await page
      .getByRole("button", { name: "Image output input color", exact: true })
      .click();
    await expect(page.locator(".wires [data-edge]")).toHaveCount(1);
    const edge = await page
      .locator(".wires [data-edge]")
      .getAttribute("data-edge");
    await page
      .getByRole("button", { name: "Generate GLSL", exact: true })
      .click();
    await expect(page.getByLabel("Generated GLSL")).toContainText("fragColor");
    const document = await exported(page);
    expect(document.formatVersion).toEqual({ major: 2, minor: 1 });
    const plan = document.graph.stages.find((s: any) => s.key === "pixel")
      .network.edges[0].adaptation;
    await page.getByRole("button", { name: "Undo", exact: true }).click();
    await expect(page.locator(".wires [data-edge]")).toHaveCount(0);
    await page.getByRole("button", { name: "Redo", exact: true }).click();
    await expect(page.locator(".wires [data-edge]")).toHaveAttribute(
      "data-edge",
      edge!,
    );
    const redo = await exported(page);
    expect(redo.graph).toEqual(document.graph);
    rows.push({ shape, edge, plan, document });
  }
  await page.screenshot({ path: evidence + "/s04-canvas.png", fullPage: true });
  await fs.writeFile(
    evidence + "/s04-canvas-four.json",
    JSON.stringify(rows, null, 2),
  );
});
test("S04 actual Personal UI saves relists imports downloads and inserts independent Graph snapshots", async ({
  page,
}) => {
  await page.goto("/");
  await createNode(page, "Float");
  await page
    .getByRole("button", { name: "Float output value", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Image output input color", exact: true })
    .click();
  await page.getByRole("button", { name: "New subgraph", exact: true }).click();
  await clickAction(page, "Personal Library");
  await page
    .getByRole("button", { name: "Save selected subgraph", exact: true })
    .click();
  await expect(page.locator('dialog[open] [role="status"]')).toContainText(
    "Saved",
  );
  const download = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Export Subgraph", exact: true })
    .click();
  const text = await fs.readFile((await (await download).path())!, "utf8");
  await page.getByLabel("Import Personal package").setInputFiles({
    name: "again.sgrape-function.json",
    mimeType: "application/json",
    buffer: Buffer.from(text),
  });
  await expect(page.locator("[data-personal-file]")).toHaveCount(1);
  await page
    .getByRole("button", { name: "Insert Subgraph", exact: true })
    .click();
  await expect(
    page
      .locator("dialog[open]")
      .filter({ has: page.getByLabel("Search Personal Library") }),
  ).toHaveCount(0);
  const once = await exported(page);
  await clickAction(page, "Personal Library");
  await page
    .getByRole("button", { name: "Insert Subgraph", exact: true })
    .click();
  const twice = await exported(page);
  expect(twice.graph.resources).toEqual(once.graph.resources);
  await page
    .getByRole("button", { name: "Make independent", exact: true })
    .click();
  const independent = await exported(page);
  expect(independent.graph.resources.length).toBe(
    twice.graph.resources.length + 1,
  );
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  expect((await exported(page)).graph).toEqual(twice.graph);
  await clickAction(page, "Personal Library");
  await page.getByLabel("Import Personal package").setInputFiles({
    name: "bad.sgrape-function.json",
    mimeType: "application/json",
    buffer: Buffer.from('{"bad":true}'),
  });
  await expect(page.locator('dialog[open] [role="status"]')).toContainText(
    "PERSONAL_FORMAT",
  );
  await expect(page.locator("[data-personal-file]")).toHaveCount(1);
  await page
    .getByRole("button", { name: "Close Personal", exact: true })
    .click();
  expect((await exported(page)).graph).toEqual(twice.graph);
  await page.reload();
  await clickAction(page, "Personal Library");
  await expect(page.locator("[data-personal-file]")).toHaveCount(1);
  await page.screenshot({
    path: evidence + "/s04-personal-ui.png",
    fullPage: true,
  });
  await fs.writeFile(
    evidence + "/s04-personal-ui.json",
    JSON.stringify(
      { asset: JSON.parse(text), once, twice, independent },
      null,
      2,
    ),
  );
});

test("S04 DEC004 browser hash-valid missing dependency scope cycle and module candidates reject atomically", async ({
  page,
}) => {
  await page.goto("/");
  const result = await page.evaluate(async () => {
    const { arrayFixture, nestedArrayFixture, currentSetup } =
        await import("/tests/fixtures/s04.ts"),
      { buildPersonal } = await import("/src/application/personal.ts"),
      { probeDefinitions } = await import("/src/modules/package-probe.ts"),
      { esProfile } = await import("/src/modules/image.ts"),
      { currentImageKind } = await import("/src/modules/image-current.ts"),
      { EditorApplication } = await import("/src/application/editor.ts"),
      { MemoryStorage } = await import("/tests/fixtures/setup.ts");
    const source = arrayFixture("source"),
      input = arrayFixture("input"),
      nested = nestedArrayFixture(),
      fixtures = [source, input, nested],
      assets = await Promise.all(
        fixtures.map((s) =>
          buildPersonal(
            s.graph.capture(),
            s.fixed,
            "root" in s ? s.root : s.id,
            esProfile,
            probeDefinitions,
          ),
        ),
      );
    const s = currentSetup(),
      app = new EditorApplication(
        s.definitions,
        s.identity,
        currentImageKind.ref,
        esProfile,
        new MemoryStorage(),
        { download: async () => {} },
        probeDefinitions,
      );
    app.newDocument();
    const context = app.context();
    let events = 0;
    app.subscribe(() => events++);
    const stable = (v: any): string =>
      Array.isArray(v)
        ? "[" + v.map(stable).join(",") + "]"
        : v && typeof v === "object"
          ? "{" +
            Object.keys(v)
              .sort()
              .map((k) => JSON.stringify(k) + ":" + stable(v[k]))
              .join(",") +
            "}"
          : JSON.stringify(v);
    const cases = [
        {
          name: "missing-source",
          index: 0,
          mutate: (a: any) =>
            a.resources.splice(
              a.resources.findIndex(
                (r: any) => r.type.typeId === "source-definition",
              ),
              1,
            ),
        },
        {
          name: "wrong-input-scope",
          index: 1,
          mutate: (a: any) =>
            (a.resources.find(
              (r: any) => r.type.typeId === "array-extent",
            ).data.networkId = "foreign"),
        },
        {
          name: "nested-cycle",
          index: 2,
          mutate: (a: any) =>
            a.resources
              .find(
                (r: any) => r.type.typeId === "definition" && r.id !== a.entry,
              )
              .data.dependencies.push(a.entry),
        },
        {
          name: "undeclared-module",
          index: 0,
          mutate: (a: any) =>
            (a.modules = a.modules.filter(
              (p: any) => p.moduleId !== "grape.resources.extents",
            )),
        },
      ],
      rows = [];
    for (const c of cases) {
      const a = structuredClone(assets[c.index]);
      c.mutate(a);
      const { contentHash, ...body } = a;
      a.contentHash = [
        ...new Uint8Array(
          await crypto.subtle.digest(
            "SHA-256",
            new TextEncoder().encode(stable(body)),
          ),
        ),
      ]
        .map((x) => x.toString(16).padStart(2, "0"))
        .join("");
      const before = JSON.stringify(app.snapshot),
        selection = JSON.stringify(context.capture()),
        history = [app.canUndo, app.canRedo],
        count = events;
      let error = "";
      try {
        await app.insertPersonal(context, JSON.stringify(a));
      } catch (e) {
        error = (e as Error).name;
      }
      rows.push({
        name: c.name,
        error,
        unchanged:
          JSON.stringify(app.snapshot) === before &&
          JSON.stringify(context.capture()) === selection &&
          app.canUndo === history[0] &&
          app.canRedo === history[1] &&
          count === events,
      });
    }
    return rows;
  });
  expect(result.every((r) => r.error && r.unchanged)).toBe(true);
  await fs.writeFile(
    evidence + "/s04-personal-rejections.json",
    JSON.stringify(result, null, 2),
  );
});
