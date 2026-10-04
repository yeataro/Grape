/* Offline, finite arrangement demonstrations. No product, Host, persistence or network API. */
(() => {
  'use strict';
  const init = () => {
    const root = document.getElementById('arrange');
    if (!root || root.dataset.arInitialized) return;
    root.dataset.arInitialized = 'true';
    const find = selector => root.querySelector(selector);
    const NS = 'http://www.w3.org/2000/svg';
    const element = (name, attrs = {}, text) => {
      const node = document.createElementNS(NS, name);
      Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, String(value)));
      if (text !== undefined) node.textContent = text;
      return node;
    };
    const clone = items => items.map(item => ({ ...item }));
    const bounds = items => ({ left: Math.min(...items.map(n => n.x)), top: Math.min(...items.map(n => n.y)), right: Math.max(...items.map(n => n.x + n.width)), bottom: Math.max(...items.map(n => n.y + n.height)) });
    const headerPath = (width, height = 38) => `M10 0H${width - 10}Q${width} 0 ${width} 10V${height}H0V10Q0 0 10 0Z`;
    const drawCard = (svg, node, selected, ports = false, edges = []) => {
      const group = element('g', { transform: `translate(${node.x} ${node.y})`, 'data-ar-node': node.id, 'data-x': node.x, 'data-y': node.y, 'data-width': node.width, 'data-height': node.height });
      const shell = element('rect', { x: 0, y: 0, width: node.width, height: node.height, rx: 10, class: 'ar-node-shell' });
      group.append(shell, element('path', { d: headerPath(node.width), class: `ar-node-title${['A', 'D'].includes(node.id) && ports ? ' ar-node-source' : node.id === 'F' ? ' ar-node-note' : ''}` }), element('text', { x: 14, y: 25, class: 'ar-node-label' }, node.title));
      if (selected) group.append(element('rect', { x: 0, y: 0, width: node.width, height: node.height, rx: 10, fill: 'none', class: 'ar-node-selected' }));
      if (ports && node.id !== 'F') {
        const incoming = edges.filter(edge => edge.to === node.id);
        incoming.forEach((edge, i) => {
          const y = 62 + i * 27;
          group.append(element('circle', { cx: 0, cy: y, r: 4.8, class: 'ar-port ar-port-linked' }), element('text', { x: 14, y: y + 4, class: 'ar-port-label' }, node.id === 'E' ? (i ? 'b' : 'a') : 'value'));
        });
        const outputConnected = edges.some(edge => edge.from === node.id);
        group.append(element('text', { x: node.width - 16, y: node.height - 21, 'text-anchor': 'end', class: 'ar-port-label' }, 'out  float'), element('circle', { cx: node.width, cy: node.height - 25, r: 4.8, class: `ar-port${outputConnected ? ' ar-port-linked' : ''}` }));
      } else {
        group.append(element('text', { x: 14, y: 65, class: 'ar-layout-size' }, ports ? 'Unconnected' : `${node.width} × ${node.height}`));
      }
      svg.append(group);
    };
    const drawGraph = (svg, items, edges = [], selectedIds = items.map(n => n.id), ports = false) => {
      svg.replaceChildren();
      const byId = new Map(items.map(n => [n.id, n]));
      edges.forEach(edge => {
        const a = byId.get(edge.from), b = byId.get(edge.to), index = edges.filter(e => e.to === b.id).indexOf(edge);
        const start = { x: a.x + a.width, y: a.y + a.height - 25 }, end = { x: b.x, y: b.y + 62 + index * 27 };
        const reach = Math.max(55, Math.abs(end.x - start.x) * .45);
        svg.append(element('path', { d: `M${start.x} ${start.y}C${start.x + reach} ${start.y} ${end.x - reach} ${end.y} ${end.x} ${end.y}`, class: 'ar-wire' }));
      });
      items.forEach(n => drawCard(svg, n, selectedIds.includes(n.id), ports, edges));
    };

    // Both fixed outputs below were obtained by executing autoArrangePositions
    // from Legacy e005f08 selection_ui.js:266-363 against this exact fixture.
    // This is a finite illustration, not a second implementation of that algorithm.
    const autoNodes = [
      { id: 'A', title: 'Source', x: 40, y: 190, width: 150, height: 95 },
      { id: 'B', title: 'Remap', x: 330, y: 60, width: 170, height: 140 },
      { id: 'C', title: 'Multiply', x: 530, y: 260, width: 160, height: 105 },
      { id: 'D', title: 'Short source', x: 80, y: 390, width: 150, height: 95 },
      { id: 'E', title: 'Result', x: 820, y: 95, width: 170, height: 165 },
      { id: 'F', title: 'Note', x: 500, y: 490, width: 150, height: 90 }
    ];
    const autoEdges = [{ from: 'A', to: 'B' }, { from: 'B', to: 'C' }, { from: 'C', to: 'E' }, { from: 'D', to: 'E' }];
    const autoPositions = {
      source: { A: [40, 60], D: [40, 203], B: [286, 109], C: [552, 126.5], E: [808, 96.5], F: [40, 394] },
      output: { A: [40, 136.5], B: [286, 114], C: [552, 60], D: [552, 213], E: [808, 101.5], F: [40, 404] }
    };
    let autoMode = 'source', previousAuto = null;
    const drawAuto = () => {
      drawGraph(find('[data-ar-auto-after]'), autoNodes.map(n => ({ ...n, x: autoPositions[autoMode][n.id][0], y: autoPositions[autoMode][n.id][1] })), autoEdges, autoNodes.map(n => n.id), true);
      root.querySelectorAll('[data-ar-auto]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.arAuto === autoMode)));
      find('[data-ar-auto-undo]').disabled = previousAuto === null;
    };
    drawGraph(find('[data-ar-auto-before]'), autoNodes, autoEdges, autoNodes.map(n => n.id), true);
    root.querySelectorAll('[data-ar-auto]').forEach(button => button.addEventListener('click', () => {
      const next = button.dataset.arAuto;
      if (next === autoMode) { find('[data-ar-auto-status]').textContent = '位置相同；沒有新增圖冊回復步驟。'; return; }
      previousAuto = autoMode; autoMode = next; drawAuto();
      find('[data-ar-auto-status]').textContent = autoMode === 'output' ? '由結果排列：短支線靠近 Result，線路方向與連接關係不變。一次示例修改。' : '由來源排列：兩個來源從左側開始。一次示例修改。';
    }));
    find('[data-ar-auto-undo]').addEventListener('click', () => {
      if (previousAuto === null) return;
      autoMode = previousAuto; previousAuto = null; drawAuto();
      find('[data-ar-auto-status]').textContent = '已回復上一個圖冊示例；沒有存取產品 History。';
    });
    drawAuto();

    const initialCards = [
      { id: 'A', title: 'Layout A', x: 45, y: 65, width: 160, height: 100 },
      { id: 'B', title: 'Layout B', x: 280, y: 100, width: 200, height: 145 },
      { id: 'C', title: 'Layout C', x: 510, y: 275, width: 145, height: 115 },
      { id: 'D', title: 'Layout D', x: 760, y: 315, width: 175, height: 130 }
    ];
    let cards = clone(initialCards), undoCards = null;
    const count = find('[data-ar-count]'), operation = find('[data-ar-operation]'), readOnly = find('[data-ar-readonly]');
    const manualStatus = find('[data-ar-manual-status]');
    const selectedCards = () => cards.slice(0, Number(count.value));
    const isDistribution = () => ['spaceX', 'spaceY'].includes(operation.value);
    const renderManual = () => {
      const svg = find('[data-ar-manual-svg]'), b = bounds(cards), width = Math.max(1120, b.right + 45), height = Math.max(760, b.bottom + 50);
      svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
      svg.style.width = `${width}px`;
      drawGraph(svg, cards, [], selectedCards().map(n => n.id));
      operation.querySelectorAll('option[value^="space"]').forEach(option => { option.disabled = Number(count.value) < 3; });
      find('[data-ar-apply]').disabled = readOnly.checked || (isDistribution() && Number(count.value) < 3);
      find('[data-ar-undo]').disabled = readOnly.checked || undoCards === null;
    };
    count.addEventListener('change', () => { renderManual(); manualStatus.textContent = Number(count.value) < 3 ? '選取 2 個：可對齊或格狀排列；等距需 3 個，不能執行。' : `選取 ${count.value} 個；灰框卡不移動。`; });
    operation.addEventListener('change', renderManual);
    readOnly.addEventListener('change', () => { renderManual(); manualStatus.textContent = readOnly.checked ? '唯讀示例：Apply 與 Undo 都停用，位置保留。' : '回到可編輯示例。'; });
    find('[data-ar-apply]').addEventListener('click', () => {
      if (find('[data-ar-apply]').disabled) return;
      const before = clone(cards), items = selectedCards(), kind = operation.value, b = bounds(items);
      // Direct finite-fixture transcription of selection_ui.js:371-390, GRID=24.
      if (['left', 'centerX', 'right', 'top', 'centerY', 'bottom'].includes(kind)) items.forEach(n => {
        if (kind === 'left') n.x = b.left;
        if (kind === 'centerX') n.x = (b.left + b.right - n.width) / 2;
        if (kind === 'right') n.x = b.right - n.width;
        if (kind === 'top') n.y = b.top;
        if (kind === 'centerY') n.y = (b.top + b.bottom - n.height) / 2;
        if (kind === 'bottom') n.y = b.bottom - n.height;
      });
      else if (isDistribution()) {
        const axis = kind === 'spaceX' ? 'x' : 'y', size = axis === 'x' ? 'width' : 'height';
        items.sort((a, c) => a[axis] - c[axis] || a.id.localeCompare(c.id));
        const span = items.at(-1)[axis] + items.at(-1)[size] - items[0][axis];
        const gap = Math.max(48, (span - items.reduce((sum, n) => sum + n[size], 0)) / (items.length - 1));
        let at = items[0][axis]; items.forEach(n => { n[axis] = at; at += n[size] + gap; });
      } else if (kind === 'grid') {
        items.sort((a, c) => a.y - c.y || a.x - c.x || a.id.localeCompare(c.id));
        const columns = Math.ceil(Math.sqrt(items.length)), widths = Array(columns).fill(0);
        items.forEach((n, i) => { widths[i % columns] = Math.max(widths[i % columns], n.width); });
        let y = b.top;
        for (let row = 0; row < items.length; row += columns) {
          let x = b.left; const batch = items.slice(row, row + columns);
          batch.forEach((n, col) => { n.x = x; n.y = y; x += widths[col] + 48; });
          y += Math.max(...batch.map(n => n.height)) + 48;
        }
      }
      items.forEach(n => { n.x = Math.round(n.x * 1000) / 1000; n.y = Math.round(n.y * 1000) / 1000; });
      if (JSON.stringify(before) === JSON.stringify(cards)) { manualStatus.textContent = '位置相同；沒有新增圖冊回復步驟。'; return; }
      undoCards = before; renderManual();
      manualStatus.textContent = isDistribution() ? 'After：相等的是卡片邊緣之間的空隙，第一張位置固定。一次示例修改。' : 'After：只改選取卡片的 X／Y，大小保持不變。一次示例修改。';
    });
    find('[data-ar-undo]').addEventListener('click', () => {
      if (readOnly.checked || undoCards === null) return;
      cards = undoCards; undoCards = null; renderManual(); manualStatus.textContent = '已回復上一步的所有位置。這是一格圖冊示例回復，不是產品 History。';
    });
    find('[data-ar-reset]').addEventListener('click', () => { cards = clone(initialCards); undoCards = null; renderManual(); manualStatus.textContent = 'Before：已重設本頁範例。'; });
    renderManual();

    // Bounded right-handle illustration of selection_ui.js:179-227.
    // Three non-overlapping, same-row cards permit the exact 1D reduction:
    // scale center distances, stop before a new collision, then fix left edge.
    const spreadCards = [
      { id: 'A', title: 'Layout A', x: 45, y: 90, width: 150, height: 100 },
      { id: 'B', title: 'Layout B', x: 300, y: 90, width: 210, height: 135 },
      { id: 'C', title: 'Layout C', x: 590, y: 90, width: 130, height: 115 }
    ];
    const spreadInput = find('[data-ar-spread]');
    const renderSpread = () => {
      const delta = Number(spreadInput.value), initial = bounds(spreadCards), span = initial.right - initial.left;
      const target = Math.max(...spreadCards.map(n => n.width), span + delta), centers = spreadCards.map(n => n.x + n.width / 2);
      let factor = Infinity;
      for (let i = 0; i < spreadCards.length; i++) for (let j = i + 1; j < spreadCards.length; j++) factor = Math.min(factor, (target - (spreadCards[i].width + spreadCards[j].width) / 2) / Math.abs(centers[i] - centers[j]));
      factor = Math.max(0, factor);
      if (factor < 1) for (let i = 0; i < spreadCards.length; i++) for (let j = i + 1; j < spreadCards.length; j++) {
        const distance = Math.abs(centers[i] - centers[j]), half = (spreadCards[i].width + spreadCards[j].width) / 2;
        factor = Math.max(factor, (half + Math.min(8, Math.max(0, distance - half))) / distance);
      }
      const xs = spreadCards.map((n, i) => centers[i] * factor - n.width / 2), shift = initial.left - Math.min(...xs);
      const next = spreadCards.map((n, i) => ({ ...n, x: xs[i] + shift })), b = bounds(next), svg = find('[data-ar-spread-svg]');
      drawGraph(svg, next);
      const x = b.left - 10, y = b.top - 10, width = b.right - b.left + 20, height = b.bottom - b.top + 20;
      svg.append(element('rect', { x, y, width, height, class: 'ar-outline' }), element('path', { d: `M${initial.left} 40V265`, class: 'ar-guide' }), element('text', { x: initial.left, y: 31, class: 'ar-fixed-caption' }, 'Fixed left edge'));
      [[0, 0], [.5, 0], [1, 0], [1, .5], [1, 1], [.5, 1], [0, 1], [0, .5]].forEach(([cx, cy]) => svg.append(element('rect', { x: x + width * cx - 3, y: y + height * cy - 3, width: 6, height: 6, class: `ar-grip${cx === 1 && cy === .5 ? ' ar-grip-active' : ''}` })));
      find('[data-ar-spread-value]').value = String(delta);
      find('[data-ar-spread-status]').textContent = `右側位移請求 ${delta}；實際外框寬度 ${(b.right - b.left).toFixed(1)}。左外緣 X = 45，三張卡尺寸不變。`;
    };
    spreadInput.addEventListener('input', renderSpread);
    find('[data-ar-spread-reset]').addEventListener('click', () => { spreadInput.value = '0'; renderSpread(); });
    renderSpread();
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true }); else init();
})();
