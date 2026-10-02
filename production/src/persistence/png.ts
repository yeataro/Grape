import { demand, Fault } from "../sdk/kernel.ts";
import { DOCUMENT_MAX_BYTES, parseJSON } from "./codec.ts";

export const PNG_MAX_BYTES = 16 * 1024 * 1024;
const signature = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
const encoder = new TextEncoder();
const decoder = new TextDecoder("utf-8", { fatal: true, ignoreBOM: true });
const keyword = "TD-Sgrape";
function parseText(raw: string) {
  try {
    return parseJSON(raw);
  } catch (error) {
    if (error instanceof Fault) throw error;
    throw Error("INVALID_JSON");
  }
}
export function isPNG(bytes: Uint8Array): boolean {
  return signature.every((n, i) => bytes[i] === n);
}
export function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (const b of bytes) {
    crc ^= b;
    for (let i = 0; i < 8; i++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}
type Chunk = { type: string; data: Uint8Array; bytes: Uint8Array };
function chunks(bytes: Uint8Array): Chunk[] {
  demand(bytes.byteLength <= PNG_MAX_BYTES, "PNG_SIZE");
  demand(isPNG(bytes), "PNG_SIGNATURE");
  const result: Chunk[] = [];
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let at = 8,
    ended = false,
    dataSeen = false,
    dataEnded = false,
    palette = false;
  while (at < bytes.length) {
    demand(!ended, "PNG_TRAILING_DATA");
    demand(result.length < 65536, "PNG_CHUNK_COUNT");
    demand(at + 12 <= bytes.length, "PNG_TRUNCATED");
    const size = view.getUint32(at),
      end = at + 12 + size;
    demand(size <= 0x7fffffff && end <= bytes.length, "PNG_TRUNCATED");
    const type = String.fromCharCode(...bytes.subarray(at + 4, at + 8));
    demand(
      /^[A-Za-z]{4}$/.test(type) && type[2] === type[2].toUpperCase(),
      "PNG_CHUNK_TYPE",
    );
    demand(
      crc32(bytes.subarray(at + 4, end - 4)) === view.getUint32(end - 4),
      "PNG_CRC",
    );
    const data = bytes.subarray(at + 8, end - 4);
    if (result.length === 0) demand(type === "IHDR", "PNG_ORDER");
    if (type === "IHDR") {
      demand(result.length === 0 && size === 13, "PNG_IHDR");
      const header = new DataView(
        data.buffer,
        data.byteOffset,
        data.byteLength,
      );
      demand(
        header.getUint32(0) > 0 &&
          header.getUint32(4) > 0 &&
          header.getUint32(0) <= 0x7fffffff &&
          header.getUint32(4) <= 0x7fffffff &&
          data[10] === 0 &&
          data[11] === 0 &&
          data[12] <= 1,
        "PNG_IHDR",
      );
      const depths: Record<number, number[]> = {
        0: [1, 2, 4, 8, 16],
        2: [8, 16],
        3: [1, 2, 4, 8],
        4: [8, 16],
        6: [8, 16],
      };
      demand(depths[data[9]]?.includes(data[8]), "PNG_IHDR");
    } else if (type === "PLTE") {
      demand(
        !palette && !dataSeen && size > 0 && size <= 768 && size % 3 === 0,
        "PNG_ORDER",
      );
      palette = true;
    } else if (type === "IDAT") {
      demand(!dataEnded && (result[0].data[9] !== 3 || palette), "PNG_ORDER");
      dataSeen = true;
    } else {
      if (dataSeen) dataEnded = true;
      if (type === "IEND") {
        demand(dataSeen && size === 0, "PNG_ORDER");
        ended = true;
      } else demand(type[0] === type[0].toLowerCase(), "PNG_UNKNOWN_CRITICAL");
    }
    result.push({ type, data, bytes: bytes.subarray(at, end) });
    at = end;
  }
  demand(ended, "PNG_IEND_MISSING");
  return result;
}
function owned(chunk: Chunk): boolean {
  if (!["iTXt", "tEXt", "zTXt"].includes(chunk.type)) return false;
  const zero = chunk.data.indexOf(0);
  return (
    zero === keyword.length &&
    String.fromCharCode(...chunk.data.subarray(0, zero)) === keyword
  );
}
function metadata(chunk: Chunk): string {
  demand(chunk.type === "iTXt", "PNG_METADATA_ENCODING");
  demand(chunk.data.length <= DOCUMENT_MAX_BYTES + 8192, "PNG_METADATA_SIZE");
  let at = keyword.length + 1;
  demand(
    chunk.data[at++] === 0 && chunk.data[at++] === 0,
    "PNG_METADATA_COMPRESSION",
  );
  for (let i = 0; i < 2; i++) {
    const zero = chunk.data.indexOf(0, at);
    demand(zero >= at, "PNG_METADATA_STRUCTURE");
    try {
      decoder.decode(chunk.data.subarray(at, zero));
    } catch {
      throw Error("INVALID_UTF8");
    }
    at = zero + 1;
  }
  try {
    return decoder.decode(chunk.data.subarray(at));
  } catch {
    throw Error("INVALID_UTF8");
  }
}
export function unwrapPNG(bytes: Uint8Array): string {
  const entries = chunks(bytes).filter(owned);
  demand(entries.length > 0, "PNG_METADATA_MISSING");
  demand(entries.length === 1, "PNG_METADATA_DUPLICATE");
  const value = parseText(metadata(entries[0]));
  demand(
    value && typeof value === "object" && !Array.isArray(value),
    "PNG_METADATA_STRUCTURE",
  );
  demand(
    value.format === "td-sgrape.graph-png" && value.version === 1,
    "PNG_METADATA_VERSION",
  );
  demand(Object.hasOwn(value, "graph"), "PNG_METADATA_STRUCTURE");
  // View data is inert export context, not canonical Graph authority.
  demand(
    Object.keys(value).every((key) =>
      ["format", "version", "graph", "view"].includes(key),
    ),
    "PNG_METADATA_STRUCTURE",
  );
  const raw = JSON.stringify(value.graph);
  demand(encoder.encode(raw).length <= DOCUMENT_MAX_BYTES, "DOCUMENT_SIZE");
  return raw;
}
function chunk(type: string, data: Uint8Array): Uint8Array {
  const bytes = new Uint8Array(data.length + 12),
    view = new DataView(bytes.buffer);
  view.setUint32(0, data.length);
  bytes.set(encoder.encode(type), 4);
  bytes.set(data, 8);
  view.setUint32(bytes.length - 4, crc32(bytes.subarray(4, bytes.length - 4)));
  return bytes;
}
export function wrapPNG(image: Uint8Array, raw: string): Uint8Array {
  demand(encoder.encode(raw).length <= DOCUMENT_MAX_BYTES, "DOCUMENT_SIZE");
  const graph = parseText(raw);
  const payload = encoder.encode(
    JSON.stringify({ format: "td-sgrape.graph-png", version: 1, graph }),
  );
  const prefix = encoder.encode(keyword + "\0\0\0\0\0");
  const data = new Uint8Array(prefix.length + payload.length);
  data.set(prefix);
  data.set(payload, prefix.length);
  demand(data.length <= DOCUMENT_MAX_BYTES + 8192, "PNG_METADATA_SIZE");
  const parsed = chunks(image),
    parts: Uint8Array[] = [signature];
  demand(parsed.filter(owned).length <= 1, "PNG_METADATA_DUPLICATE");
  for (const c of parsed) {
    if (owned(c)) continue;
    if (c.type === "IEND") parts.push(chunk("iTXt", data));
    parts.push(c.bytes);
  }
  const bytes = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  demand(bytes.length <= PNG_MAX_BYTES, "PNG_SIZE");
  let offset = 0;
  for (const p of parts) {
    bytes.set(p, offset);
    offset += p.length;
  }
  return bytes;
}
export function decodeInput(bytes: Uint8Array, name = ""): string {
  if (isPNG(bytes) || /\.png$/i.test(name)) return unwrapPNG(bytes);
  demand(bytes.length <= DOCUMENT_MAX_BYTES, "DOCUMENT_SIZE");
  try {
    return decoder.decode(bytes);
  } catch {
    throw Error("INVALID_UTF8");
  }
}
