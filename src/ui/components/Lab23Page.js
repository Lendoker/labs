/**
 * @file Lab23Page.js
 * @description Лабораторна №23 — Пошук у ширину (BFS) у графі.
 *   Реалізація на основі черги: вилучаємо вершину з початку черги, обробляємо
 *   її та додаємо невідвіданих сусідів. Візуалізація показує стан черги на
 *   кожному кроці, активне ребро та порядок вилучення. Підтримує покрокове
 *   та автоматичне програвання, перевірку зв’язності.
 */

import {
  parseMatrixText,
  buildAdjList,
  bfsTraversal,
  circleLayout,
} from '../../core/algorithms/graph.js';

const EXAMPLE_MATRIX = `0 1 1 0 1
1 0 1 1 0
1 1 0 1 1
0 1 1 0 0
1 0 1 0 0`;

const PSEUDOCODE = `BFS(start, graph, visited):
  queue.push(start)
  visited[start] = true
  while not queue.empty():
    current = queue.front(); queue.pop()
    print(current + 1)
    for i in adj[current]:
      if graph[current][i] == 1 and not visited[i]:
        queue.push(i)
        visited[i] = true`;

export const Lab23Page = {
  mount(container) {
    let matrix = parseMatrixText(EXAMPLE_MATRIX);
    let startVertex = 0;
    let trace = bfsTraversal(matrix, startVertex);
    let stepIndex = 0;
    let autoTimer = null;
    let autoDelay = 700;
    let logLines = ['[menu] Введіть граф → оберіть стартову вершину → запустіть BFS'];

    container.innerHTML = `
      <div class="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
        <header><h1 class="text-2xl font-bold">Лабораторна робота №23 — Пошук в ширину у графі</h1></header>

        <section class="prose dark:prose-invert max-w-none">
          <h2>Теоретичний блок</h2>
          <p><strong>Пошук у ширину (BFS)</strong> — алгоритм обходу графа, який досліджує вершини порівнево: спочатку обробляються всі сусіди початкової вершини, потім сусіди сусідів і так далі. Для збереження порядку обходу використовується <strong>черга</strong>.</p>
          <p><strong>Кроки:</strong> додати стартову вершину до черги та позначити її відвіданою; поки черга не порожня — вилучити вершину з початку черги, обробити її, додати всіх невідвіданих сусідів у кінець черги та позначити їх відвіданими.</p>
          <p>BFS природно обчислює <em>найкоротшу відстань</em> у незваженому графі: коли вершина вперше потрапляє у чергу, рівень її попередника + 1 і є відстанню від стартової вершини.</p>
          <pre class="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg text-sm overflow-x-auto"><code>${PSEUDOCODE}</code></pre>
        </section>

        <section class="space-y-4">
          <h2 class="text-xl font-semibold">Граф (матриця суміжності)</h2>
          <textarea id="matrix-input" rows="6" class="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 font-mono text-sm">${EXAMPLE_MATRIX}</textarea>
          <div class="flex flex-wrap gap-2">
            <button id="btn-apply" class="btn-animated px-4 py-2 rounded-lg bg-purple-600 text-white">Застосувати</button>
            <button id="btn-random" class="btn-animated px-4 py-2 rounded-lg bg-indigo-600 text-white">Випадковий (n=6)</button>
          </div>
          <p id="error-msg" class="text-red-600 dark:text-red-400 text-sm hidden"></p>
        </section>

        <section class="space-y-3">
          <h2 class="text-xl font-semibold">Керування обходом</h2>
          <div class="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
            <div>
              <label class="block text-sm font-medium mb-1">Стартова вершина</label>
              <select id="start-vertex" class="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900"></select>
            </div>
            <button id="btn-run" class="btn-animated px-4 py-2 rounded-lg bg-purple-600 text-white">Запустити</button>
            <button id="btn-step" class="btn-animated px-4 py-2 rounded-lg bg-indigo-600 text-white">Крок</button>
            <button id="btn-auto" class="btn-animated px-4 py-2 rounded-lg bg-emerald-600 text-white">Авто</button>
            <button id="btn-reset" class="btn-animated px-4 py-2 rounded-lg bg-zinc-500 text-white">Скинути</button>
          </div>
          <div class="flex items-center gap-3">
            <label class="text-sm">Швидкість:</label>
            <input id="speed" type="range" min="100" max="1500" step="50" value="700" class="flex-1">
            <span id="speed-val" class="font-mono text-xs text-zinc-500">700 мс</span>
          </div>
        </section>

        <section class="space-y-3">
          <h2 class="text-xl font-semibold">Візуалізація</h2>
          <div id="graph-viz" class="overflow-x-auto p-3 bg-zinc-100/80 dark:bg-zinc-800/50 rounded-xl border-2 border-dashed border-purple-200 dark:border-purple-900/60"></div>
        </section>

        <section class="space-y-3">
          <h2 class="text-xl font-semibold">Черга</h2>
          <div id="queue-viz" class="flex flex-wrap items-center gap-2 p-4 bg-zinc-100/80 dark:bg-zinc-800/50 rounded-xl border-2 border-dashed border-emerald-200 dark:border-emerald-900/60 min-h-[80px]"></div>
        </section>

        <section class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div class="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800">
            <div class="text-xs text-zinc-500 mb-1">Поточна подія</div>
            <div id="t-event" class="font-mono text-sm">—</div>
          </div>
          <div class="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800">
            <div class="text-xs text-zinc-500 mb-1">Порядок обходу</div>
            <div id="t-order" class="font-mono text-sm break-all">—</div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-semibold mb-2">Журнал та статистика</h2>
          <pre id="menu-log" class="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-3 text-xs overflow-auto max-h-48"></pre>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
            <div class="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800"><div class="text-xs text-zinc-500">вершин</div><div id="s-n" class="font-mono">0</div></div>
            <div class="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800"><div class="text-xs text-zinc-500">крок</div><div id="s-step" class="font-mono">0 / 0</div></div>
            <div class="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800"><div class="text-xs text-zinc-500">у черзі</div><div id="s-queue" class="font-mono">0</div></div>
            <div class="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800"><div class="text-xs text-zinc-500">зв’язний</div><div id="s-conn" class="font-mono">—</div></div>
          </div>
        </section>
      </div>
    `;

    const menuLog = document.getElementById('menu-log');
    const errorEl = document.getElementById('error-msg');
    const speedEl = document.getElementById('speed');
    const speedVal = document.getElementById('speed-val');

    function pushLog(line) {
      const ts = new Date().toLocaleTimeString();
      logLines.push(`[${ts}] ${line}`);
      if (logLines.length > 80) logLines = logLines.slice(-80);
      menuLog.textContent = logLines.join('\n');
      menuLog.scrollTop = menuLog.scrollHeight;
    }

    function showError(msg) {
      errorEl.textContent = msg || '';
      errorEl.classList.toggle('hidden', !msg);
    }

    function rebuildStartSelect() {
      const sel = document.getElementById('start-vertex');
      const n = matrix.length;
      sel.innerHTML = '';
      for (let i = 0; i < n; i++) {
        const opt = document.createElement('option');
        opt.value = String(i);
        opt.textContent = String(i + 1);
        if (i === startVertex) opt.selected = true;
        sel.appendChild(opt);
      }
    }

    function currentStep() {
      return trace.steps[stepIndex] || { event: 'idle', visited: new Array(matrix.length).fill(false), order: [], queue: [] };
    }

    function eventLabel(s) {
      if (!s) return '—';
      const cur = (s.current ?? -1) + 1;
      const nb = (s.neighbour ?? -1) + 1;
      switch (s.event) {
        case 'start': return `start: ${cur} додано у чергу та позначено відвіданою`;
        case 'dequeue': return `dequeue: вилучаємо ${cur} з черги для обробки`;
        case 'enqueue': return `enqueue: додаємо сусіда ${nb} у чергу`;
        case 'edge-skip': return `пропуск: сусід ${nb} уже відвіданий`;
        case 'component': return `нова компонента: стартуємо з ${cur}`;
        case 'done': return 'обхід завершено';
        default: return s.event;
      }
    }

    function isSymmetricLocal(m) {
      const n = m.length;
      for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) if (m[i][j] !== m[j][i]) return false;
      return true;
    }

    function isConnectedLocal() {
      const n = matrix.length;
      if (!n) return false;
      const adj = buildAdjList(matrix);
      const used = new Array(n).fill(false);
      const q = [0]; used[0] = true;
      while (q.length) { const u = q.shift(); for (const v of adj[u]) if (!used[v]) { used[v] = true; q.push(v); } }
      return used.every(Boolean);
    }

    function renderGraph() {
      const el = document.getElementById('graph-viz');
      const n = matrix.length;
      if (!n) { el.innerHTML = '<p class="text-zinc-500 p-4">Граф порожній.</p>'; return; }
      const width = 600, height = 460;
      const positions = circleLayout(n, { cx: width / 2, cy: height / 2, radius: Math.min(width, height) / 2 - 40 });
      const s = currentStep();
      const visited = s.visited || new Array(n).fill(false);
      const order = s.order || [];
      const queue = s.queue || [];
      const directed = !isSymmetricLocal(matrix);

      const arrowDef = `
        <defs>
          <marker id="arrow-bfs" viewBox="0 -5 10 10" refX="22" refY="0" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0,-5L10,0L0,5" class="fill-purple-500 dark:fill-purple-300"></path>
          </marker>
        </defs>
      `;

      const drawn = new Set();
      const edgesSvg = [];
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          if (matrix[i][j] === 0) continue;
          if (!directed) {
            const key = `${Math.min(i, j)}-${Math.max(i, j)}`;
            if (drawn.has(key)) continue;
            drawn.add(key);
          }
          if (i === j) continue;
          const a = positions[i], b = positions[j];
          const isActive = s.current === i && s.neighbour === j && (s.event === 'enqueue' || s.event === 'edge-skip');
          const isActiveReverse = !directed && s.current === j && s.neighbour === i && (s.event === 'enqueue' || s.event === 'edge-skip');
          const cls = (isActive || isActiveReverse)
            ? (s.event === 'enqueue' ? 'stroke-amber-500' : 'stroke-rose-500')
            : 'stroke-purple-400 dark:stroke-purple-500';
          edgesSvg.push(`<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" class="${cls}" stroke-width="${isActive || isActiveReverse ? 3 : 2}" ${directed ? 'marker-end="url(#arrow-bfs)"' : ''}/>`);
        }
      }

      const nodesSvg = positions.map((p, i) => {
        let cls = 'fill-white dark:fill-zinc-900 stroke-purple-500';
        if (visited[i]) cls = 'fill-emerald-100 dark:fill-emerald-900/40 stroke-emerald-500';
        if (queue.includes(i)) cls = 'fill-indigo-100 dark:fill-indigo-900/40 stroke-indigo-500';
        if (s.current === i && (s.event === 'dequeue' || s.event === 'start' || s.event === 'enqueue' || s.event === 'edge-skip')) cls = 'fill-amber-200 dark:fill-amber-900/60 stroke-amber-500';
        const orderIdx = order.indexOf(i);
        const orderLabel = orderIdx >= 0 ? `<text x="${p.x + 14}" y="${p.y - 14}" text-anchor="middle" class="fill-amber-700 dark:fill-amber-300 text-[10px] font-mono">#${orderIdx + 1}</text>` : '';
        return `
          <g class="transition-all duration-300">
            <circle cx="${p.x}" cy="${p.y}" r="20" class="${cls}" stroke-width="2"></circle>
            <text x="${p.x}" y="${p.y + 4}" text-anchor="middle" class="fill-zinc-800 dark:fill-zinc-100 text-xs font-mono font-semibold">${i + 1}</text>
            ${orderLabel}
          </g>
        `;
      }).join('');

      el.innerHTML = `<svg viewBox="0 0 ${width} ${height}" width="100%" height="${height}" preserveAspectRatio="xMidYMid meet" class="block">${arrowDef}${edgesSvg.join('')}${nodesSvg}</svg>`;
    }

    function renderQueue() {
      const el = document.getElementById('queue-viz');
      const q = currentStep().queue || [];
      if (!q.length) { el.innerHTML = '<p class="text-zinc-500">Черга порожня.</p>'; return; }
      el.innerHTML = q.map((v, idx) => {
        const isFront = idx === 0;
        const isBack = idx === q.length - 1;
        const cls = isFront
          ? 'border-purple-400 bg-purple-100/80 dark:bg-purple-900/30'
          : isBack
            ? 'border-emerald-400 bg-emerald-100/80 dark:bg-emerald-900/30'
            : 'border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900';
        const label = isFront
          ? '<div class="text-[10px] text-purple-600 dark:text-purple-300">front</div>'
          : isBack
            ? '<div class="text-[10px] text-emerald-600 dark:text-emerald-300">rear</div>'
            : '';
        const arrow = idx < q.length - 1 ? '<span class="text-zinc-400 text-lg">→</span>' : '';
        return `
          <div class="rounded-lg border-2 px-3 py-2 min-w-[56px] text-center transition-all duration-300 ${cls}">
            ${label}
            <div class="font-mono text-sm">${v + 1}</div>
          </div>
          ${arrow}
        `;
      }).join('');
    }

    function refreshStats() {
      const s = currentStep();
      document.getElementById('s-n').textContent = matrix.length;
      document.getElementById('s-step').textContent = `${stepIndex} / ${Math.max(0, trace.steps.length - 1)}`;
      document.getElementById('s-queue').textContent = (s.queue || []).length;
      document.getElementById('s-conn').textContent = matrix.length ? (isConnectedLocal() ? 'так' : 'ні') : '—';
      document.getElementById('t-event').textContent = eventLabel(s);
      document.getElementById('t-order').textContent = (s.order || []).map((v) => v + 1).join(' → ') || '—';
    }

    function renderAll() { renderGraph(); renderQueue(); refreshStats(); }

    function recomputeTrace() {
      trace = bfsTraversal(matrix, startVertex);
      stepIndex = 0;
      renderAll();
    }

    function stopAuto() {
      if (autoTimer) { clearInterval(autoTimer); autoTimer = null; document.getElementById('btn-auto').textContent = 'Авто'; }
    }

    document.getElementById('btn-apply').addEventListener('click', () => {
      stopAuto();
      try {
        matrix = parseMatrixText(document.getElementById('matrix-input').value);
        startVertex = 0;
        rebuildStartSelect();
        recomputeTrace();
        pushLog(`Застосовано граф ${matrix.length}×${matrix.length}`);
      } catch (e) {
        showError(e.message);
      }
    });

    document.getElementById('btn-random').addEventListener('click', () => {
      stopAuto();
      const n = 6;
      const m = Array.from({ length: n }, () => new Array(n).fill(0));
      for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) if (Math.random() < 0.45) { m[i][j] = 1; m[j][i] = 1; }
      matrix = m;
      document.getElementById('matrix-input').value = matrix.map((r) => r.join(' ')).join('\n');
      startVertex = 0;
      rebuildStartSelect();
      recomputeTrace();
      pushLog(`Згенеровано випадковий неорієнтований граф n=${n}`);
    });

    document.getElementById('start-vertex').addEventListener('change', (e) => {
      stopAuto();
      startVertex = Number(e.target.value);
      recomputeTrace();
      pushLog(`Стартова вершина: ${startVertex + 1}`);
    });

    document.getElementById('btn-run').addEventListener('click', () => {
      stopAuto();
      stepIndex = trace.steps.length - 1;
      renderAll();
      pushLog(`BFS(${startVertex + 1}) → порядок: [${trace.order.map((v) => v + 1).join(' → ')}]`);
    });

    document.getElementById('btn-step').addEventListener('click', () => {
      stopAuto();
      if (stepIndex < trace.steps.length - 1) stepIndex++;
      renderAll();
    });

    document.getElementById('btn-auto').addEventListener('click', () => {
      if (autoTimer) { stopAuto(); return; }
      document.getElementById('btn-auto').textContent = 'Стоп';
      autoTimer = setInterval(() => {
        if (stepIndex < trace.steps.length - 1) { stepIndex++; renderAll(); }
        else stopAuto();
      }, autoDelay);
    });

    document.getElementById('btn-reset').addEventListener('click', () => {
      stopAuto();
      stepIndex = 0;
      renderAll();
    });

    speedEl.addEventListener('input', (e) => {
      autoDelay = Number(e.target.value);
      speedVal.textContent = `${autoDelay} мс`;
      if (autoTimer) {
        stopAuto();
        document.getElementById('btn-auto').click();
      }
    });

    rebuildStartSelect();
    renderAll();
    pushLog('Демо: 5×5 граф з методички, старт з вершини 1');
  },
};
