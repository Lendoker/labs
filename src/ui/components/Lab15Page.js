/**
 * @file Lab15Page.js
 * @description Лабораторна №15 — Реалізація стеків.
 *   Дві реалізації поряд: ArrayStack (MAX_SIZE) та ListStack (на вузлах).
 *   Додатково: isEmpty/isFull, search, sum/average, збереження/завантаження.
 */

import { ArrayStack } from '../../core/algorithms/stackArray.js';
import { ListStack } from '../../core/algorithms/stackList.js';

const PSEUDOCODE = `// Array-based
push(v):  if isFull: error; else data[++top] = v
pop():    if isEmpty: error; else return data[top--]
peek():   return data[top]

// List-based
push(top, v):
  n = new Node(v); n.next = top; return n
pop(top):
  if top == NULL: error
  next = top.next; delete top; return next`;

export const Lab15Page = {
  mount(container) {
    const arrStack = new ArrayStack(8);
    const listStack = new ListStack();
    let logLines = ['[menu] 1) Push  2) Pop  3) Peek  4) Display'];
    let lastSaved = '';

    container.innerHTML = `
      <div class="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
        <header><h1 class="text-2xl font-bold">Лабораторна робота №15 — Реалізація стеків</h1></header>

        <section class="prose dark:prose-invert max-w-none">
          <h2>Теоретичний блок</h2>
          <p>Стек — абстрактна структура даних з принципом <strong>LIFO</strong> (Last-In-First-Out): елемент, доданий останнім, виймається першим.</p>
          <p><strong>Операції:</strong> <code>push</code> (додавання на вершину), <code>pop</code> (зняти з вершини), <code>peek</code> (перегляд вершини), <code>isEmpty</code>, <code>isFull</code>.</p>
          <p><strong>Застосування:</strong> стек викликів функцій, обчислення виразів, undo/redo, обхід графів/дерев.</p>
          <pre class="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg text-sm overflow-x-auto"><code>${PSEUDOCODE}</code></pre>
        </section>

        <section class="space-y-4">
          <h2 class="text-xl font-semibold">Керування</h2>
          <div class="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
            <div>
              <label class="block text-sm font-medium mb-1">Команда</label>
              <select id="cmd" class="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900">
                <option value="push">1) Push</option>
                <option value="pop">2) Pop</option>
                <option value="peek">3) Peek</option>
                <option value="search">4) Search</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Значення</label>
              <input id="value" type="number" class="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900" placeholder="10">
            </div>
            <button id="btn-run" class="btn-animated px-4 py-2 rounded-lg bg-purple-600 text-white">Виконати</button>
            <button id="btn-clear" class="btn-animated px-4 py-2 rounded-lg bg-zinc-500 text-white">Очистити обидва</button>
            <button id="btn-random" class="btn-animated px-4 py-2 rounded-lg bg-indigo-600 text-white">+5 випадкових</button>
          </div>
          <div class="flex flex-wrap gap-2 items-center">
            <button id="btn-save" class="btn-animated px-4 py-2 rounded-lg bg-zinc-200 dark:bg-zinc-700">Зберегти у "файл"</button>
            <button id="btn-load" class="btn-animated px-4 py-2 rounded-lg bg-zinc-200 dark:bg-zinc-700">Завантажити з "файлу"</button>
            <input id="saved-file" class="flex-1 min-w-[200px] px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-sm font-mono" placeholder="зберігається тут...">
          </div>
          <pre id="menu-log" class="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-3 text-xs overflow-auto max-h-48"></pre>
          <p id="error-msg" class="text-red-600 dark:text-red-400 text-sm hidden"></p>
        </section>

        <section class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 class="text-xl font-semibold mb-3">Стек на базі масиву <span class="text-xs text-zinc-500">(MAX_SIZE = 8)</span></h2>
            <div id="arr-viz" class="p-4 bg-zinc-100/80 dark:bg-zinc-800/50 rounded-xl border-2 border-dashed border-indigo-200 dark:border-indigo-900/60 min-h-[260px] flex flex-col-reverse gap-1 items-center"></div>
            <div class="grid grid-cols-3 gap-2 mt-3 text-xs">
              <div class="p-2 rounded bg-zinc-100 dark:bg-zinc-800">top: <span id="arr-top" class="font-mono">-1</span></div>
              <div class="p-2 rounded bg-zinc-100 dark:bg-zinc-800">sum: <span id="arr-sum" class="font-mono">0</span></div>
              <div class="p-2 rounded bg-zinc-100 dark:bg-zinc-800">avg: <span id="arr-avg" class="font-mono">0.00</span></div>
            </div>
          </div>
          <div>
            <h2 class="text-xl font-semibold mb-3">Стек на базі однозв'язного списку</h2>
            <div id="list-viz" class="p-4 bg-zinc-100/80 dark:bg-zinc-800/50 rounded-xl border-2 border-dashed border-purple-200 dark:border-purple-900/60 min-h-[260px] flex flex-col gap-1 items-center"></div>
            <div class="grid grid-cols-3 gap-2 mt-3 text-xs">
              <div class="p-2 rounded bg-zinc-100 dark:bg-zinc-800">length: <span id="list-len" class="font-mono">0</span></div>
              <div class="p-2 rounded bg-zinc-100 dark:bg-zinc-800">sum: <span id="list-sum" class="font-mono">0</span></div>
              <div class="p-2 rounded bg-zinc-100 dark:bg-zinc-800">avg: <span id="list-avg" class="font-mono">0.00</span></div>
            </div>
          </div>
        </section>
      </div>
    `;

    const cmdEl = document.getElementById('cmd');
    const valueEl = document.getElementById('value');
    const menuLog = document.getElementById('menu-log');
    const errorEl = document.getElementById('error-msg');
    const savedFileEl = document.getElementById('saved-file');

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

    function renderArray() {
      const arr = arrStack.toArray();
      const el = document.getElementById('arr-viz');
      const maxSize = arrStack.maxSize;
      const slots = [];
      for (let i = 0; i < maxSize; i++) {
        const v = arr[i];
        const isTop = i === arr.length - 1 && arr.length > 0;
        const filled = i < arr.length;
        const cls = isTop
          ? 'border-emerald-400 bg-emerald-100/80 dark:bg-emerald-900/30'
          : filled
            ? 'border-indigo-300 bg-indigo-50/70 dark:bg-indigo-900/15'
            : 'border-dashed border-zinc-300 bg-white/40 dark:bg-zinc-900/30';
        const label = isTop ? '<span class="text-[9px] text-emerald-600 dark:text-emerald-300 mr-1">← top</span>' : '';
        slots.push(`
          <div class="w-full max-w-[240px] rounded-lg border-2 px-3 py-1.5 flex items-center justify-between text-sm transition-all duration-300 ${cls}">
            <span class="text-[10px] text-zinc-500">[${i}]</span>
            <span class="font-mono">${filled ? v : '—'}</span>
            <span>${label}</span>
          </div>
        `);
      }
      el.innerHTML = slots.join('');
      document.getElementById('arr-top').textContent = arrStack.top;
      document.getElementById('arr-sum').textContent = arrStack.sum();
      document.getElementById('arr-avg').textContent = arrStack.average().toFixed(2);
    }

    function renderList() {
      const nodes = listStack.toNodesArray();
      const el = document.getElementById('list-viz');
      if (!nodes.length) {
        el.innerHTML = '<p class="text-zinc-500">Стек порожній</p>';
      } else {
        el.innerHTML = nodes.map((n, idx) => {
          const isTop = idx === 0;
          const cls = isTop
            ? 'border-emerald-400 bg-emerald-100/80 dark:bg-emerald-900/30'
            : 'border-purple-300 bg-purple-50/70 dark:bg-purple-900/15';
          const label = isTop ? '<span class="text-[9px] text-emerald-600 dark:text-emerald-300 mr-1">top →</span>' : '';
          const arrow = idx < nodes.length - 1 ? '<div class="text-zinc-400 text-xs">↓</div>' : '<div class="text-zinc-400 text-xs">↓ NULL</div>';
          return `
            <div class="w-full max-w-[240px] rounded-lg border-2 px-3 py-1.5 flex items-center justify-between text-sm transition-all duration-300 ${cls}">
              <span>${label}</span>
              <span class="font-mono">${n.data}</span>
            </div>
            ${arrow}
          `;
        }).join('');
      }
      document.getElementById('list-len').textContent = listStack.length;
      document.getElementById('list-sum').textContent = listStack.sum();
      document.getElementById('list-avg').textContent = listStack.average().toFixed(2);
    }

    function refresh() { renderArray(); renderList(); }

    document.getElementById('btn-run').addEventListener('click', () => {
      const cmd = cmdEl.value;
      const v = Number(valueEl.value);
      const needsValue = cmd === 'push' || cmd === 'search';
      if (needsValue && !Number.isFinite(v)) return showError('Введіть числове значення.');
      showError('');

      if (cmd === 'push') {
        const r1 = arrStack.push(v);
        const r2 = listStack.push(v);
        pushLog(`Push(${v}) → array: ${r1.ok ? 'ok' : 'OVERFLOW'}; list: ${r2.ok ? 'ok' : 'err'}`);
      } else if (cmd === 'pop') {
        const r1 = arrStack.pop();
        const r2 = listStack.pop();
        pushLog(`Pop() → array: ${r1.ok ? r1.value : 'EMPTY'}; list: ${r2.ok ? r2.value : 'EMPTY'}`);
      } else if (cmd === 'peek') {
        const r1 = arrStack.peek();
        const r2 = listStack.peek();
        pushLog(`Peek() → array: ${r1.ok ? r1.value : 'EMPTY'}; list: ${r2.ok ? r2.value : 'EMPTY'}`);
      } else if (cmd === 'search') {
        const r1 = arrStack.search(v);
        const r2 = listStack.search(v);
        pushLog(`Search(${v}) → array: ${r1.found ? `fromTop=${r1.fromTop}` : 'not found'}; list: ${r2.found ? `fromTop=${r2.fromTop}` : 'not found'}`);
      }
      refresh();
    });

    document.getElementById('btn-clear').addEventListener('click', () => {
      arrStack.clear();
      listStack.clear();
      pushLog('clear() → обидва стеки очищено');
      refresh();
    });

    document.getElementById('btn-random').addEventListener('click', () => {
      for (let i = 0; i < 5; i++) {
        const v = Math.floor(Math.random() * 99) + 1;
        arrStack.push(v);
        listStack.push(v);
      }
      pushLog('Push(+5 випадкових у обидва стеки)');
      refresh();
    });

    document.getElementById('btn-save').addEventListener('click', () => {
      lastSaved = arrStack.serialize();
      savedFileEl.value = lastSaved;
      pushLog(`saved = "${lastSaved}"`);
    });

    document.getElementById('btn-load').addEventListener('click', () => {
      const text = savedFileEl.value || lastSaved;
      if (!text.trim()) return showError('Немає збережених даних.');
      const n = arrStack.load(text);
      listStack.load(text);
      pushLog(`loaded ${n} елементів з "${text}"`);
      refresh();
    });

    // Демо-дані.
    [3, 7, 12, 5].forEach((v) => { arrStack.push(v); listStack.push(v); });
    pushLog('Демо: push(3), push(7), push(12), push(5)');
    refresh();
  },
};
