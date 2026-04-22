/**
 * @file queueList.js
 * @description Черга на базі однозв'язного списку з окремими вказівниками
 *   front (початок) і rear (кінець). Операції: enqueue, dequeue, peek, min, max.
 */

let __qNodeId = 1;

function createNode(value) {
  return { id: __qNodeId++, data: Number(value), next: null };
}

export class ListQueue {
  constructor() {
    this.front = null;
    this.rear = null;
    this.length = 0;
  }

  isEmpty() {
    return this.front === null;
  }

  enqueue(value) {
    const node = createNode(value);
    if (!this.front) {
      this.front = this.rear = node;
    } else {
      this.rear.next = node;
      this.rear = node;
    }
    this.length++;
    return { ok: true };
  }

  dequeue() {
    if (!this.front) return { ok: false, reason: 'empty' };
    const value = this.front.data;
    this.front = this.front.next;
    if (!this.front) this.rear = null;
    this.length--;
    return { ok: true, value };
  }

  peek() {
    if (!this.front) return { ok: false, reason: 'empty' };
    return { ok: true, value: this.front.data };
  }

  min() {
    if (!this.front) return null;
    let m = Infinity;
    let cur = this.front;
    while (cur) {
      if (cur.data < m) m = cur.data;
      cur = cur.next;
    }
    return m;
  }

  max() {
    if (!this.front) return null;
    let m = -Infinity;
    let cur = this.front;
    while (cur) {
      if (cur.data > m) m = cur.data;
      cur = cur.next;
    }
    return m;
  }

  toNodesArray() {
    const arr = [];
    let cur = this.front;
    while (cur) {
      arr.push({ id: cur.id, data: cur.data });
      cur = cur.next;
    }
    return arr;
  }

  clear() {
    this.front = this.rear = null;
    this.length = 0;
  }
}
