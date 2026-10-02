#!/usr/bin/env python3
"""Offline installation evidence fixture; no network, dispatch or file writes.

Run explicitly from repository root: python3 production/evidence/coordinator/install-v1/replay.py
Stdout is a result artifact. This small policy model is not a Coordinator runtime.
Synthetic events/receipts never alter repository project state or authorize work.
"""
import copy
import hashlib
import json
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parents[4]
BASE = 'ba39de6992827514bbd74368f67e406ec2eef06a'
POLICY = '0826de5a9cca7cf200d843435985a7dc624634a2'


def git(*args):
    return subprocess.check_output(['git', '-C', str(ROOT), *args])


def obj(ref, path):
    return git('show', f'{ref}:{path}')


def record(ref, path):
    return json.loads(obj(ref, path))


def ancestor(a, b):
    return subprocess.run(['git', '-C', str(ROOT), 'merge-base', '--is-ancestor', a, b],
                          capture_output=True).returncode == 0


def digest(data):
    return hashlib.sha256(data).hexdigest()


state = record(BASE, 'implementation-state.json')
assert state['activeSlices'] == []
assert [x['sliceId'] for x in state['completedSlices']] == ['S01', 'S02']
reviews = [record(BASE, p) for p in (
    'production/evidence/acceptance/S01-independent-review.json',
    'production/evidence/acceptance/s02/S02-independent-review.json')]
triples = [
    ('c1ecb3cd1a4cd1685e3fb1d9ba2a17b4108e68c3',
     'ab0216436d66ab1282758d51dceb38d0283c1965',
     'd44cb8ebc1d00d4a46bb4b08b93b00a6b455e83f'),
    ('e23a997f53a17f3e00bf7f83de489cfaeb367251',
     '45c08a5b27beb9c57797975cea8007c35640e16c',
     'bfbba1d3199ddd2d4a6cf8b7d00085810b92b863')]
refs = {s: git('rev-parse', s).decode().strip() for s in ('19124c1', '05d152d', 'e6dfecf')}
evidence_hashes = {}
for evidence in state['acceptedEvidence']:
    actual = digest(obj(BASE, evidence['file']))
    assert actual == evidence['sha256']
    evidence_hashes[evidence['file']] = actual

protected = [p for p in git('ls-tree', '-r', '--name-only', BASE).decode().splitlines()
             if p != 'AGENTS.md']


def verify_protected():
    # All previously tracked files other than the one authorized pointer are immutable here.
    for path in protected:
        assert (ROOT / path).read_bytes() == obj(BASE, path), path
    assert (ROOT / 'AGENTS.md').read_bytes().startswith(obj(BASE, 'AGENTS.md'))
    for path in ('COORDINATOR.md', 'RUNBOOK.md', 'PACKETS.md', 'CONFORMANCE.md'):
        assert (ROOT / 'workflow' / path).read_bytes() == obj(POLICY, 'workflow/' + path)


def derive(f):
    """Stateless routing model of the installed policy, operating only on fixtures."""
    if f.get('divergent'):
        return 'WF_BRANCH_DIVERGENCE', 'stop mutation and diagnose preserved work'
    if f.get('expectedHead') != f.get('actualHead'):
        return 'WF_INTEGRITY', 'reread and reconcile preserved Human commit'
    if f.get('contractCounterexample'):
        return 'HUMAN_GATE_WAIT', 'prepare scoped HG_ARCHITECTURE packet'
    if f.get('environmentFailure'):
        return (('WF_RETRY_BUDGET', 'workflow diagnosis') if f.get('retries', 0) >= 2
                else ('WF_ENVIRONMENT', 'restore and verify declared environment'))
    if f.get('reviewMissing') or (f.get('reviewHead') and f['reviewHead'] != f.get('candidate')):
        return 'REVIEW_PENDING', 'obtain valid exact-candidate review'
    if f.get('technicalFail'):
        return (('WF_RETRY_BUDGET', 'technical diagnosis') if f.get('round', 0) >= 3
                else ('REPAIR_REQUIRED', 'dispatch bounded repair'))
    if f.get('repairedSubmission'):
        return 'REVIEW_PENDING', 'dispatch targeted Fresh Review'
    if f.get('merged'):
        return 'MERGED_VERIFIED', 'reconcile accepted baseline and work'
    if f.get('bookkeepingValid'):
        return 'COMPLETION_RECORDED', 'wait for separate merge control'
    if f.get('humanAcceptance'):
        assert f.get('passValid')
        return 'HUMAN_ACCEPTED', 'validate bounded bookkeeping'
    if f.get('passValid'):
        return 'AWAITING_HUMAN_ACCEPTANCE', 'present bounded acceptance control'
    if f.get('needsSync'):
        return 'SYNC_REQUIRED', 'propose safe fast-forward'
    return 'WAITING_AUTHORIZATION', 'wait for Human Slice authorization'


