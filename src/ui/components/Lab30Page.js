/**
 * @file Lab30Page.js
 * @description Лабораторна №30 — A* (евристичний пошук шляху).
 */

import {
  parseWeightedEdgesText,
  aStar,
  reconstructPath,
} from '../../core/algorithms/graphAdvanced.js';
import { renderGraphSvg } from './graphViz.js';

const EXAMPLE_EDGES = `0 1 9
0 2 75
1 3 19
1 4 42
2 3 51
3 4 31`;

const DEFAULT_H = '4 3 2 1 0';

export const Lab30Page = {
  mount(container) {
    let graph = parseWeightedEdgesText(EXAMPLE_EDGES);
    let adj = buildAdj(graph);
    let h = [4, 3, 2, 1, 0];
    let start = 0;
    let goal = 4;
    let trace = aStar(adj, h, start, goal);
    let logLines = ['[menu] A*: граф, евристика h, старт і ціль'];

    function buildAdj(g) {
      const list = Array.from({ length: g.n }, () => []);
      for (const e of g.edges) list[e.from].push({ to: e.to, weight: e.weight });
      return list;
    }

    container.innerHTML = `
      <div class="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
        <header><h1 class="text-2xl font-bold">Лабораторна робота №30 — Алгоритм A*</h1></header>
        <section class="prose dark:prose-invert max-w-none">
          <h2>Теоретичний блок</h2>
          <p><strong>A*</strong> шукає найкоротший шлях між двома вершинами, використовуючи оцінку <code>f(v) = g(v) + h(v)</code>, де g — вартість шляху від старту, h — евристика до цілі.</p>
          <p>Якщо h не переоцінює реальну відстань (admissible), A* знаходить оптимальний шлях. При h(v)=0 для всіх v алгоритм еквівалентний Дейкстрі.</p>
          <p>Застосовується в навігації, іграх, плануванні руху роботів.</p>
        </section>
        <section class="space-y-4">
          <h2 class="text-xl font-semibold">Ребра (u v w)</h2>
          <textarea id="edges-input" rows="8" class="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 font-mono text-sm">${EXAMPLE_EDGES}</textarea>
          <div>
            <label class="text-sm block mb-1">Евристика h для вершин (через пробіл)</label>
            <input id="h-input" type="text" value="${DEFAULT_H}" class="w-full max-w-md px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 font-mono text-sm">
          </div>
          <div class="flex flex-wrap gap-3 items-end">
            <div><label class="text-sm">Старт</label><input id="start-v" type="number" min="0" value="0" class="w-16 px-2 py-1 rounded border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 block"></div>
            <div><label class="text-sm">Ціль</label><input id="goal-v" type="number" min="0" value="4" class="w-16 px-2 py-1 rounded border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 block"></div>
            <button id="btn-apply" class="btn-animated px-4 py-2 rounded-lg bg-purple-600 text-white">Застосувати</button>
            <button id="btn-h-zero" class="btn-animated px-4 py-2 rounded-lg bg-indigo-600 text-white">h = 0 (як Дейкстра)</button>
            <button id="btn-compare" class="btn-animated px-4 py-2 rounded-lg bg-emerald-600 text-white">Порівняти h=0 та h≠0</button>
          </div>
          <p id="error-msg" class="text-red-600 dark:text-red-400 text-sm hidden"></p>
        </section>
        <section><div id="graph-viz" class="overflow-x-auto p-3 bg-zinc-100/80 dark:bg-zinc-800/50 rounded-xl border-2 border-dashed border-purple-200"></div></section>
        <section class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div class="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800"><div class="text-xs text-zinc-500">Шлях</div><div id="t-path" class="font-mono text-sm">—</div></div>
          <div class="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800"><div class="text-xs text-zinc-500">Вартість</div><div id="t-cost" class="font-mono text-lg">—</div></div>
          <div class="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800"><div class="text-xs text-zinc-500">Розгорнуто вершин</div><div id="t-exp" class="font-mono text-lg">—</div></div>
        </section>
        <pre id="menu-log" class="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-3 text-xs overflow-auto max-h-48"></pre>
      </div>
    `;

    const errorEl = document.getElementById('error-msg');
    const menuLog = document.getElementById('menu-log');
    const pushLog = (l) => { logLines.push(`[${new Date().toLocaleTimeString()}] ${l}`); menuLog.textContent = logLines.slice(-80).join('\n'); };

    function parseH(text, n) {
      const vals = String(text).trim().split(/[\s,;]+/).map(Number);
      if (vals.length < n || vals.some((x) => Number.isNaN(x))) {
        throw new Error(`Потрібно ${n} евристичних значень.`);
      }
      return vals.slice(0, n);
    }

    function renderViz() {
      const path = trace.found ? reconstructPath(trace.parent, goal) : [];
      const pathEdges = [];
      for (let i = 1; i < path.length; i++) pathEdges.push({ from: path[i - 1], to: path[i] });
      renderGraphSvg(document.getElementById('graph-viz'), {
        n: graph.n,
        directed: true,
        hasEdge: (i, j) => adj[i]?.some((e) => e.to === j),
        edgeLabel: (i, j) => {
          const e = adj[i]?.find((x) => x.to === j);
          return e ? e.weight : '';
        },
        pathEdges,
        highlightNodes: [start, goal, ...path],
      });
      document.getElementById('t-path').textContent = trace.found
        ? path.map((v) => v + 1).join(' → ')
        : 'Шлях не знайдено';
      document.getElementById('t-cost').textContent = trace.found ? trace.pathCost : '—';
      document.getElementById('t-exp').textContent = trace.expanded ?? '—';
    }

    function recompute() {
      trace = aStar(adj, h, start, goal);
      renderViz();
    }

    document.getElementById('btn-apply').addEventListener('click', () => {
      try {
        graph = parseWeightedEdgesText(document.getElementById('edges-input').value);
        adj = buildAdj(graph);
        h = parseH(document.getElementById('h-input').value, graph.n);
        start = Number(document.getElementById('start-v').value) || 0;
        goal = Number(document.getElementById('goal-v').value) || 0;
        errorEl.classList.add('hidden');
        recompute();
        pushLog(`A* ${start + 1}→${goal + 1}, expanded=${trace.expanded}`);
      } catch (e) { errorEl.textContent = e.message; errorEl.classList.remove('hidden'); }
    });

    document.getElementById('btn-h-zero').addEventListener('click', () => {
      document.getElementById('h-input').value = new Array(graph.n).fill(0).join(' ');
      h = new Array(graph.n).fill(0);
      recompute();
      pushLog('h(v)=0 для всіх v — поведінка як у Дейкстри');
    });

    document.getElementById('btn-compare').addEventListener('click', () => {
      const h0 = new Array(graph.n).fill(0);
      const r0 = aStar(adj, h0, start, goal);
      const r1 = aStar(adj, h, start, goal);
      pushLog(`h=0: expanded=${r0.expanded}, cost=${r0.found ? r0.pathCost : '—'}`);
      pushLog(`h≠0: expanded=${r1.expanded}, cost=${r1.found ? r1.pathCost : '—'}`);
      if (r0.found && r1.found && r0.pathCost !== r1.pathCost) pushLog('Увага: різна вартість — перевірте admissible евристику');
    });

    adj = buildAdj(graph);
    recompute();
    pushLog('Демо: орієнтований граф, евристика до цілі');
  },
};
