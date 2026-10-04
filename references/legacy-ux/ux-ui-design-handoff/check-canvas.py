"""Traceability and evidence-boundary check, never executes/reads the product."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
errors = []
checks = 0

def check(ok, reason):
    global checks
    checks += 1
    if not ok:
        errors.append(reason)

data = json.loads((ROOT/'design/CANVAS_ACCEPTANCE.json').read_text(encoding='utf-8'))
coverage = json.loads((ROOT/'design/INTERACTION_COVERAGE.json').read_text(encoding='utf-8'))
manifest = json.loads((ROOT/'atlas/atlas-manifest.json').read_text(encoding='utf-8'))
entries = data['entries']
known = {e['id'] for e in coverage['entries']}
check(len(entries) == 20, 'Expected 20 named canvas cases')
check(len({e['id'] for e in entries}) == len(entries), 'Duplicate case IDs')
check(data['atlasRevision'] == manifest['revision'] == 'ATLAS-005', 'Revision mismatch')
check(data['summary']['fullyQualifiedCases'] == 0, 'Bounded evidence must not promote full qualification')
live_sections = set()
for e in entries:
    for field in ['id', 'title', 'trigger', 'preconditions', 'expected', 'cancellation', 'stateScope', 'history', 'persistence', 'spec', 'evidence', 'validation']:
        check(bool(e.get(field)), f'{e["id"]}: missing {field}')
    check(e['existingUXEntry'] in known, f'{e["id"]}: unknown original UX ID')
    check((ROOT/'design'/e['spec']).is_file(), f'{e["id"]}: missing spec')
    observed = []
    for proof in e['evidence']:
        path = (ROOT/'design'/proof['path']).resolve()
        check(path.is_file(), f'{e["id"]}: missing evidence {path}')
        if proof['kind'] == 'live-observed-bounded':
            observed.append(proof)
            live_sections.add(proof['section'])
            check(f'## {proof["section"]} ' in path.read_text(encoding='utf-8'), 'Missing named live sequence')
    check(e['validation']['status'] == ('BOUNDED_OBSERVATION' if observed else 'NOT_EXECUTED_THIS_ROUND'), f'{e["id"]}: evidence status inflated')
check(len(live_sections) == data['summary']['boundedLiveCases'] == 7, 'Live case count mismatch')
check(len(data['openItems']) == data['summary']['openItems'] == 7, 'OPEN count mismatch')
for item in data['openItems']:
    check(all(item.get(k) for k in ['id', 'title', 'unknown', 'disposition']), 'Unexplained OPEN')
new_obs = [o for e in coverage['entries'] for o in e['observations'] if o.get('sessionId') == 'canvas-live-005']
check(len(new_obs) == 7, 'Missing or duplicate coverage observations')
check(all(not o['provesFullRequiredSequence'] for o in new_obs), 'Full sequence promotion is unsupported')
check(sum(any(c['kind'] == 'observed' for c in e['claims']) for e in coverage['entries']) == coverage['summary']['entriesWithObservedClaims'], 'Stale observed-entry total')
check(coverage['summary']['fullyVerifiedSequences'] == 0, 'Original coverage was improperly promoted')
art = (ROOT/'atlas/parts/canvas.html').read_text(encoding='utf-8')
check('<script' not in art.lower() and '<input' not in art.lower(), 'Static chapter must not imply runnable product controls')
check('Esc' in art and 'Focus' in art and '框選方向不切換命中規則' in art, 'Missing behavior distinctions')
check(len([a for a in manifest['artboards'] if a['id'].startswith('ca-')]) == 5, 'Missing five indexed canvas artboards')
result = dict(status='FAIL' if errors else 'PASS', checks=checks, scope='Canvas material schema, traceability, live-evidence boundaries and static illustration index; not product runtime tests', errors=errors)
print(json.dumps(result, ensure_ascii=False, indent=2))
raise SystemExit(bool(errors))
