/**
 * @file Lab19Page.js
 * @description Лабораторна №19 — AVL-дерево та його балансування.
 *   Самобалансоване BST: після кожної вставки/видалення оновлюються висоти,
 *   обчислюється коефіцієнт балансування і за потреби виконуються оберти
 *   (LL, RR, LR, RL). Поряд з SVG-візуалізацією виводиться журнал останньої
 *   операції балансування з типом обертів.
 */

import { AVLTree } from '../../core/algorithms/avlTree.js';

const PSEUDOCODE = `Insert(node, value):
  if node == nullptr: return new Node(value)
  if value < node.data: node.left  = Insert(node.left,  value)
  else if value > node.data: node.right = Insert(node.right, value)
  else: return node
  node.height = 1 + max(h(node.left), h(node.right))
  bal = h(node.left) - h(node.right)
  if bal >  1 and value < node.left.data:  return rightRotate(node)        // LL
  if bal < -1 and value > node.right.data: return leftRotate(node)         // RR
  if bal >  1 and value > node.left.data:  node.left  = leftRotate(node.left);  return rightRotate(node)   // LR
  if bal < -1 and value < node.right.data: node.right = rightRotate(node.right); return leftRotate(node)   // RL
  return node`;

export const Lab19Page = {
  mount(container) {
    const tree = new AVLTree();
    let logLines = ['[menu] 1) Insert  2) Delete  3) Search'];
    let highlightId = null;
    let highlightPath = [];
    let highlightOk = true;

    container.innerHTML = `
      <div class="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
        <header><h1 class="text-2xl font-bold">Лабораторна робота №19 — AVL-дерева та їх балансування</h1></header>

        <section class="prose dark:prose-invert max-w-none">
          <h2>Теоретичний блок</h2>
          <p><strong>AVL-дерево</strong> — самобалансоване бінарне дерево пошуку. Для кожного вузла зберігається висота піддерева; <strong>коефіцієнт балансування</strong> = <code>h(left) − h(right)</code> ∈ {−1, 0, +1}. При порушенні цієї умови виконуються оберти.</p>
          <p><strong>Чотири випадки балансування:</strong></p>
          <ul>
            <li><strong>LL</strong> (ліво-ліво) — <em>правий</em> оберт навколо неврівноваженого вузла.</li>
            <li><strong>RR</strong> (право-право) — <em>лівий</em> оберт.</li>
            <li><strong>LR</strong> — лівий оберт лівого піддерева, потім правий навколо вузла.</li>
            <li><strong>RL</strong> — правий оберт правого піддерева, потім лівий навколо вузла.</li>
          </ul>
          <pre class="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg text-sm overflow-x-auto"><code>${PSEUDOCODE}</code></pre>
        </section>

        <section class="space-y-4">
          <h2 class="text-xl font-semibold">Керування</h2>
          <div class="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
            <div>
              <label class="block text-sm font-medium mb-1">Команда</label>
              <select id="cmd" class="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900">
                <option value="insert">1) Insert</option>
                <option value="delete">2) Delete</option>
                <option value="search">3) Search</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Значення</label>
              <input id="value" type="number" class="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900" placeholder="42">
            </div>
            <button id="btn-run" class="btn-animated px-4 py-2 rounded-lg bg-purple-600 text-white">Виконати</button>
            <button id="btn-sorted" class="btn-animated px-4 py-2 rounded-lg bg-emerald-600 text-white">Демо: 1..10</button>
            <button id="btn-random" class="btn-animated px-4 py-2 rounded-lg bg-indigo-600 text-white">+10 випадкових</button>
            <button id="btn-clear" class="btn-animated px-4 py-2 rounded-lg bg-zinc-500 text-white">Очистити</button>
          </div>
          <p id="error-msg" class="text-red-600 dark:text-red-400 text-sm hidden"></p>
        </section>

        <section class="space-y-3">
          <h2 class="text-xl font-semibold">Візуалізація (значення / висота / баланс)</h2>
          <div id="tree-viz" class="overflow-x-auto p-3 bg-zinc-100/80 dark:bg-zinc-800/50 rounded-xl border-2 border-dashed border-purple-200 dark:border-purple-900/60"></div>
        </section>

        <section class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div class="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800">
            <div class="text-xs text-zinc-500 mb-1">Симетричний обхід (InOrder)</div>
            <div id="t-in" class="font-mono text-sm break-all">—</div>
          </div>
          <div class="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800">
            <div class="text-xs text-zinc-500 mb-1">Балансування останньої операції</div>
            <div id="t-ops" class="font-mono text-xs break-all">—</div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-semibold mb-2">Журнал та аналітика</h2>
          <pre id="menu-log" class="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-3 text-xs overflow-auto max-h-48"></pre>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
            <div class="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800"><div class="text-xs text-zinc-500">кількість вузлів</div><div id="s-count" class="font-mono">0</div></div>
            <div class="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800"><div class="text-xs text-zinc-500">висота</div><div id="s-height" class="font-mono">0</div></div>
            <div class="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800"><div class="text-xs text-zinc-500">оптимальна висота ⌈log₂(n+1)⌉</div><div id="s-opt" class="font-mono">0</div></div>
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

    function nodeFill(n) {
      if (n.id === highlightId) return highlightOk
        ? 'fill-amber-100 dark:fill-amber-900/50 stroke-amber-500'
        : 'fill-rose-100 dark:fill-rose-900/40 stroke-rose-500';
      if (highlightPath.includes(n.id)) return 'fill-indigo-100 dark:fill-indigo-900/40 stroke-indigo-400';
      if (Math.abs(n.balance) > 1) return 'fill-rose-100 dark:fill-rose-900/40 stroke-rose-500';
      return 'fill-white dark:fill-zinc-900 stroke-purple-400 dark:stroke-purple-500';
    }

    function renderTree() {
      const el = document.getElementById('tree-viz');
      const width = Math.max(600, Math.min(1200, 80 + tree.count() * 80));
      const { nodes, edges, height } = tree.layout(width, 80);
      if (!nodes.length) {
        el.innerHTML = '<p class="text-zinc-500 p-4">Дерево порожнє.</p>';
      } else {
        const edgesSvg = edges.map((e) => `<line x1="${e.x1}" y1="${e.y1}" x2="${e.x2}" y2="${e.y2}" class="stroke-purple-300 dark:stroke-purple-700" stroke-width="1.5" />`).join('');
        const nodesSvg = nodes.map((n) => `
          <g class="transition-all duration-300">
            <circle cx="${n.x}" cy="${n.y}" r="22" class="${nodeFill(n)}" stroke-width="2"></circle>
            <text x="${n.x}" y="${n.y + 1}" text-anchor="middle" class="fill-zinc-800 dark:fill-zinc-100 text-xs font-mono font-semibold">${n.data}</text>
            <text x="${n.x}" y="${n.y + 13}" text-anchor="middle" class="fill-zinc-500 dark:fill-zinc-400 text-[8px] font-mono">h=${n.height} b=${n.balance}</text>
          </g>
        `).join('');
        el.innerHTML = `<svg viewBox="0 0 ${width} ${height}" width="100%" height="${height}" preserveAspectRatio="xMidYMid meet" class="block">${edgesSvg}${nodesSvg}</svg>`;
      }
      const n = tree.count();
      document.getElementById('s-count').textContent = n;
      document.getElementById('s-height').textContent = tree.height();
      document.getElementById('s-opt').textContent = n === 0 ? 0 : Math.ceil(Math.log2(n + 1));
      const ino = tree.inOrder();
      document.getElementById('t-in').textContent = ino.length ? ino.join(' → ') : '—';
    }

    function renderOps() {
      const opsEl = document.getElementById('t-ops');
      if (!tree.lastOps.length) { opsEl.textContent = 'без балансування'; return; }
      opsEl.innerHTML = tree.lastOps.map((op) => {
        if (op.type === 'case') return `<span class="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-200">case ${op.name} (node id=${op.nodeId})</span>`;
        return `<span class="px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-200">${op.type} → newRoot=${op.newRootId}</span>`;
      }).join(' ');
    }

    document.getElementById('btn-run').addEventListener('click', () => {
      const cmd = cmdEl.value;
      const v = Number(valueEl.value);
      if (!Number.isFinite(v)) return showError('Введіть числове значення.');
      showError('');
      highlightId = null;
      highlightPath = [];
      highlightOk = true;

      if (cmd === 'insert') {
        const r = tree.insert(v);
        if (r.duplicate) pushLog(`Insert(${v}) → дублікат`);
        else { highlightId = r.inserted.id; pushLog(`Insert(${v}) → додано; обертів: ${tree.lastOps.filter((o) => o.type !== 'case').length}`); }
      } else if (cmd === 'delete') {
        const r = tree.remove(v);
        pushLog(r.removed ? `Delete(${v}) → видалено; обертів: ${tree.lastOps.filter((o) => o.type !== 'case').length}` : `Delete(${v}) → не знайдено`);
      } else if (cmd === 'search') {
        const r = tree.search(v);
        highlightPath = r.path;
        highlightOk = r.found;
        if (r.found) highlightId = r.id;
        pushLog(`Search(${v}) → ${r.found ? `знайдено за ${r.path.length} порівнянь` : 'не знайдено'}`);
      }
      renderTree();
      renderOps();
    });

    document.getElementById('btn-sorted').addEventListener('click', () => {
      tree.clear();
      for (let i = 1; i <= 10; i++) tree.insert(i);
      pushLog('Insert у відсортованому порядку 1..10 → AVL-баланс утримано');
      highlightId = null; highlightPath = [];
      renderTree(); renderOps();
    });

    document.getElementById('btn-random').addEventListener('click', () => {
      const added = [];
      for (let i = 0; i < 10; i++) {
        const v = Math.floor(Math.random() * 99) + 1;
        const r = tree.insert(v);
        if (!r.duplicate) added.push(v);
      }
      pushLog(`Insert(+10 випадкових) → реально додано: [${added.join(', ')}]`);
      highlightId = null; highlightPath = [];
      renderTree(); renderOps();
    });

    document.getElementById('btn-clear').addEventListener('click', () => {
      tree.clear();
      highlightId = null; highlightPath = [];
      pushLog('clear() → дерево очищено');
      renderTree(); renderOps();
    });

    [10, 20, 30, 40, 50, 25].forEach((v) => tree.insert(v));
    pushLog('Демо: Insert(10, 20, 30, 40, 50, 25) → автоматичне балансування');
    renderTree();
    renderOps();
  },
};
