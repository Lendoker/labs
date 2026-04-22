/**
 * @file singlyLinkedList.js
 * @description Однозв'язний список з основними операціями: Insert (head/tail),
 *   Display, Remove, Search, Reverse, Count. Реалізовано на базі вузлів з полем
 *   next і унікальним id для стабільної візуалізації.
 */

let __nodeIdCounter = 1;

function createNode(value) {
  return { id: __nodeIdCounter++, data: Number(value), next: null };
}

export class SinglyLinkedList {
  constructor() {
    this.head = null;
    this.length = 0;
  }

  /** Вставка у початок списку (класичний Insert з методички). */
  insertHead(value) {
    const node = createNode(value);
    node.next = this.head;
    this.head = node;
    this.length++;
    return node;
  }

  /** Вставка у кінець списку. */
  insertTail(value) {
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

  /**
   * Видалення першого вузла зі значенням value.
   * @returns {{removed: boolean, position: number}}
   */
  remove(value) {
    const v = Number(value);
    if (!this.head) return { removed: false, position: -1 };
    if (this.head.data === v) {
      this.head = this.head.next;
      this.length--;
      return { removed: true, position: 0 };
    }
    let cur = this.head;
    let pos = 0;
    while (cur.next) {
      if (cur.next.data === v) {
        cur.next = cur.next.next;
        this.length--;
        return { removed: true, position: pos + 1 };
      }
      cur = cur.next;
      pos++;
    }
    return { removed: false, position: -1 };
  }

  /**
   * Пошук елемента. Повертає кількість кроків і позицію.
   * @returns {{found: boolean, position: number, steps: number}}
   */
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

  /** Реверс списку in-place. */
  reverse() {
    let prev = null;
    let cur = this.head;
    while (cur) {
      const nxt = cur.next;
      cur.next = prev;
      prev = cur;
      cur = nxt;
    }
    this.head = prev;
  }

  /** Кількість елементів (підрахунок обходом). */
  count() {
    let n = 0;
    let cur = this.head;
    while (cur) {
      n++;
      cur = cur.next;
    }
    return n;
  }

  /** Перетворення на масив значень для виведення. */
  toArray() {
    const arr = [];
    let cur = this.head;
    while (cur) {
      arr.push(cur.data);
      cur = cur.next;
    }
    return arr;
  }

  /** Масив {id, data} для стабільного рендеру. */
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
