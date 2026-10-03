import { performance } from "node:perf_hooks";
import { setup } from "../tests/fixtures/setup.ts";
import { nodeRef } from "../src/modules/nodes.ts";
import { copySelection } from "../src/model/transfer.ts";
import { compile } from "../src/generation/compiler.ts";
import { esProfile } from "../src/modules/image.ts";
const s = setup(),
  selection: string[] = [],
  timings: Record<string, number> = {};
const measure = (name: string, fn: () => unknown) => {
  const start = performance.now();
  fn();
  timings[name] = performance.now() - start;
};
measure("create200NodesOneBatchMs", () =>
  s.graph.change("Large draft", (d) => {
    for (let i = 0; i < 200; i++)
      selection.push(
        d.add(s.network, nodeRef("float"), [
          (i % 20) * 220,
          Math.floor(i / 20) * 100,
        ]),
      );
  }),
);
let caller = "";
measure("encapsulate200Ms", () =>
  s.graph.change("Group", (d) => {
    caller = d.encapsulate(s.network, selection);
  }),
);
measure("copyClosureMs", () =>
  copySelection(s.graph.capture(), s.fixed, s.network, [caller]),
);
measure("compileMs", () => compile(s.graph.capture(), s.fixed, esProfile));
measure("undoMs", () => s.graph.undo());
measure("redoMs", () => s.graph.redo());
console.log(
  JSON.stringify(
    {
      scope:
        "Single-run host-free model performance sample; 200 floats in one definition, two required boundaries. Disconnected root intentionally has INPUT_REQUIRED. Not a browser frame-rate, scalability, physical GPU or Host qualification.",
      node: process.version,
      platform: process.platform,
      arch: process.arch,
      timings,
    },
    null,
    2,
  ),
);
