/**
 * @file Lab28Page.js
 * @description Лабораторна №28 — Беллман–Форд з візуалізацією та випадковою генерацією.
 */

import {
  parseWeightedEdgesText,
  bellmanFord,
  dijkstra,
  formatDist,
  INF,
  reconstructPath,
} from '../../core/algorithms/graphAdvanced.js';
import { randomDirectedWeightedEdges } from '../../core/algorithms/graphRandom.js';
import { renderGraphSvg, wireStepPlayback } from './graphViz.js';

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
    let target = 4;
    let trace = bellmanFord(graph.n, graph.edges, start);
    let logLines = ['[menu] Беллман–Форд + візуалізація'];

    container.innerHTML = `
      <div class="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
        <header><h1 class="text-2xl font-bold">Лабораторна робота №28 — Алгоритм Беллмана–Форда</h1></header>
        <section class="prose dark:prose-invert max-w-none">
          <h2>Теоретичний блок</h2>
          <p><strong>Беллман–Форд</strong> знаходить найкоротші шляхи у зваженому орієнтованому графі, допускаючи від’ємні ваги. Виконує до |V|−1 ітерацій релаксації всіх ребер.</p>
          <p>Додаткова перевірка виявляє <strong>від’ємний цикл</strong>. На відміну від Дейкстри (лаб. 27), працює з від’ємними вагами, але повільніший: O(VE).</p>
        </section>
        <section class="space-y-4">
          <h2 class="text-xl font-semibold">Ребра (u v w), орієнтований граф</h2>
          <textarea id="edges-input" rows="10" class="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 font-mono text-sm">${EXAMPLE_EDGES}</textarea>
          <div class="flex flex-wrap gap-2 items-center">
            <label class="text-sm">Старт:</label>
            <input id="start-v" type="number" min="0" value="0" class="w-20 px-2 py-1 rounded border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900">
            <label class="text-sm">Ціль:</label>
            <input id="target-v" type="number" min="0" value="4" class="w-20 px-2 py-1 rounded border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900">
            <button id="btn-apply" class="btn-animated px-4 py-2 rounded-lg bg-purple-600 text-white">Застосувати</button>
            <button id="btn-random" class="btn-animated px-4 py-2 rounded-lg bg-indigo-600 text-white">Випадковий (n=7)</button>
            <button id="btn-neg-cycle" class="btn-animated px-4 py-2 rounded-lg bg-rose-600 text-white">+ від’ємний цикл</button>
            <button id="btn-compare" class="btn-animated px-4 py-2 rounded-lg bg-emerald-600 text-white">Порівняти з Дейкстрою</button>
          </div>
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
          <div class="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800"><div class="text-xs text-zinc-500">Відстані від старту</div><div id="t-dist" class="font-mono text-sm">—</div></div>
          <div class="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800"><div class="text-xs text-zinc-500">Шлях / статус</div><div id="t-status" class="font-mono text-sm">—</div></div>
        </section>
        <pre id="menu-log" class="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-3 text-xs overflow-auto max-h-48"></pre>
      </div>
    `;

    const errorEl = document.getElementById('error-msg');
    const menuLog = document.getElementById('menu-log');
    const pushLog = (l) => { logLines.push(`[${new Date().toLocaleTimeString()}] ${l}`); menuLog.textContent = logLines.slice(-80).join('\n'); };

    function hasEdge(i, j) {
      return graph.edges.some((e) => e.from === i && e.to === j);
    }

    function edgeWeight(i, j) {
      const e = graph.edges.find((x) => x.from === i && x.to === j);
      return e ? e.weight : '';
    }

    function recompute() {
      trace = bellmanFord(graph.n, graph.edges, start);
      playback.setStep(0);
      playback.render();
    }

    function renderStep(i) {
      const s = trace.steps[i] || trace.steps.at(-1);
      const dist = s?.dist || trace.dist;
      const parent = s?.parent || trace.parent;
      const path = (!trace.negativeCycle && dist[target] !== INF)
        ? reconstructPath(parent, target) : [];
      const pathEdges = [];
      for (let k = 1; k < path.length; k++) pathEdges.push({ from: path[k - 1], to: path[k] });

      renderGraphSvg(document.getElementById('graph-viz'), {
        n: graph.n,
        directed: true,
        hasEdge,
        edgeLabel: edgeWeight,
        pathEdges,
        highlightNodes: [start, target],
        activeEdge: s?.edge ? { from: s.edge.from, to: s.edge.to } : null,
        nodeSubLabels: dist.map((d) => formatDist(d)),
      });

      document.getElementById('t-dist').textContent = dist.map((d, idx) => `${idx + 1}:${formatDist(d)}`).join('  ');
      if (trace.negativeCycle) {
        document.getElementById('t-status').textContent = 'Виявлено від’ємний цикл!';
      } else if (dist[target] === INF) {
        document.getElementById('t-status').textContent = `Ціль ${target + 1} недосяжна`;
      } else {
        document.getElementById('t-status').textContent = `${path.map((v) => v + 1).join(' → ')} (вага ${dist[target]})`;
      }
    }

    const playback = wireStepPlayback({
      getMaxStep: () => Math.max(0, trace.steps.length - 1),
      onStep: renderStep,
      onRun: () => pushLog(trace.negativeCycle ? 'Від’ємний цикл' : `dist до ${target + 1}: ${formatDist(trace.dist[target])}`),
      btnStep: document.getElementById('btn-step'),
      btnAuto: document.getElementById('btn-auto'),
      btnRun: document.getElementById('btn-run'),
      btnReset: document.getElementById('btn-reset'),
    });

    document.getElementById('btn-apply').addEventListener('click', () => {
      try {
        graph = parseWeightedEdgesText(document.getElementById('edges-input').value);
        start = Number(document.getElementById('start-v').value) || 0;
        target = Number(document.getElementById('target-v').value) || 0;
        errorEl.classList.add('hidden');
        recompute();
        pushLog(`n=${graph.n}, m=${graph.edges.length}`);
      } catch (e) { errorEl.textContent = e.message; errorEl.classList.remove('hidden'); }
    });

    document.getElementById('btn-random').addEventListener('click', () => {
      playback.stopAuto();
      const text = randomDirectedWeightedEdges(7, 1, 45, false);
      document.getElementById('edges-input').value = text;
      graph = parseWeightedEdgesText(text);
      start = 0;
      target = graph.n - 1;
      document.getElementById('start-v').value = String(start);
      document.getElementById('target-v').value = String(target);
      errorEl.classList.add('hidden');
      recompute();
      pushLog(`Випадковий орієнтований граф n=${graph.n}`);
    });

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
        lines.push(`${i + 1}: BF=${formatDist(a)} D=${formatDist(b)} ${same ? '✓' : '≠'}`);
      }
      pushLog('Порівняння:\n' + lines.join('\n'));
    });

    recompute();
    pushLog('Демо: орієнтований граф з методички');
  },
};
