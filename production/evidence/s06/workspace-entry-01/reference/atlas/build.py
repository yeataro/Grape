"""Build this offline design atlas. Uses stdlib only; never touches product repos."""
import json
import os
import re
from pathlib import Path
from html import escape

ROOT = Path(__file__).resolve().parent
PARTS = ['canvas','links','groups','arrange','panels','fields','color']
MARK = '<svg class="grape-mark" viewBox="0 0 64 64" width="28" height="28" aria-hidden="true"><circle cx="20" cy="23" r="11" fill="#bfa5f4"/><circle cx="44" cy="23" r="11" fill="#a98be2"/><circle cx="32" cy="44" r="11" fill="#b499ef"/></svg>'

def icon(name):
    shapes={
      'down':'<path d="M4 8h16l-8 9Z"/>',
      'right':'<path d="m8 4 9 8-9 8Z"/>',
      'undo':'<path d="M9 5 4 10l5 5M4 10h9a6 6 0 0 1 6 6v3"/>',
      'redo':'<path d="m15 5 5 5-5 5m5-5h-9a6 6 0 0 0-6 6v3"/>',
      'select':'<rect x="4" y="4" width="16" height="16" rx="1" stroke-dasharray="3 3"/>',
      'left-pane':'<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M9 4v16"/>',
      'right-pane':'<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M15 4v16"/>',
      'bottom-pane':'<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M3 14h18"/>',
      'expand':'<path d="M14 3h7v7M21 3l-9 9M10 5H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5"/>',
      'close':'<path d="m6 6 12 12M18 6 6 18"/>',
      'copy':'<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M15 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h3"/>',
      'paste':'<rect x="5" y="5" width="14" height="16" rx="2"/><rect x="9" y="2" width="6" height="5" rx="1"/>',
      'delete':'<path d="M3 6h18M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7m4-7v7"/>',
      'collapse':'<path d="M4 5h16M4 19h16m-7-6-3-3-3 3m0-2 3 3 3-3"/>',
      'frame':'<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/><rect x="8" y="8" width="8" height="8"/>',
      'settings':'<path d="M4 6h16M4 12h16M4 18h16"/><circle cx="9" cy="6" r="2" fill="#1c1c25"/><circle cx="15" cy="12" r="2" fill="#1c1c25"/><circle cx="9" cy="18" r="2" fill="#1c1c25"/>',
      'square':'<rect x="4" y="4" width="16" height="16" rx="2"/>',
      'circle':'<circle cx="12" cy="12" r="8"/>',
      'triangle':'<path d="m12 3 10 18H2Z"/>',
      'plus':'<path d="M12 5v14M5 12h14"/>',
      'swatch-book':'<rect x="3" y="3" width="7" height="18" rx="2"/><path d="m10 5 7 4-7 12M10 12h9a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H6"/><circle cx="6.5" cy="17.5" r=".5"/>',
      'palette':'<path d="M12 3a9 9 0 1 0 0 18h1a2 2 0 0 0 1.4-3.4 1.2 1.2 0 0 1 .9-2H17a4 4 0 0 0 4-4A9 9 0 0 0 12 3Z"/><circle cx="7.5" cy="10" r=".7"/><circle cx="11" cy="7" r=".7"/><circle cx="15.5" cy="8" r=".7"/>',
      'pipette':'<path d="m14 5 5 5M3 21l3-1 11-11-3-3L3 17Zm11-15 2-2a3 3 0 0 1 4 4l-2 2M4 17l3 3"/>',
    }
    cls='atlas-icon'+(' triangle' if name in ['down','right'] else '')
    return f'<svg class="{cls}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">{shapes[name]}</svg>'