def normalized_packet(source):
    return {k: source[k] for k in ('repository', 'authorizedScope', 'contractRefs', 'findingIds')
            if k in source}


def publication_opportunity(f, receipts):
    phase, action = derive(f)
    # Synthetic publication means emitting an in-memory route packet, never executing it.
    key = digest(json.dumps({'facts': f, 'phase': phase, 'action': action}, sort_keys=True).encode())
    return phase, action, key, key not in receipts


results = []


def exercise(case, variant, facts, expected, proof):
    before = copy.deepcopy(facts)
    observed = derive(facts)
    assert observed == expected, (case, variant, observed, expected)
    first = publication_opportunity(facts, set())
    duplicate_before = publication_opportunity(facts, set())
    restart_before = publication_opportunity(json.loads(json.dumps(facts)), set())
    assert first == duplicate_before == restart_before
    receipts = {first[2]}
    duplicate_after = publication_opportunity(facts, receipts)
    restart_after = publication_opportunity(json.loads(json.dumps(facts)), set(receipts))
    assert duplicate_after == restart_after and not restart_after[3]
    assert restart_after[:3] == first[:3]
    assert facts == before  # input truth, retry counters and scope are not mutated by routing
    packet = normalized_packet(dict(repository='yeataro/Grape', authorizedScope='synthetic fixture only',
                                    contractRefs=['IH-005'], findingIds=facts.get('findings', []),
                                    brainstorming='SYNTHETIC_UNPROMOTED_IDEA', aestheticDiscussion='EXCLUDE'))
    assert 'SYNTHETIC_UNPROMOTED_IDEA' not in json.dumps(packet)
    assert 'aestheticDiscussion' not in packet and 'brainstorming' not in packet
    verify_protected()
    results.append(dict(case=case, variant=variant, eventKind='synthetic read-only replay',
                        inputs=facts, historicalProof=proof,
                        expected={'phase': expected[0], 'singleNextAction': expected[1]},
                        observed={'phase': observed[0], 'singleNextAction': observed[1]},
                        result='PASS', replay={'duplicateBefore': 'same outstanding action',
                        'restartBefore': 'same derived phase/action',
                        'duplicateAfter': 'matching receipt suppresses publication',
                        'restartAfter': 'receipt survives fixture serialization; no duplicate',
                        'simulatedRoutePublications': 1},
                        invariants={'noLostCommits': True, 'noInventedAcceptance': True,
                        'noExtraActiveSlice': True, 'frozenHandoffUnchanged': True,
                        'speculativeContextExcluded': True}))


assert ancestor(triples[1][2], BASE)
assert git('diff', '--name-only', triples[1][2], BASE) == b''
exercise('C01', 'historical behind work', {'needsSync': True},
         ('SYNC_REQUIRED', 'propose safe fast-forward'), {'work': triples[1][2], 'main': BASE, 'workOnlyCommits': 0})
exercise('C01', 'synchronized without authorization', {},
         ('WAITING_AUTHORIZATION', 'wait for Human Slice authorization'), {'state': BASE, 'activeSlices': []})

log = obj(triples[0][1], 'production/evidence/m1-counterexample-initial.log').decode()
assert '1e+21.0' in log and 'fail 2' in log
assert 'N1' in obj(triples[0][1], 'production/evidence/REVIEW.md').decode()
proof = {'preRepair': refs['19124c1'], 'repair': triples[0][0], 'reviewSubmission': triples[0][1],
         'counterexampleLogSha256': digest(log.encode())}
exercise('C02', 'M1/N1 FAIL', {'technicalFail': True, 'findings': ['M1', 'N1'], 'round': 0},
         ('REPAIR_REQUIRED', 'dispatch bounded repair'), proof)
exercise('C02', 'repair submitted', {'repairedSubmission': True, 'candidate': triples[0][1]},
         ('REVIEW_PENDING', 'dispatch targeted Fresh Review'), proof)
exercise('C02', 'three unsuccessful rounds', {'technicalFail': True, 'round': 3},
         ('WF_RETRY_BUDGET', 'technical diagnosis'), proof)

human = refs['05d152d']
parent = git('rev-parse', human + '^').decode().strip()
assert '.github/workflows/pages-review.yml' in git('diff', '--name-only', parent, human).decode()
exercise('C03', 'stale publisher', {'expectedHead': parent, 'actualHead': human},
         ('WF_INTEGRITY', 'reread and reconcile preserved Human commit'), {'preservedHumanCommit': human})
exercise('C03', 'synthetic divergence', {'divergent': True},
         ('WF_BRANCH_DIVERGENCE', 'stop mutation and diagnose preserved work'), {'fixture': 'divergence event only; no branch changed'})

legacy = reviews[1]['legacyBranch']
assert legacy['status'] == 'NOT DELIVERED / BLOCKED' and reviews[1]['gateDispositionsChanged'] == []
exercise('C04', 'PASS before acceptance', {'passValid': True},
         ('AWAITING_HUMAN_ACCEPTANCE', 'present bounded acceptance control'), {'I': triples[1][0], 'R': triples[1][1], 'legacy': legacy})
