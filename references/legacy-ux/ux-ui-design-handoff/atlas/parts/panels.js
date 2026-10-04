/* Atlas-only interaction sketches. No product API, Graph or Host access. */
(() => {
  'use strict';
  const init = () => {
    const roots = [document.getElementById('panels'), document.getElementById('overlays')].filter(Boolean);
    if (!roots.length || roots.every(root => root.dataset.pnInitialized)) return;
    roots.forEach(root => { root.dataset.pnInitialized = 'true'; });
    // Local atlas SVG vocabulary. Shapes/sizes are inferred reconstructions, not measured assets.
    const resultIcon = name => {
      const shapes = {
        preview: [['path', { d: 'M1 8c2-3.5 4.5-5 7-5s5 1.5 7 5c-2 3.5-4.5 5-7 5S3 11.5 1 8Z' }], ['circle', { cx: '8', cy: '8', r: '2' }]],
        route: [['path', { d: 'M1.5 8h4M10.5 8h4' }], ['circle', { cx: '8', cy: '8', r: '2.5' }]],
        operation: [['path', { d: 'm8 1.5 6 3.2v6.6l-6 3.2-6-3.2V4.7L8 1.5ZM2 4.7 8 8l6-3.3M8 8v6.5' }]],
        switch: [['path', { d: 'M1.5 8h4l4-4h5M5.5 8l4 4h5' }]],
        scalar: [['path', { d: 'm5.5 5 2.5-2v10M5 13h6' }]],
        subgraph: [['path', { d: 'M4.5 5.5 7 10M11.5 5.5 9 10M5 4h6' }], ['circle', { cx: '3.5', cy: '4', r: '1.5' }], ['circle', { cx: '12.5', cy: '4', r: '1.5' }], ['circle', { cx: '8', cy: '12', r: '2' }]],
        source: [['path', { d: 'M3 2.5h10v11H3zM5.5 6h5M5.5 9h3' }]]
      };
      const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      Object.entries({ class: 'pn-icon pn-result-icon', viewBox: '0 0 16 16', width: '16', height: '16', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.4', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': 'true', focusable: 'false' }).forEach(([key, value]) => icon.setAttribute(key, value));
      (shapes[name] || shapes.operation).forEach(([tag, attrs]) => { const shape = document.createElementNS('http://www.w3.org/2000/svg', tag); Object.entries(attrs).forEach(([key, value]) => shape.setAttribute(key, value)); icon.append(shape); });
      return icon;
    };
    const nodes = [
      { name: 'Preview', source: 'Editor', category: 'Editor', icon: 'preview', types: ['float', 'vec3'], aliases: ['preview'], signature: 'GenType → primary preview', detail: '暫時查看中間值。這裡只展示發現入口，不建立節點或生成 shader。' },
      { name: 'Router', source: 'Editor', category: 'Editor', icon: 'route', types: ['float', 'vec3'], aliases: ['route'], signature: 'value → out', detail: '整理連線路徑。圖冊不修改真實 Edge。' },
      { name: 'Math', source: 'Editor', category: 'Math', icon: 'operation', types: ['float', 'vec3'], aliases: ['operation'], signature: 'a, b → out', detail: '計算類型的發現入口；此處不切換 operation 或端口。' },
      { name: 'Switch', source: 'Editor', category: 'Logic', icon: 'switch', types: ['float', 'vec3'], aliases: ['select'], signature: 'condition, values → out', detail: '顯示一個可選結果的例子，不建立或驗證運算。' },
      { name: 'Scalar', source: 'Editor', category: 'Input', icon: 'scalar', types: ['float'], aliases: ['constant', 'number'], signature: 'float → out', detail: '常數輸入的搜尋樣本。不是一項新的預設值決策。' },
      { name: 'Fresnel', source: 'Editor', category: 'Subgraph', icon: 'subgraph', types: ['float', 'vec3'], aliases: ['fresnel', 'facing', 'rim', 'view'], signature: 'Normal, View Direction, IOR → Fac', detail: '既有 Subgraph 參考；可找到來源與 signature。此圖稿不匯入或編輯定義。' },
      { name: 'Facing', source: 'Editor', category: 'Subgraph', icon: 'subgraph', types: ['float', 'vec3'], aliases: ['fresnel', 'facing', 'rim', 'view'], signature: 'Normal, View Direction → Fac', detail: '依表面與視線方向的夾角提供權重；這是 help 摘述，不是 production generator。' },
      { name: 'Rim Light', source: 'Editor', category: 'Subgraph', icon: 'subgraph', types: ['float', 'vec3'], aliases: ['fresnel', 'facing', 'rim', 'view'], signature: 'Normal, View Direction → Fac', detail: '與 Fresnel query 相關的發現樣本；沒有模擬未知的完整搜尋排序。' },
      { name: 'View Direction', source: 'Editor', category: 'Subgraph', icon: 'subgraph', types: ['vec3'], aliases: ['fresnel', 'facing', 'view'], signature: 'Direction · vec3', detail: '提供視線方向的節點參考。保留 source 與 category 的資訊層次。' },
      { name: 'Normalize', source: 'GLSL', category: 'Vector', icon: 'operation', types: ['vec3'], aliases: ['normalize', 'vector'], signature: 'value · vec3 → out · vec3', detail: 'GLSL 計算樣本；實際 Node 外觀由圖冊 Node 區保真呈現。' },
      { name: 'TDNormal', source: 'TouchDesigner', category: 'Source', icon: 'source', types: ['vec3'], aliases: ['normal', 'source'], signature: 'out · vec3', detail: 'Host-specific source 的識別樣本；此頁不存取 TouchDesigner。' }
    ];
    document.querySelectorAll('.pn-search-surface').forEach(surface => {
      const query = surface.querySelector('[data-pn-query]');
      const source = surface.querySelector('[data-pn-source]');
      const type = surface.querySelector('[data-pn-type]');
      const results = surface.querySelector('[data-pn-results]');
      let detail = surface.querySelector('[data-pn-detail]');
      if (!detail) { detail = document.createElement('div'); detail.className = 'pn-pane-footer'; detail.dataset.pnDetail = ''; results.after(detail); }
      const display = (node, selected) => {
        detail.replaceChildren();
        const meta = document.createElement('span'); meta.className = 'pn-eyebrow'; meta.textContent = `${node.source} · ${node.category}`;
        const title = document.createElement('h4'); title.textContent = node.name;
        const signature = document.createElement('code'); signature.textContent = node.signature;
        const description = document.createElement('p'); description.textContent = node.detail;
        const unavailable = document.createElement('span'); unavailable.className = 'pn-disabled-action'; unavailable.textContent = 'Add node — not executed in atlas';
        detail.append(meta, title, signature, description, unavailable);
        results.querySelectorAll('button').forEach(button => button.setAttribute('aria-pressed', String(button === selected)));
      };
      const render = () => {
        const phrase = query.value.trim().toLocaleLowerCase();
        const list = nodes.filter(node => (source.value === 'All sources' || source.value === node.source) && (!type || type.value === 'All types' || node.types.includes(type.value)) && (!phrase || [node.name, node.source, node.category, ...node.aliases].join(' ').toLocaleLowerCase().includes(phrase)));
        results.replaceChildren();
        if (!list.length) { const empty = document.createElement('p'); empty.className = 'pn-empty'; empty.textContent = 'No matching specimen · 圖冊不是完整 catalog'; results.append(empty); detail.textContent = '清除條件以返回示範清單。'; return; }
        list.forEach(node => { const button = document.createElement('button'); button.type = 'button'; button.className = 'pn-result-button'; button.setAttribute('aria-pressed', 'false'); const icon = resultIcon(node.icon); const name = document.createElement('span'); name.className = 'pn-result-label'; name.textContent = node.name; const origin = document.createElement('span'); origin.className = 'pn-result-source'; origin.textContent = node.source; button.append(icon, name, origin); button.addEventListener('click', () => display(node, button)); results.append(button); });
        display(list[0], results.firstElementChild);
      };
      query.addEventListener('input', render); source.addEventListener('change', render); if (type) type.addEventListener('change', render); render();
    });

    const inspector = document.querySelector('[data-pn-inspector]');
    if (inspector) {
      const feedback = inspector.querySelector('[data-pn-inspector-feedback]');
      const projection = inspector.querySelector('[data-pn-link-state]');
      const linkedSocket = inspector.querySelector('[data-pn-link-socket]');
      const initial = [...projection.children];
      inspector.querySelector('[data-pn-source-link]').addEventListener('click', () => { feedback.textContent = '示範回饋：定位 Vertex Inputs · world。沒有選取或移動任何真實節點。'; });
      inspector.querySelector('[data-pn-disconnect]').addEventListener('click', () => {
        const value = document.createElement('span'); value.className = 'pn-field-value'; value.textContent = '0, 0, 0'; value.title = 'Illustrative local value, not an observed default';
        const restore = document.createElement('button'); restore.type = 'button'; restore.className = 'pn-small-button'; restore.textContent = 'Reset sketch';
        restore.addEventListener('click', () => { projection.replaceChildren(...initial); linkedSocket.classList.add('pn-socket-connected'); feedback.textContent = '圖稿已回到 linked source 樣本；接孔實心，沒有 model/history 變更。'; });
        projection.replaceChildren(value, restore); linkedSocket.classList.remove('pn-socket-connected'); feedback.textContent = '已切到 local projection／空心接孔樣本。0,0,0 只是圖稿值；沒有刪除 Graph Edge。';
      });
    }
    const viewer = document.querySelector('.pn-viewer-pane');
    if (viewer) viewer.querySelectorAll('[data-pn-viewer-state]').forEach(button => button.addEventListener('click', () => {
      const takeover = button.dataset.pnViewerState === 'takeover';
      viewer.querySelector('[data-pn-viewer-title]').textContent = takeover ? 'Taken over by another page' : 'Host unavailable · specimen';
      viewer.querySelector('[data-pn-viewer-description]').textContent = takeover ? 'Another browser has taken control. Connect again to take control here.' : '示範 unavailable 狀態；不是本輪實機觀察，也沒有執行重連。';
      viewer.querySelectorAll('[data-pn-viewer-state]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    }));
    const toggleFloat = document.querySelector('[data-pn-toggle-float]');
    if (toggleFloat) toggleFloat.addEventListener('click', () => { const docked = document.querySelector('[data-pn-float-stage]').classList.toggle('pn-docked'); toggleFloat.textContent = docked ? 'Float specimen' : 'Dock specimen'; });

    const custom = document.querySelector('[data-pn-custom-window]');
    const customStage = document.querySelector('[data-pn-custom-stage]');
    const openCustom = document.querySelector('[data-pn-open-custom]');
    let drag = null;
    if (custom && customStage) {
      const handle = custom.querySelector('[data-pn-drag-handle]');
      const endDrag = () => { drag = null; custom.classList.remove('pn-dragging'); };
      const close = () => { endDrag(); custom.hidden = true; openCustom.focus(); };
      openCustom.addEventListener('click', () => { custom.hidden = false; custom.focus(); });
      custom.querySelector('[data-pn-close-custom]').addEventListener('click', close);
      custom.addEventListener('keydown', event => { if (event.key === 'Escape') { event.stopPropagation(); close(); } });
      handle.addEventListener('pointerdown', event => {
        if (event.button !== 0 || event.target.closest('button')) return;
        const frame = customStage.getBoundingClientRect(); const rect = custom.getBoundingClientRect();
        drag = { id: event.pointerId, x: event.clientX - rect.left, y: event.clientY - rect.top };
        custom.style.transform = 'none'; custom.style.left = `${rect.left - frame.left - customStage.clientLeft}px`; custom.style.top = `${rect.top - frame.top - customStage.clientTop}px`;
        handle.setPointerCapture(event.pointerId); custom.classList.add('pn-dragging'); event.preventDefault();
      });
      handle.addEventListener('pointermove', event => {
        if (!drag || drag.id !== event.pointerId) return;
        const frame = customStage.getBoundingClientRect();
        const maxX = Math.max(0, customStage.clientWidth - custom.offsetWidth); const maxY = Math.max(0, customStage.clientHeight - custom.offsetHeight);
        custom.style.left = `${Math.min(maxX, Math.max(0, event.clientX - frame.left - customStage.clientLeft - drag.x))}px`;
        custom.style.top = `${Math.min(maxY, Math.max(0, event.clientY - frame.top - customStage.clientTop - drag.y))}px`;
      });
      handle.addEventListener('pointerup', endDrag); handle.addEventListener('pointercancel', endDrag); handle.addEventListener('lostpointercapture', endDrag);
      window.addEventListener('resize', () => { endDrag(); custom.style.left = ''; custom.style.top = ''; custom.style.transform = ''; });
    }
    const exportOverlay = document.querySelector('[data-pn-export-overlay]');
    const openExport = document.querySelector('[data-pn-open-export]');
    if (exportOverlay && openExport) {
      const close = () => { exportOverlay.hidden = true; openExport.focus(); };
      openExport.addEventListener('click', () => { exportOverlay.hidden = false; exportOverlay.querySelector('[role=dialog]').focus(); });
      exportOverlay.querySelectorAll('[data-pn-close-export]').forEach(button => button.addEventListener('click', close));
      exportOverlay.addEventListener('keydown', event => { if (event.key === 'Escape') { event.stopPropagation(); close(); } });
    }
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true }); else init();
})();
