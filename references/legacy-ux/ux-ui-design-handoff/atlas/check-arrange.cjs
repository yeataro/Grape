/* Self-contained offline checks. Node built-ins only; no browser, server or product access.
 * The tiny DOM double covers only the selectors/events used by arrange.js. It does not
 * qualify CSS rendering, accessibility, focus or real browser event behavior.
 * Run: node atlas/check-arrange.cjs (from any cwd).
 */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const parts = path.join(__dirname, 'parts');
const read = name => fs.readFileSync(path.join(parts, name), 'utf8');
const html = read('arrange.html'), css = read('arrange.css'), js = read('arrange.js');
const manifest = JSON.parse(read('arrange-manifest.json'));
const checks = [];
const check = (name, condition) => { assert.ok(condition, name); checks.push(name); };
const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);

class Element {
  constructor(tag) { this.tagName = tag.toLowerCase(); this.attrs = {}; this.dataset = {}; this.style = {}; this.children = []; this.events = {}; this.textContent = ''; this.value = ''; this.checked = false; this.disabled = false; }
  setAttribute(key, value) {
    this.attrs[key] = String(value);
    if (key.startsWith('data-')) this.dataset[key.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = String(value);
    if (key === 'value') this.value = String(value);
    if (key === 'checked') this.checked = true;
    if (key === 'disabled') this.disabled = true;
  }
  getAttribute(key) { return this.attrs[key] ?? null; }
  append(...children) { this.children.push(...children); }
  replaceChildren(...children) { this.children = children; }
  addEventListener(type, callback) { (this.events[type] ||= []).push(callback); }
  fire(type) { for (const callback of this.events[type] || []) callback({ target: this }); }
  matches(selector) {
    if (selector.startsWith('#')) return this.attrs.id === selector.slice(1);
    if (selector.startsWith('.')) return (this.attrs.class || '').split(/\s+/).includes(selector.slice(1));
    const match = selector.match(/^([\w-]*)\[([\w-]+)(?:(\^?=)["']?([^"'\]]+)["']?)?\]$/);
    if (match) {
      if (match[1] && this.tagName !== match[1]) return false;
      const value = this.attrs[match[2]];
      if (value === undefined) return false;
      return !match[3] || (match[3] === '^=' ? value.startsWith(match[4]) : value === match[4]);
    }
    return this.tagName === selector;
  }
  querySelectorAll(selector) { const result = []; for (const child of this.children) { if (child.matches(selector)) result.push(child); result.push(...child.querySelectorAll(selector)); } return result; }
  querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
}

// Parse tag/attribute structure only. Text layout and HTML error recovery are outside scope.
const documentRoot = new Element('document'), stack = [documentRoot];
const voidTags = new Set(['input', 'hr', 'br', 'img', 'meta', 'link']);
for (const match of html.matchAll(/<!--[^]*?-->|<\/?([\w-]+)([^>]*?)>/g)) {
  if (!match[1]) continue;
  const tag = match[1].toLowerCase();
  if (match[0].startsWith('</')) { assert.equal(stack.at(-1).tagName, tag, `balanced HTML ${tag}`); stack.pop(); continue; }
  const element = new Element(tag);
  for (const attr of match[2].matchAll(/([\w:-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) element.setAttribute(attr[1], attr[2] ?? attr[3] ?? attr[4] ?? '');
  stack.at(-1).append(element);
  if (!voidTags.has(tag) && !match[0].endsWith('/>')) stack.push(element);
}
assert.equal(stack.length, 1, 'balanced fragment');
for (const select of documentRoot.querySelectorAll('select')) {
  const options = select.querySelectorAll('option');
  select.value = (options.find(option => option.attrs.selected !== undefined) || options[0])?.value || '';
}
const documentDouble = { readyState: 'complete', getElementById: id => documentRoot.querySelector('#' + id), createElementNS: (_, tag) => new Element(tag) };
const context = vm.createContext({ document: documentDouble });
new vm.Script(js, { filename: 'arrange.js' }).runInContext(context);
const root = documentDouble.getElementById('arrange'), q = selector => root.querySelector(selector);
const click = selector => { const e = q(selector); assert.ok(e, selector); assert.equal(e.disabled, false, selector + ' enabled'); e.fire('click'); };
const choose = (selector, value) => { const e = q(selector); e.value = String(value); e.fire('change'); };
const positions = selector => q(selector).querySelectorAll('[data-ar-node]').map(n => ({ id: n.dataset.arNode, x: +n.dataset.x, y: +n.dataset.y, w: +n.dataset.width, h: +n.dataset.height }));

check('all manifest artboard IDs exist', manifest.artboards.every(b => documentDouble.getElementById(b.id)));
check('unique IDs', new Set(documentRoot.querySelectorAll('[id]').map(n => n.attrs.id)).size === documentRoot.querySelectorAll('[id]').length);
check('11 command inventory', q('.ar-command-list').children.filter(n => n.tagName === 'div').length === 11);
check('source-first fixture', positions('[data-ar-auto-after]').find(n => n.id === 'D').x === 40 && positions('[data-ar-auto-after]').find(n => n.id === 'E').x === 808);
click('[data-ar-auto="output"]');
check('output-first short branch', positions('[data-ar-auto-after]').find(n => n.id === 'D').x === 552 && positions('[data-ar-auto-after]').find(n => n.id === 'A').y === 136.5);
click('[data-ar-auto-undo]');
check('auto local undo', positions('[data-ar-auto-after]').find(n => n.id === 'D').x === 40 && q('[data-ar-auto-undo]').disabled);
const before = positions('[data-ar-manual-svg]');
click('[data-ar-apply]');
check('equal horizontal edge gaps', equal(positions('[data-ar-manual-svg]').map(n => n.x), [45, 275, 545, 760]));
click('[data-ar-undo]');
check('manual local undo', equal(positions('[data-ar-manual-svg]'), before));
choose('[data-ar-count]', '2');
check('equal-gap guard below 3', q('[data-ar-apply]').disabled && q('[data-ar-operation]').querySelectorAll('option[value^="space"]').every(n => n.disabled));
choose('[data-ar-operation]', 'left'); click('[data-ar-apply]');
check('only selected cards move', equal(positions('[data-ar-manual-svg]').map(n => n.x), [45, 45, 510, 760]));
check('dimensions preserved', equal(positions('[data-ar-manual-svg]').map(n => [n.w, n.h]), before.map(n => [n.w, n.h])));
q('[data-ar-readonly]').checked = true; q('[data-ar-readonly]').fire('change');
check('read-only guards', q('[data-ar-apply]').disabled && q('[data-ar-undo]').disabled);
q('[data-ar-readonly]').checked = false; q('[data-ar-readonly]').fire('change');
click('[data-ar-reset]'); choose('[data-ar-count]', '4'); choose('[data-ar-operation]', 'grid'); click('[data-ar-apply]');
check('grid actual dimensions', equal(positions('[data-ar-manual-svg]').map(n => [n.x, n.y]), [[45, 65], [253, 65], [45, 258], [253, 258]]));
click('[data-ar-apply]');
check('stable repeat no new demo edit', q('[data-ar-manual-status]').textContent.includes('位置相同'));
click('[data-ar-reset]'); choose('[data-ar-operation]', 'spaceY'); click('[data-ar-apply]');
check('vertical gap minimum extends span', equal(positions('[data-ar-manual-svg]').map(n => n.y), [65, 213, 406, 569]));
click('[data-ar-reset]'); choose('[data-ar-operation]', 'right'); click('[data-ar-apply]'); choose('[data-ar-operation]', 'spaceX'); click('[data-ar-apply]');
check('sequential layout expands scrollable drawing bounds', q('[data-ar-manual-svg]').getAttribute('viewBox') === '0 0 1604 760' && positions('[data-ar-manual-svg]').every(n => n.x + n.w < 1604));

// Goldens generated once from unmodified e005f08 selectionSpreadPositions.
// No canonical-repository dependency when rerunning this test.
const spreadGoldens = [
  [-180, [45, 217.92, 435.92]], [-150, [45, 220.09345794392522, 440]],
  [-100, [45, 246.7289719626168, 490]], [-30, [45, 284.01869158878503, 560]],
  [0, [45, 300, 590]], [80, [45, 342.61682242990656, 670]],
  [160, [45, 385.2336448598131, 750]], [220, [45, 417.196261682243, 810]]
];
for (const [delta, xs] of spreadGoldens) {
  q('[data-ar-spread]').value = String(delta); q('[data-ar-spread]').fire('input');
  const got = positions('[data-ar-spread-svg]');
  check('spread source golden ' + delta, got.every((n, i) => Math.abs(n.x - xs[i]) < 1e-8 && n.y === 90 && n.w === [150, 210, 130][i] && n.h === [100, 135, 115][i]));
}
click('[data-ar-spread-reset]');
check('spread reset', equal(positions('[data-ar-spread-svg]').map(n => n.x), [45, 300, 590]));
const references = manifest.artboards.flatMap(b => b.sourceReferences).concat(manifest.sourceReferences);
check('self-contained evidence paths resolve', references.every(ref => fs.existsSync(path.resolve(parts, ref.path.split('#')[0]))));
check('no external resource markup', !/<(?:script|link|img|iframe)[^>]+(?:src|href)=["'](?:https?:|\/\/)/i.test(html) && !/url\(\s*["']?(?:https?:|\/\/)/i.test(css));
check('no network or persistence APIs', !/\b(?:fetch|XMLHttpRequest|WebSocket|localStorage|sessionStorage|indexedDB)\b/.test(js));
check('read-only VM surfaces suffice', root.dataset.arInitialized === 'true');
console.log(JSON.stringify({ status: 'pass', checks: checks.length, names: checks, mode: 'Node built-ins + minimal DOM double; no browser/server/product', limits: 'No CSS geometry, actual focus, pointer lifecycle or accessibility qualification' }, null, 2));
