import { test } from "node:test";
import assert from "node:assert/strict";
import { Localization } from "../../src/localization/service.ts";
import { application } from "../fixtures/setup.ts";
const owner = {
  moduleId: "test.feature",
  version: "1",
  fingerprint: "one",
  namespace: "test.feature",
  catalogVersion: 1,
};
const ref = {
  owner,
  key: "title",
  fallback: "Inline {name}",
  params: { name: "Grape" },
};
const defaults = {
  owner,
  locale: "en",
  revision: 1,
  messages: [{ key: "title", text: "Hello {name}" }],
};
test("L10N exact owner, parent/default/inline fallback and plain interpolation leave model/history/generation unchanged", () => {
  const s = application(),
    locale = new Localization(),
    before = s.app.exportText(),
    revision = s.app.snapshot.revision;
  locale.registerModule({ owner, defaultLocale: "en" }, defaults);
  locale.addLocale({
    owner,
    locale: "zh-Hant",
    revision: 1,
    messages: [{ key: "title", text: "你好 {name}" }],
  });
  locale.setLocale("zh-Hant-TW");
  assert.equal(locale.resolve(ref).text, "你好 Grape");
  assert.equal(locale.resolve(ref).source, "parent-locale");
  locale.setLocale("ja-JP");
  assert.equal(locale.resolve(ref).source, "module-default");
  assert(
    locale.resolve({ ...ref, key: "missing" }).notices.includes("MISSING_KEY"),
  );
  assert.equal(
    locale.resolve({ ...ref, owner: { ...owner, fingerprint: "other" } })
      .source,
    "inline-fallback",
  );
  assert.equal(
    locale.resolve({ ...ref, params: { name: "{title}<script>" } }).text,
    "Hello {title}<script>",
  );
  assert.equal(s.app.exportText(), before);
  assert.equal(s.app.snapshot.revision, revision);
  assert.equal(s.app.canUndo, false);
});
test("L10N atomic duplicate/malformed rejection, revision CAS and immutable detached catalogs", () => {
  const locale = new Localization();
  let notifications = 0;
  locale.subscribe(() => notifications++);
  assert.throws(
    () =>
      locale.registerModule(
        { owner, defaultLocale: "en" },
        { ...defaults, messages: [...defaults.messages, ...defaults.messages] },
      ),
    /CATALOG_MESSAGE/,
  );
  assert.equal(notifications, 0);
  locale.registerModule({ owner, defaultLocale: "en" }, defaults);
  assert.throws(
    () => locale.replaceLocale({ ...defaults, revision: 2 }, 0),
    /CATALOG_STALE/,
  );
  assert.equal(notifications, 1);
  locale.replaceLocale(
    { ...defaults, revision: 2, messages: [{ key: "title", text: "Updated" }] },
    1,
  );
  assert.equal(locale.resolve(ref).text, "Updated");
  assert.throws(
    () => locale.resolve({ ...ref, params: { unused: {} } } as any),
    /TEXT_PARAMETER/,
  );
  assert.throws(
    () => locale.resolve({ ...ref, owner: { ...owner, catalogVersion: 1.5 } }),
    /CATALOG_IDENTITY/,
  );
});
test("L10N observer errors/reentry are isolated, cleanup cancels later delivery, disposed service rejects", () => {
  const locale = new Localization();
  let attempts = 0,
    later = 0,
    rejected = false;
  let unsubscribe = () => {};
  locale.subscribe(() => {
    attempts++;
    unsubscribe();
    try {
      locale.setLocale("de");
    } catch {
      rejected = true;
    }
    throw Error("observer");
  });
  unsubscribe = locale.subscribe(() => later++);
  locale.setLocale("fr");
  assert(rejected);
  assert.equal(attempts, 1);
  assert.equal(later, 0);
  assert.equal(locale.locale, "fr");
  locale.dispose();
  assert.throws(() => locale.resolve(ref), /TEXT_REF/);
});
