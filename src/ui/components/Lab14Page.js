/**
 * @file Lab14Page.js
 * @description Лабораторна №14 — Двозв'язні та кільцеві списки.
 *   Дві структури: DoublyLinkedList (prev/next, вивід у прямому і зворотньому
 *   напрямку) та CircularList (однозв'язний з замиканням у кільце).
 */

import { DoublyLinkedList } from '../../core/algorithms/doublyLinkedList.js';
import { CircularList } from '../../core/algorithms/circularList.js';

export const Lab14Page = {
  mount(container) {
    const doubly = new DoublyLinkedList();
    const circular = new CircularList();
    let logLines = ['[menu] вибери структуру та операцію'];
    let highlightDoubly = null;
    let highlightCircular = null;

    container.innerHTML = `
      <div class="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
        <header><h1 class="text-2xl font-bold">Лабораторна робота №14 — Двозв'язні та кільцеві списки</h1></header>

        <section class="prose dark:prose-invert max-w-none">
          <h2>Теоретичний блок</h2>
          <p><strong>Двозв'язний список</strong> — кожен вузол має два вказівники: <code>prev</code> та <code>next</code>. Це дозволяє обхід у обидва боки. Використовується для черг з двома кінцями, історії Undo/Redo тощо.</p>
          <p><strong>Кільцевий список</strong> — останній вузол вказує знову на голову, утворюючи замкнений цикл. Обхід виконується через <code>do...while</code> з поверненням до голови як умовою зупинки.</p>
        </section>

        <section class="space-y-4">
          <h2 class="text-xl font-semibold">Двозв'язний список</h2>
          <div class="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
            <div>
              <label class="block text-sm font-medium mb-1">Команда</label>
              <select id="d-cmd" class="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900">
                <option value="insert-front">InsertFront</option>
                <option value="insert-back" selected>InsertBack</option>
                <option value="delete-first">DeleteFirst</option>
                <option value="delete-last">DeleteLast</option>
                <option value="search">Search</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Значення</label>
              <input id="d-value" type="number" class="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900" placeholder="10">
            </div>
            <button id="d-run" class="btn-animated px-4 py-2 rounded-lg bg-purple-600 text-white">Виконати</button>
            <button id="d-clear" class="btn-animated px-4 py-2 rounded-lg bg-zinc-500 text-white">Очистити</button>
          </div>

          <h3 class="text-sm font-semibold text-zinc-600 dark:text-zinc-300">Прямий напрямок (head → tail)</h3>
          <div id="d-viz-forward" class="flex flex-wrap items-center gap-2 p-4 bg-zinc-100/80 dark:bg-zinc-800/50 rounded-xl border-2 border-dashed border-indigo-200 dark:border-indigo-900/60 min-h-[80px]"></div>

          <h3 class="text-sm font-semibold text-zinc-600 dark:text-zinc-300">Зворотний напрямок (tail → head)</h3>
          <div id="d-viz-reverse" class="flex flex-wrap items-center gap-2 p-4 bg-zinc-100/80 dark:bg-zinc-800/50 rounded-xl border-2 border-dashed border-purple-200 dark:border-purple-900/60 min-h-[80px]"></div>
        </section>

        <section class="space-y-4">
          <h2 class="text-xl font-semibold">Кільцевий (однозв'язний) список</h2>
          <div class="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
            <div>
              <label class="block text-sm font-medium mb-1">Команда</label>
              <select id="c-cmd" class="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900">
                <option value="insert-back" selected>InsertCircularBack</option>
                <option value="remove">Remove за значенням</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Значення</label>
              <input id="c-value" type="number" class="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900" placeholder="3">
            </div>
            <button id="c-run" class="btn-animated px-4 py-2 rounded-lg bg-indigo-600 text-white">Виконати</button>
            <button id="c-clear" class="btn-animated px-4 py-2 rounded-lg bg-zinc-500 text-white">Очистити кільце</button>
          </div>

          <div id="c-viz" class="p-6 bg-zinc-100/80 dark:bg-zinc-800/50 rounded-xl border-2 border-dashed border-emerald-200 dark:border-emerald-900/60 min-h-[120px] flex items-center justify-center"></div>
        </section>

        <section>
          <h2 class="text-xl font-semibold mb-2">Журнал та аналітика</h2>
          <pre id="menu-log" class="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-3 text-xs overflow-auto max-h-48"></pre>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
            <div class="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800"><div class="text-xs text-zinc-500">двозв. довжина</div><div id="s-d-length" class="font-mono">0</div></div>
            <div class="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800"><div class="text-xs text-zinc-500">двозв. голова</div><div id="s-d-head" class="font-mono">—</div></div>
            <div class="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800"><div class="text-xs text-zinc-500">двозв. хвіст</div><div id="s-d-tail" class="font-mono">—</div></div>
            <div class="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800"><div class="text-xs text-zinc-500">кільце довжина</div><div id="s-c-length" class="font-mono">0</div></div>
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

    function renderDoubly() {
      const fwd = doubly.toForwardArray();
      const rev = doubly.toReverseArray();
      const forwardEl = document.getElementById('d-viz-forward');
      const reverseEl = document.getElementById('d-viz-reverse');

      const renderNodes = (nodes, directionLabel) => {
        if (!nodes.length) return '<p class="text-zinc-500">Список порожній.</p>';
        return nodes.map((node, idx) => {
          const isHi = node.id === highlightDoubly;
          const isFirst = idx === 0;
          const isLast = idx === nodes.length - 1;
          const baseColor = isFirst
            ? 'border-purple-400 bg-purple-100/80 dark:bg-purple-900/30'
            : isLast
              ? 'border-emerald-400 bg-emerald-100/80 dark:bg-emerald-900/30'
              : 'border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900';
          const cls = isHi ? 'border-amber-400 bg-amber-100/80 dark:bg-amber-900/30' : baseColor;
          const prevArrow = !isFirst ? '<span class="text-zinc-400 text-lg">⇄</span>' : '';
          const label = isFirst
            ? `<div class="text-[10px] text-purple-600 dark:text-purple-300">${directionLabel === 'forward' ? 'head' : 'tail'}</div>`
            : isLast
              ? `<div class="text-[10px] text-emerald-600 dark:text-emerald-300">${directionLabel === 'forward' ? 'tail' : 'head'}</div>`
              : '';
          return `
            ${prevArrow}
            <div class="rounded-lg border-2 px-3 py-2 min-w-[56px] text-center transition-all duration-300 ${cls}">
              ${label}
              <div class="font-mono text-sm">${node.data}</div>
            </div>
          `;
        }).join('');
      };

      forwardEl.innerHTML = renderNodes(fwd, 'forward');
      reverseEl.innerHTML = renderNodes(rev, 'reverse');

      document.getElementById('s-d-length').textContent = doubly.length;
      document.getElementById('s-d-head').textContent = fwd[0]?.data ?? '—';
      document.getElementById('s-d-tail').textContent = fwd[fwd.length - 1]?.data ?? '—';
    }

    function renderCircular() {
      const nodes = circular.toArray();
      const el = document.getElementById('c-viz');
      document.getElementById('s-c-length').textContent = circular.length;
      if (!nodes.length) {
        el.innerHTML = '<p class="text-zinc-500">Кільце порожнє.</p>';
        return;
      }
      // Візуалізація по колу: розміщуємо вузли на еліпсі.
      const n = nodes.length;
      const radiusX = 140;
      const radiusY = 70;
      const items = nodes.map((node, idx) => {
        const angle = (idx / n) * 2 * Math.PI - Math.PI / 2;
        const x = Math.cos(angle) * radiusX;
        const y = Math.sin(angle) * radiusY;
        const isHead = idx === 0;
        const isHi = node.id === highlightCircular;
        const cls = isHi
          ? 'border-amber-400 bg-amber-100/80 dark:bg-amber-900/30'
          : isHead
            ? 'border-purple-400 bg-purple-100/80 dark:bg-purple-900/30'
            : 'border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900';
        const label = isHead ? '<div class="text-[10px] text-purple-600 dark:text-purple-300">head</div>' : '';
        return `
          <div class="absolute rounded-lg border-2 px-3 py-2 min-w-[48px] text-center transition-all duration-300 ${cls}"
               style="left: calc(50% + ${x}px); top: calc(50% + ${y}px); transform: translate(-50%, -50%);">
            ${label}
            <div class="font-mono text-sm">${node.data}</div>
          </div>
        `;
      }).join('');
      el.innerHTML = `
        <div class="relative w-full h-52">
          <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[140px] rounded-full border border-dashed border-emerald-400/60"></div>
          ${items}
        </div>
      `;
    }

    function refresh() {
      renderDoubly();
      renderCircular();
    }

    document.getElementById('d-run').addEventListener('click', () => {
      const cmd = document.getElementById('d-cmd').value;
      const raw = document.getElementById('d-value').value;
      const value = Number(raw);
      const needsValue = cmd === 'insert-front' || cmd === 'insert-back' || cmd === 'search';
      if (needsValue && !Number.isFinite(value)) return showError('Введіть числове значення.');
      showError('');
      highlightDoubly = null;

      if (cmd === 'insert-front') {
        const n = doubly.insertFront(value);
        highlightDoubly = n.id;
        pushLog(`[DLL] InsertFront(${value})`);
      } else if (cmd === 'insert-back') {
        const n = doubly.insertBack(value);
        highlightDoubly = n.id;
        pushLog(`[DLL] InsertBack(${value})`);
      } else if (cmd === 'delete-first') {
        const r = doubly.deleteFirst();
        pushLog(r.removed ? `[DLL] DeleteFirst() → видалено ${r.value}` : '[DLL] DeleteFirst() → список порожній');
      } else if (cmd === 'delete-last') {
        const r = doubly.deleteLast();
        pushLog(r.removed ? `[DLL] DeleteLast() → видалено ${r.value}` : '[DLL] DeleteLast() → список порожній');
      } else if (cmd === 'search') {
        const r = doubly.search(value);
        if (r.found) highlightDoubly = doubly.toForwardArray()[r.position]?.id;
        pushLog(r.found ? `[DLL] Search(${value}) → pos=${r.position}, steps=${r.steps}` : `[DLL] Search(${value}) → не знайдено`);
      }
      refresh();
    });

    document.getElementById('d-clear').addEventListener('click', () => {
      doubly.clear();
      highlightDoubly = null;
      pushLog('[DLL] clear');
      refresh();
    });

    document.getElementById('c-run').addEventListener('click', () => {
      const cmd = document.getElementById('c-cmd').value;
      const value = Number(document.getElementById('c-value').value);
      if (!Number.isFinite(value)) return showError('Введіть числове значення.');
      showError('');
      highlightCircular = null;
      if (cmd === 'insert-back') {
        const n = circular.insertBack(value);
        highlightCircular = n.id;
        pushLog(`[CLL] InsertCircularBack(${value})`);
      } else if (cmd === 'remove') {
        const r = circular.remove(value);
        pushLog(r.removed ? `[CLL] Remove(${value}) → pos=${r.position}` : `[CLL] Remove(${value}) → не знайдено`);
      }
      refresh();
    });

    document.getElementById('c-clear').addEventListener('click', () => {
      circular.clear();
      highlightCircular = null;
      pushLog('[CLL] DeleteCircularList()');
      refresh();
    });

    // Початкові дані за прикладом з методички.
    [1, 2, 3, 4, 5].forEach((v) => doubly.insertBack(v));
    [10, 20, 30, 40].forEach((v) => circular.insertBack(v));
    pushLog('Демо-ініціалізація DLL=[1..5], CLL=[10,20,30,40]');
    refresh();
  },
};
