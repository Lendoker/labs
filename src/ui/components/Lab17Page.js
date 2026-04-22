/**
 * @file Lab17Page.js
 * @description Лабораторна №17 — Черга з пріоритетами та дек (двобічна черга).
 *   PriorityQueue: список впорядкований за спаданням пріоритету, pop знімає з голови.
 *   Deque: операції push/pop з обох кінців на однозв'язному списку.
 */

import { PriorityQueue } from '../../core/algorithms/priorityQueue.js';
import { Deque } from '../../core/algorithms/deque.js';

export const Lab17Page = {
  mount(container) {
    const pq = new PriorityQueue();
    const dq = new Deque();
    let logLines = ['[menu] Пріоритетна черга та Дек'];
    let highlightPqId = null;
    let highlightDqId = null;

    container.innerHTML = `
      <div class="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
        <header><h1 class="text-2xl font-bold">Лабораторна робота №17 — Черга з пріоритетами та дек</h1></header>

        <section class="prose dark:prose-invert max-w-none">
          <h2>Теоретичний блок</h2>
          <p><strong>Пріоритетна черга</strong> — модифікація звичайної черги, де порядок вилучення визначається значенням пріоритету, а не моментом додавання. Елемент з більшим пріоритетом вилучається першим.</p>
          <p><strong>Дек (двобічна черга)</strong> — структура, у якій операції додавання та вилучення дозволені з обох кінців (pushFront, pushBack, popFront, popBack).</p>
          <p>Обидві структури тут реалізовані на базі однозв'язного списку.</p>
        </section>

        <section class="space-y-4">
          <h2 class="text-xl font-semibold">Пріоритетна черга</h2>
          <div class="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
            <div>
              <label class="block text-sm font-medium mb-1">Команда</label>
              <select id="pq-cmd" class="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900">
                <option value="push">pushPriority</option>
                <option value="pop">popPriority</option>
                <option value="top">top (перегляд)</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Значення</label>
              <input id="pq-value" type="number" class="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900" placeholder="10">
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Пріоритет</label>
              <input id="pq-priority" type="number" class="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900" placeholder="5">
            </div>
            <button id="pq-run" class="btn-animated px-4 py-2 rounded-lg bg-purple-600 text-white">Виконати</button>
            <button id="pq-clear" class="btn-animated px-4 py-2 rounded-lg bg-zinc-500 text-white">Очистити</button>
          </div>
          <div id="pq-viz" class="flex flex-wrap items-center gap-2 p-4 bg-zinc-100/80 dark:bg-zinc-800/50 rounded-xl border-2 border-dashed border-purple-200 dark:border-purple-900/60 min-h-[100px]"></div>
        </section>

        <section class="space-y-4">
          <h2 class="text-xl font-semibold">Дек (двобічна черга)</h2>
          <div class="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
            <div>
              <label class="block text-sm font-medium mb-1">Команда</label>
              <select id="dq-cmd" class="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900">
                <option value="push-front">pushFront</option>
                <option value="push-back">pushBack</option>
                <option value="pop-front">popFront</option>
                <option value="pop-back">popBack</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Значення</label>
              <input id="dq-value" type="number" class="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900" placeholder="10">
            </div>
            <button id="dq-run" class="btn-animated px-4 py-2 rounded-lg bg-indigo-600 text-white">Виконати</button>
            <button id="dq-clear" class="btn-animated px-4 py-2 rounded-lg bg-zinc-500 text-white">Очистити</button>
          </div>
          <div id="dq-viz" class="flex flex-wrap items-center gap-2 p-4 bg-zinc-100/80 dark:bg-zinc-800/50 rounded-xl border-2 border-dashed border-emerald-200 dark:border-emerald-900/60 min-h-[100px]"></div>
        </section>

        <section>
          <h2 class="text-xl font-semibold mb-2">Журнал та аналітика</h2>
          <pre id="menu-log" class="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-3 text-xs overflow-auto max-h-48"></pre>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
            <div class="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800"><div class="text-xs text-zinc-500">PQ length</div><div id="s-pq-len" class="font-mono">0</div></div>
            <div class="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800"><div class="text-xs text-zinc-500">PQ найвищий пріоритет</div><div id="s-pq-top" class="font-mono">—</div></div>
            <div class="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800"><div class="text-xs text-zinc-500">Deque length</div><div id="s-dq-len" class="font-mono">0</div></div>
            <div class="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800"><div class="text-xs text-zinc-500">Deque front/back</div><div id="s-dq-ends" class="font-mono">—</div></div>
          </div>
          <p id="error-msg" class="text-red-600 dark:text-red-400 text-sm hidden mt-2"></p>
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

    function renderPQ() {
      const nodes = pq.toNodesArray();
      const el = document.getElementById('pq-viz');
      if (!nodes.length) {
        el.innerHTML = '<p class="text-zinc-500">Пріоритетна черга порожня.</p>';
      } else {
        el.innerHTML = nodes.map((n, idx) => {
          const isHead = idx === 0;
          const isHi = n.id === highlightPqId;
          const cls = isHi
            ? 'border-amber-400 bg-amber-100/80 dark:bg-amber-900/30'
            : isHead
              ? 'border-purple-400 bg-purple-100/80 dark:bg-purple-900/30'
              : 'border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900';
          const label = isHead ? '<div class="text-[10px] text-purple-600 dark:text-purple-300">head (найвищ. p)</div>' : '';
          const arrow = idx < nodes.length - 1 ? '<span class="text-zinc-400 text-lg">→</span>' : '<span class="text-zinc-400 text-xs">→ NULL</span>';
          return `
            <div class="rounded-lg border-2 px-3 py-2 text-center transition-all duration-300 ${cls}">
              ${label}
              <div class="font-mono text-sm">${n.data}</div>
              <div class="text-[10px] text-zinc-500">p=${n.priority}</div>
            </div>
            ${arrow}
          `;
        }).join('');
      }
      document.getElementById('s-pq-len').textContent = pq.length;
      const t = pq.top();
      document.getElementById('s-pq-top').textContent = t.ok ? `${t.value} (p=${t.priority})` : '—';
    }

    function renderDeque() {
      const nodes = dq.toNodesArray();
      const el = document.getElementById('dq-viz');
      if (!nodes.length) {
        el.innerHTML = '<p class="text-zinc-500">Дек порожній.</p>';
      } else {
        el.innerHTML = nodes.map((n, idx) => {
          const isFront = idx === 0;
          const isBack = idx === nodes.length - 1;
          const isHi = n.id === highlightDqId;
          const cls = isHi
            ? 'border-amber-400 bg-amber-100/80 dark:bg-amber-900/30'
            : isFront
              ? 'border-purple-400 bg-purple-100/80 dark:bg-purple-900/30'
              : isBack
                ? 'border-emerald-400 bg-emerald-100/80 dark:bg-emerald-900/30'
                : 'border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900';
          const label = isFront
            ? '<div class="text-[10px] text-purple-600 dark:text-purple-300">front</div>'
            : isBack
              ? '<div class="text-[10px] text-emerald-600 dark:text-emerald-300">back</div>'
              : '';
          const arrow = idx < nodes.length - 1 ? '<span class="text-zinc-400 text-lg">→</span>' : '';
          return `
            <div class="rounded-lg border-2 px-3 py-2 min-w-[56px] text-center transition-all duration-300 ${cls}">
              ${label}
              <div class="font-mono text-sm">${n.data}</div>
            </div>
            ${arrow}
          `;
        }).join('');
      }
      document.getElementById('s-dq-len').textContent = dq.length;
      const f = dq.peekFront();
      const b = dq.peekBack();
      document.getElementById('s-dq-ends').textContent = f.ok ? `${f.value} / ${b.value}` : '—';
    }

    function refresh() { renderPQ(); renderDeque(); }

    document.getElementById('pq-run').addEventListener('click', () => {
      const cmd = document.getElementById('pq-cmd').value;
      const v = Number(document.getElementById('pq-value').value);
      const p = Number(document.getElementById('pq-priority').value);
      showError('');
      highlightPqId = null;

      if (cmd === 'push') {
        if (!Number.isFinite(v) || !Number.isFinite(p)) return showError('Введіть значення та пріоритет.');
        const n = pq.push(v, p);
        highlightPqId = n.id;
        pushLog(`pushPriority(${v}, p=${p})`);
      } else if (cmd === 'pop') {
        const r = pq.pop();
        pushLog(r.ok ? `popPriority() → вилучено ${r.value} (p=${r.priority})` : 'popPriority() → черга порожня');
      } else if (cmd === 'top') {
        const r = pq.top();
        pushLog(r.ok ? `top() → ${r.value} (p=${r.priority})` : 'top() → черга порожня');
        if (r.ok) highlightPqId = pq.head.id;
      }
      refresh();
    });

    document.getElementById('pq-clear').addEventListener('click', () => {
      pq.clear();
      highlightPqId = null;
      pushLog('[PQ] clear');
      refresh();
    });

    document.getElementById('dq-run').addEventListener('click', () => {
      const cmd = document.getElementById('dq-cmd').value;
      const v = Number(document.getElementById('dq-value').value);
      showError('');
      highlightDqId = null;

      if (cmd === 'push-front') {
        if (!Number.isFinite(v)) return showError('Введіть числове значення.');
        const n = dq.pushFront(v);
        highlightDqId = n.id;
        pushLog(`pushFront(${v})`);
      } else if (cmd === 'push-back') {
        if (!Number.isFinite(v)) return showError('Введіть числове значення.');
        const n = dq.pushBack(v);
        highlightDqId = n.id;
        pushLog(`pushBack(${v})`);
      } else if (cmd === 'pop-front') {
        const r = dq.popFront();
        pushLog(r.ok ? `popFront() → ${r.value}` : 'popFront() → дек порожній');
      } else if (cmd === 'pop-back') {
        const r = dq.popBack();
        pushLog(r.ok ? `popBack() → ${r.value}` : 'popBack() → дек порожній');
      }
      refresh();
    });

    document.getElementById('dq-clear').addEventListener('click', () => {
      dq.clear();
      highlightDqId = null;
      pushLog('[Deque] clear');
      refresh();
    });

    // Демо за прикладом з методички.
    pq.push(10, 2);
    pq.push(5, 5);
    pq.push(7, 3);
    dq.pushFront(10);
    dq.pushBack(20);
    dq.pushFront(5);
    pushLog('Демо: PQ.push(10,p=2), push(5,p=5), push(7,p=3); Deque pushFront(10), pushBack(20), pushFront(5)');
    refresh();
  },
};
