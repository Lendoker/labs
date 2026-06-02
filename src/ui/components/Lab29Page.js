/**
 * @file Lab29Page.js
 * @description Лабораторна №29 — Флойд–Воршелл (всі пари найкоротших шляхів).
 */

import { parseMatrixText } from '../../core/algorithms/graph.js';
import { floydWarshall, floydPath, formatDist, INF } from '../../core/algorithms/graphAdvanced.js';

const EXAMPLE_MATRIX = `0 9 75 0 0
9 0 95 19 42
75 95 0 51 66
0 19 51 0 31
0 42 66 31 0`;

export const Lab29Page = {
  mount(container) {
    let matrix = parseMatrixText(EXAMPLE_MATRIX);
    let result = floydWarshall(matrix);
    let fromV = 0;
    let toV = 4;
    let logLines = ['[menu] Флойд–Воршелл: матриця відстаней'];

    container.innerHTML = `
      <div class="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
        <header><h1 class="text-2xl font-bold">Лабораторна робота №29 — Алгоритм Флойда–Воршелла</h1></header>
        <section class="prose dark:prose-invert max-w-none">
          <h2>Теоретичний блок</h2>
          <p><strong>Флойд–Воршелл</strong> обчислює найкоротші шляхи між <em>усіма</em> парами вершин за динамічним програмуванням. Для кожної проміжної вершини k оновлюємо: dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j]).</p>
          <p>Складність O(V³). На відміну від повторного запуску Дейкстри, коректно працює з від’ємними вагами (за відсутності від’ємних циклів).</p>
          <p>Якщо після алгоритму dist[i][i] &lt; 0 для деякої i — у графі є від’ємний цикл.</p>
        </section>
        <section class="space-y-4">
          <h2 class="text-xl font-semibold">Матриця ваг</h2>
          <textarea id="matrix-input" rows="6" class="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 font-mono text-sm">${EXAMPLE_MATRIX}</textarea>
          <div class="grid grid-cols-2 gap-3 max-w-md">
            <div><label class="text-sm">Від вершини</label><select id="from-v" class="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900"></select></div>
            <div><label class="text-sm">До вершини</label><select id="to-v" class="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900"></select></div>
          </div>
          <button id="btn-apply" class="btn-animated px-4 py-2 rounded-lg bg-purple-600 text-white">Обчислити</button>
          <p id="error-msg" class="text-red-600 dark:text-red-400 text-sm hidden"></p>
        </section>
        <section class="space-y-2">
          <h2 class="text-xl font-semibold">Матриця відстаней</h2>
          <div id="dist-matrix" class="overflow-x-auto font-mono text-xs"></div>
        </section>
        <div class="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800">
          <div class="text-xs text-zinc-500">Шлях між обраними вершинами</div>
          <div id="t-path" class="font-mono text-sm">—</div>
        </div>
        <div class="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800">
          <div class="text-xs text-zinc-500">Статус</div>
          <div id="t-status" class="font-mono text-sm">—</div>
        </div>
        <pre id="menu-log" class="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-3 text-xs overflow-auto max-h-48"></pre>
      </div>
    `;

    const errorEl = document.getElementById('error-msg');
    const menuLog = document.getElementById('menu-log');
    const pushLog = (l) => { logLines.push(`[${new Date().toLocaleTimeString()}] ${l}`); menuLog.textContent = logLines.slice(-80).join('\n'); };

    function rebuildSelects() {
      for (const id of ['from-v', 'to-v']) {
        const sel = document.getElementById(id);
        sel.innerHTML = '';
        for (let i = 0; i < matrix.length; i++) {
          const o = document.createElement('option');
          o.value = String(i);
          o.textContent = String(i + 1);
          sel.appendChild(o);
        }
      }
      document.getElementById('from-v').value = String(fromV);
      document.getElementById('to-v').value = String(toV);
    }

    function renderMatrix() {
      const dist = result.dist;
      const n = dist.length;
      let html = '<table class="border-collapse"><tr><th class="p-1 border border-zinc-300 dark:border-zinc-600"></th>';
      for (let j = 0; j < n; j++) html += `<th class="p-1 border border-zinc-300 dark:border-zinc-600">${j + 1}</th>`;
      html += '</tr>';
      for (let i = 0; i < n; i++) {
        html += `<tr><th class="p-1 border border-zinc-300 dark:border-zinc-600">${i + 1}</th>`;
        for (let j = 0; j < n; j++) {
          const v = dist[i][j];
          const cls = i === fromV && j === toV ? 'bg-amber-100 dark:bg-amber-900/40' : '';
          html += `<td class="p-1 border border-zinc-300 dark:border-zinc-600 text-center ${cls}">${formatDist(v)}</td>`;
        }
        html += '</tr>';
      }
      html += '</table>';
      document.getElementById('dist-matrix').innerHTML = html;

      const d = dist[fromV][toV];
      const path = d === INF ? [] : floydPath(result.next, fromV, toV);
      document.getElementById('t-path').textContent = d === INF
        ? 'Шлях відсутній'
        : `${path.map((v) => v + 1).join(' → ')} (довжина ${d})`;
      document.getElementById('t-status').textContent = result.negativeCycle
        ? 'Від’ємний цикл у графі'
        : `Обчислено ${n}×${n} відстаней`;
    }

    function recompute() {
      result = floydWarshall(matrix);
      renderMatrix();
    }

    document.getElementById('btn-apply').addEventListener('click', () => {
      try {
        matrix = parseMatrixText(document.getElementById('matrix-input').value);
        fromV = 0;
        toV = Math.min(4, matrix.length - 1);
        errorEl.classList.add('hidden');
        rebuildSelects();
        recompute();
        pushLog(`Флойд–Воршелл для n=${matrix.length}`);
      } catch (e) { errorEl.textContent = e.message; errorEl.classList.remove('hidden'); }
    });

    document.getElementById('from-v').addEventListener('change', (e) => { fromV = Number(e.target.value); renderMatrix(); });
    document.getElementById('to-v').addEventListener('change', (e) => { toV = Number(e.target.value); renderMatrix(); });

    rebuildSelects();
    recompute();
    pushLog('Демо: той самий 5×5 граф');
  },
};
