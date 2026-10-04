"""Portable evidence/material consistency only. Never reads or writes product repositories."""
import hashlib
import json
import re
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parent
errors = []
json_count = 0
for file in ROOT.rglob('*.json'):
    try:
        json.loads(file.read_text(encoding='utf-8'))
        json_count += 1
    except (ValueError, UnicodeError) as exc:
        errors.append(f'{file.relative_to(ROOT)}: {exc}')

docs = [ROOT/'README.md', ROOT/'atlas/README.md', ROOT/'atlas/COLOR_PICKER_SPEC.md',
        ROOT/'design/UX_UI_REPORT.md', ROOT/'design/DESIGN_PREMISES.md', ROOT/'design/ATLAS_004_CHANGELOG.md',
        ROOT/'design/CANVAS_INTERACTION_SPEC.md', ROOT/'design/ATLAS_005_CHANGELOG.md']
refs = 0
for file in docs:
    for target in re.findall(r'\]\(([^)]+)\)', file.read_text(encoding='utf-8')):
        target = target.strip('<>')
        url = urlsplit(target)
        if url.scheme or not url.path:
            continue
        refs += 1
        if not (file.parent/unquote(url.path)).exists():
            errors.append(f'Missing local Markdown reference: {file.name} -> {target}')

historical = ROOT/'visual-reference/historical'
images = json.loads((historical/'index.json').read_text(encoding='utf-8'))['images']
for entry in images:
    file = historical/entry['file']
    if not file.exists() or hashlib.sha256(file.read_bytes()).hexdigest() != entry['sha256']:
        errors.append(f'Historical image changed/missing: {entry["file"]}')

manifest = json.loads((ROOT/'atlas/atlas-manifest.json').read_text(encoding='utf-8'))
coverage = json.loads((ROOT/'design/INTERACTION_COVERAGE.json').read_text(encoding='utf-8'))
if manifest['revision'] != 'ATLAS-005' or coverage['designReviewAmendment']['artifactRevision'] != 'ATLAS-005':
    errors.append('Atlas/coverage revision mismatch')
for record in coverage['sourceRecords']:
    if not (ROOT/'design'/record['path']).resolve().exists():
        errors.append(f'Missing coverage source: {record["path"]}')
for record in coverage['designCoverageSupplement']['chapters']:
    known = {entry['id'] for entry in coverage['entries']}
    if not set(record['existingUXEntries']).issubset(known):
        errors.append(f'Invalid UX entry mapping: {record["id"]}')

result = {'scope':'Portable material JSON, Markdown locators, original screenshot hashes, design supplement mappings; not runtime or architecture qualification',
          'status':'FAIL' if errors else 'PASS','jsonFilesParsed':json_count,'markdownLocalTargetsChecked':refs,
          'historicalImageHashesChecked':len(images),'existingUXEntries':len(coverage['entries']),
          'designSupplements':len(coverage['designCoverageSupplement']['chapters']),'errors':errors}
print(json.dumps(result,ensure_ascii=False,indent=2))
raise SystemExit(bool(errors))
