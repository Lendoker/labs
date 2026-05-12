/**
 * @file Lab18Page.js
 * @description Лабораторна №18 — Реалізація бінарного дерева пошуку.
 *   Операції: Insert, Search, Delete; обходи: InOrder, PreOrder, PostOrder.
 *   Додатково: min, max, height, count. Дерево візуалізується у SVG з
 *   in-order розкладкою, активна підсвітка останньої операції/пошукового шляху.
 */

import { BinarySearchTree } from '../../core/algorithms/binaryTree.js';

const PSEUDOCODE = `Insert(node, value):
  if node == nullptr: return new Node(value)
  if value < node.data: node.left  = Insert(node.left,  value)
  else if value > node.data: node.right = Insert(node.right, value)
  return node

Search(node, value):
  if node == nullptr: return false
  if value == node.data: return true
  if value < node.data: return Search(node.left,  value)
  else: return Search(node.right, value)`;

export const Lab18Page = {
  mount(container) {
    const tree = new BinarySearchTree();
    let logLines = ['[menu] 1) Insert  2) Search  3) Delete  4) Traverse'];
    let highlightId = null;
    let highlightPath = [];
    let highlightOk = true;

    container.innerHTML = `
      <div class="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
        <header><h1 class="text-2xl font-bold">Лабораторна робота №18 — Реалізація дерев</h1></header>

        <section class="prose dark:prose-invert max-w-none">
          <h2>Теоретичний блок</h2>
          <p><strong>Дерево</strong> — ієрархічна структура даних, у якій один вузол виокремлюється як корінь, а решта розділена на піддерева. <strong>Бінарне дерево пошуку (BST)</strong> — двійкове дерево, де для кожного вузла значення лівого піддерева менші, а правого — більші за значення самого вузла.</p>
          <p><strong>Основні операції:</strong> <code>Insert</code>, <code>Search</code>, <code>Delete</code>.</p>
          <p><strong>Обходи:</strong> <em>InOrder</em> (ліве → корінь → праве) — повертає елементи у зростаючому порядку; <em>PreOrder</em> (корінь → ліве → праве); <em>PostOrder</em> (ліве → праве → корінь).</p>
          <pre class="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg text-sm overflow-x-auto"><code>${PSEUDOCODE}</code></pre>
        </section>

        <section class="space-y-4">
          <h2 class="text-xl font-semibold">Керування</h2>
          <div class="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
            <div>
              <label class="block text-sm font-medium mb-1">Команда</label>
              <select id="cmd" class="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900">
                <option value="insert">1) Insert</option>
                <option value="search">2) Search</option>
                <option value="delete">3) Delete</option>
                <option value="traverse">4) Traverse</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Значення</label>
              <input id="value" type="number" class="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900" placeholder="42">
            </div>
            <button id="btn-run" class="btn-animated px-4 py-2 rounded-lg bg-purple-600 text-white">Виконати</button>
            <button id="btn-random" class="btn-animated px-4 py-2 rounded-lg bg-indigo-600 text-white">+10 випадкових</button>
            <button id="btn-clear" class="btn-animated px-4 py-2 rounded-lg bg-zinc-500 text-white">Очистити</button>
          </div>
          <p id="error-msg" class="text-red-600 dark:text-red-400 text-sm hidden"></p>
        </section>

        <section class="space-y-3">
          <h2 class="text-xl font-semibold">Візуалізація</h2>
          <div id="tree-viz" class="overflow-x-auto p-3 bg-zinc-100/80 dark:bg-zinc-800/50 rounded-xl border-2 border-dashed border-purple-200 dark:border-purple-900/60"></div>
        </section>

        <section class="space-y-3">
          <h2 class="text-xl font-semibold">Обходи</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div class="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800">
              <div class="text-xs text-zinc-500 mb-1">InOrder (ліве → корінь → праве)</div>
              <div id="t-in" class="font-mono text-sm break-all">—</div>
            </div>
            <div class="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800">
              <div class="text-xs text-zinc-500 mb-1">PreOrder (корінь → ліве → праве)</div>
              <div id="t-pre" class="font-mono text-sm break-all">—</div>
            </div>
            <div class="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800">
              <div class="text-xs text-zinc-500 mb-1">PostOrder (ліве → праве → корінь)</div>
              <div id="t-post" class="font-mono text-sm break-all">—</div>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-semibold mb-2">Журнал та аналітика</h2>
          <pre id="menu-log" class="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-3 text-xs overflow-auto max-h-48"></pre>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
            <div class="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800"><div class="text-xs text-zinc-500">кількість вузлів</div><div id="s-count" class="font-mono">0</div></div>
            <div class="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800"><div class="text-xs text-zinc-500">висота</div><div id="s-height" class="font-mono">0</div></div>
            <div class="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800"><div class="text-xs text-zinc-500">min</div><div id="s-min" class="font-mono">—</div></div>
            <div class="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800"><div class="text-xs text-zinc-500">max</div><div id="s-max" class="font-mono">—</div></div>
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

    function nodeFill(id) {
      if (id === highlightId) return highlightOk ? 'fill-amber-100 dark:fill-amber-900/50 stroke-amber-500' : 'fill-rose-100 dark:fill-rose-900/40 stroke-rose-500';
      if (highlightPath.includes(id)) return 'fill-indigo-100 dark:fill-indigo-900/40 stroke-indigo-400';
      return 'fill-white dark:fill-zinc-900 stroke-purple-400 dark:stroke-purple-500';
    }

    function renderTree() {
      const el = document.getElementById('tree-viz');
      const width = Math.max(600, Math.min(1200, 80 + tree.count() * 80));
      const { nodes, edges, height } = tree.layout(width);
      if (!nodes.length) {
        el.innerHTML = '<p class="text-zinc-500 p-4">Дерево порожнє.</p>';
      } else {
        const edgesSvg = edges.map((e) => `<line x1="${e.x1}" y1="${e.y1}" x2="${e.x2}" y2="${e.y2}" class="stroke-purple-300 dark:stroke-purple-700" stroke-width="1.5" />`).join('');
        const nodesSvg = nodes.map((n) => `
          <g class="transition-all duration-300">
            <circle cx="${n.x}" cy="${n.y}" r="20" class="${nodeFill(n.id)}" stroke-width="2"></circle>
            <text x="${n.x}" y="${n.y + 4}" text-anchor="middle" class="fill-zinc-800 dark:fill-zinc-100 text-xs font-mono font-semibold">${n.data}</text>
          </g>
        `).join('');
        el.innerHTML = `<svg viewBox="0 0 ${width} ${height}" width="100%" height="${height}" preserveAspectRatio="xMidYMid meet" class="block">${edgesSvg}${nodesSvg}</svg>`;
      }
      document.getElementById('s-count').textContent = tree.count();
      document.getElementById('s-height').textContent = tree.height();
      document.getElementById('s-min').textContent = tree.min() ?? '—';
      document.getElementById('s-max').textContent = tree.max() ?? '—';

      const ino = tree.inOrder();
      document.getElementById('t-in').textContent = ino.length ? ino.join(' → ') : '—';
      const pre = tree.preOrder();
      document.getElementById('t-pre').textContent = pre.length ? pre.join(' → ') : '—';
      const post = tree.postOrder();
      document.getElementById('t-post').textContent = post.length ? post.join(' → ') : '—';
    }

    document.getElementById('btn-run').addEventListener('click', () => {
      const cmd = cmdEl.value;
      const v = Number(valueEl.value);
      showError('');
      highlightId = null;
      highlightPath = [];
      highlightOk = true;

      if (cmd === 'insert') {
        if (!Number.isFinite(v)) return showError('Введіть числове значення.');
        const r = tree.insert(v);
        if (r.duplicate) {
          pushLog(`Insert(${v}) → дублікат, проігноровано`);
        } else {
          highlightId = r.inserted.id;
          pushLog(`Insert(${v}) → додано (id=${r.inserted.id})`);
        }
      } else if (cmd === 'search') {
        if (!Number.isFinite(v)) return showError('Введіть числове значення.');
        const r = tree.search(v);
        highlightPath = r.path;
        highlightOk = r.found;
        if (r.found) highlightId = r.id;
        pushLog(`Search(${v}) → ${r.found ? `знайдено за ${r.comparisons} порівнянь` : `не знайдено (${r.comparisons} порівнянь)`}`);
      } else if (cmd === 'delete') {
        if (!Number.isFinite(v)) return showError('Введіть числове значення.');
        const r = tree.remove(v);
        pushLog(r.removed ? `Delete(${v}) → видалено` : `Delete(${v}) → не знайдено`);
      } else if (cmd === 'traverse') {
        pushLog(`Traverse → InOrder: [${tree.inOrder().join(', ')}] | PreOrder: [${tree.preOrder().join(', ')}] | PostOrder: [${tree.postOrder().join(', ')}]`);
      }
      renderTree();
    });

    document.getElementById('btn-random').addEventListener('click', () => {
      const added = [];
      for (let i = 0; i < 10; i++) {
        const v = Math.floor(Math.random() * 99) + 1;
        const r = tree.insert(v);
        if (!r.duplicate) added.push(v);
      }
      pushLog(`Insert(+10 випадкових) → реально додано: [${added.join(', ')}]`);
      highlightId = null;
      highlightPath = [];
      renderTree();
    });

    document.getElementById('btn-clear').addEventListener('click', () => {
      tree.clear();
      highlightId = null;
      highlightPath = [];
      pushLog('clear() → дерево очищено');
      renderTree();
    });

    [50, 30, 70, 20, 40, 60, 80, 10, 35, 65].forEach((v) => tree.insert(v));
    pushLog('Демо: Insert(50, 30, 70, 20, 40, 60, 80, 10, 35, 65)');
    renderTree();
  },
};
