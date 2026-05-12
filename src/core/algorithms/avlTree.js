/**
 * @file avlTree.js
 * @description AVL-дерево — самобалансоване бінарне дерево пошуку.
 *   Підтримує балансування за рахунок чотирьох типів обертів (LL, RR, LR, RL).
 *   Кожен вузол зберігає висоту піддерева, що дозволяє швидко обчислювати
 *   коефіцієнт балансування як height(left) - height(right).
 */

let __avlNodeId = 1;

function createNode(value) {
  return { id: __avlNodeId++, data: Number(value), left: null, right: null, height: 1 };
}

function h(n) { return n ? n.height : 0; }
function updateHeight(n) { n.height = 1 + Math.max(h(n.left), h(n.right)); }
function balance(n) { return n ? h(n.left) - h(n.right) : 0; }

export class AVLTree {
  constructor() {
    this.root = null;
    /** Журнал останньої операції (вставка/видалення): які оберти виконано. */
    this.lastOps = [];
  }

  _rightRotate(y) {
    const x = y.left;
    const T2 = x.right;
    x.right = y;
    y.left = T2;
    updateHeight(y);
    updateHeight(x);
    this.lastOps.push({ type: 'rightRotate', pivotId: y.id, newRootId: x.id });
    return x;
  }

  _leftRotate(x) {
    const y = x.right;
    const T2 = y.left;
    y.left = x;
    x.right = T2;
    updateHeight(x);
    updateHeight(y);
    this.lastOps.push({ type: 'leftRotate', pivotId: x.id, newRootId: y.id });
    return y;
  }

  insert(value) {
    this.lastOps = [];
    const ctx = { inserted: null, duplicate: false };
    this.root = this._insertNode(this.root, Number(value), ctx);
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
    else { ctx.duplicate = true; return node; }

    updateHeight(node);
    const bal = balance(node);

    if (bal > 1 && value < node.left.data) {
      this.lastOps.push({ type: 'case', name: 'LL', nodeId: node.id });
      return this._rightRotate(node);
    }
    if (bal < -1 && value > node.right.data) {
      this.lastOps.push({ type: 'case', name: 'RR', nodeId: node.id });
      return this._leftRotate(node);
    }
    if (bal > 1 && value > node.left.data) {
      this.lastOps.push({ type: 'case', name: 'LR', nodeId: node.id });
      node.left = this._leftRotate(node.left);
      return this._rightRotate(node);
    }
    if (bal < -1 && value < node.right.data) {
      this.lastOps.push({ type: 'case', name: 'RL', nodeId: node.id });
      node.right = this._rightRotate(node.right);
      return this._leftRotate(node);
    }
    return node;
  }

  remove(value) {
    this.lastOps = [];
    const ctx = { removed: false };
    this.root = this._removeNode(this.root, Number(value), ctx);
    return ctx;
  }

  _removeNode(node, value, ctx) {
    if (node === null) return null;
    if (value < node.data) node.left = this._removeNode(node.left, value, ctx);
    else if (value > node.data) node.right = this._removeNode(node.right, value, ctx);
    else {
      ctx.removed = true;
      if (node.left === null || node.right === null) {
        node = node.left || node.right;
      } else {
        let succ = node.right;
        while (succ.left) succ = succ.left;
        node.data = succ.data;
        node.right = this._removeNode(node.right, succ.data, { removed: false });
      }
    }
    if (node === null) return null;

    updateHeight(node);
    const bal = balance(node);

    if (bal > 1 && balance(node.left) >= 0) {
      this.lastOps.push({ type: 'case', name: 'LL', nodeId: node.id });
      return this._rightRotate(node);
    }
    if (bal > 1 && balance(node.left) < 0) {
      this.lastOps.push({ type: 'case', name: 'LR', nodeId: node.id });
      node.left = this._leftRotate(node.left);
      return this._rightRotate(node);
    }
    if (bal < -1 && balance(node.right) <= 0) {
      this.lastOps.push({ type: 'case', name: 'RR', nodeId: node.id });
      return this._leftRotate(node);
    }
    if (bal < -1 && balance(node.right) > 0) {
      this.lastOps.push({ type: 'case', name: 'RL', nodeId: node.id });
      node.right = this._rightRotate(node.right);
      return this._leftRotate(node);
    }
    return node;
  }

  search(value) {
    const v = Number(value);
    const path = [];
    let cur = this.root;
    while (cur) {
      path.push(cur.id);
      if (v === cur.data) return { found: true, path, id: cur.id };
      cur = v < cur.data ? cur.left : cur.right;
    }
    return { found: false, path };
  }

  inOrder() {
    const out = [];
    (function walk(n) { if (!n) return; walk(n.left); out.push(n.data); walk(n.right); })(this.root);
    return out;
  }

  height(node = this.root) { return h(node); }

  count(node = this.root) {
    if (!node) return 0;
    return 1 + this.count(node.left) + this.count(node.right);
  }

  /** Розмітка координат вузлів для рендеру у SVG (in-order layout). */
  layout(width = 720, levelHeight = 70, paddingX = 24) {
    const nodes = [];
    const edges = [];
    if (!this.root) return { nodes, edges, width, height: 80 };

    let idx = 0;
    const positions = new Map();
    const walk = (n, d) => {
      if (!n) return;
      walk(n.left, d + 1);
      positions.set(n.id, { x: idx++, y: d, balance: balance(n), height: n.height });
      walk(n.right, d + 1);
    };
    walk(this.root, 0);

    const total = positions.size;
    const stepX = total > 1 ? (width - paddingX * 2) / (total - 1) : 0;

    const collect = (node) => {
      if (!node) return;
      const p = positions.get(node.id);
      const x = paddingX + (total === 1 ? (width - paddingX * 2) / 2 : p.x * stepX);
      const y = 40 + p.y * levelHeight;
      nodes.push({ id: node.id, data: node.data, x, y, balance: p.balance, height: p.height });
      for (const child of [node.left, node.right]) {
        if (child) {
          const cp = positions.get(child.id);
          edges.push({
            from: node.id,
            to: child.id,
            x1: x, y1: y,
            x2: paddingX + (total === 1 ? (width - paddingX * 2) / 2 : cp.x * stepX),
            y2: 40 + cp.y * levelHeight,
          });
          collect(child);
        }
      }
    };
    collect(this.root);

    return { nodes, edges, width, height: Math.max(80, 80 + this.height() * levelHeight) };
  }

  clear() {
    this.root = null;
    this.lastOps = [];
  }
}
