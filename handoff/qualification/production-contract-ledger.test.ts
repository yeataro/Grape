import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { sep } from 'node:path';
import ts from '../executable-reference/node_modules/typescript/lib/typescript.js';
// Invoke from the package root, matching all documented qualification commands.
const root = pathToFileURL(process.cwd() + sep);
const ledger = JSON.parse(readFileSync(new URL('data/production-contract-ledger.json', root), 'utf8'));
const text = readFileSync(new URL(ledger.source.path, root), 'utf8');
const ast = ts.createSourceFile(ledger.source.path, text, ts.ScriptTarget.Latest, true);
test('PC-L01 every sealed shared public type and field has an explicit disposition', () => {
  assert.equal(createHash('sha256').update(text).digest('hex'), ledger.source.sha256);
  const declarations = ast.statements.filter(n => (ts.isInterfaceDeclaration(n) || ts.isTypeAliasDeclaration(n)) && n.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword));
  assert.deepEqual(ledger.records.map((r: any) => r.sourceSymbol).sort(), declarations.map(n => (n as ts.InterfaceDeclaration).name.text).sort());
  for (const n of declarations) {
    const declaration = n as ts.InterfaceDeclaration | ts.TypeAliasDeclaration;
    const row = ledger.records.find((r: any) => r.sourceSymbol === declaration.name.text);
    const names = ts.isInterfaceDeclaration(declaration) ? declaration.members.map(m => m.name ? m.name.getText(ast) : '[extension]') : [];
    assert.deepEqual(row.fields.map((f: any) => f.field), names);
    for (const entry of [row,...row.fields]) {
      assert.ok(['EXACT_IDENTITY','NORMATIVE_SHAPE_RENAMEABLE','QUALIFICATION_ONLY'].includes(entry.classification));
      assert.ok(entry.reason.length > 20); assert.ok(existsSync(new URL(entry.productionContract.split('#')[0], root)), entry.productionContract);
    }
  }
});
test('PC-L02 closed experiment shapes cannot be mistaken for a normative production format', () => {
  const row = (name: string) => ledger.records.find((r: any) => r.sourceSymbol === name);
  assert.equal(row('GraphDocument').classification, 'QUALIFICATION_ONLY');
  assert.equal(row('StageRecord').classification, 'QUALIFICATION_ONLY');
  assert.equal(row('NodeType').fields.find((f: any) => f.field === 'stages').classification, 'QUALIFICATION_ONLY');
  assert.equal(row('TypeRef').classification, 'EXACT_IDENTITY');
  assert.ok(ledger.implementationBan.rule.includes('cannot import/copy'));
  assert.equal(ledger.examples.length, 7); assert.ok(ledger.examples.some((x: any)=>x.path==='examples/editable-panel')); assert.ok(ledger.additions.some((x: any)=>x.id==='PC-WIRE-EVIDENCE'));
});
