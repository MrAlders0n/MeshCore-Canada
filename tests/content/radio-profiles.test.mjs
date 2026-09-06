import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import test from "node:test";

const source = readFileSync(new URL("../../docs/assets/javascripts/radio-profiles.js", import.meta.url), "utf8");
const profiles = JSON.parse(readFileSync(new URL("../../docs/assets/radio-profiles.json", import.meta.url), "utf8"));

function fixture({ french = false, offline = false } = {}) {
  const select = { options: [], notices: [], appendChild(option) { this.options.push(option); }, after(notice) { this.notices.push(notice); } };
  const window = {};
  vm.runInNewContext(source, { window, URL, document: {
    currentScript: { src: "https://meshcore.ca/assets/javascripts/radio-profiles.js" },
    documentElement: { lang: french ? "fr" : "en" },
    createElement() { return { setAttribute() {} }; }
  }, fetch: async () => ({ ok: !offline, json: async () => profiles }) });
  return { select, api: window.MeshCoreRadioProfiles };
}

test("radio and hash changes are opt-in and use the shared community source", async () => {
  const { select, api } = fixture();
  assert.deepEqual(Array.from(api.commands("keep", "keep")), []);
  await api.populate(select);
  assert.equal(select.options.length, profiles.length);
  assert.deepEqual(Array.from(api.commands("bc-mesh", "2")), ["set radio 910.425,62.5,7,5", "set path.hash.mode 2"]);
  assert.deepEqual(Array.from(api.commands("canada", "keep")), ["set radio 910.525,62.5,7,5"]);
  assert.deepEqual(Array.from(api.commands("keep", "0")), ["set path.hash.mode 0"]);
  assert.throws(() => api.commands("unknown", "2"), /Unknown radio profile/);
});

test("French labels use the same radio commands", async () => {
  const { select, api } = fixture({ french: true });
  await api.populate(select);
  assert.match(api.label("canada"), /Réglages canadiens/);
  assert.match(api.label("keep"), /Conserver/);
  assert.deepEqual(Array.from(api.commands("canada", "1")), ["set radio 910.525,62.5,7,5", "set path.hash.mode 1"]);
});

test("a failed profile download cannot silently select national radio defaults", async () => {
  const { select, api } = fixture({ offline: true });
  await api.populate(select);
  assert.equal(select.options.length, 0);
  assert.match(select.notices[0].textContent, /unavailable/);
  assert.deepEqual(Array.from(api.commands("keep", "keep")), []);
  assert.throws(() => api.commands("canada", "keep"), /Unknown radio profile/);
});
