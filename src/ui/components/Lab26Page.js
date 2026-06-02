/**
 * @file Lab26Page.js
 * @description Лабораторна №26 — Мінімальний кістяк, алгоритм Пріма.
 */

import { parseMatrixText } from '../../core/algorithms/graph.js';
import { primMst } from '../../core/algorithms/graphAdvanced.js';
import { renderGraphSvg, wireStepPlayback, matrixHasEdge, matrixEdgeLabel } from './graphViz.js';

const EXAMPLE_MATRIX = `0 9 75 0 0
9 0 95 19 42
75 95 0 51 66
0 19 51 0 31
0 42 66 31 0`;

export const Lab26Page = {
  mount(container) {
    let matrix = parseMatrixText(EXAMPLE_MATRIX);
    let trace = primMst(matrix, 0);
    let logLines = ['[menu] Матриця ваг → Прим'];

    container.innerHTML = `
      <div class="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
        <header><h1 class="text-2xl font-bold">Лабораторна робота №26 — Алгоритм Пріма</h1></header>
        <section class="prose dark:prose-invert max-w-none">
          <h2>Теоретичний блок</h2>
          <p><strong>Прим</strong> росте MST від однієї стартової вершини: на кожному кроці додаємо ребро мінімальної ваги між множиною вже включених вершин і рештою графа.</p>
          <p>Масив <code>key[v]</code> — найменша вага ребра, що з’єднує v з MST; <code>parent[v]</code> — сусід у MST. Складність O(V²) для матриці суміжності.</p>
          <p>На тому ж графі, що й у Краскала, обидва алгоритми дають однакову суму ваг MST.</p>
        </section>
        <section class="space-y-4">
          <h2 class="text-xl font-semibold">Матриця ваг</h2>
          <textarea id="matrix-input" rows="6" class="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 font-mono text-sm">${EXAMPLE_MATRIX}</textarea>
          <button id="btn-apply" class="btn-animated px-4 py-2 rounded-lg bg-purple-600 text-white">Застосувати</button>
          <p id="error-msg" class="text-red-600 dark:text-red-400 text-sm hidden"></p>
        </section>
        <section class="flex flex-wrap gap-2">
          <button id="btn-run" class="btn-animated px-4 py-2 rounded-lg bg-purple-600 text-white">Запустити</button>
          <button id="btn-step" class="btn-animated px-4 py-2 rounded-lg bg-indigo-600 text-white">Крок</button>
          <button id="btn-auto" class="btn-animated px-4 py-2 rounded-lg bg-emerald-600 text-white">Авто</button>
          <button id="btn-reset" class="btn-animated px-4 py-2 rounded-lg bg-zinc-500 text-white">Скинути</button>
        </section>
        <section><div id="graph-viz" class="overflow-x-auto p-3 bg-zinc-100/80 dark:bg-zinc-800/50 rounded-xl border-2 border-dashed border-purple-200"></div></section>
        <section class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div class="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800"><div class="text-xs text-zinc-500">Ребра MST</div><div id="t-mst" class="font-mono text-sm">—</div></div>
          <div class="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800"><div class="text-xs text-zinc-500">Сума ваг</div><div id="t-sum" class="font-mono text-lg">—</div></div>
        </section>
        <pre id="menu-log" class="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-3 text-xs overflow-auto max-h-48"></pre>
      </div>
    `;

    const errorEl = document.getElementById('error-msg');
    const menuLog = document.getElementById('menu-log');
    const pushLog = (l) => { logLines.push(`[${new Date().toLocaleTimeString()}] ${l}`); menuLog.textContent = logLines.slice(-80).join('\n'); };

    function recompute() {
      trace = primMst(matrix, 0);
      playback.setStep(0);
      playback.render();
    }

    function renderStep(i) {
      const s = trace.steps[i] || trace.steps.at(-1);
      const mst = s?.mstEdges || trace.mstEdges;
      const inMst = s?.inMst || [];
      const hi = inMst.map((v, idx) => (v ? idx : null)).filter((x) => x !== null);
      renderGraphSvg(document.getElementById('graph-viz'), {
        n: matrix.length,
        directed: false,
        hasEdge: (i, j) => matrixHasEdge(matrix, i, j, false),
        edgeLabel: (i, j) => matrixEdgeLabel(matrix, i, j),
        mstEdges: mst.map((e) => ({ start: e.start, end: e.end })),
        highlightNodes: s?.current !== undefined ? [s.current] : hi,
        activeEdge: s?.neighbour !== undefined ? { from: s.current, to: s.neighbour } : null,
      });
      document.getElementById('t-mst').textContent = mst.map((e) => `${e.start + 1}–${e.end + 1}(${e.weight})`).join(', ') || '—';
      document.getElementById('t-sum').textContent = s?.totalWeight ?? trace.totalWeight;
    }

    const playback = wireStepPlayback({
      getMaxStep: () => Math.max(0, trace.steps.length - 1),
      onStep: renderStep,
      onRun: () => pushLog(`MST (Прим) вага=${trace.totalWeight}`),
      btnStep: document.getElementById('btn-step'),
      btnAuto: document.getElementById('btn-auto'),
      btnRun: document.getElementById('btn-run'),
      btnReset: document.getElementById('btn-reset'),
    });

    document.getElementById('btn-apply').addEventListener('click', () => {
      try {
        matrix = parseMatrixText(document.getElementById('matrix-input').value);
        errorEl.classList.add('hidden');
        recompute();
        pushLog(`Граф ${matrix.length}×${matrix.length}`);
      } catch (e) { errorEl.textContent = e.message; errorEl.classList.remove('hidden'); }
    });

    recompute();
    pushLog('Демо: той самий граф, що в лаб. 25');
  },
};
