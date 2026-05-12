/**
 * @file trie.js
 * @description Префіксне дерево (Trie) для зберігання та пошуку рядків.
 *   Кожен вузол має словник нащадків (children: char → node) та прапор
 *   isEndOfWord. Підтримує додавання, пошук, пошук за префіксом, підрахунок
 *   слів з префіксом, видалення слова.
 */

let __trieNodeId = 1;

function createNode(char = '') {
  return {
    id: __trieNodeId++,
    char,
    children: new Map(),
    isEndOfWord: false,
  };
}

function normalize(word) {
  return String(word ?? '').trim().toLowerCase();
}

export class Trie {
  constructor() {
    this.root = createNode('');
    this.wordCount = 0;
  }

  /** Додає слово. Повертає шлях відвіданих вузлів та чи слово було новим. */
  insert(word) {
    const w = normalize(word);
    if (!w) return { ok: false, reason: 'empty', path: [] };
    let cur = this.root;
    const path = [cur.id];
    for (const ch of w) {
      if (!cur.children.has(ch)) cur.children.set(ch, createNode(ch));
      cur = cur.children.get(ch);
      path.push(cur.id);
    }
    const wasNew = !cur.isEndOfWord;
    if (wasNew) {
      cur.isEndOfWord = true;
      this.wordCount++;
    }
    return { ok: true, word: w, path, wasNew };
  }

  /**
   * Пошук точного слова. Повертає прапор знайдено, шлях та чи це лише префікс
   * (тобто всі символи знайдені, але кінцевого прапора немає).
   */
  search(word) {
    const w = normalize(word);
    if (!w) return { found: false, isPrefix: false, path: [] };
    let cur = this.root;
    const path = [cur.id];
    for (const ch of w) {
      if (!cur.children.has(ch)) return { found: false, isPrefix: false, path };
      cur = cur.children.get(ch);
      path.push(cur.id);
    }
    return { found: cur.isEndOfWord, isPrefix: !cur.isEndOfWord, path };
  }

  /**
   * Усі слова, що починаються з заданого префікса.
   * @returns {{prefix: string, path: number[], words: string[]}}
   */
  wordsWithPrefix(prefix) {
    const p = normalize(prefix);
    let cur = this.root;
    const path = [cur.id];
    for (const ch of p) {
      if (!cur.children.has(ch)) return { prefix: p, path, words: [] };
      cur = cur.children.get(ch);
      path.push(cur.id);
    }
    const out = [];
    const walk = (node, buf) => {
      if (node.isEndOfWord) out.push(buf);
      for (const [ch, child] of node.children) walk(child, buf + ch);
    };
    walk(cur, p);
    return { prefix: p, path, words: out };
  }

  countWithPrefix(prefix) {
    return this.wordsWithPrefix(prefix).words.length;
  }

  /** Видалення слова. Очищає порожні «хвости». */
  delete(word) {
    const w = normalize(word);
    if (!w) return { ok: false, reason: 'empty' };

    const remove = (node, depth) => {
      if (depth === w.length) {
        if (!node.isEndOfWord) return { node, deleted: false, prune: false };
        node.isEndOfWord = false;
        return { node, deleted: true, prune: node.children.size === 0 };
      }
      const ch = w[depth];
      const child = node.children.get(ch);
      if (!child) return { node, deleted: false, prune: false };
      const res = remove(child, depth + 1);
      if (res.prune) node.children.delete(ch);
      return {
        node,
        deleted: res.deleted,
        prune: !node.isEndOfWord && node.children.size === 0 && depth !== 0,
      };
    };

    const result = remove(this.root, 0);
    if (result.deleted) this.wordCount--;
    return { ok: result.deleted };
  }

  /** Усі слова у дереві у лексикографічному порядку. */
  allWords() {
    const out = [];
    const walk = (node, buf) => {
      if (node.isEndOfWord) out.push(buf);
      for (const ch of [...node.children.keys()].sort()) walk(node.children.get(ch), buf + ch);
    };
    walk(this.root, '');
    return out;
  }

  /** Загальна кількість вузлів (включно з коренем). */
  nodeCount() {
    let n = 0;
    const walk = (node) => { n++; for (const c of node.children.values()) walk(c); };
    walk(this.root);
    return n;
  }

  /**
   * Розмітка координат для рендеру SVG. Вузли розкладаються за DFS-порядком
   * (по горизонталі) та глибиною (по вертикалі). Через довільну кількість
   * нащадків ширина залежить від кількості листків піддерева.
   */
  layout(width = 720, levelHeight = 70, paddingX = 24) {
    const nodes = [];
    const edges = [];
    if (this.root.children.size === 0) {
      nodes.push({ id: this.root.id, label: 'root', x: width / 2, y: 40, isRoot: true, isEnd: false });
      return { nodes, edges, width, height: 80 };
    }

    let idx = 0;
    const positions = new Map();
    const orderedChildren = (n) => [...n.children.entries()].sort(([a], [b]) => a.localeCompare(b));

    const walk = (node, depth) => {
      const kids = orderedChildren(node);
      if (kids.length === 0) {
        positions.set(node.id, { x: idx++, y: depth });
        return;
      }
      const start = idx;
      for (const [, child] of kids) walk(child, depth + 1);
      const end = idx - 1;
      positions.set(node.id, { x: (start + end) / 2, y: depth });
    };
    walk(this.root, 0);

    const total = idx;
    const stepX = total > 1 ? (width - paddingX * 2) / (total - 1) : 0;
    let maxDepth = 0;

    const collect = (node) => {
      const p = positions.get(node.id);
      const x = paddingX + (total === 1 ? (width - paddingX * 2) / 2 : p.x * stepX);
      const y = 40 + p.y * levelHeight;
      maxDepth = Math.max(maxDepth, p.y);
      nodes.push({
        id: node.id,
        label: node === this.root ? 'root' : node.char,
        isRoot: node === this.root,
        isEnd: node.isEndOfWord,
        x, y,
      });
      for (const [, child] of orderedChildren(node)) {
        const cp = positions.get(child.id);
        edges.push({
          from: node.id,
          to: child.id,
          char: child.char,
          x1: x, y1: y,
          x2: paddingX + (total === 1 ? (width - paddingX * 2) / 2 : cp.x * stepX),
          y2: 40 + cp.y * levelHeight,
        });
        collect(child);
      }
    };
    collect(this.root);

    return { nodes, edges, width, height: Math.max(80, 80 + maxDepth * levelHeight) };
  }

  clear() {
    this.root = createNode('');
    this.wordCount = 0;
  }
}
