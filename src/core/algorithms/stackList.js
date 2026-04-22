/**
 * @file stackList.js
 * @description Стек на базі однозв'язного списку. Вершина стеку — голова списку.
 *   Операції: push, pop, peek, isEmpty, search, sum, average.
 */

let __sNodeId = 1;

function createNode(value) {
  return { id: __sNodeId++, data: Number(value), next: null };
}

export class ListStack {
  constructor() {
    this.top = null;
    this.length = 0;
  }

  isEmpty() {
    return this.top === null;
  }

  push(value) {
    const node = createNode(value);
    node.next = this.top;
    this.top = node;
    this.length++;
    return { ok: true };
  }

  pop() {
    if (!this.top) return { ok: false, reason: 'empty' };
    const value = this.top.data;
    this.top = this.top.next;
    this.length--;
    return { ok: true, value };
  }

  peek() {
    if (!this.top) return { ok: false, reason: 'empty' };
    return { ok: true, value: this.top.data };
  }

  search(value) {
    const v = Number(value);
    let cur = this.top;
    let fromTop = 0;
    while (cur) {
      if (cur.data === v) return { found: true, fromTop };
      cur = cur.next;
      fromTop++;
    }
    return { found: false, fromTop: -1 };
  }

  sum() {
    let s = 0;
    let cur = this.top;
    while (cur) {
      s += cur.data;
      cur = cur.next;
    }
    return s;
  }

  average() {
    return this.length ? this.sum() / this.length : 0;
  }

  /** Масив {id, data} — від вершини до дна. */
  toNodesArray() {
    const arr = [];
    let cur = this.top;
    while (cur) {
      arr.push({ id: cur.id, data: cur.data });
      cur = cur.next;
    }
    return arr;
  }

  serialize() {
    return this.toNodesArray().map((n) => n.data).reverse().join(', ');
  }

  load(text) {
    this.clear();
    const values = String(text)
      .split(/[,\s]+/)
      .map((s) => s.trim())
      .filter(Boolean)
      .map(Number)
      .filter((n) => Number.isFinite(n));
    for (const v of values) this.push(v);
    return this.length;
  }

  clear() {
    this.top = null;
    this.length = 0;
  }
}
