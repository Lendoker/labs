/**
 * @file Lab27Page.js
 * @description Лабораторна №27 — Найкоротші шляхи, алгоритм Дейкстри.
 */

import { parseMatrixText } from '../../core/algorithms/graph.js';
import { dijkstra, reconstructPath, formatDist, INF } from '../../core/algorithms/graphAdvanced.js';
import { randomUndirectedWeightedMatrix, matrixToText } from '../../core/algorithms/graphRandom.js';
import { renderGraphSvg, wireStepPlayback, matrixHasEdge, matrixEdgeLabel } from './graphViz.js';

const EXAMPLE_MATRIX = `0 9 75 0 0
9 0 95 19 42
75 95 0 51 66
0 19 51 0 31
0 42 66 31 0`;

export const Lab27Page = {
  mount(container) {
    let matrix = parseMatrixText(EXAMPLE_MATRIX);
    let start = 0;
    let target = 4;
    let trace = dijkstra(matrix, start);
    let logLines = ['[menu] Дейкстра: стартова та цільова вершини'];

    container.innerHTML = `
      <div class="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
        <header><h1 class="text-2xl font-bold">Лабораторна робота №27 — Алгоритм Дейкстри</h1></header>
        <section class="prose dark:prose-invert max-w-none">
          <h2>Теоретичний блок</h2>
          <p><strong>Дейкстра</strong> знаходить найкоротші шляхи від однієї вершини до всіх інших у графі з невід’ємними вагами. На кожному кроці фіксуємо невідвідану вершину з мінімальною поточною відстанню і релаксуємо її сусідів.</p>
          <p>Масив <code>distance[v]</code> — найкраща відома відстань; <code>parent[v]</code> — попередник на шляху. Складність O(V²) з лінійним пошуком мінімуму.</p>
          <p>Не працює коректно при від’ємних вагах — для них використовують Беллмана–Форда (лаб. 28).</p>
        </section>
        <section class="space-y-4">
          <h2 class="text-xl font-semibold">Матриця ваг</h2>
          <textarea id="matrix-input" rows="6" class="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 font-mono text-sm">${EXAMPLE_MATRIX}</textarea>
          <div class="grid grid-cols-2 gap-3 max-w-md">
            <div><label class="text-sm">Старт</label><select id="start-v" class="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900"></select></div>
            <div><label class="text-sm">Ціль (для шляху)</label><select id="target-v" class="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900"></select></div>
          </div>
          <button id="btn-apply" class="btn-animated px-4 py-2 rounded-lg bg-purple-600 text-white">Застосувати</button>
          <button id="btn-random" class="btn-animated px-4 py-2 rounded-lg bg-indigo-600 text-white">Випадковий (n=7)</button>
          <p id="error-msg" class="text-red-600 dark:text-red-400 text-sm hidden"></p>
        </section>
        <section class="flex flex-wrap gap-2">
          <button id="btn-run" class="btn-animated px-4 py-2 rounded-lg bg-purple-600 text-white">Запустити</button>
          <button id="btn-step" class="btn-animated px-4 py-2 rounded-lg bg-indigo-600 text-white">Крок</button>
          <button id="btn-auto" class="btn-animated px-4 py-2 rounded-lg bg-emerald-600 text-white">Авто</button>
          <button id="btn-reset" class="btn-animated px-4 py-2 rounded-lg bg-zinc-500 text-white">Скинути</button>
        </section>
        <section class="space-y-3">
          <h2 class="text-xl font-semibold">Візуалізація</h2>
          <div id="graph-viz" class="overflow-x-auto p-3 bg-zinc-100/80 dark:bg-zinc-800/50 rounded-xl border-2 border-dashed border-purple-200"></div>
        </section>
        <section class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div class="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800"><div class="text-xs text-zinc-500">Відстані від старту</div><div id="t-dist" class="font-mono text-xs break-all">—</div></div>
          <div class="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800"><div class="text-xs text-zinc-500">Шлях до цілі</div><div id="t-path" class="font-mono text-sm">—</div></div>
        </section>
        <pre id="menu-log" class="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-3 text-xs overflow-auto max-h-48"></pre>
      </div>
    `;

    const errorEl = document.getElementById('error-msg');
    const menuLog = document.getElementById('menu-log');
    const pushLog = (l) => { logLines.push(`[${new Date().toLocaleTimeString()}] ${l}`); menuLog.textContent = logLines.slice(-80).join('\n'); };

    function rebuildSelects() {
      for (const id of ['start-v', 'target-v']) {
        const sel = document.getElementById(id);
        sel.innerHTML = '';
        for (let i = 0; i < matrix.length; i++) {
          const o = document.createElement('option');
          o.value = String(i);
          o.textContent = String(i + 1);
          sel.appendChild(o);
        }
      }
      document.getElementById('start-v').value = String(start);
      document.getElementById('target-v').value = String(Math.min(target, matrix.length - 1));
    }

    function pathEdges(parent, t) {
      const path = reconstructPath(parent, t);
      const edges = [];
      for (let i = 1; i < path.length; i++) edges.push({ from: path[i - 1], to: path[i] });
      return { path, edges };
    }

    function recompute() {
      trace = dijkstra(matrix, start);
      playback.setStep(0);
      playback.render();
    }

    function renderStep(i) {
      const s = trace.steps[i] || trace.steps.at(-1);
      const dist = s?.distance || trace.distance;
      const parent = s?.parent || trace.parent;
      const { path, edges } = pathEdges(parent, target);
      const visited = (s?.visited || []).map((v, i) => (v ? i : null)).filter((x) => x !== null);
      const nodeSubLabels = dist.map((d) => formatDist(d));
      renderGraphSvg(document.getElementById('graph-viz'), {
        n: matrix.length,
        directed: false,
        hasEdge: (i, j) => matrixHasEdge(matrix, i, j, false),
        edgeLabel: (i, j) => matrixEdgeLabel(matrix, i, j),
        pathEdges: edges,
        highlightNodes: [start, target, ...(s?.current !== undefined ? [s.current] : [])],
        visitedNodes: visited,
        activeEdge: s?.neighbour !== undefined ? { from: s.current, to: s.neighbour } : null,
        nodeSubLabels,
      });
      document.getElementById('t-dist').textContent = dist.map((d, idx) => `${idx + 1}:${formatDist(d)}`).join('  ');
      document.getElementById('t-path').textContent = dist[target] === INF
        ? 'Недосяжна'
        : `${path.map((v) => v + 1).join(' → ')} (вага ${dist[target]})`;
    }

    const playback = wireStepPlayback({
      getMaxStep: () => Math.max(0, trace.steps.length - 1),
      onStep: renderStep,
      onRun: () => {
        const d = trace.distance[target];
        pushLog(`До ${target + 1}: ${d === INF ? '∞' : d}`);
      },
      btnStep: document.getElementById('btn-step'),
      btnAuto: document.getElementById('btn-auto'),
      btnRun: document.getElementById('btn-run'),
      btnReset: document.getElementById('btn-reset'),
    });

    document.getElementById('btn-apply').addEventListener('click', () => {
      try {
        matrix = parseMatrixText(document.getElementById('matrix-input').value);
        start = Number(document.getElementById('start-v').value || 0);
        target = Number(document.getElementById('target-v').value || 0);
        errorEl.classList.add('hidden');
        rebuildSelects();
        recompute();
      } catch (e) { errorEl.textContent = e.message; errorEl.classList.remove('hidden'); }
    });

    document.getElementById('start-v').addEventListener('change', (e) => { start = Number(e.target.value); recompute(); });
    document.getElementById('target-v').addEventListener('change', (e) => { target = Number(e.target.value); playback.render(); });

    document.getElementById('btn-random').addEventListener('click', () => {
      playback.stopAuto();
      matrix = randomUndirectedWeightedMatrix(7);
      document.getElementById('matrix-input').value = matrixToText(matrix);
      start = 0;
      target = matrix.length - 1;
      errorEl.classList.add('hidden');
      rebuildSelects();
      recompute();
      pushLog(`Випадковий граф n=${matrix.length}, старт=1, ціль=${target + 1}`);
    });

    rebuildSelects();
    recompute();
    pushLog('Демо: граф з методички, старт = 1');
  },
};
