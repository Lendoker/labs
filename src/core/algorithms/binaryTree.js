/**
 * @file binaryTree.js
 * @description Бінарне дерево пошуку (BST) з основними операціями та обходами.
 *   Кожен вузол містить data, посилання на лівого/правого нащадка та унікальний
 *   id для стабільної візуалізації. Операції: insert, search, remove,
 *   in-/pre-/post-order traversal, min, max, height, count.
 */

let __btNodeId = 1;

function createNode(value) {
  return { id: __btNodeId++, data: Number(value), left: null, right: null };
}

export class BinarySearchTree {
  constructor() {
    this.root = null;
  }

  /** Рекурсивна вставка значення. Дублікати ігноруються. */
  insert(value) {
    const v = Number(value);
    const ctx = { inserted: null, duplicate: false };
    this.root = this._insertNode(this.root, v, ctx);
    return ctx;
  }

  _insertNode(node, value, ctx) {
    if (node === null) {
      const fresh = createNode(value);
      ctx.inserted = fresh;
      return fresh;
    }
    if (value < node.data) node.left = this._insertNode(node.left, value, ctx);
    else if (value > node.data) node.right = this._insertNode(node.right, value, ctx);
    else ctx.duplicate = true;
    return node;
  }

  /**
   * Пошук значення. Повертає кількість порівнянь, шлях відвіданих вузлів
   * (їхні id) і прапор знайдено/ні.
   */
  search(value) {
    const v = Number(value);
    const path = [];
    let cur = this.root;
    let comparisons = 0;
    while (cur) {
      comparisons++;
      path.push(cur.id);
      if (v === cur.data) return { found: true, comparisons, path, id: cur.id };
      cur = v < cur.data ? cur.left : cur.right;
    }
    return { found: false, comparisons, path };
  }

  /** Видалення вузла за значенням (підхід з in-order successor). */
  remove(value) {
    const v = Number(value);
    const ctx = { removed: false };
    this.root = this._removeNode(this.root, v, ctx);
    return ctx;
  }

  _removeNode(node, value, ctx) {
    if (node === null) return null;
    if (value < node.data) {
      node.left = this._removeNode(node.left, value, ctx);
    } else if (value > node.data) {
      node.right = this._removeNode(node.right, value, ctx);
    } else {
      ctx.removed = true;
      if (node.left === null) return node.right;
      if (node.right === null) return node.left;
      let succ = node.right;
      while (succ.left !== null) succ = succ.left;
      node.data = succ.data;
      node.right = this._removeNode(node.right, succ.data, { removed: false });
    }
    return node;
  }

  /** Симетричний (in-order) обхід: ліве → корінь → праве. */
  inOrder() {
    const out = [];
    (function walk(n) {
      if (!n) return;
      walk(n.left);
      out.push(n.data);
      walk(n.right);
    })(this.root);
    return out;
  }

  /** Прямий (pre-order) обхід: корінь → ліве → праве. */
  preOrder() {
    const out = [];
    (function walk(n) {
      if (!n) return;
      out.push(n.data);
      walk(n.left);
      walk(n.right);
    })(this.root);
    return out;
  }

  /** Зворотний (post-order) обхід: ліве → праве → корінь. */
  postOrder() {
    const out = [];
    (function walk(n) {
      if (!n) return;
      walk(n.left);
      walk(n.right);
      out.push(n.data);
    })(this.root);
    return out;
  }

  /** Мінімальне значення (крайній лівий вузол). */
  min() {
    if (!this.root) return null;
    let cur = this.root;
    while (cur.left) cur = cur.left;
    return cur.data;
  }

  /** Максимальне значення (крайній правий вузол). */
  max() {
    if (!this.root) return null;
    let cur = this.root;
    while (cur.right) cur = cur.right;
    return cur.data;
  }

  /** Висота дерева (порожнє = 0, єдиний вузол = 1). */
  height(node = this.root) {
    if (!node) return 0;
    return 1 + Math.max(this.height(node.left), this.height(node.right));
  }

  /** Кількість вузлів. */
  count(node = this.root) {
    if (!node) return 0;
    return 1 + this.count(node.left) + this.count(node.right);
  }

  /**
   * Підготувати координати вузлів для рендеру у SVG. Розмір вибирається
   * залежно від висоти; вертикалі рівномірні, горизонталі — за in-order
   * позицією, що уникає накладання.
   */
  layout(width = 720, levelHeight = 70, paddingX = 24) {
    const nodes = [];
    const edges = [];
    if (!this.root) return { nodes, edges, width, height: 80 };

    let inOrderIndex = 0;
    const positions = new Map();

    const walk = (node, depth) => {
      if (!node) return;
      walk(node.left, depth + 1);
      positions.set(node.id, { x: inOrderIndex++, y: depth });
      walk(node.right, depth + 1);
    };
    walk(this.root, 0);

    const total = positions.size;
    const stepX = total > 1 ? (width - paddingX * 2) / (total - 1) : 0;
    const treeHeight = this.height();

    const collect = (node) => {
      if (!node) return;
      const p = positions.get(node.id);
      nodes.push({
        id: node.id,
        data: node.data,
        x: paddingX + (total === 1 ? (width - paddingX * 2) / 2 : p.x * stepX),
        y: 40 + p.y * levelHeight,
      });
      for (const child of [node.left, node.right]) {
        if (child) {
          const cp = positions.get(child.id);
          edges.push({
            from: node.id,
            to: child.id,
            x1: paddingX + (total === 1 ? (width - paddingX * 2) / 2 : p.x * stepX),
            y1: 40 + p.y * levelHeight,
            x2: paddingX + (total === 1 ? (width - paddingX * 2) / 2 : cp.x * stepX),
            y2: 40 + cp.y * levelHeight,
          });
          collect(child);
        }
      }
    };
    collect(this.root);

    return { nodes, edges, width, height: Math.max(80, 80 + treeHeight * levelHeight) };
  }

  clear() {
    this.root = null;
  }
}
