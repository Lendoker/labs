/**
 * @file Lab20Page.js
 * @description Лабораторна №20 — Trie (префіксне дерево).
 *   Кожен вузол відповідає одному символу; шлях від кореня до листа з прапором
 *   isEndOfWord утворює слово. Операції: insert, search, prefix-search,
 *   delete. Окремо обчислюються слова за префіксом та їх кількість.
 */

import { Trie } from '../../core/algorithms/trie.js';

const PSEUDOCODE = `Insert(root, word):
  current = root
  for c in word:
    if current.children[c] == nullptr:
      current.children[c] = new TrieNode()
    current = current.children[c]
  current.isEndOfWord = true

Search(root, word):
  current = root
  for c in word:
    if current.children[c] == nullptr: return false
    current = current.children[c]
  return current.isEndOfWord`;

export const Lab20Page = {
  mount(container) {
    const trie = new Trie();
    let logLines = ['[menu] 1) Insert  2) Search  3) Prefix  4) Delete'];
    let highlightPath = [];
    let highlightOk = true;
    let lastPrefix = null;
    let lastPrefixWords = [];

    container.innerHTML = `
      <div class="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
        <header><h1 class="text-2xl font-bold">Лабораторна робота №20 — Trie (префіксне дерево)</h1></header>

        <section class="prose dark:prose-invert max-w-none">
          <h2>Теоретичний блок</h2>
          <p><strong>Префіксне дерево (Trie)</strong> — деревоподібна структура для зберігання та пошуку рядків. Кожен вузол відповідає одному символу, а шлях від кореня до вузла утворює префікс слова.</p>
          <p>Прапор <code>isEndOfWord</code> у вузлі позначає, що до цього вузла закінчується саме <em>слово</em>, а не лише префікс. Завдяки цьому час пошуку слова чи префікса залежить лише від довжини рядка, а не від кількості слів у словнику.</p>
          <p>Типові застосування: автодоповнення, перевірка правопису, фільтрація за префіксом, побудова словників.</p>
          <pre class="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg text-sm overflow-x-auto"><code>${PSEUDOCODE}</code></pre>
        </section>

        <section class="space-y-4">
          <h2 class="text-xl font-semibold">Керування</h2>
          <div class="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
            <div>
              <label class="block text-sm font-medium mb-1">Команда</label>
              <select id="cmd" class="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900">
                <option value="insert">1) Insert слово</option>
                <option value="search">2) Search слово</option>
                <option value="prefix">3) Search префікс</option>
                <option value="delete">4) Delete слово</option>
              </select>
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-medium mb-1">Рядок (лише латинські літери)</label>
              <input id="value" type="text" class="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900" placeholder="cat">
            </div>
            <button id="btn-run" class="btn-animated px-4 py-2 rounded-lg bg-purple-600 text-white">Виконати</button>
            <button id="btn-clear" class="btn-animated px-4 py-2 rounded-lg bg-zinc-500 text-white">Очистити</button>
          </div>
          <p id="error-msg" class="text-red-600 dark:text-red-400 text-sm hidden"></p>
        </section>

        <section class="space-y-3">
          <h2 class="text-xl font-semibold">Візуалізація</h2>
          <div id="trie-viz" class="overflow-x-auto p-3 bg-zinc-100/80 dark:bg-zinc-800/50 rounded-xl border-2 border-dashed border-purple-200 dark:border-purple-900/60"></div>
          <p class="text-xs text-zinc-500">Зелений кружечок — кінець слова (<code>isEndOfWord = true</code>). Янтарне підсвічення — шлях останньої операції.</p>
        </section>

        <section class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div class="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800">
            <div class="text-xs text-zinc-500 mb-1">Усі слова словника</div>
            <div id="t-all" class="font-mono text-sm break-all">—</div>
          </div>
          <div class="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800">
            <div class="text-xs text-zinc-500 mb-1">Слова за останнім префіксом</div>
            <div id="t-prefix" class="font-mono text-sm break-all">—</div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-semibold mb-2">Журнал та аналітика</h2>
          <pre id="menu-log" class="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-3 text-xs overflow-auto max-h-48"></pre>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
            <div class="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800"><div class="text-xs text-zinc-500">кількість слів</div><div id="s-words" class="font-mono">0</div></div>
            <div class="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800"><div class="text-xs text-zinc-500">кількість вузлів</div><div id="s-nodes" class="font-mono">1</div></div>
            <div class="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800"><div class="text-xs text-zinc-500">слів з останнім префіксом</div><div id="s-prefix-count" class="font-mono">0</div></div>
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
      const onPath = highlightPath.includes(n.id);
      if (onPath) return highlightOk ? 'fill-amber-100 dark:fill-amber-900/50 stroke-amber-500' : 'fill-rose-100 dark:fill-rose-900/40 stroke-rose-500';
      if (n.isRoot) return 'fill-indigo-100 dark:fill-indigo-900/40 stroke-indigo-500';
      if (n.isEnd) return 'fill-emerald-100 dark:fill-emerald-900/40 stroke-emerald-500';
      return 'fill-white dark:fill-zinc-900 stroke-purple-400 dark:stroke-purple-500';
    }

    function renderTrie() {
      const el = document.getElementById('trie-viz');
      const nodeCount = trie.nodeCount();
      const width = Math.max(600, Math.min(1400, 60 + nodeCount * 50));
      const { nodes, edges, height } = trie.layout(width);
      if (nodes.length <= 1) {
        el.innerHTML = '<p class="text-zinc-500 p-4">Trie порожній (лише корінь).</p>';
      } else {
        const edgesSvg = edges.map((e) => `
          <g>
            <line x1="${e.x1}" y1="${e.y1}" x2="${e.x2}" y2="${e.y2}" class="stroke-purple-300 dark:stroke-purple-700" stroke-width="1.5" />
            <text x="${(e.x1 + e.x2) / 2}" y="${(e.y1 + e.y2) / 2 - 4}" text-anchor="middle" class="fill-zinc-500 dark:fill-zinc-400 text-[10px] font-mono">${e.char}</text>
          </g>
        `).join('');
        const nodesSvg = nodes.map((n) => `
          <g class="transition-all duration-300">
            <circle cx="${n.x}" cy="${n.y}" r="${n.isRoot ? 22 : 18}" class="${nodeFill(n)}" stroke-width="2"></circle>
            <text x="${n.x}" y="${n.y + 4}" text-anchor="middle" class="fill-zinc-800 dark:fill-zinc-100 text-xs font-mono font-semibold">${n.label}</text>
          </g>
        `).join('');
        el.innerHTML = `<svg viewBox="0 0 ${width} ${height}" width="100%" height="${height}" preserveAspectRatio="xMidYMid meet" class="block">${edgesSvg}${nodesSvg}</svg>`;
      }

      document.getElementById('s-words').textContent = trie.wordCount;
      document.getElementById('s-nodes').textContent = nodeCount;
      document.getElementById('s-prefix-count').textContent = lastPrefix === null ? 0 : lastPrefixWords.length;
      const all = trie.allWords();
      document.getElementById('t-all').textContent = all.length ? all.join(', ') : '—';
      document.getElementById('t-prefix').textContent = lastPrefix === null
        ? '—'
        : (lastPrefixWords.length ? `«${lastPrefix}» → ${lastPrefixWords.join(', ')}` : `«${lastPrefix}» → нічого не знайдено`);
    }

    function validateWord(raw) {
      const w = String(raw || '').trim().toLowerCase();
      if (!w) return { ok: false, msg: 'Введіть слово.' };
      if (!/^[a-z]+$/.test(w)) return { ok: false, msg: 'Дозволені лише латинські літери (a-z).' };
      return { ok: true, word: w };
    }

    document.getElementById('btn-run').addEventListener('click', () => {
      const cmd = cmdEl.value;
      const { ok, msg, word } = validateWord(valueEl.value);
      showError('');
      highlightPath = [];
      highlightOk = true;

      if (!ok) return showError(msg);

      if (cmd === 'insert') {
        const r = trie.insert(word);
        highlightPath = r.path;
        pushLog(r.wasNew ? `Insert("${word}") → нове слово` : `Insert("${word}") → вже існувало`);
      } else if (cmd === 'search') {
        const r = trie.search(word);
        highlightPath = r.path;
        highlightOk = r.found;
        if (r.found) pushLog(`Search("${word}") → знайдено`);
        else pushLog(r.isPrefix ? `Search("${word}") → це лише префікс, повного слова немає` : `Search("${word}") → відсутнє`);
      } else if (cmd === 'prefix') {
        const r = trie.wordsWithPrefix(word);
        highlightPath = r.path;
        highlightOk = r.words.length > 0;
        lastPrefix = word;
        lastPrefixWords = r.words;
        pushLog(`Prefix("${word}") → знайдено ${r.words.length} слів: [${r.words.join(', ')}]`);
      } else if (cmd === 'delete') {
        const r = trie.delete(word);
        pushLog(r.ok ? `Delete("${word}") → видалено` : `Delete("${word}") → відсутнє`);
      }
      renderTrie();
    });

    document.getElementById('btn-clear').addEventListener('click', () => {
      trie.clear();
      highlightPath = [];
      lastPrefix = null;
      lastPrefixWords = [];
      pushLog('clear() → словник очищено');
      renderTrie();
    });

    ['cat', 'car', 'card', 'care', 'careful', 'dog', 'door', 'down', 'do'].forEach((w) => trie.insert(w));
    pushLog('Демо: Insert("cat", "car", "card", "care", "careful", "dog", "door", "down", "do")');
    renderTrie();
  },
};
