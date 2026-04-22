/**
 * @file Lab12Page.js
 * @description Лабораторна №12 — Вирішення колізій у хеш-таблицях.
 *   Два методи: відкрита адресація (квадратичне пробування) та ланцюжки.
 *   Хеш-функція: мультиплікативна з константою A = 0.618033.
 */

import { CollisionHashTable } from '../../core/algorithms/hashCollisions.js';

const PSEUDOCODE = `hashFunction(key):
  A = 0.618033
  x = key * A
  frac = x - floor(x)
  return floor(SIZE * frac)

insertOpen(key):
  h = hashFunction(key)
  for attempt in 0..SIZE-1:
    index = (h + attempt^2) % SIZE
    if not used[index]:
      table[index] = key; used[index] = true; break

insertChain(key):
  index = hashFunction(key)
  chain[index].push_back(key)`;

export const Lab12Page = {
  mount(container) {
    let table = new CollisionHashTable(11);
    let logLines = ['[menu] 1) Insert  2) Search  3) Clear'];

    container.innerHTML = `
      <div class="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
        <header><h1 class="text-2xl font-bold">Лабораторна робота №12 — Вирішення колізій у хеш-таблицях</h1></header>

        <section class="prose dark:prose-invert max-w-none">
          <h2>Теоретичний блок</h2>
          <p>Колізії виникають, коли різні ключі дають однаковий хеш-індекс. У цій лабораторній реалізовані два класичні методи вирішення:</p>
          <ul>
            <li><strong>Відкрита адресація</strong> з квадратичним пробуванням: <code>index = (h + attempt²) % SIZE</code>. Усі елементи зберігаються у самому масиві.</li>
            <li><strong>Метод ланцюжків</strong> (separate chaining): кожна комірка зберігає список значень з однаковим хешем.</li>
          </ul>
          <p>Для обчислення індексу використовується <strong>мультиплікативна</strong> хеш-функція з константою A ≈ 0.618033 (золотий переріз).</p>
          <pre class="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg text-sm overflow-x-auto"><code>${PSEUDOCODE}</code></pre>
        </section>

        <section class="space-y-4">
          <h2 class="text-xl font-semibold">Інтерактивний блок</h2>
          <div class="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
            <div>
              <label class="block text-sm font-medium mb-1">Команда</label>
              <select id="cmd-select" class="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900">
                <option value="insert">1) Insert</option>
                <option value="search">2) Search</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Ключ (число)</label>
              <input id="key-input" type="number" class="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900" placeholder="21">
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Розмір таблиці</label>
              <input id="size-input" type="number" min="3" max="31" value="11" class="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900">
            </div>
            <button id="btn-run" class="btn-animated px-4 py-2 rounded-lg bg-purple-600 text-white">Виконати</button>
            <button id="btn-clear" class="btn-animated px-4 py-2 rounded-lg bg-zinc-500 text-white">Очистити</button>
          </div>
          <div class="flex flex-wrap gap-2">
            <button id="btn-demo" class="btn-animated px-4 py-2 rounded-lg bg-zinc-200 dark:bg-zinc-700">Тестові дані (21,44,55,32,18,29,37)</button>
            <button id="btn-random" class="btn-animated px-4 py-2 rounded-lg bg-indigo-600 text-white">Випадкові 7 ключів</button>
          </div>
          <pre id="menu-log" class="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-3 text-xs overflow-auto max-h-48"></pre>
          <p id="error-msg" class="text-red-600 dark:text-red-400 text-sm hidden"></p>
        </section>

        <section>
          <h2 class="text-xl font-semibold mb-3">Відкрита адресація (квадратичне пробування)</h2>
          <div id="open-viz" class="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-11 gap-2"></div>
        </section>

        <section>
          <h2 class="text-xl font-semibold mb-3">Метод ланцюжків</h2>
          <div id="chain-viz" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"></div>
        </section>

        <section>
          <h2 class="text-xl font-semibold mb-2">Аналітика</h2>
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div class="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800"><div class="text-xs text-zinc-500">SIZE</div><div id="s-size" class="font-mono">11</div></div>
            <div class="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800"><div class="text-xs text-zinc-500">open used</div><div id="s-open-used" class="font-mono">0</div></div>
            <div class="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800"><div class="text-xs text-zinc-500">open collisions</div><div id="s-open-col" class="font-mono">0</div></div>
            <div class="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800"><div class="text-xs text-zinc-500">chain used</div><div id="s-chain-used" class="font-mono">0</div></div>
            <div class="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800"><div class="text-xs text-zinc-500">chain collisions</div><div id="s-chain-col" class="font-mono">0</div></div>
            <div class="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800"><div class="text-xs text-zinc-500">max chain</div><div id="s-chain-max" class="font-mono">0</div></div>
          </div>
        </section>
      </div>
    `;

    const cmdSelect = document.getElementById('cmd-select');
    const keyInput = document.getElementById('key-input');
    const sizeInput = document.getElementById('size-input');
    const menuLog = document.getElementById('menu-log');
    const openViz = document.getElementById('open-viz');
    const chainViz = document.getElementById('chain-viz');
    const errorEl = document.getElementById('error-msg');

    let lastHighlight = { open: -1, chain: -1 };

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
      document.getElementById('s-open-used').textContent = s.openUsed;
      document.getElementById('s-open-col').textContent = s.openCollisions;
      document.getElementById('s-chain-used').textContent = s.chainUsed;
      document.getElementById('s-chain-col').textContent = s.chainCollisions;
      document.getElementById('s-chain-max').textContent = s.chainMax;
    }

    function renderOpen() {
      openViz.innerHTML = table.openSlots.map((slot, idx) => {
        const isHi = idx === lastHighlight.open;
        const cls = isHi
          ? 'border-amber-400 bg-amber-100/80 dark:bg-amber-900/30 dark:border-amber-500'
          : slot.used
            ? 'border-emerald-300 bg-emerald-50/70 dark:bg-emerald-900/15 dark:border-emerald-800'
            : 'border-zinc-200 dark:border-zinc-700 bg-white/70 dark:bg-zinc-900/40';
        return `
          <div class="rounded-lg border p-2 text-center transition-all duration-300 ${cls}">
            <div class="text-[10px] text-zinc-500">[${idx}]</div>
            <div class="font-mono text-sm">${slot.used ? slot.key : '—'}</div>
          </div>
        `;
      }).join('');
    }

    function renderChain() {
      chainViz.innerHTML = table.chainSlots.map((bucket, idx) => {
        const isHi = idx === lastHighlight.chain;
        const clsBase = bucket.length > 1
          ? 'border-red-300 dark:border-red-900/70 bg-red-50/60 dark:bg-red-900/15'
          : 'border-zinc-200 dark:border-zinc-700 bg-white/70 dark:bg-zinc-900/40';
        const cls = isHi ? 'border-amber-400 bg-amber-100/80 dark:bg-amber-900/30 dark:border-amber-500' : clsBase;
        const content = bucket.length
          ? bucket.map((v) => `<span class="inline-block px-2 py-1 m-0.5 rounded bg-zinc-100 dark:bg-zinc-700 text-xs font-mono">${v}</span>`).join('')
          : '<span class="text-xs text-zinc-400">порожньо</span>';
        return `
          <div class="rounded-lg border p-3 transition-all duration-300 ${cls}">
            <div class="text-xs mb-2 text-zinc-500">chain[${idx}] (${bucket.length})</div>
            <div>${content}</div>
          </div>
        `;
      }).join('');
    }

    function refresh() {
      renderStats();
      renderOpen();
      renderChain();
      menuLog.textContent = logLines.join('\n');
    }

    function runCommand() {
      const key = Number(keyInput.value);
      if (!Number.isFinite(key)) return showError('Введіть числовий ключ.');
      showError('');
      const cmd = cmdSelect.value;

      if (cmd === 'insert') {
        const o = table.insertOpen(key);
        const c = table.insertChain(key);
        lastHighlight = { open: o.index, chain: c.index };
        pushLog(`Insert(${key}): open[${o.index}] attempts=${o.attempts}${o.collided ? ', collision!' : ''} | chain[${c.index}]${c.collided ? ' collision!' : ''}`);
      } else if (cmd === 'search') {
        const o = table.searchOpen(key);
        const c = table.searchChain(key);
        lastHighlight = { open: o.index, chain: c.index };
        pushLog(`Search(${key}): open=${o.found ? 'знайдено' : 'не знайдено'} (attempts=${o.attempts}) | chain=${c.found ? 'знайдено' : 'не знайдено'} (probes=${c.probes})`);
      }
      refresh();
    }

    document.getElementById('btn-run').addEventListener('click', runCommand);
    document.getElementById('btn-clear').addEventListener('click', () => {
      const size = Math.max(3, Math.min(31, Number(sizeInput.value) || 11));
      table = new CollisionHashTable(size);
      logLines = ['[menu] 1) Insert  2) Search  3) Clear', '[system] таблицю очищено'];
      lastHighlight = { open: -1, chain: -1 };
      refresh();
    });
    sizeInput.addEventListener('change', () => {
      const size = Math.max(3, Math.min(31, Number(sizeInput.value) || 11));
      sizeInput.value = size;
      table = new CollisionHashTable(size);
      logLines.push(`[system] змінено SIZE=${size}, таблицю очищено`);
      lastHighlight = { open: -1, chain: -1 };
      refresh();
    });

    document.getElementById('btn-demo').addEventListener('click', () => {
      table = new CollisionHashTable(Number(sizeInput.value) || 11);
      const demo = [21, 44, 55, 32, 18, 29, 37];
      for (const k of demo) { table.insertOpen(k); table.insertChain(k); }
      pushLog(`Демо-вставка: ${demo.join(', ')}`);
      lastHighlight = { open: -1, chain: -1 };
      refresh();
    });

    document.getElementById('btn-random').addEventListener('click', () => {
      const keys = Array.from({ length: 7 }, () => Math.floor(Math.random() * 99) + 1);
      for (const k of keys) { table.insertOpen(k); table.insertChain(k); }
      pushLog(`Випадкова вставка: ${keys.join(', ')}`);
      refresh();
    });

    document.getElementById('btn-demo').click();
  },
};
