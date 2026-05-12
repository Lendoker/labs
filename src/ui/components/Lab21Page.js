/**
 * @file Lab21Page.js
 * @description Лабораторна №21 — Представлення графів матрицею суміжності.
 *   Користувач вводить розмір та матрицю; програма визначає тип графа
 *   (орієнтований/неорієнтований, зважений/незважений), наявність петель,
 *   кількість ребер, степені вершин, список суміжності та зв’язність.
 *   Доступний альтернативний спосіб задання — у вигляді списку ребер.
 */

import {
  parseMatrixText,
  summarize,
  circleLayout,
} from '../../core/algorithms/graph.js';

const EXAMPLE_MATRIX = `0 1 1 0 1
1 0 1 1 0
1 1 0 1 1
0 1 1 0 0
1 0 1 0 0`;

const EXAMPLE_EDGES = `1-2
1-3
1-5
2-3
2-4
3-4
3-5`;

export const Lab21Page = {
  mount(container) {
    let matrix = parseMatrixText(EXAMPLE_MATRIX);
    let summary = summarize(matrix);
    let logLines = ['[menu] 1) Ввести матрицю  2) Ввести список ребер  3) Згенерувати'];

    container.innerHTML = `
      <div class="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
        <header><h1 class="text-2xl font-bold">Лабораторна робота №21 — Представлення графів</h1></header>

        <section class="prose dark:prose-invert max-w-none">
          <h2>Теоретичний блок</h2>
          <p><strong>Граф</strong> — пара <code>(V, E)</code>, де <code>V</code> — множина вершин, а <code>E</code> — множина ребер. Граф може бути <em>орієнтованим</em> або <em>неорієнтованим</em>, <em>зваженим</em> або <em>незваженим</em>.</p>
          <p><strong>Матриця суміжності</strong> — двовимірний масив <code>a[i][j]</code>, у якому значення показує, чи існує ребро між вершинами <em>i</em> та <em>j</em> (та його вагу для зважених графів). Симетричність матриці свідчить про неорієнтованість графа; ненульові елементи на діагоналі — про наявність петель.</p>
          <p>Зі списку суміжності зручно швидко перебирати сусідів. Степені вершин обчислюються підрахунком ненульових елементів у рядку (для неорієнтованих) або окремо вхідного/вихідного ступеня (для орієнтованих).</p>
        </section>

        <section class="space-y-4">
          <h2 class="text-xl font-semibold">Введення графа</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="block text-sm font-medium">Матриця суміжності (рядки розділені переходом)</label>
              <textarea id="matrix-input" rows="6" class="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 font-mono text-sm">${EXAMPLE_MATRIX}</textarea>
              <button id="btn-apply-matrix" class="btn-animated px-4 py-2 rounded-lg bg-purple-600 text-white">Застосувати матрицю</button>
            </div>
            <div class="space-y-2">
              <label class="block text-sm font-medium">Список ребер (формат <code>a-b</code> або <code>a-b:w</code>)</label>
              <textarea id="edges-input" rows="6" class="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 font-mono text-sm">${EXAMPLE_EDGES}</textarea>
              <div class="flex gap-2 items-center">
                <label class="text-sm flex items-center gap-1">
                  <input id="edges-directed" type="checkbox" class="accent-purple-600"> орієнтований
                </label>
                <button id="btn-apply-edges" class="btn-animated px-4 py-2 rounded-lg bg-indigo-600 text-white">Застосувати список ребер</button>
              </div>
            </div>
          </div>
          <div class="flex flex-wrap gap-2">
            <button id="btn-random" class="btn-animated px-4 py-2 rounded-lg bg-emerald-600 text-white">Згенерувати випадковий (n=6)</button>
            <button id="btn-clear" class="btn-animated px-4 py-2 rounded-lg bg-zinc-500 text-white">Очистити</button>
          </div>
          <p id="error-msg" class="text-red-600 dark:text-red-400 text-sm hidden"></p>
        </section>

        <section class="space-y-3">
          <h2 class="text-xl font-semibold">Граф (кругова розкладка)</h2>
          <div id="graph-viz" class="overflow-x-auto p-3 bg-zinc-100/80 dark:bg-zinc-800/50 rounded-xl border-2 border-dashed border-purple-200 dark:border-purple-900/60"></div>
        </section>

        <section class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <h2 class="text-xl font-semibold mb-2">Матриця суміжності</h2>
            <div id="matrix-table" class="overflow-x-auto"></div>
          </div>
          <div>
            <h2 class="text-xl font-semibold mb-2">Довідка про граф</h2>
            <div id="report" class="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-sm space-y-1"></div>
            <h3 class="text-md font-semibold mt-3 mb-1">Список суміжності</h3>
            <pre id="adj-list" class="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-3 text-xs overflow-auto max-h-48"></pre>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-semibold mb-2">Журнал</h2>
          <pre id="menu-log" class="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-3 text-xs overflow-auto max-h-48"></pre>
        </section>
      </div>
    `;

    const menuLog = document.getElementById('menu-log');
    const errorEl = document.getElementById('error-msg');

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

    function renderMatrixTable() {
      const el = document.getElementById('matrix-table');
      const n = matrix.length;
      if (!n) { el.innerHTML = '<p class="text-zinc-500 text-sm">Матриця порожня.</p>'; return; }
      const header = `<th class="px-2 py-1 text-xs text-zinc-500"></th>` + matrix.map((_, j) => `<th class="px-2 py-1 text-xs text-purple-600 dark:text-purple-300">${j + 1}</th>`).join('');
      const rows = matrix.map((row, i) => {
        const head = `<th class="px-2 py-1 text-xs text-purple-600 dark:text-purple-300">${i + 1}</th>`;
        const cells = row.map((v, j) => {
          const isDiag = i === j;
          const cls = v !== 0
            ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-200'
            : 'text-zinc-400 dark:text-zinc-600';
          const diag = isDiag ? 'ring-1 ring-amber-400/60' : '';
          return `<td class="px-2 py-1 text-center font-mono text-xs rounded ${cls} ${diag}">${v}</td>`;
        }).join('');
        return `<tr>${head}${cells}</tr>`;
      }).join('');
      el.innerHTML = `<table class="min-w-full border-separate border-spacing-1"><thead><tr>${header}</tr></thead><tbody>${rows}</tbody></table>`;
    }

    function renderGraph() {
      const el = document.getElementById('graph-viz');
      const n = matrix.length;
      if (!n) { el.innerHTML = '<p class="text-zinc-500 p-4">Граф порожній.</p>'; return; }
      const width = 580, height = 440;
      const positions = circleLayout(n, { cx: width / 2, cy: height / 2, radius: Math.min(width, height) / 2 - 40 });
      const directed = summary.directed;

      const arrowDef = `
        <defs>
          <marker id="arrow-g1" viewBox="0 -5 10 10" refX="22" refY="0" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0,-5L10,0L0,5" class="fill-purple-500 dark:fill-purple-300"></path>
          </marker>
        </defs>
      `;

      const edgesSvg = [];
      const drawn = new Set();
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          if (matrix[i][j] === 0) continue;
          if (!directed) {
            const key = `${Math.min(i, j)}-${Math.max(i, j)}`;
            if (drawn.has(key)) continue;
            drawn.add(key);
          }
          const a = positions[i], b = positions[j];
          if (i === j) {
            edgesSvg.push(`<circle cx="${a.x + 22}" cy="${a.y - 22}" r="14" fill="none" class="stroke-amber-500" stroke-width="1.5" />`);
            edgesSvg.push(`<text x="${a.x + 22}" y="${a.y - 38}" text-anchor="middle" class="fill-amber-600 dark:fill-amber-300 text-[10px]">loop</text>`);
            continue;
          }
          const label = summary.weighted ? matrix[i][j] : '';
          edgesSvg.push(`<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" class="stroke-purple-400 dark:stroke-purple-500" stroke-width="2" ${directed ? 'marker-end="url(#arrow-g1)"' : ''}/>`);
          if (label) {
            edgesSvg.push(`<text x="${(a.x + b.x) / 2}" y="${(a.y + b.y) / 2 - 4}" text-anchor="middle" class="fill-purple-700 dark:fill-purple-200 text-[11px] font-mono">${label}</text>`);
          }
        }
      }
      const nodesSvg = positions.map((p, i) => `
        <g>
          <circle cx="${p.x}" cy="${p.y}" r="20" class="fill-white dark:fill-zinc-900 stroke-purple-500" stroke-width="2"></circle>
          <text x="${p.x}" y="${p.y + 4}" text-anchor="middle" class="fill-zinc-800 dark:fill-zinc-100 text-xs font-mono font-semibold">${i + 1}</text>
        </g>
      `).join('');
      el.innerHTML = `<svg viewBox="0 0 ${width} ${height}" width="100%" height="${height}" preserveAspectRatio="xMidYMid meet" class="block">${arrowDef}${edgesSvg.join('')}${nodesSvg}</svg>`;
    }

    function renderReport() {
      const el = document.getElementById('report');
      const n = summary.n;
      const lines = [];
      lines.push(`<div><strong>Вершин:</strong> ${n}</div>`);
      lines.push(`<div><strong>Тип:</strong> ${summary.directed ? 'орієнтований' : 'неорієнтований'}</div>`);
      lines.push(`<div><strong>Вага ребер:</strong> ${summary.weighted ? 'зважений' : 'незважений'}</div>`);
      lines.push(`<div><strong>Петлі:</strong> ${summary.loops ? 'є' : 'немає'}</div>`);
      lines.push(`<div><strong>Кількість ребер:</strong> ${summary.edges}</div>`);
      if (summary.negative) lines.push(`<div class="text-rose-600 dark:text-rose-300">Виявлено від’ємні значення — перевірте введення.</div>`);
      if (summary.connected !== null) lines.push(`<div><strong>Зв’язність (неорієнтований):</strong> ${summary.connected ? 'граф зв’язний' : 'граф незв’язний'}</div>`);
      lines.push('<hr class="border-zinc-300 dark:border-zinc-700"/>');
      lines.push('<div class="text-xs text-zinc-500">Степені вершин:</div>');
      const degRows = summary.degrees.list.map((d, i) => {
        if (summary.degrees.directed) return `<span class="px-2 py-1 rounded bg-purple-100 dark:bg-purple-900/40 text-xs font-mono">${i + 1}: in=${d.in}, out=${d.out}</span>`;
        return `<span class="px-2 py-1 rounded bg-purple-100 dark:bg-purple-900/40 text-xs font-mono">${i + 1}: deg=${d.deg}</span>`;
      }).join(' ');
      lines.push(`<div class="flex flex-wrap gap-2">${degRows}</div>`);
      el.innerHTML = lines.join('');

      const adj = summary.adjList;
      document.getElementById('adj-list').textContent = adj.map((row, i) => `${i + 1}: ${row.map((v) => v + 1).join(', ') || '—'}`).join('\n');
    }

    function refresh() {
      summary = summarize(matrix);
      renderGraph();
      renderMatrixTable();
      renderReport();
    }

    function applyMatrix() {
      showError('');
      try {
        matrix = parseMatrixText(document.getElementById('matrix-input').value);
        pushLog(`Застосовано матрицю ${matrix.length}×${matrix.length}`);
        refresh();
      } catch (e) {
        showError(e.message);
      }
    }

    function applyEdges() {
      showError('');
      const txt = document.getElementById('edges-input').value;
      const directed = document.getElementById('edges-directed').checked;
      const lines = txt.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
      const edges = [];
      let maxV = 0;
      for (const line of lines) {
        const m = line.match(/^(\d+)\s*[-–>]\s*(\d+)(?::([+-]?\d+))?$/);
        if (!m) return showError(`Не вдалося розпізнати рядок: «${line}». Очікувано: «a-b» або «a-b:вага».`);
        const a = Number(m[1]) - 1;
        const b = Number(m[2]) - 1;
        const w = m[3] ? Number(m[3]) : 1;
        if (a < 0 || b < 0) return showError('Номери вершин мають бути ≥ 1.');
        maxV = Math.max(maxV, a + 1, b + 1);
        edges.push([a, b, w]);
      }
      const n = maxV;
      const m = Array.from({ length: n }, () => new Array(n).fill(0));
      for (const [a, b, w] of edges) {
        m[a][b] = w;
        if (!directed) m[b][a] = w;
      }
      matrix = m;
      pushLog(`Застосовано список ребер: ${edges.length} ребер, n=${n}, тип: ${directed ? 'орієнтований' : 'неорієнтований'}`);
      refresh();
    }

    function generateRandom() {
      const n = 6;
      const m = Array.from({ length: n }, () => new Array(n).fill(0));
      for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
          if (Math.random() < 0.45) {
            m[i][j] = 1;
            m[j][i] = 1;
          }
        }
      }
      matrix = m;
      document.getElementById('matrix-input').value = matrix.map((r) => r.join(' ')).join('\n');
      pushLog(`Згенеровано випадковий неорієнтований граф n=${n}`);
      refresh();
    }

    document.getElementById('btn-apply-matrix').addEventListener('click', applyMatrix);
    document.getElementById('btn-apply-edges').addEventListener('click', applyEdges);
    document.getElementById('btn-random').addEventListener('click', generateRandom);
    document.getElementById('btn-clear').addEventListener('click', () => {
      matrix = [];
      pushLog('clear() → граф очищено');
      refresh();
    });

    pushLog('Демо: завантажено приклад матриці 5×5 (неорієнтований граф з 7 ребер).');
    refresh();
  },
};
