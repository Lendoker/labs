/**
 * @file Lab16Page.js
 * @description Лабораторна №16 — Реалізація черг.
 *   Три варіанти: ArrayQueue (лінійна з front/rear), CircularArrayQueue
 *   (кільцева на масиві), ListQueue (однозв'язний список).
 */

import { ArrayQueue, CircularArrayQueue } from '../../core/algorithms/queueArray.js';
import { ListQueue } from '../../core/algorithms/queueList.js';

const PSEUDOCODE = `Enqueue(v):
  if rear == MAX - 1: overflow
  if front == -1: front = 0
  data[++rear] = v

Dequeue():
  if front == -1: empty
  v = data[front]
  if front == rear: front = rear = -1
  else front++
  return v`;

export const Lab16Page = {
  mount(container) {
    const arrQ = new ArrayQueue(8);
    const circQ = new CircularArrayQueue(8);
    const listQ = new ListQueue();
    let logLines = ['[menu] 1) Enqueue  2) Dequeue  3) Peek  4) Min/Max'];

    container.innerHTML = `
      <div class="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
        <header><h1 class="text-2xl font-bold">Лабораторна робота №16 — Реалізація черг</h1></header>

        <section class="prose dark:prose-invert max-w-none">
          <h2>Теоретичний блок</h2>
          <p>Черга — структура даних з принципом <strong>FIFO</strong> (First-In-First-Out): перший доданий елемент виходить першим.</p>
          <p><strong>Операції:</strong> <code>enqueue</code> (додати у хвіст), <code>dequeue</code> (зняти з початку), <code>peek</code> (перегляд початку), <code>isEmpty</code>.</p>
          <p><strong>Види черг:</strong> лінійна на масиві, кільцева (circular) на масиві (повторно використовує звільнені слоти), на основі однозв'язного списку.</p>
          <pre class="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg text-sm overflow-x-auto"><code>${PSEUDOCODE}</code></pre>
        </section>

        <section class="space-y-4">
          <h2 class="text-xl font-semibold">Керування (спільне для трьох реалізацій)</h2>
          <div class="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
            <div>
              <label class="block text-sm font-medium mb-1">Команда</label>
              <select id="cmd" class="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900">
                <option value="enqueue">1) Enqueue</option>
                <option value="dequeue">2) Dequeue</option>
                <option value="peek">3) Peek</option>
                <option value="minmax">4) Min / Max</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Значення</label>
              <input id="value" type="number" class="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900" placeholder="10">
            </div>
            <button id="btn-run" class="btn-animated px-4 py-2 rounded-lg bg-purple-600 text-white">Виконати</button>
            <button id="btn-random" class="btn-animated px-4 py-2 rounded-lg bg-indigo-600 text-white">+5 випадкових</button>
            <button id="btn-clear" class="btn-animated px-4 py-2 rounded-lg bg-zinc-500 text-white">Очистити все</button>
          </div>
          <pre id="menu-log" class="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-3 text-xs overflow-auto max-h-48"></pre>
          <p id="error-msg" class="text-red-600 dark:text-red-400 text-sm hidden"></p>
        </section>

        <section class="space-y-6">
          <div>
            <h2 class="text-xl font-semibold mb-3">Лінійна черга на масиві <span class="text-xs text-zinc-500">(MAX_SIZE = 8)</span></h2>
            <div id="arr-viz" class="grid grid-cols-8 gap-1"></div>
            <div class="text-xs mt-2 text-zinc-500">front: <span id="arr-front" class="font-mono">-1</span>, rear: <span id="arr-rear" class="font-mono">-1</span></div>
          </div>

          <div>
            <h2 class="text-xl font-semibold mb-3">Кільцева черга на масиві <span class="text-xs text-zinc-500">(MAX_SIZE = 8)</span></h2>
            <div id="circ-viz" class="grid grid-cols-8 gap-1"></div>
            <div class="text-xs mt-2 text-zinc-500">front: <span id="circ-front" class="font-mono">-1</span>, rear: <span id="circ-rear" class="font-mono">-1</span>, count: <span id="circ-count" class="font-mono">0</span></div>
          </div>

          <div>
            <h2 class="text-xl font-semibold mb-3">Черга на базі списку</h2>
            <div id="list-viz" class="flex flex-wrap items-center gap-2 p-4 bg-zinc-100/80 dark:bg-zinc-800/50 rounded-xl border-2 border-dashed border-purple-200 dark:border-purple-900/60 min-h-[80px]"></div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-semibold mb-2">Аналітика</h2>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div class="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800"><div class="text-xs text-zinc-500">length (list)</div><div id="s-len" class="font-mono">0</div></div>
            <div class="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800"><div class="text-xs text-zinc-500">min</div><div id="s-min" class="font-mono">—</div></div>
            <div class="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800"><div class="text-xs text-zinc-500">max</div><div id="s-max" class="font-mono">—</div></div>
            <div class="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800"><div class="text-xs text-zinc-500">peek (list)</div><div id="s-peek" class="font-mono">—</div></div>
          </div>
        </section>
      </div>
    `;

    const cmdEl = document.getElementById('cmd');
    const valueEl = document.getElementById('value');
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

    function renderSlot(slot) {
      let cls = 'border-dashed border-zinc-300 bg-white/40 dark:bg-zinc-900/30';
      let label = '';
      if (slot.role === 'front') { cls = 'border-purple-400 bg-purple-100/80 dark:bg-purple-900/30'; label = '<div class="text-[9px] text-purple-600 dark:text-purple-300">front</div>'; }
      else if (slot.role === 'rear') { cls = 'border-emerald-400 bg-emerald-100/80 dark:bg-emerald-900/30'; label = '<div class="text-[9px] text-emerald-600 dark:text-emerald-300">rear</div>'; }
      else if (slot.role === 'active') { cls = 'border-indigo-300 bg-indigo-50/70 dark:bg-indigo-900/15'; }
      return `
        <div class="rounded-lg border-2 px-2 py-1.5 text-center transition-all duration-300 ${cls}">
          <div class="text-[10px] text-zinc-500">[${slot.index}]</div>
          <div class="font-mono text-sm">${slot.value === null ? '—' : slot.value}</div>
          ${label}
        </div>
      `;
    }

    function renderArray() {
      document.getElementById('arr-viz').innerHTML = arrQ.snapshot().map(renderSlot).join('');
      document.getElementById('arr-front').textContent = arrQ.front;
      document.getElementById('arr-rear').textContent = arrQ.rear;
    }

    function renderCircular() {
      document.getElementById('circ-viz').innerHTML = circQ.snapshot().map(renderSlot).join('');
      document.getElementById('circ-front').textContent = circQ.front;
      document.getElementById('circ-rear').textContent = circQ.rear;
      document.getElementById('circ-count').textContent = circQ.count;
    }

    function renderList() {
      const nodes = listQ.toNodesArray();
      const el = document.getElementById('list-viz');
      if (!nodes.length) {
        el.innerHTML = '<p class="text-zinc-500">Черга порожня.</p>';
      } else {
        el.innerHTML = nodes.map((n, idx) => {
          const isFront = idx === 0;
          const isRear = idx === nodes.length - 1;
          const cls = isFront
            ? 'border-purple-400 bg-purple-100/80 dark:bg-purple-900/30'
            : isRear
              ? 'border-emerald-400 bg-emerald-100/80 dark:bg-emerald-900/30'
              : 'border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900';
          const label = isFront
            ? '<div class="text-[10px] text-purple-600 dark:text-purple-300">front</div>'
            : isRear
              ? '<div class="text-[10px] text-emerald-600 dark:text-emerald-300">rear</div>'
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
      document.getElementById('s-len').textContent = listQ.length;
      document.getElementById('s-min').textContent = listQ.min() ?? '—';
      document.getElementById('s-max').textContent = listQ.max() ?? '—';
      const p = listQ.peek();
      document.getElementById('s-peek').textContent = p.ok ? p.value : '—';
    }

    function refresh() { renderArray(); renderCircular(); renderList(); }

    document.getElementById('btn-run').addEventListener('click', () => {
      const cmd = cmdEl.value;
      const v = Number(valueEl.value);
      if (cmd === 'enqueue' && !Number.isFinite(v)) return showError('Введіть числове значення.');
      showError('');

      if (cmd === 'enqueue') {
        const r1 = arrQ.enqueue(v);
        const r2 = circQ.enqueue(v);
        listQ.enqueue(v);
        pushLog(`Enqueue(${v}) → arr: ${r1.ok ? 'ok' : 'OVERFLOW'}; circ: ${r2.ok ? 'ok' : 'OVERFLOW'}; list: ok`);
      } else if (cmd === 'dequeue') {
        const r1 = arrQ.dequeue();
        const r2 = circQ.dequeue();
        const r3 = listQ.dequeue();
        pushLog(`Dequeue() → arr: ${r1.ok ? r1.value : 'EMPTY'}; circ: ${r2.ok ? r2.value : 'EMPTY'}; list: ${r3.ok ? r3.value : 'EMPTY'}`);
      } else if (cmd === 'peek') {
        const r1 = arrQ.peek();
        const r2 = circQ.peek();
        const r3 = listQ.peek();
        pushLog(`Peek() → arr: ${r1.ok ? r1.value : 'EMPTY'}; circ: ${r2.ok ? r2.value : 'EMPTY'}; list: ${r3.ok ? r3.value : 'EMPTY'}`);
      } else if (cmd === 'minmax') {
        pushLog(`Min/Max (list) → min=${listQ.min() ?? '—'}, max=${listQ.max() ?? '—'}; arr min=${arrQ.min() ?? '—'}, max=${arrQ.max() ?? '—'}`);
      }
      refresh();
    });

    document.getElementById('btn-random').addEventListener('click', () => {
      for (let i = 0; i < 5; i++) {
        const v = Math.floor(Math.random() * 99) + 1;
        arrQ.enqueue(v);
        circQ.enqueue(v);
        listQ.enqueue(v);
      }
      pushLog('Enqueue(+5 випадкових у всі три черги)');
      refresh();
    });

    document.getElementById('btn-clear').addEventListener('click', () => {
      arrQ.clear();
      circQ.clear();
      listQ.clear();
      pushLog('clear() → усі черги очищено');
      refresh();
    });

    // Демо.
    [5, 10, 15, 20].forEach((v) => { arrQ.enqueue(v); circQ.enqueue(v); listQ.enqueue(v); });
    pushLog('Демо: Enqueue(5), Enqueue(10), Enqueue(15), Enqueue(20)');
    refresh();
  },
};
