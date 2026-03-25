/**
 * @file Lab11Page.js
 * @description Лабораторна №11 — hashMapTable з Insert/SearchKey/Remove і візуалізацією.
 */

import { hashMapTable } from '../../core/algorithms/hashMapTable.js';

export const Lab11Page = {
  mount(container) {
    let table = new hashMapTable(8, 'sum');
    let logLines = ['[menu] 1) Insert  2) SearchKey  3) Remove'];

    container.innerHTML = `
      <div class="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
        <header><h1 class="text-2xl font-bold">Лабораторна робота №11 — HashMapTable</h1></header>
        <section class="prose dark:prose-invert max-w-none">
          <h2>Теоретичний блок</h2>
          <p>Реалізовано клас <code>hashMapTable</code> з методами <code>Insert</code>, <code>SearchKey</code> та <code>Remove</code>. Колізії обробляються методом ланцюжків (separate chaining).</p>
          <p>Для достатнього рівня додано: інтерактивну взаємодію, візуалізацію колізій, статистику заповнення, порівняння хеш-функцій і автоматичне розширення таблиці.</p>
        </section>

        <section class="space-y-4">
          <h2 class="text-xl font-semibold">Текстове меню / керування</h2>
          <div class="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
            <div>
              <label class="block text-sm font-medium mb-1">Команда</label>
              <select id="cmd-select" class="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900">
                <option value="insert">1) Insert</option>
                <option value="search">2) SearchKey</option>
                <option value="remove">3) Remove</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Ключ</label>
              <input id="key-input" class="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900" placeholder="user42">
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Значення</label>
              <input id="value-input" class="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900" placeholder="Artem">
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Хеш-функція</label>
              <select id="hash-select" class="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900">
                <option value="sum">sum(chars)</option>
                <option value="djb2">djb2</option>
                <option value="poly">polynomial</option>
              </select>
            </div>
            <button id="btn-run" class="btn-animated px-4 py-2 rounded-lg bg-purple-600 text-white">Виконати</button>
          </div>
          <div class="flex flex-wrap gap-2">
            <button id="btn-random-fill" class="btn-animated px-4 py-2 rounded-lg bg-zinc-200 dark:bg-zinc-700">Авто-заповнення</button>
            <button id="btn-compare" class="btn-animated px-4 py-2 rounded-lg bg-indigo-600 text-white">Порівняти хеш-функції</button>
            <button id="btn-clear" class="btn-animated px-4 py-2 rounded-lg bg-zinc-500 text-white">Очистити таблицю</button>
          </div>
          <pre id="menu-log" class="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-3 text-xs overflow-auto max-h-48"></pre>
          <p id="error-msg" class="text-red-600 dark:text-red-400 text-sm hidden"></p>
        </section>

        <section>
          <h2 class="text-xl font-semibold mb-3">Візуалізація колізій (bucket-ланцюжки)</h2>
          <div id="buckets-viz" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"></div>
        </section>

        <section>
          <h2 class="text-xl font-semibold mb-2">Аналітика</h2>
          <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            <div class="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800"><div class="text-xs text-zinc-500">size</div><div id="s-size" class="font-mono">0</div></div>
            <div class="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800"><div class="text-xs text-zinc-500">capacity</div><div id="s-capacity" class="font-mono">8</div></div>
            <div class="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800"><div class="text-xs text-zinc-500">load factor</div><div id="s-load" class="font-mono">0.00</div></div>
            <div class="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800"><div class="text-xs text-zinc-500">collisions</div><div id="s-collisions" class="font-mono">0</div></div>
            <div class="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800"><div class="text-xs text-zinc-500">max chain</div><div id="s-chain" class="font-mono">0</div></div>
            <div class="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800"><div class="text-xs text-zinc-500">resizes</div><div id="s-resize" class="font-mono">0</div></div>
            <div class="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800"><div class="text-xs text-zinc-500">hash</div><div id="s-hash" class="font-mono">sum</div></div>
          </div>
          <pre id="compare-log" class="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-3 text-xs overflow-auto mt-3"></pre>
        </section>
      </div>
    `;

    const cmdSelect = document.getElementById('cmd-select');
    const keyInput = document.getElementById('key-input');
    const valueInput = document.getElementById('value-input');
    const hashSelect = document.getElementById('hash-select');
    const menuLog = document.getElementById('menu-log');
    const compareLog = document.getElementById('compare-log');
    const bucketsViz = document.getElementById('buckets-viz');
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

    function renderStats() {
      const s = table.getStats();
      document.getElementById('s-size').textContent = s.size;
      document.getElementById('s-capacity').textContent = s.capacity;
      document.getElementById('s-load').textContent = s.loadFactor.toFixed(2);
      document.getElementById('s-collisions').textContent = s.collisions;
      document.getElementById('s-chain').textContent = s.maxChain;
      document.getElementById('s-resize').textContent = s.resizeCount;
      document.getElementById('s-hash').textContent = s.hashFunctionName;
    }

    function renderBuckets() {
      bucketsViz.innerHTML = table.buckets.map((bucket, idx) => {
        const collisionClass = bucket.length > 1
          ? 'border-red-300 dark:border-red-900/70 bg-red-50/60 dark:bg-red-900/15'
          : 'border-zinc-200 dark:border-zinc-700 bg-white/70 dark:bg-zinc-900/40';
        const content = bucket.length
          ? bucket.map((e) => `<div class="text-xs font-mono truncate">${e.key} → ${e.value}</div>`).join('')
          : '<div class="text-xs text-zinc-400">порожньо</div>';
        return `
          <div class="rounded-lg border p-3 ${collisionClass}">
            <div class="text-xs mb-2 text-zinc-500">bucket[${idx}] (${bucket.length})</div>
            <div class="space-y-1">${content}</div>
          </div>
        `;
      }).join('');
    }

    function refreshAll() {
      renderStats();
      renderBuckets();
      menuLog.textContent = logLines.join('\n');
    }

    hashSelect.addEventListener('change', () => {
      table.setHashFunction(hashSelect.value);
      pushLog(`hash function = ${hashSelect.value}; rehash complete`);
      refreshAll();
    });

    document.getElementById('btn-run').addEventListener('click', () => {
      const cmd = cmdSelect.value;
      const key = keyInput.value.trim();
      const value = valueInput.value.trim();
      if (!key) return showError('Введіть ключ.');
      showError('');

      if (cmd === 'insert') {
        if (!value) return showError('Для Insert введіть значення.');
        const r = table.insert(key, value);
        pushLog(`Insert("${key}", "${value}") -> ${r.action}, bucket=${r.bucketIndex}${r.collision ? ', collision' : ''}`);
      } else if (cmd === 'search') {
        const r = table.searchKey(key);
        pushLog(`SearchKey("${key}") -> ${r.found ? `found "${r.value}"` : 'not found'}, bucket=${r.bucketIndex}, probes=${r.probes}`);
      } else if (cmd === 'remove') {
        const r = table.remove(key);
        pushLog(`Remove("${key}") -> ${r.removed ? 'removed' : 'not found'}, bucket=${r.bucketIndex}`);
      }
      refreshAll();
    });

    document.getElementById('btn-random-fill').addEventListener('click', () => {
      const names = ['anna', 'bob', 'carl', 'dana', 'eva', 'fedor', 'gita', 'hugo', 'ira', 'john', 'kate', 'leo'];
      for (let i = 0; i < 10; i++) {
        const k = `${names[Math.floor(Math.random() * names.length)]}_${Math.floor(Math.random() * 99)}`;
        const v = String(100 + Math.floor(Math.random() * 900));
        table.insert(k, v);
      }
      pushLog('Автозаповнення: додано 10 випадкових пар');
      refreshAll();
    });

    document.getElementById('btn-compare').addEventListener('click', () => {
      const cmp = table.compareHashFunctions();
      compareLog.textContent =
        `sum:   used=${cmp.sum.usedBuckets}, maxChain=${cmp.sum.maxChain}, collisions=${cmp.sum.collisions}\n` +
        `djb2:  used=${cmp.djb2.usedBuckets}, maxChain=${cmp.djb2.maxChain}, collisions=${cmp.djb2.collisions}\n` +
        `poly:  used=${cmp.poly.usedBuckets}, maxChain=${cmp.poly.maxChain}, collisions=${cmp.poly.collisions}`;
      pushLog('Виконано порівняння хеш-функцій');
    });

    document.getElementById('btn-clear').addEventListener('click', () => {
      table = new hashMapTable(8, hashSelect.value);
      logLines = ['[menu] 1) Insert  2) SearchKey  3) Remove', '[system] таблицю очищено'];
      compareLog.textContent = '';
      refreshAll();
    });

    // Початкові демо-дані.
    table.insert('user1', 'Artem');
    table.insert('group', 'IPZ-22');
    table.insert('subject', 'Algorithms');
    refreshAll();
  },
};
