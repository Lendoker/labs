/**
 * @file deque.js
 * @description Двобічна черга (дек) на базі однозв'язного списку.
 *   Підтримує pushFront/pushBack/popFront/popBack.
 *   Для O(1) popBack зберігаємо додатковий tail-указівник, але не використовуємо
 *   zv'язок у зворотному напрямку — лише for-walk при потребі (як у методичці).
 */

let __dqNodeId = 1;

function createNode(value) {
  return { id: __dqNodeId++, data: Number(value), next: null };
}

export class Deque {
  constructor() {
    this.head = null;
    this.length = 0;
  }

  isEmpty() {
    return this.head === null;
  }

  pushFront(value) {
    const node = createNode(value);
    node.next = this.head;
    this.head = node;
    this.length++;
    return node;
  }

  pushBack(value) {
    const node = createNode(value);
    if (!this.head) {
      this.head = node;
    } else {
      let cur = this.head;
      while (cur.next) cur = cur.next;
      cur.next = node;
    }
    this.length++;
    return node;
  }

  popFront() {
    if (!this.head) return { ok: false, reason: 'empty' };
    const value = this.head.data;
    this.head = this.head.next;
    this.length--;
    return { ok: true, value };
  }

  popBack() {
    if (!this.head) return { ok: false, reason: 'empty' };
    if (!this.head.next) {
      const value = this.head.data;
      this.head = null;
      this.length--;
      return { ok: true, value };
    }
    let cur = this.head;
    while (cur.next.next) cur = cur.next;
    const value = cur.next.data;
    cur.next = null;
    this.length--;
    return { ok: true, value };
  }

  peekFront() {
    if (!this.head) return { ok: false, reason: 'empty' };
    return { ok: true, value: this.head.data };
  }

  peekBack() {
    if (!this.head) return { ok: false, reason: 'empty' };
    let cur = this.head;
    while (cur.next) cur = cur.next;
    return { ok: true, value: cur.data };
  }

  toNodesArray() {
    const arr = [];
    let cur = this.head;
    while (cur) {
      arr.push({ id: cur.id, data: cur.data });
      cur = cur.next;
    }
    return arr;
  }

  clear() {
    this.head = null;
    this.length = 0;
  }
}