acceptance = record(BASE, 'production/evidence/acceptance/s02/S02-human-owner-acceptance.json')
assert acceptance['authority'] == 'Human Owner'
exercise('C04', 'existing historical Human receipt', {'passValid': True, 'humanAcceptance': True},
         ('HUMAN_ACCEPTED', 'validate bounded bookkeeping'), {'receipt': 'production/evidence/acceptance/s02/S02-human-owner-acceptance.json', 'syntheticNewAcceptance': False})

for index, (i, r, b) in enumerate(triples, 1):
    assert len({i, r, b}) == 3 and ancestor(i, r) and ancestor(r, b)
    changed = git('diff', '--name-only', r, b).decode().splitlines()
    assert all(p in ('README.md', 'implementation-state.json', 'production/README.md')
               or p.startswith('production/evidence/acceptance/') for p in changed)
    for p in ('production/src', 'production/tests', 'production/tools', 'handoff'):
        assert git('rev-parse', f'{i}:{p}') == git('rev-parse', f'{r}:{p}') == git('rev-parse', f'{b}:{p}')
    exercise('C05', f'S0{index} metadata descendant', {'bookkeepingValid': True},
             ('COMPLETION_RECORDED', 'wait for separate merge control'), {'I': i, 'R': r, 'B': b, 'changedPaths': changed})

pr_facts = json.loads((Path(__file__).parent / 'historical-pr-facts.json').read_text())['facts']
for pr in pr_facts:
    assert pr['merged'] and pr['historicalBodySaysNoMerge'] and ancestor(pr['mergeCommit'], BASE)
    exercise('C06', f'PR {pr["number"]} lost response', {'merged': True},
             ('MERGED_VERIFIED', 'reconcile accepted baseline and work'), pr)

for review in reviews:
    assert review['provenance']['reviewerIdentity'] is None
    assert not review['provenance']['originalReviewerReportAttached']
    assert review['independentValidationSummary']['independentExecutionCounts'] is None
exercise('C07', 'old report new product candidate', {'reviewHead': triples[0][1], 'candidate': triples[1][0]},
         ('REVIEW_PENDING', 'obtain valid exact-candidate review'), {'provenance': 'historical owner-reported; null identities preserved'})
exercise('C07', 'malformed or missing review', {'reviewMissing': True},
         ('REVIEW_PENDING', 'obtain valid exact-candidate review'), {'fixture': 'synthetic missing report; no PASS fabricated'})

packaging = refs['e6dfecf']
assert git('diff', '--name-only', packaging + '^', packaging).decode().strip() == 'README.md'
exercise('C08', 'packaging defect', {'technicalFail': True},
         ('REPAIR_REQUIRED', 'dispatch bounded repair'), {'packagingRepair': packaging})
exercise('C08', 'wrong runtime or unavailable artifact', {'environmentFailure': True, 'retries': 0},
         ('WF_ENVIRONMENT', 'restore and verify declared environment'), {'fixture': 'synthetic runtime/access failure'})
exercise('C08', 'two unsuccessful transient retries', {'environmentFailure': True, 'retries': 2},
         ('WF_RETRY_BUDGET', 'workflow diagnosis'), {'fixture': 'initial attempt plus two retries; no product Gate'})

deferred = record(BASE, 'production/evidence/acceptance/S01-human-owner-acceptance.json')['deferredUiObservations']
assert all(not x['expandsS01'] for x in deferred)
exercise('C09', 'unpromoted discussion', {},
         ('WAITING_AUTHORIZATION', 'wait for Human Slice authorization'), {'deferredObservationCount': len(deferred), 'textForwarded': False})
exercise('C09', 'synthetic impossible-contract dependency', {'contractCounterexample': True},
         ('HUMAN_GATE_WAIT', 'prepare scoped HG_ARCHITECTURE packet'),
         {'fixture': 'synthetic requirement simultaneously demands publish and no publish of the same mutation; no actual Grape conflict asserted',
          'scope': 'simulated authorized dependency only; unaffected work preserved'})

print(json.dumps({'recordKind': 'offline-workflow-policy-model-execution', 'policyRevision': POLICY,
                  'baseline': BASE, 'historicalRefs': refs, 'acceptedEvidenceHashes': evidence_hashes,
                  'casesExecuted': sorted(set(x['case'] for x in results)), 'variantsExecuted': len(results),
                  'results': results, 'capabilityLimits': [
                      'PASS means historical-fact and in-memory policy-model assertions executed successfully.',
                      'Restart uses JSON serialization and replay of synthetic receipts, not a killed live service.',
                      'No real isolated Implementer/Reviewer dispatch, external retry or concurrent publisher tested.',
                      'No adapter or production behavior is qualified; no product Slice authorized.']}, indent=2))
