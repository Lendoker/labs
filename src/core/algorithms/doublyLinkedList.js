/**
 * @file doublyLinkedList.js
 * @description Двозв'язний список з операціями InsertFront/InsertBack,
 *   DeleteFirst/DeleteLast, Display (прямий та зворотній напрям), Search.
 */

let __dNodeId = 1;

function createNode(value) {
  return { id: __dNodeId++, data: Number(value), prev: null, next: null };
}

export class DoublyLinkedList {
  constructor() {
    this.head = null;
    this.tail = null;
    this.length = 0;
  }

  insertFront(value) {
    const node = createNode(value);
    if (!this.head) {
      this.head = this.tail = node;
    } else {
      node.next = this.head;
      this.head.prev = node;
      this.head = node;
    }
    this.length++;
    return node;
  }

  insertBack(value) {
    const node = createNode(value);
    if (!this.tail) {
      this.head = this.tail = node;
    } else {
      node.prev = this.tail;
      this.tail.next = node;
      this.tail = node;
    }
    this.length++;
    return node;
  }

  deleteFirst() {
    if (!this.head) return { removed: false };
    const removedValue = this.head.data;
    this.head = this.head.next;
    if (this.head) this.head.prev = null;
    else this.tail = null;
    this.length--;
    return { removed: true, value: removedValue };
  }

  deleteLast() {
    if (!this.tail) return { removed: false };
    const removedValue = this.tail.data;
    this.tail = this.tail.prev;
    if (this.tail) this.tail.next = null;
    else this.head = null;
    this.length--;
    return { removed: true, value: removedValue };
  }

  search(value) {
    const v = Number(value);
    let cur = this.head;
    let pos = 0;
    let steps = 0;
    while (cur) {
      steps++;
      if (cur.data === v) return { found: true, position: pos, steps };
      cur = cur.next;
      pos++;
    }
    return { found: false, position: -1, steps };
  }

  toForwardArray() {
    const arr = [];
    let cur = this.head;
    while (cur) {
      arr.push({ id: cur.id, data: cur.data });
      cur = cur.next;
    }
    return arr;
  }

  toReverseArray() {
    const arr = [];
    let cur = this.tail;
    while (cur) {
      arr.push({ id: cur.id, data: cur.data });
      cur = cur.prev;
    }
    return arr;
  }

  clear() {
    this.head = this.tail = null;
    this.length = 0;
  }
}