def row(label, typ='float', value=None, output=False, connected=False, extra='', fill=0):
    colors={'float':'#c4c1bc','int':'#c4c1bc','vec2':'#8fc5ee','vec3':'#87ceb7','vec4':'#c5b2e2','mat3':'#a1adb7','TDMatrix[4]':'#bbb5c7'}
    cls='g-row'+(' out' if output else '')+(' has-value' if value is not None else '')+(' connected' if connected else '')+(' struct' if typ=='TDMatrix[4]' else '')
    val=f'<span class="g-field" style="--fill:{fill}%">{escape(str(value))}</span>' if value is not None else ''
    return f'<div class="{cls}" style="--type:{colors[typ]}" {extra}><span class="g-port" aria-label="{"已接上" if connected else "未接上"}"></span><span class="g-label">{escape(label)}</span><small>{escape(typ)}</small>{val}</div>'

def node(title, rows, role='#43345c', cls='', mode='', attrs=''):
    wire='<span class="g-collapse-wire" aria-hidden="true"></span>' if cls=='collapsed' else ''
    return f'<div class="g-node {cls}" style="--role:{role}" {attrs}>{wire}<div class="g-title"><span>{title}</span>{f"<span class=\"g-mode\">{mode}</span>" if mode else ""}</div><div class="g-ports">{"".join(rows)}</div><span class="g-resize" aria-hidden="true"></span></div>'

def voronoi(dynamic=False, cls=''):
    rows=[row('Vector','vec3',connected=True)]
    if dynamic: rows.append(row('W',value=0,extra='data-dynamic="w-input" hidden'))
    rows += [row('Scale',value=5,fill=50),row('Detail',value=0),row('Roughness',value=.5,fill=50),row('Lacunarity',value=2,fill=20),row('Randomness',value=1,fill=100),row('Distance',output=True)]
    rows += [row('Color','vec4',output=True,connected=True,extra='data-dynamic="color"' if dynamic else ''),row('Position','vec3',output=True,extra='data-dynamic="position"' if dynamic else '')]
    if dynamic: rows.append(row('W',output=True,extra='data-dynamic="w-output" hidden'))
    return node('Voronoi',rows,cls=cls)

