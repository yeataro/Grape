// Static document-artifact rendering only. This does not run the product or test UI behavior.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import path from 'node:path';

const root = path.dirname(fileURLToPath(import.meta.url));
const evidence = JSON.parse(await readFile(path.join(root, '../executable-reference/evidence/PACKAGE_VALIDATION.json'), 'utf8'));
const tooling = evidence.browserTooling;
if (!tooling?.modulePath || !tooling?.channel) throw new Error('Explicit browser tooling is required.');
const { chromium } = await import(pathToFileURL(tooling.modulePath).href);
const browser = await chromium.launch({ headless: true, channel: tooling.channel });
const renderings = [];
try {
  await mkdir(path.join(root, 'rendered'), { recursive: true });
  for (const [name, width, height] of [
    ['workspace-schematic', 1280, 760],
    ['states-schematic', 1280, 690],
  ]) {
    const svg = await readFile(path.join(root, `${name}.svg`));
    const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
    await page.setContent(`<html><head><style>html,body{margin:0;padding:0;}svg{display:block;}</style></head><body>${svg.toString('utf8')}</body></html>`);
    await page.evaluate(() => document.fonts.ready);
    const output = path.join(root, 'rendered', `${name}.png`);
    await page.screenshot({ path: output, fullPage: false });
    const png = await readFile(output);
    renderings.push({
      source: `${name}.svg`,
      sourceSha256: createHash('sha256').update(svg).digest('hex'),
      output: `rendered/${name}.png`,
      outputSha256: createHash('sha256').update(png).digest('hex'),
      viewport: { width, height, deviceScaleFactor: 1 },
    });
    await page.close();
  }
  await writeFile(path.join(root, 'rendered/RENDER_RECORD.json'), JSON.stringify({
    scope: 'Static handoff SVG artifact rendering; not product screenshots, UI behavior validation, or a new architecture experiment.',
    renderedAt: new Date().toISOString(),
    runtime: process.version,
    tooling: { modulePath: tooling.modulePath, package: tooling.name, version: tooling.version, channel: tooling.channel, browser: browser.version(), headless: true },
    renderings,
    visualInspection: 'Recorded separately in VISUAL_QA.md after inspecting the PNG artifacts.',
  }, null, 2) + '\n');
} finally {
  await browser.close();
}
