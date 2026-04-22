/**
 * @file priorityQueue.js
 * @description Пріоритетна черга на базі однозв'язного списку.
 *   Список підтримується впорядкованим за спаданням пріоритету, тож
 *   вилучення елемента з найвищим пріоритетом — це завжди голова.
 */

let __pNodeId = 1;

function createNode(value, priority) {
  return { id: __pNodeId++, data: Number(value), priority: Number(priority), next: null };
}

export class PriorityQueue {
  constructor() {
    this.head = null;
    this.length = 0;
  }

  isEmpty() {
    return this.head === null;
  }

  /**
   * Вставка з урахуванням пріоритету. Новий елемент стає головою, якщо його
   * пріоритет > пріоритет поточної голови. В іншому випадку виконується обхід
   * до позиції, де priority наступного вузла менший за pr.
   */
  push(value, priority) {
    const node = createNode(value, priority);
    if (!this.head || node.priority > this.head.priority) {
      node.next = this.head;
      this.head = node;
    } else {
      let cur = this.head;
      while (cur.next && cur.next.priority >= node.priority) cur = cur.next;
      node.next = cur.next;
      cur.next = node;
    }
    this.length++;
    return node;
  }

  /** Вилучення елемента з найвищим пріоритетом (голова). */
  pop() {
    if (!this.head) return { ok: false, reason: 'empty' };
    const { data, priority } = this.head;
    this.head = this.head.next;
    this.length--;
    return { ok: true, value: data, priority };
  }

  /** Перегляд елемента з найвищим пріоритетом. */
  top() {
    if (!this.head) return { ok: false, reason: 'empty' };
    return { ok: true, value: this.head.data, priority: this.head.priority };
  }

  toNodesArray() {
    const arr = [];
    let cur = this.head;
    while (cur) {
      arr.push({ id: cur.id, data: cur.data, priority: cur.priority });
      cur = cur.next;
    }
    return arr;
  }

  clear() {
    this.head = null;
    this.length = 0;
  }
}
