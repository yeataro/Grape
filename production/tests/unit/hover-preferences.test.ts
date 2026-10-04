import test from "node:test";
import assert from "node:assert/strict";
import { hoverPreference } from "../../apps/web/experimental-preferences.ts";
test("S06 hover preference defaults false and changes only its explicit isolated key", () => {
  const items = new Map([["other-product", "keep"]]),
    writes: string[] = [];
  const p = hoverPreference(() => ({
    getItem: (key) => items.get(key) ?? null,
    setItem: (key, value) => {
      writes.push(key);
      items.set(key, value);
    },
  }));
  assert.equal(p.load().enabled, false);
  assert.equal(p.save(true).enabled, true);
  assert.equal(p.load().enabled, true);
  assert.equal(p.save(false).enabled, false);
  assert.equal(items.get("other-product"), "keep");
  assert.deepEqual(writes, [
    "grape.preferences.hover.v1",
    "grape.preferences.hover.v1",
  ]);
});
test("S06 malformed hover preference is honest default without rewriting any key", () => {
  for (const invalid of ["1", "TRUE", "{}", "null", '"true"']) {
    const p = hoverPreference(() => ({
      getItem: () => invalid,
      setItem: () => {
        throw Error("must not write on load");
      },
    }));
    assert.equal(p.load().enabled, false);
    assert.match(p.load().issue, /invalid/);
  }
});
test("S06 inaccessible or refused hover preference falls back to normal hints without clearing storage", () => {
  const unavailable = hoverPreference(() => {
    throw Error("denied");
  });
  assert.equal(unavailable.load().enabled, false);
  assert.match(unavailable.load().issue, /unavailable/);
  const p = hoverPreference(() => ({
    getItem: () => "false",
    setItem: () => {
      throw Error("quota");
    },
  }));
  assert.equal(p.save(true).enabled, false);
  assert.match(p.save(true).issue, /could not be saved/);
});
