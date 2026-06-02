/**
 * @file Lab28Page.js
 * @description Лабораторна №28 — Беллман–Форд, від’ємні цикли, порівняння з Дейкстрою.
 */

import { parseWeightedEdgesText, bellmanFord, dijkstra, formatDist, INF, reconstructPath } from '../../core/algorithms/graphAdvanced.js';

const EXAMPLE_EDGES = `0 1 9
0 2 75
1 2 95
1 3 19
1 4 42
2 3 51
2 4 66
3 4 31`;

export const Lab28Page = {
  mount(container) {
    let graph = parseWeightedEdgesText(EXAMPLE_EDGES);
    let start = 0;
    let trace = bellmanFord(graph.n, graph.edges, start);
    let logLines = ['[menu] Беллман–Форд + порівняння з Дейкстрою'];

    container.innerHTML = `
      <div class="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
        <header><h1 class="text-2xl font-bold">Лабораторна робота №28 — Алгоритм Беллмана–Форда</h1></header>
        <section class="prose dark:prose-invert max-w-none">
          <h2>Теоретичний блок</h2>
          <p><strong>Беллман–Форд</strong> знаходить найкоротші шляхи у зваженому орієнтованому графі, допускаючи від’ємні ваги. Виконує до |V|−1 ітерацій релаксації всіх ребер.</p>
          <p>Додаткова |V|-та ітерація виявляє <strong>від’ємний цикл</strong>: якщо ще можна покращити відстань — цикл існує, однозначні найкоротші шляхи не визначені.</p>
          <p>На відміну від Дейкстри (лаб. 27), працює з від’ємними вагами, але повільніший: O(VE).</p>
        </section>
        <section class="space-y-4">
          <h2 class="text-xl font-semibold">Ребра (u v w), орієнтований граф</h2>
          <textarea id="edges-input" rows="10" class="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 font-mono text-sm">${EXAMPLE_EDGES}</textarea>
          <div class="flex flex-wrap gap-2 items-center">
            <label class="text-sm">Старт:</label>
            <input id="start-v" type="number" min="0" value="0" class="w-20 px-2 py-1 rounded border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900">
            <button id="btn-apply" class="btn-animated px-4 py-2 rounded-lg bg-purple-600 text-white">Застосувати</button>
            <button id="btn-neg-cycle" class="btn-animated px-4 py-2 rounded-lg bg-rose-600 text-white">+ від’ємний цикл (демо)</button>
            <button id="btn-compare" class="btn-animated px-4 py-2 rounded-lg bg-indigo-600 text-white">Порівняти з Дейкстрою</button>
          </div>
          <p id="error-msg" class="text-red-600 dark:text-red-400 text-sm hidden"></p>
        </section>
        <section class="flex flex-wrap gap-2">
          <button id="btn-run" class="btn-animated px-4 py-2 rounded-lg bg-purple-600 text-white">Запустити</button>
          <button id="btn-step" class="btn-animated px-4 py-2 rounded-lg bg-indigo-600 text-white">Крок</button>
          <button id="btn-reset" class="btn-animated px-4 py-2 rounded-lg bg-zinc-500 text-white">Скинути</button>
        </section>
        <div class="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800"><div class="text-xs text-zinc-500">Відстані</div><div id="t-dist" class="font-mono text-sm">—</div></div>
        <div class="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800"><div class="text-xs text-zinc-500">Статус</div><div id="t-status" class="font-mono text-sm">—</div></div>
        <pre id="menu-log" class="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-3 text-xs overflow-auto max-h-48"></pre>
      </div>
    `;

    const errorEl = document.getElementById('error-msg');
    const menuLog = document.getElementById('menu-log');
    let stepIndex = 0;
    const pushLog = (l) => { logLines.push(`[${new Date().toLocaleTimeString()}] ${l}`); menuLog.textContent = logLines.slice(-80).join('\n'); };

    function renderResult() {
      const dist = trace.dist;
      document.getElementById('t-dist').textContent = dist.map((d, i) => `→${i + 1}: ${formatDist(d)}`).join('  ');
      document.getElementById('t-status').textContent = trace.negativeCycle
        ? 'Виявлено від’ємний цикл!'
        : 'Найкоротші відстані обчислено';
    }

    function recompute() {
      trace = bellmanFord(graph.n, graph.edges, start);
      stepIndex = 0;
      renderResult();
    }

    document.getElementById('btn-apply').addEventListener('click', () => {
      try {
        graph = parseWeightedEdgesText(document.getElementById('edges-input').value);
        start = Number(document.getElementById('start-v').value) || 0;
        errorEl.classList.add('hidden');
        recompute();
        pushLog(`n=${graph.n}, m=${graph.edges.length}`);
      } catch (e) { errorEl.textContent = e.message; errorEl.classList.remove('hidden'); }
    });

    document.getElementById('btn-run').addEventListener('click', () => {
      recompute();
      pushLog(trace.negativeCycle ? 'Від’ємний цикл' : `dist: [${trace.dist.map(formatDist).join(', ')}]`);
    });

    document.getElementById('btn-step').addEventListener('click', () => {
      if (stepIndex < trace.steps.length - 1) stepIndex++;
      const s = trace.steps[stepIndex];
      if (s?.edge) pushLog(`relax ${s.edge.from + 1}→${s.edge.to + 1} w=${s.edge.weight}`);
      renderResult();
    });

    document.getElementById('btn-reset').addEventListener('click', () => { stepIndex = 0; renderResult(); });

    document.getElementById('btn-neg-cycle').addEventListener('click', () => {
      const extra = `${graph.n - 1} ${graph.n - 2} -50\n${graph.n - 2} ${graph.n - 1} 20`;
      document.getElementById('edges-input').value = `${document.getElementById('edges-input').value.trim()}\n${extra}`;
      graph = parseWeightedEdgesText(document.getElementById('edges-input').value);
      recompute();
      pushLog('Додано ребра для демонстрації від’ємного циклу');
    });

    document.getElementById('btn-compare').addEventListener('click', () => {
      const bf = bellmanFord(graph.n, graph.edges, start);
      const n = graph.n;
      const matrix = Array.from({ length: n }, () => new Array(n).fill(0));
      for (const e of graph.edges) if (e.weight >= 0) matrix[e.from][e.to] = e.weight;
      const dj = dijkstra(matrix, start);
      const lines = [];
      for (let i = 0; i < n; i++) {
        const a = bf.dist[i]; const b = dj.distance[i];
        const same = (a === INF && b === INF) || a === b;
        lines.push(`${i + 1}: BF=${formatDist(a)} Dijkstra=${formatDist(b)} ${same ? '✓' : '≠'}`);
      }
      pushLog('Порівняння (лише невід\'ємні ребра для Дейкстри):\n' + lines.join('\n'));
    });

    recompute();
    pushLog('Демо: орієнтований граф з методички');
  },
};