def main():
    shell=(ROOT/'shell.html').read_text(encoding='utf-8')
    multiply=[row('a','vec3',connected=True),row('b','float',1,fill=10),row('out','vec3',output=True)]
    inspector='''<div class="wb-inspector"><div class="wb-ins-title">▾ Voronoi <span>Voronoi_1</span></div><div class="wb-ins-tabs"><b>Parameters</b> Settings　 Notes</div><div class="wb-ins-row"><span>Dimensions</span><span class="wb-ins-val">3D　⌄</span></div><div class="wb-ins-row"><span>Feature</span><span class="wb-ins-val">F1　⌄</span></div><div class="wb-ins-row"><span>Distance</span><span class="wb-ins-val">Euclidean　⌄</span></div><div class="wb-ins-row"><span>Vector <small>vec3</small></span><span class="wb-ins-ref">Vertex Inputs · world</span></div><div class="wb-ins-row"><span>Scale <small>float</small></span><span class="wb-ins-val">5</span></div><div class="wb-ins-row"><span>Detail <small>float</small></span><span class="wb-ins-val">0</span></div></div>'''
    layouts=node('Vertex Inputs',[row('world','vec3',output=True,connected=True),row('normal','vec3',output=True),row('color','vec4',output=True),row('uv','vec3',output=True)],'#62414f','source')+voronoi(cls='operator selected')+node('Color Output',[row('Buffer 0','vec4',connected=True)],'#38524a','output','1 ⌄')
    replacements={
      '<!-- LAYOUT_NODES -->':layouts,
      '<!-- INSPECTOR_COPY -->':inspector,
      '<!-- NORMAL_NODE -->':node('Multiply',multiply,mode='Auto · vec3 ⌄'),
      '<!-- SELECTED_NODE -->':node('Multiply',multiply,cls='selected',mode='Auto · vec3 ⌄'),
      '<!-- COLLAPSED_NODE -->':node('▸ Multiply',multiply,cls='collapsed',mode='vec3'),
      '<!-- MEASURE_NODE -->':node('Multiply',multiply,mode='Auto · vec3 ⌄'),
      '<!-- SOURCE_NODE -->':node('Vertex Inputs',[row('world','vec3',output=True,connected=True),row('normal','vec3',output=True),row('color','vec4',output=True),row('tangentToWorld','mat3',output=True)],'#62414f'),
      '<!-- STRUCT_NODE -->':node('Array',[row('out','TDMatrix[4]',output=True)],'#384d73',mode='TDMatrix[4] ⌄'),
      '<!-- PREVIEW_NODE -->':node('Preview',[row('value','vec3',connected=True)],'#38524a','preview'),
      '<!-- DYNAMIC_NODE -->':voronoi(dynamic=True,cls='selected'),
    }
    for marker,val in replacements.items(): shell=shell.replace(marker,val)
    shell=shell.replace('<!-- GRAPE_MARK -->',MARK)
    grid=json.loads((ROOT/'evidence.json').read_text(encoding='utf-8'))['gridSamples']
    shell=shell.replace('<!-- GRID_SAMPLES -->',''.join(f'<figure><div class="grid-sample" style="--dot:{g["dotRadiusCssPx"]}px;--step:{g["screenStepCssPx"]}px"></div><figcaption><strong>{g["zoomPercent"]}%</strong><br>畫面點距 {g["screenStepCssPx"]}px<br>圖中點距 {g["worldStep"]}<br>點半徑 {g["dotRadiusCssPx"]:.3f}px</figcaption></figure>' for g in grid))
    # Visual symbols, not architecture or a proposed production icon registry.
    for char,name in {'⌄':'down','▾':'down','▸':'right','↶':'undo','↷':'redo','□':'select','◧':'left-pane','◨':'right-pane','▤':'bottom-pane','↗':'expand','⚙':'settings','⛶':'frame'}.items():
        shell=shell.replace(char,icon(name))
    shell=shell.replace('<span>×</span>',f'<span>{icon("close")}</span>')
    shell=shell.replace('Copy · Paste · Delete　│　Collapse · Frame',''.join(f'<span title="{name.title()}">{icon(name)}</span>' for name in ['copy','paste','delete','collapse','frame']))
    for part in PARTS:
        shell=shell.replace(f'<!-- {part.upper()}_FRAGMENT -->',(ROOT/'parts'/f'{part}.html').read_text(encoding='utf-8'))
    # Bake the conversation mock's icon placeholders into local SVG; no host icon runtime.
    shell=re.sub(r'<i data-lucide="([a-z-]+)" aria-hidden="true"></i>',lambda m:icon(m[1]),shell)
    css='\n'.join((ROOT/p).read_text(encoding='utf-8') for p in ['atlas.css']+[f'parts/{part}.css' for part in PARTS])
    js='\n'.join((ROOT/p).read_text(encoding='utf-8') for p in ['atlas.js']+[f'parts/{part}.js' for part in PARTS if (ROOT/'parts'/f'{part}.js').exists()])
    shell=shell.replace('/* ATLAS_CSS */',css).replace('/* ATLAS_JS */',js)
    reviews=[('canvas-operations','畫布平移／縮放／選取／拖曳與取消'),('layout','整體工作空間／Minimal／Focus'),('nodes','Node 保真與 socket 新方向'),('dynamic','動態接口與連線提示'),('links','Link＋箭頭導航與快捷'),('groups','Group 成員規則／外觀／操作'),('arrange','節點排列／對齊／等距'),('panels','搜尋／Sources／Inspector'),('fields','數值與分量排版'),('overlays','三種浮動／對話行為'),('color','精簡色彩面板／Uniform 與常數提交'),('states','例外狀態與多語言')]
    rows=''.join(f'<tr data-review-id="{id}"><td>{escape(title)}</td><td><select aria-label="{escape(title)} 審查判斷"><option value="not-reviewed">尚未審查</option value="preserve">保留這個方向</option><option value="revise">需要修改</option><option value="discuss">需要討論</option></select></td><td><textarea aria-label="{escape(title)} 審查備註" placeholder="哪個畫面／狀態需要調整？"></textarea></td></tr>' for id,title in reviews)
    shell=shell.replace('<!-- REVIEW_ROWS -->',rows)
    assert '<!-- ' not in shell, 'Unreplaced template marker'
    (ROOT/'index.html').write_text(shell,encoding='utf-8')
    manifest=json.loads((ROOT/'atlas-manifest.json').read_text(encoding='utf-8'))
    manifest['revision']='ATLAS-005'
    manifest['ownerReviewChanges']=['exact three-circle product mark','connected-solid/unconnected-hollow with visible wires','sidebar and panel resize grips','fill-only workspace highlight','Uniform simplification required','compact normalized RGB/HSV color candidate','Japanese を編集 kept together','SVG dropdown triangles','grid zoom density samples','role tint/style exploration deferred','normal Link gray 60% at1px; selected Link2px pale yellow','remove invented standalone numeric-control lab','HSV/RGB display all three editable components prominently','front-page Legacy design-reference positioning','12px selection toolbar gap anchored to node bounds','measured dark scrollbar plus scrollable specimen','SV plane direction labels and live saturation/value readouts']
    # Keep root entries; refresh independently authored fragments from their canonical manifests.
    root_entries=[a for a in manifest['artboards'] if a['id'].startswith('ATLAS-')]
    for id,title,anchor in [('ATLAS-IDENTITY-01','Product identity and visible resize grips','identity'),('ATLAS-SCROLLER-01','Measured subtle panel scrollbar','scrollbars'),('ATLAS-GRID-01','Measured grid zoom density','grid-density'),('ATLAS-LOCALE-01','Japanese semantic wrapping','states')]:
        if not any(a['id']==id for a in root_entries):root_entries.append({'id':id,'title':title,'anchor':anchor,'kind':'owner-review-correction','sourceReferences':[{'path':'evidence.json'},{'path':'../design/DESIGN_PREMISES.md','section':'9'}]})
    manifest['ownerReviewChanges'] += ['Owner-approved compact color layout replaces previous picker','HSV and RGB simultaneously visible; A only for RGBA','RGB six-digit HEX / RGBA eight-digit HEX including opaque FF','Square100px current color with corner add; TD44 palette; custom swatches beside HEX','Palette/plane top-region switch with round circle geometry']
    manifest['ownerReviewChanges'] += ['Link + arrows replace standalone gradient comparison; full shortcut protocol','Group Frame explicit membership distinct from computation subgraph','Layout means node arrangement;11 commands with target/gap rules','Color presentation follows shipped0.8.273 live/draft/cancel behavior; no new architecture']
    manifest['ownerReviewChanges'] += ['Floating Parameter reference uses product #2E2C3A content surface; docked sidebar remains distinct','Restore all11 product Arrange command SVG icons; Source block unchanged']
    for part in PARTS:
        fragment=json.loads((ROOT/'parts'/f'{part}-manifest.json').read_text(encoding='utf-8'))
        for a in fragment['artboards']:
            refs=[]
            for r in a.get('sourceReferences',[]):
                if isinstance(r,str):
                    path,sep,section=r.partition('#')
                    r={'path':'../'+path,**({'section':section} if sep else {})}
                else:
                    r=dict(r)
                    if 'path' in r:
                        path,sep,section=r['path'].partition('#')
                        r['path']=Path(os.path.relpath((ROOT/'parts'/path).resolve(),ROOT)).as_posix()
                        if sep:r.setdefault('section',section)
                refs.append(r)
            a['sourceReferences']=refs
            a['anchor']=a['id']
        part_ids={a['id'] for a in fragment['artboards']}
        root_entries=[a for a in root_entries if a['id'] not in part_ids]+fragment['artboards']
    manifest['artboards']=root_entries
    manifest['artboardCount']=len(root_entries)
    manifest['sourceFiles']=list(dict.fromkeys(manifest['sourceFiles']+['parts/links-manifest.json','parts/groups-manifest.json','parts/arrange-manifest.json','../research/link-evidence-004.md','../research/groups-evidence-004.md','../research/arrange-evidence-004.md','../research/color-implementation-004.md','../design/ATLAS_004_CHANGELOG.md']))
    (ROOT/'atlas-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print('Built atlas/index.html (offline, embedded CSS/JS).')

if __name__=='__main__': main()
