import { test } from "node:test";
import assert from "node:assert/strict";
import { deflateSync } from "node:zlib";
import {
  crc32,
  wrapPNG,
  unwrapPNG,
  decodeInput,
  PNG_MAX_BYTES,
} from "../../src/persistence/png.ts";
import { DOCUMENT_MAX_BYTES } from "../../src/persistence/codec.ts";
import { flow, application } from "../fixtures/setup.ts";
const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
function chunk(type: string, data: Uint8Array = Buffer.alloc(0)) {
  const bytes = Buffer.alloc(data.length + 12);
  bytes.writeUInt32BE(data.length, 0);
  bytes.write(type, 4);
  bytes.set(data, 8);
  bytes.writeUInt32BE(crc32(bytes.subarray(4, -4)), bytes.length - 4);
  return bytes;
}
const header = Buffer.from([0, 0, 0, 1, 0, 0, 0, 1, 8, 6, 0, 0, 0]);
const ihdr = chunk("IHDR", header),
  idat = chunk("IDAT", deflateSync(Buffer.from([0, 20, 40, 60, 255]))),
  iend = chunk("IEND");
const image = (...middle: Uint8Array[]) =>
  Buffer.concat([signature, ihdr, idat, ...middle, iend]);
const owned = (data: string, flag = 0, type = "iTXt") =>
  chunk(
    type,
    Buffer.concat([
      Buffer.from("TD-Sgrape\0"),
      Buffer.from([flag, 0, 0, 0]),
      Buffer.from(data),
    ]),
  );
const raw = () => JSON.stringify(flow().graph.capture().document);
test("AT-S02-04 PNG: CRC oracle, roundtrip, repeated wrapping and unowned chunks preserve bytes", () => {
  assert.equal(crc32(Buffer.from("123456789")), 0xcbf43926);
  const ancillary = chunk("tEXt", Buffer.from("Comment\0Keep me")),
    png = image(ancillary),
    original = Buffer.from(png);
  const wrapped = wrapPNG(png, raw());
  assert.equal(unwrapPNG(wrapped), raw());
  assert.deepEqual(png, original);
  assert(Buffer.from(wrapped).includes(ancillary));
  assert.deepEqual(wrapPNG(wrapped, raw()), wrapped);
  assert.equal(decodeInput(wrapped, "not-json.bin"), raw());
  assert.equal(decodeInput(Buffer.from(raw()), "doc.json"), raw());
});
test("AT-S02-04 PNG: malformed CRC, missing metadata, duplicate metadata, compression and malformed envelope are named rejections", () => {
  const corrupt = wrapPNG(image(), raw()).slice();
  corrupt[29] ^= 1;
  const envelope = JSON.stringify({
    format: "td-sgrape.graph-png",
    version: 1,
    graph: JSON.parse(raw()),
  });
  const samples: [Uint8Array, RegExp][] = [
    [corrupt, /PNG_CRC/],
    [image(), /PNG_METADATA_MISSING/],
    [image(owned(envelope), owned(envelope)), /PNG_METADATA_DUPLICATE/],
    [image(owned(envelope, 1)), /PNG_METADATA_COMPRESSION/],
    [image(owned(envelope, 0, "zTXt")), /PNG_METADATA_ENCODING/],
    [image(owned(envelope, 0, "tEXt")), /PNG_METADATA_ENCODING/],
    [
      image(owned('{"format":"td-sgrape.graph-png","version":2,"graph":{}}')),
      /PNG_METADATA_VERSION/,
    ],
    [
      image(owned('{"format":"td-sgrape.graph-png","version":1}')),
      /PNG_METADATA_STRUCTURE/,
    ],
    [
      image(
        owned(
          '{"format":"td-sgrape.graph-png","version":1,"graph":{},"extra":1}',
        ),
      ),
      /PNG_METADATA_STRUCTURE/,
    ],
    [image(owned('{"graph":1,"graph":2}')), /DUPLICATE_JSON_KEY/],
  ];
  for (const [bytes, error] of samples) {
    const before = bytes.slice();
    assert.throws(() => unwrapPNG(bytes), error);
    assert.deepEqual(bytes, before);
  }
});
test("AT-S02-04 PNG: structural boundaries, file/chunk/metadata limits and invalid UTF-8 never decode pixels or compressed text", () => {
  const tooMany = image(...Array.from({ length: 65534 }, () => chunk("teSt")));
  const samples: [Uint8Array, RegExp][] = [
    [new Uint8Array(PNG_MAX_BYTES + 1), /PNG_SIZE/],
    [Buffer.concat([image(), Buffer.from([0])]), /PNG_TRAILING_DATA/],
    [image().subarray(0, -1), /PNG_TRUNCATED/],
    [Buffer.concat([signature, ihdr, iend]), /PNG_ORDER/],
    [Buffer.concat([signature, idat, ihdr, iend]), /PNG_ORDER/],
    [
      Buffer.concat([signature, ihdr, idat, chunk("teSt"), idat, iend]),
      /PNG_ORDER/,
    ],
    [image(chunk("ABCD")), /PNG_UNKNOWN_CRITICAL/],
    [image(owned("x".repeat(DOCUMENT_MAX_BYTES + 8192))), /PNG_METADATA_SIZE/],
    [tooMany, /PNG_CHUNK_COUNT/],
    [
      image(
        chunk(
          "iTXt",
          Buffer.concat([
            Buffer.from("TD-Sgrape\0\0\0\0\0"),
            Buffer.from([0xff]),
          ]),
        ),
      ),
      /INVALID_UTF8/,
    ],
  ];
  for (const [bytes, error] of samples)
    assert.throws(() => unwrapPNG(bytes), error);
  assert.throws(
    () => decodeInput(Buffer.from([255, 192]), "a.json"),
    /INVALID_UTF8/,
  );
  assert.throws(
    () => decodeInput(Buffer.from(raw()), "a.png"),
    /PNG_SIGNATURE/,
  );
});
test("AT-S02-04 PNG: ASCII/CJK/non-BMP budgets match text intake and preserve canonical graph", () => {
  const s = application();
  for (const character of ["x", "中", "🍇"]) {
    const doc = JSON.parse(raw());
    doc.graph.extensions["test.notes"] = "";
    const remaining =
        DOCUMENT_MAX_BYTES - Buffer.byteLength(JSON.stringify(doc)),
      width = Buffer.byteLength(character);
    doc.graph.extensions["test.notes"] =
      character.repeat(Math.floor(remaining / width)) +
      "x".repeat(remaining % width);
    const text = JSON.stringify(doc),
      png = wrapPNG(image(), text);
    assert.equal(Buffer.byteLength(text), DOCUMENT_MAX_BYTES);
    const result = decodeInput(png);
    assert.equal(result, text);
    assert.equal(
      s.app.inspectText(result).status,
      s.app.inspectText(text).status,
    );
    assert.throws(() => wrapPNG(image(), text + " "), /DOCUMENT_SIZE/);
    assert.throws(() => decodeInput(Buffer.from(text + " ")), /DOCUMENT_SIZE/);
  }
});
