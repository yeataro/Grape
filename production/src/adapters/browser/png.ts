import type { CanonicalGraphDocument } from "../../sdk/document.ts";
import { demand } from "../../sdk/kernel.ts";
import { wrapPNG } from "../../persistence/png.ts";
import { writeDocument } from "../../persistence/codec.ts";

export async function renderDocumentPNG(
  doc: CanonicalGraphDocument,
  stageId: string,
  layout: ReadonlyMap<string, { width: number; height: number }>,
): Promise<Uint8Array> {
  const stage = doc.graph.stages.find((s) => s.id === stageId);
  demand(stage, "PNG_STAGE_MISSING");
  const nodes = stage.network.nodes;
  demand(
    nodes.length &&
      nodes.every((n) => {
        const box = layout.get(n.id);
        return box && box.width > 0 && box.height > 0;
      }),
    "PNG_LAYOUT_MISSING",
  );
  const left = Math.min(...nodes.map((n) => n.position[0])) - 24;
  const top = Math.min(...nodes.map((n) => n.position[1])) - 24;
  const width = Math.max(
    640,
    ...nodes.map((n) => n.position[0] + layout.get(n.id)!.width - left + 24),
  );
  const height = Math.max(
    240,
    ...nodes.map((n) => n.position[1] + layout.get(n.id)!.height - top + 24),
  );
  const scale = Math.min(1.5, 4096 / width, (4096 - 104) / height);
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(width * scale);
  canvas.height = Math.ceil(height * scale) + 104;
  const ctx = canvas.getContext("2d");
  demand(ctx, "PNG_CANVAS_UNAVAILABLE");
  ctx.fillStyle = "#151720";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.scale(scale, scale);
  ctx.translate(-left, -top);
  ctx.strokeStyle = "#b8a4ec";
  ctx.lineWidth = 2;
  for (const edge of stage.network.edges) {
    const a = nodes.find((n) => n.id === edge.from.nodeId),
      b = nodes.find((n) => n.id === edge.to.nodeId);
    if (!a || !b) continue;
    ctx.beginPath();
    ctx.moveTo(a.position[0] + layout.get(a.id)!.width, a.position[1] + 48);
    ctx.lineTo(b.position[0], b.position[1] + 48);
    ctx.stroke();
  }
  for (const node of nodes) {
    const box = layout.get(node.id)!,
      [x, y] = node.position;
    ctx.fillStyle = "#303342";
    ctx.fillRect(x, y, box.width, box.height);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 14px sans-serif";
    ctx.fillText(node.name, x + 10, y + 23, box.width - 20);
    ctx.font = "12px sans-serif";
    node.ports.forEach((p, i) =>
      ctx.fillText(
        `${p.direction === "input" ? "←" : "→"} ${p.key} · ${p.type}`,
        x + 10,
        y + 48 + i * 25,
        box.width - 20,
      ),
    );
  }
  ctx.restore();
  ctx.fillStyle = "#ffffff";
  ctx.font = "16px sans-serif";
  ctx.fillText(
    `${doc.graph.name} · ${stage.key}`,
    24,
    canvas.height - 62,
    canvas.width - 48,
  );
  ctx.font = "12px sans-serif";
  ctx.fillText("Grape · complete document embedded", 24, canvas.height - 32);
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(Error("PNG_ENCODING_FAILED"))),
      "image/png",
    ),
  );
  return wrapPNG(new Uint8Array(await blob.arrayBuffer()), writeDocument(doc));
}
