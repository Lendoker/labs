/**
 * @file Lab24Page.js
 * @description Лабораторна №24 — Топологічне сортування (DFS, Кан, перевірка циклу).
 */

import { parseDirectedEdgesText, topologicalSortDfs, topologicalSortKahn } from '../../core/algorithms/graphAdvanced.js';
import { renderGraphSvg, wireStepPlayback } from './graphViz.js';

const EXAMPLE_EDGES = `0 1
0 2
1 3
2 3
2 4
3 5`;

const PSEUDOCODE = `DFS_topo(v):
  visited[v] = true
  for to in adj[v]:
    if not visited[to]: DFS_topo(to)
  order.push(v)   // після обходу сусідів
// результат: reverse(order)`;

export const Lab24Page = {
  mount(container) {
    let graph = parseDirectedEdgesText(EXAMPLE_EDGES);
    let mode = 'dfs';
    let trace = topologicalSortDfs(graph.adj, graph.n);
    let logLines = ['[menu] Введіть орієнтовані ребра → запустіть сортування'];

    container.innerHTML = `
      <div class="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
        <header><h1 class="text-2xl font-bold">Лабораторна робота №24 — Топологічне сортування</h1></header>

        <section class="prose dark:prose-invert max-w-none">
          <h2>Теоретичний блок</h2>
          <p><strong>Топологічне сортування</strong> будує лінійний порядок вершин орієнтованого ациклічного графа (DAG): для кожного ребра u→v вершина u з’являється раніше за v. Застосовується при плануванні задач, компіляції модулів, розкладі курсів.</p>
          <p><strong>DFS:</strong> після повного обходу сусідів вершина додається у список завершення; зворотний порядок цього списку — топологічний порядок. Якщо під час DFS знайдено ребро до «сірої» вершини — у графі є цикл, сортування неможливе.</p>
          <p><strong>Алгоритм Кана:</strong> повторно вилучаємо вершини з нульовим вхідним степенем; якщо в кінці оброблено менше n вершин — є цикл.</p>
          <pre class="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg text-sm overflow-x-auto"><code>${PSEUDOCODE}</code></pre>
        </section>

        <section class="space-y-4">
          <h2 class="text-xl font-semibold">Орієнтований граф (ребра u v)</h2>
          <textarea id="edges-input" rows="8" class="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 font-mono text-sm">${EXAMPLE_EDGES}</textarea>
          <div class="flex flex-wrap gap-2 items-center">
            <button id="btn-apply" class="btn-animated px-4 py-2 rounded-lg bg-purple-600 text-white">Застосувати</button>
            <label class="text-sm">Алгоритм:</label>
            <select id="algo-mode" class="px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-sm">
              <option value="dfs">DFS (зворотний порядок завершення)</option>
              <option value="kahn">Кан (черга нульового in-degree)</option>
            </select>
          </div>
          <p id="error-msg" class="text-red-600 dark:text-red-400 text-sm hidden"></p>
        </section>

        <section class="space-y-3">
          <h2 class="text-xl font-semibold">Керування</h2>
          <div class="flex flex-wrap gap-2">
            <button id="btn-run" class="btn-animated px-4 py-2 rounded-lg bg-purple-600 text-white">Запустити</button>
            <button id="btn-step" class="btn-animated px-4 py-2 rounded-lg bg-indigo-600 text-white">Крок</button>
            <button id="btn-auto" class="btn-animated px-4 py-2 rounded-lg bg-emerald-600 text-white">Авто</button>
            <button id="btn-reset" class="btn-animated px-4 py-2 rounded-lg bg-zinc-500 text-white">Скинути</button>
          </div>
          <input id="speed" type="range" min="100" max="1500" step="50" value="700" class="w-full max-w-md">
        </section>

        <section class="space-y-3">
          <h2 class="text-xl font-semibold">Візуалізація</h2>
          <div id="graph-viz" class="overflow-x-auto p-3 bg-zinc-100/80 dark:bg-zinc-800/50 rounded-xl border-2 border-dashed border-purple-200 dark:border-purple-900/60"></div>
        </section>

        <section class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div class="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800">
            <div class="text-xs text-zinc-500 mb-1">Топологічний порядок</div>
            <div id="t-order" class="font-mono text-sm break-all">—</div>
          </div>
          <div class="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800">
            <div class="text-xs text-zinc-500 mb-1">Статус</div>
            <div id="t-status" class="font-mono text-sm">—</div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-semibold mb-2">Журнал</h2>
          <pre id="menu-log" class="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-3 text-xs overflow-auto max-h-48"></pre>
        </section>
      </div>
    `;

    const errorEl = document.getElementById('error-msg');
    const menuLog = document.getElementById('menu-log');
    const pushLog = (line) => {
      logLines.push(`[${new Date().toLocaleTimeString()}] ${line}`);
      if (logLines.length > 80) logLines = logLines.slice(-80);
      menuLog.textContent = logLines.join('\n');
    };

    function recompute() {
      trace = mode === 'kahn'
        ? topologicalSortKahn(graph.adj, graph.n)
        : topologicalSortDfs(graph.adj, graph.n);
      playback.setStep(0);
      playback.render();
    }

    function renderStep(stepIndex) {
      const s = trace.steps[stepIndex] || trace.steps[trace.steps.length - 1];
      const hi = [];
      if (s?.current !== undefined) hi.push(s.current);
      if (s?.neighbour !== undefined) hi.push(s.neighbour);
      renderGraphSvg(document.getElementById('graph-viz'), {
        n: graph.n,
        directed: true,
        hasEdge: (i, j) => graph.adj[i]?.includes(j),
        highlightNodes: hi,
        activeEdge: s?.neighbour !== undefined ? { from: s.current, to: s.neighbour } : null,
      });
      const order = trace.hasCycle ? [] : trace.order;
      document.getElementById('t-order').textContent = order.length
        ? order.map((v) => v + 1).join(' → ')
        : '—';
      document.getElementById('t-status').textContent = trace.hasCycle
        ? 'Цикл у графі — топологічне сортування неможливе'
        : `OK (${mode === 'kahn' ? 'Кан' : 'DFS'})`;
    }

    const playback = wireStepPlayback({
      getMaxStep: () => Math.max(0, trace.steps.length - 1),
      onStep: renderStep,
      onRun: () => {
        if (trace.hasCycle) pushLog('Помилка: граф містить цикл');
        else pushLog(`Порядок: [${trace.order.map((v) => v + 1).join(' → ')}]`);
      },
      speedEl: document.getElementById('speed'),
      btnStep: document.getElementById('btn-step'),
      btnAuto: document.getElementById('btn-auto'),
      btnRun: document.getElementById('btn-run'),
      btnReset: document.getElementById('btn-reset'),
    });

    document.getElementById('btn-apply').addEventListener('click', () => {
      try {
        graph = parseDirectedEdgesText(document.getElementById('edges-input').value);
        errorEl.classList.add('hidden');
        recompute();
        pushLog(`Граф: n=${graph.n}, m=${graph.edges.length}`);
      } catch (e) {
        errorEl.textContent = e.message;
        errorEl.classList.remove('hidden');
      }
    });

    document.getElementById('algo-mode').addEventListener('change', (e) => {
      mode = e.target.value;
      recompute();
      pushLog(`Режим: ${mode === 'kahn' ? 'Кан' : 'DFS'}`);
    });

    recompute();
    pushLog('Демо: DAG з 6 вершин');
  },
};
