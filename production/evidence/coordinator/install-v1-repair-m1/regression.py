#!/usr/bin/env python3
"""M1 offline policy regression fixture. Explicit invocation; stdout only.

No network, scheduler, dispatch, Git mutation, or project-state writes. Fixture
identity assignments represent a Coordinator's established distinction, not an
automatic algorithm for deciding real operation/finding independence.
"""
import copy
import hashlib
import json
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parents[4]
PRIOR = '5d8d15bbfea440cb626fc40a31df63a2e9ca1ba8'
LEGACY_RESET = 'A changed error or genuinely new evidence may justify a documented reset.'
runbook = (ROOT / 'workflow/RUNBOOK.md').read_text()
old_runbook = subprocess.check_output(['git', '-C', str(ROOT), 'show',
                                     PRIOR + ':workflow/RUNBOOK.md'], text=True)
assert LEGACY_RESET in old_runbook and LEGACY_RESET not in runbook
assert 'same underlying operation or finding group MUST NOT reset its accumulated count' in runbook
assert 'New-identity classification MUST NOT be used to evade exhaustion' in runbook

# Fixture truth: renamed aliases point to the SAME underlying identity. The two
# independent identities represent different operations / independent findings.
IDENTITIES = {
    'dispatch-A': ('operation-A', 'operation', 'collect submission A'),
    'dispatch-A-renamed': ('operation-A', 'operation', 'collect submission A'),
    'dispatch-B': ('operation-B', 'operation', 'fetch unrelated artifact B'),
    'finding-A': ('group-A', 'group', 'counterexample at boundary A'),
    'finding-A-reframed': ('group-A', 'group', 'counterexample at boundary A'),
    'finding-B': ('group-B', 'group', 'independent counterexample at boundary B'),
}


def transition(ledger, event, legacy_reset=False):
    """In-memory fixture only; event IDs deduplicate receipt replay."""
    result = copy.deepcopy(ledger)
    if event['id'] in result['seen']:
        return result
    result['seen'].append(event['id'])
    identity = IDENTITIES.get(event['identity'])
    if identity is None:
        result['observations'].append({'event': event['id'], 'outcome': 'identity not established; no fresh counter'})
        return result
    canonical, kind, basis = identity
    limit = 2 if kind == 'operation' else 3
    row = result['budgets'].setdefault(canonical, {'kind': kind, 'basis': basis,
            'count': 0, 'initialAttempt': False, 'phase': 'OPEN'})
    outcome = 'count retained'
    if event['type'] == 'initial':
        assert kind == 'operation' and not row['initialAttempt']
        row['initialAttempt'] = True
        outcome = 'initial attempt; no retry consumed'
    elif event['type'] == 'unsuccessful':
        assert kind == 'group' or row['initialAttempt']
        if row['count'] >= limit:
            outcome = 'attempt refused; budget exhausted'
        else:
            row['count'] += 1
            outcome = 'unsuccessful round' if kind == 'group' else 'retry consumed'
    elif event['type'] == 'diagnostic' and legacy_reset:
        # Deliberately wrong negative control reproduces the prior exception.
        row['count'] = 0
        outcome = 'legacy reset'
    else:
        assert event['type'] in ('diagnostic', 'identity-check')
    row['phase'] = 'WF_RETRY_BUDGET' if row['count'] >= limit else 'OPEN'
    row['nextAction'] = (('workflow diagnosis' if kind == 'operation' else 'technical diagnosis')
                         if row['phase'] == 'WF_RETRY_BUDGET' else 'bounded continuation')
    result['observations'].append({'event': event['id'], 'identity': canonical,
                                   'count': row['count'], 'phase': row['phase'], 'outcome': outcome})
    return result


def event(i, identity, kind, expected, detail=None):
    return {'input': {'id': i, 'identity': identity, 'type': kind, 'diagnosticDetail': detail},
            'expectedCount': expected}


