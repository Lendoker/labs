/**
 * @file stackArray.js
 * @description Стек на базі масиву фіксованого розміру (MAX_SIZE).
 *   Операції: push, pop, peek, isEmpty, isFull, sum, average, search.
 */

export class ArrayStack {
  constructor(maxSize = 10) {
    this.maxSize = Math.max(2, maxSize);
    this.data = [];
  }

  get top() {
    return this.data.length - 1;
  }

  isEmpty() {
    return this.data.length === 0;
  }

  isFull() {
    return this.data.length >= this.maxSize;
  }

  push(value) {
    if (this.isFull()) return { ok: false, reason: 'overflow' };
    this.data.push(Number(value));
    return { ok: true, top: this.top };
  }

  pop() {
    if (this.isEmpty()) return { ok: false, reason: 'empty' };
    const value = this.data.pop();
    return { ok: true, value };
  }

  peek() {
    if (this.isEmpty()) return { ok: false, reason: 'empty' };
    return { ok: true, value: this.data[this.top] };
  }

  /** Пошук значення — повертає позицію від вершини (0 = top). */
  search(value) {
    const v = Number(value);
    for (let i = this.data.length - 1; i >= 0; i--) {
      if (this.data[i] === v) return { found: true, fromTop: this.data.length - 1 - i, index: i };
    }
    return { found: false, fromTop: -1, index: -1 };
  }

  sum() {
    return this.data.reduce((a, b) => a + b, 0);
  }

  average() {
    return this.data.length ? this.sum() / this.data.length : 0;
  }

  toArray() {
    return [...this.data];
  }

  /** Серіалізація у текстовий формат для "збереження у файл". */
  serialize() {
    return this.data.join(', ');
  }

  /** Завантаження зі строки значень через кому. */
  load(text) {
    const values = String(text)
      .split(/[,\s]+/)
      .map((s) => s.trim())
      .filter(Boolean)
      .map(Number)
      .filter((n) => Number.isFinite(n));
    this.data = values.slice(0, this.maxSize);
    return this.data.length;
  }

  clear() {
    this.data = [];
  }
}
