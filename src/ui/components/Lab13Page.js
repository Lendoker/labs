/**
 * @file Lab13Page.js
 * @description Лабораторна №13 — Однозв'язний список.
 *   Операції: Insert (head/tail), Display, Remove, Search, Reverse, Count.
 *   Візуалізація: вузли-картки зі стрілками next та підсвіткою активного вузла.
 */

import { SinglyLinkedList } from '../../core/algorithms/singlyLinkedList.js';

const PSEUDOCODE = `struct Node { int data; Node* next; }

Insert(head, value):
  n = new Node(value)
  n.next = head
  return n              // нова голова

Display(head):
  cur = head
  while cur:
    print cur.data
    cur = cur.next

Search(head, value):
  cur = head; pos = 0
  while cur:
    if cur.data == value: return pos
    cur = cur.next; pos++
  return -1`;

export const Lab13Page = {
  mount(container) {
    const list = new SinglyLinkedList();
    let logLines = ['[menu] 1) Insert-head  2) Insert-tail  3) Remove  4) Search  5) Reverse  6) Count'];
    let highlightId = null;

    container.innerHTML = `
      <div class="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
        <header><h1 class="text-2xl font-bold">Лабораторна робота №13 — Однозв'язний список</h1></header>

        <section class="prose dark:prose-invert max-w-none">
          <h2>Теоретичний блок</h2>
          <p>Однозв'язний список — це динамічна структура, у якій кожен вузол містить <code>data</code> та вказівник <code>next</code> на наступний вузол. Останній вузол має <code>next = nullptr</code>.</p>
          <p><strong>Основні операції:</strong> вставка у початок (O(1)) або у кінець (O(n)), видалення за значенням (O(n)), пошук (O(n)), реверсування (O(n)), підрахунок (O(n)).</p>
          <pre class="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg text-sm overflow-x-auto"><code>${PSEUDOCODE}</code></pre>
        </section>

        <section class="space-y-4">
          <h2 class="text-xl font-semibold">Інтерактивний блок</h2>
          <div class="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
            <div>
              <label class="block text-sm font-medium mb-1">Команда</label>
              <select id="cmd-select" class="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900">
                <option value="insert-head">1) Insert у початок</option>
                <option value="insert-tail">2) Insert у кінець</option>
                <option value="remove">3) Remove за значенням</option>
                <option value="search">4) Search</option>
                <option value="reverse">5) Reverse</option>
                <option value="count">6) Count</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Значення</label>
              <input id="value-input" type="number" class="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900" placeholder="10">
            </div>
            <button id="btn-run" class="btn-animated px-4 py-2 rounded-lg bg-purple-600 text-white">Виконати</button>
            <button id="btn-clear" class="btn-animated px-4 py-2 rounded-lg bg-zinc-500 text-white">Очистити список</button>
          </div>
          <div class="flex flex-wrap gap-2">
            <button id="btn-demo" class="btn-animated px-4 py-2 rounded-lg bg-zinc-200 dark:bg-zinc-700">Демо (5, 10, 15)</button>
            <button id="btn-random" class="btn-animated px-4 py-2 rounded-lg bg-indigo-600 text-white">+5 випадкових</button>
          </div>
          <pre id="menu-log" class="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-3 text-xs overflow-auto max-h-48"></pre>
          <p id="error-msg" class="text-red-600 dark:text-red-400 text-sm hidden"></p>
        </section>

        <section>
          <h2 class="text-xl font-semibold mb-3">Візуалізація списку</h2>
          <div id="list-viz" class="flex flex-wrap items-center gap-2 p-4 bg-zinc-100/80 dark:bg-zinc-800/50 rounded-xl border-2 border-dashed border-indigo-200 dark:border-indigo-900/60 min-h-[96px]"></div>
        </section>

        <section>
          <h2 class="text-xl font-semibold mb-2">Аналітика</h2>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div class="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800"><div class="text-xs text-zinc-500">довжина</div><div id="s-length" class="font-mono">0</div></div>
            <div class="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800"><div class="text-xs text-zinc-500">голова</div><div id="s-head" class="font-mono">—</div></div>
            <div class="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800"><div class="text-xs text-zinc-500">останній результат</div><div id="s-last" class="font-mono text-xs">—</div></div>
            <div class="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800"><div class="text-xs text-zinc-500">складність</div><div class="font-mono">O(n)</div></div>
          </div>
        </section>
      </div>
    `;

    const cmdSelect = document.getElementById('cmd-select');
    const valueInput = document.getElementById('value-input');
    const menuLog = document.getElementById('menu-log');
    const viz = document.getElementById('list-viz');
    const errorEl = document.getElementById('error-msg');

    function showError(msg) {
      errorEl.textContent = msg || '';
      errorEl.classList.toggle('hidden', !msg);
    }

    function pushLog(line) {
      const ts = new Date().toLocaleTimeString();
      logLines.push(`[${ts}] ${line}`);
      if (logLines.length > 80) logLines = logLines.slice(-80);
      menuLog.textContent = logLines.join('\n');
      menuLog.scrollTop = menuLog.scrollHeight;
    }

    function renderList(lastMsg = '') {
      const nodes = list.toNodesArray();
      document.getElementById('s-length').textContent = list.count();
      document.getElementById('s-head').textContent = nodes[0] ? nodes[0].data : '—';
      if (lastMsg) document.getElementById('s-last').textContent = lastMsg;

      if (!nodes.length) {
        viz.innerHTML = '<p class="text-zinc-500">Список порожній. Додайте елементи через "Insert".</p>';
        return;
      }
      viz.innerHTML = nodes.map((node, idx) => {
        const isHead = idx === 0;
        const isHi = node.id === highlightId;
        const cls = isHi
          ? 'border-amber-400 bg-amber-100/80 dark:bg-amber-900/30 dark:border-amber-500'
          : isHead
            ? 'border-purple-400 bg-purple-100/80 dark:bg-purple-900/30 dark:border-purple-500'
            : 'border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900';
        const arrow = idx < nodes.length - 1
          ? '<span class="text-zinc-400 text-lg">→</span>'
          : '<span class="text-zinc-400 text-sm">→ NULL</span>';
        const label = isHead ? '<div class="text-[10px] text-purple-600 dark:text-purple-300">head</div>' : '';
        return `
          <div class="flex items-center gap-2">
            <div class="rounded-lg border-2 px-3 py-2 min-w-[56px] text-center transition-all duration-300 ${cls}">
              ${label}
              <div class="font-mono text-sm">${node.data}</div>
            </div>
            ${arrow}
          </div>
        `;
      }).join('');
    }

    document.getElementById('btn-run').addEventListener('click', () => {
      const cmd = cmdSelect.value;
      const rawValue = valueInput.value;
      const needsValue = cmd !== 'reverse' && cmd !== 'count';
      const value = Number(rawValue);
      if (needsValue && !Number.isFinite(value)) return showError('Введіть числове значення.');
      showError('');
      highlightId = null;
      let lastMsg = '';

      if (cmd === 'insert-head') {
        const n = list.insertHead(value);
        highlightId = n.id;
        pushLog(`InsertHead(${value}) → нова голова`);
        lastMsg = `+${value} у початок`;
      } else if (cmd === 'insert-tail') {
        const n = list.insertTail(value);
        highlightId = n.id;
        pushLog(`InsertTail(${value}) → додано в кінець`);
        lastMsg = `+${value} у кінець`;
      } else if (cmd === 'remove') {
        const r = list.remove(value);
        pushLog(r.removed
          ? `Remove(${value}) → видалено на позиції ${r.position}`
          : `Remove(${value}) → не знайдено`);
        lastMsg = r.removed ? `видалено ${value}` : `${value} не знайдено`;
      } else if (cmd === 'search') {
        const r = list.search(value);
        if (r.found) {
          const nodes = list.toNodesArray();
          highlightId = nodes[r.position]?.id;
        }
        pushLog(r.found
          ? `Search(${value}) → позиція ${r.position}, кроків: ${r.steps}`
          : `Search(${value}) → не знайдено (кроків: ${r.steps})`);
        lastMsg = r.found ? `знайдено на pos=${r.position}` : `${value} не знайдено`;
      } else if (cmd === 'reverse') {
        list.reverse();
        pushLog('Reverse() → порядок елементів обернено');
        lastMsg = 'реверс';
      } else if (cmd === 'count') {
        const n = list.count();
        pushLog(`Count() → ${n} елементів`);
        lastMsg = `count=${n}`;
      }
      renderList(lastMsg);
    });

    document.getElementById('btn-clear').addEventListener('click', () => {
      list.clear();
      logLines = ['[system] список очищено'];
      highlightId = null;
      renderList('очищено');
    });

    document.getElementById('btn-demo').addEventListener('click', () => {
      list.clear();
      // У методичці: InsertHead(5), InsertHead(10), InsertHead(15) → послідовність 15,10,5.
      list.insertHead(5);
      list.insertHead(10);
      list.insertHead(15);
      pushLog('Демо: Insert(5), Insert(10), Insert(15) у голову');
      renderList('демо');
    });

    document.getElementById('btn-random').addEventListener('click', () => {
      for (let i = 0; i < 5; i++) list.insertTail(Math.floor(Math.random() * 99) + 1);
      pushLog('+5 випадкових у кінець');
      renderList('+5 випадкових');
    });

    document.getElementById('btn-demo').click();
  },
};