def trace(steps, legacy_reset=False):
    ledger = {'seen': [], 'budgets': {}, 'observations': []}
    for step in steps:
        e = step['input']
        # Restart before publication, then repeat identical delivery after it.
        actual = transition(ledger, e, legacy_reset)
        assert transition(json.loads(json.dumps(ledger)), e, legacy_reset) == actual
        assert transition(actual, e, legacy_reset) == actual
        assert transition(json.loads(json.dumps(actual)), e, legacy_reset) == actual
        if e['identity'] in IDENTITIES:
            canonical = IDENTITIES[e['identity']][0]
            assert actual['budgets'][canonical]['count'] == step['expectedCount'], e['id']
        else:
            assert actual['budgets'] == ledger['budgets']
        assert all(r['phase'] != 'HUMAN_GATE_WAIT' for r in actual['budgets'].values())
        ledger = actual
    return ledger


diagnostics = ['new diagnostics', 'changed symptoms', 'additional logs',
               'changed error message', 'new evidence']
a = [event('round-1', 'finding-A', 'unsuccessful', 1),
     event('round-2', 'finding-A', 'unsuccessful', 2)]
a += [event('group-diag-' + str(i), 'finding-A', 'diagnostic', 2, d)
      for i, d in enumerate(diagnostics)]
a += [event('round-3', 'finding-A', 'unsuccessful', 3),
      event('group-diag-after-exhaustion', 'finding-A', 'diagnostic', 3, 'new evidence'),
      event('round-4-refused', 'finding-A', 'unsuccessful', 3)]
b = [event('initial-attempt', 'dispatch-A', 'initial', 0),
     event('retry-1', 'dispatch-A', 'unsuccessful', 1)]
b += [event('op-diag-' + str(i), 'dispatch-A', 'diagnostic', 1, d)
      for i, d in enumerate(diagnostics)]
b += [event('retry-2', 'dispatch-A', 'unsuccessful', 2),
      event('op-diag-after-exhaustion', 'dispatch-A', 'diagnostic', 2, 'changed error'),
      event('retry-3-refused', 'dispatch-A', 'unsuccessful', 2)]
cases = {
    'M1-A': a,
    'M1-B': b,
    'M1-C-operation': b + [event('independent-op', 'dispatch-B', 'identity-check', 0),
                           event('independent-initial', 'dispatch-B', 'initial', 0),
                           event('independent-retry-1', 'dispatch-B', 'unsuccessful', 1)],
    'M1-C-group': a + [event('independent-group', 'finding-B', 'identity-check', 0),
                       event('independent-round-1', 'finding-B', 'unsuccessful', 1)],
    'M1-C-renamed-operation': b + [event('rename-op', 'dispatch-A-renamed', 'identity-check', 2),
                                  event('renamed-retry-refused', 'dispatch-A-renamed', 'unsuccessful', 2),
                                  event('unestablished-op', 'another-spelling', 'identity-check', None)],
    'M1-C-renamed-group': a + [event('reframe-group', 'finding-A-reframed', 'identity-check', 3),
                              event('reframed-round-refused', 'finding-A-reframed', 'unsuccessful', 3),
                              event('unestablished-group', 'another-description', 'identity-check', None)],
}
results = []
for name, steps in cases.items():
    final = trace(steps)
    exhausted = 'operation-A' if name in ('M1-B', 'M1-C-operation', 'M1-C-renamed-operation') else 'group-A'
    assert final['budgets'][exhausted]['phase'] == 'WF_RETRY_BUDGET'
    assert final['budgets'][exhausted]['count'] == (2 if exhausted == 'operation-A' else 3)
    results.append({'case': name, 'assertionsSatisfied': True, 'events': steps,
                    'observed': final, 'duplicateAndRestartAssertions': 'satisfied at every event boundary'})

negative_controls = []
for name, steps in [('M1-A', a), ('M1-B', b)]:
    try:
        trace(steps, legacy_reset=True)
    except AssertionError as error:
        negative_controls.append({'case': name, 'legacyResetDetected': True,
                                  'rejectedAt': str(error)})
    else:
        raise AssertionError('Regression failed to detect old reset exception')

print(json.dumps({'kind': 'implementer-executed-offline-M1-regressions', 'priorReviewedHead': PRIOR,
                  'runbookSha256': hashlib.sha256(runbook.encode()).hexdigest(),
                  'fixtureIdentities': IDENTITIES, 'cases': results, 'negativeControls': negative_controls,
                  'limitations': ['Synthetic ledger; no runtime adapter, external service or concurrent writer qualified.',
                                  'Identity distinctions are explicit fixture facts, not an automated semantic classifier.',
                                  'These assertions do not constitute independent review, technical PASS or acceptance.']}, indent=2))
