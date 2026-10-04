"""Checks this design artifact, NOT product behavior or browser rendering."""
import json, re, subprocess
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
import xml.etree.ElementTree as ET

P=Path(__file__).resolve().parent
text=(P/'index.html').read_text(encoding='utf-8')
errors=[]
class Scan(HTMLParser):
    def __init__(self):
        super().__init__();self.ids=[];self.refs=[];self.fields=[];self.boards=[];self.attrs=[]
    def handle_starttag(self,tag,attrs):
        a=dict(attrs);self.attrs.append((tag,a))
        if a.get('id'):self.ids.append(a['id'])
        if a.get('data-artboard'):self.boards.append(a['data-artboard'])
        for k in ['href','src']:
            if a.get(k):self.refs.append(a[k])
        if tag in ['input','select','textarea']:self.fields.append(a)
    handle_startendtag=handle_starttag
s=Scan();s.feed(text)
def check(condition,message):
    if not condition:errors.append(message)
check(len(s.ids)==len(set(s.ids)),'Duplicate HTML IDs')
for ref in s.refs:
    u=urlsplit(ref)
    check(u.scheme in ['', 'data'],f'Unexpected external dependency: {ref}')
    if u.scheme:continue
    target=(P/unquote(u.path)).resolve() if u.path else P/'index.html'
    check(target.exists(),f'Missing file: {ref}')
    if not u.path and u.fragment:check(unquote(u.fragment) in s.ids,f'Missing anchor: {ref}')
for tag,a in s.attrs:
    for k in ['for','aria-labelledby','aria-describedby','aria-controls']:
        if a.get(k):
            for ref in a[k].split():check(ref in s.ids,f'{k} missing target {ref}')
check('type="color"' not in text,'Native color picker must not be a dependency')
check('<!-- ' not in text and '/* ATLAS_' not in text,'Unexpanded template marker')
check('を<br>編集' not in text and '<span class="phrase-lock">を編集</span>' in text,'Japanese phrase split regression')
check('class="port-scene"' in text and '同一條連線' in text,'Connected socket study needs a visible connecting wire')
check(text.count('class="grape-mark"')==3,'Three exact mark instances expected')
for svg in re.findall(r'<svg\b[^>]*>.*?</svg>',text,re.S):
    try:ET.fromstring(svg)
    except ET.ParseError as exc:errors.append(f'Invalid SVG: {exc}')
check(text.count('aria-label="左側欄寬度把手示意"')==1,'Missing left resize grip')
check(text.count('aria-label="右側欄寬度把手示意"')==1,'Missing right resize grip')
check('observed wrapping' not in text,'Incorrect Japanese wrapping must not remain labeled observed')
m=json.loads((P/'atlas-manifest.json').read_text(encoding='utf-8'))
check(m['artboardCount']==len(m['artboards']),'Stale artboard count')
check(len({a['id'] for a in m['artboards']})==len(m['artboards']),'Duplicate artboard index')
for a in m['artboards']:
    check(a['id'] in s.boards or a['id'] in s.ids,f'Artboard missing from HTML: {a["id"]}')
    check(a.get('anchor') in s.ids,f'Invalid artboard anchor: {a["id"]}')
    for r in a.get('sourceReferences',[]):
        if isinstance(r,dict) and 'path' in r:check((P/r['path']).resolve().exists(),f'Missing evidence: {r["path"]}')
for name in m['sourceFiles']:check((P/name).exists(),f'Missing source index file: {name}')
for source in ['atlas.js']+[f'parts/{part}.js' for part in ['links','groups','arrange','panels','fields','color']]:
    run=subprocess.run(['node','--check',str(P/source)],capture_output=True,text=True)
    check(run.returncode==0,f'JS syntax {source}: {run.stderr}')
script=text[text.index('<script>')+8:text.rindex('</script>')]
run=subprocess.run(['node','--check'],input=script,capture_output=True,text=True,encoding='utf-8')
check(run.returncode==0,f'Combined JS syntax: {run.stderr}')
check('window.openai' not in text and 'globalThis.Tweak' not in text and 'data-lucide=' not in text,'Atlas must not depend on conversation runtime')
result={'scope':'Static atlas integrity, links, SVG and syntax only; not visual/product qualification','status':'FAIL' if errors else 'PASS','htmlIds':len(s.ids),'artboards':len(m['artboards']),'localReferences':len(s.refs),'svgCount':len(re.findall('<svg\\b',text)),'errors':errors}
print(json.dumps(result,ensure_ascii=False,indent=2))
raise SystemExit(bool(errors))
