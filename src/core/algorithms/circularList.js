/**
 * @file circularList.js
 * @description Кільцевий однозв'язний список. Останній елемент посилається на
 *   голову. Обхід виконується через do...while від голови до голови.
 */

let __cNodeId = 1;

function createNode(value) {
  return { id: __cNodeId++, data: Number(value), next: null };
}

export class CircularList {
  constructor() {
    this.head = null;
    this.length = 0;
  }

  /** Вставка у "кінець" кільця (перед головою). */
  insertBack(value) {
    const node = createNode(value);
    if (!this.head) {
      this.head = node;
      node.next = node;
    } else {
      let cur = this.head;
      while (cur.next !== this.head) cur = cur.next;
      cur.next = node;
      node.next = this.head;
    }
    this.length++;
    return node;
  }

  /**
   * Видалення першого входження значення.
   * @returns {{removed: boolean, position: number}}
   */
  remove(value) {
    const v = Number(value);
    if (!this.head) return { removed: false, position: -1 };

    if (this.head.data === v) {
      if (this.head.next === this.head) {
        this.head = null;
      } else {
        let last = this.head;
        while (last.next !== this.head) last = last.next;
        this.head = this.head.next;
        last.next = this.head;
      }
      this.length--;
      return { removed: true, position: 0 };
    }

    let cur = this.head;
    let pos = 0;
    do {
      if (cur.next.data === v && cur.next !== this.head) {
        cur.next = cur.next.next;
        this.length--;
        return { removed: true, position: pos + 1 };
      }
      cur = cur.next;
      pos++;
    } while (cur !== this.head);

    return { removed: false, position: -1 };
  }

  toArray() {
    const arr = [];
    if (!this.head) return arr;
    let cur = this.head;
    do {
      arr.push({ id: cur.id, data: cur.data });
      cur = cur.next;
    } while (cur !== this.head);
    return arr;
  }

  clear() {
    this.head = null;
    this.length = 0;
  }
}
