/**
 * @file queueArray.js
 * @description Черга на базі масиву. Дві реалізації:
 *   - ArrayQueue — проста лінійна черга з front/rear;
 *   - CircularArrayQueue — кільцева черга з повторним використанням слотів.
 */

export class ArrayQueue {
  constructor(maxSize = 10) {
    this.maxSize = Math.max(2, maxSize);
    this.data = new Array(this.maxSize).fill(null);
    this.front = -1;
    this.rear = -1;
  }

  isEmpty() {
    return this.front === -1;
  }

  /** Черга переповнена, коли хвіст досяг кінця масиву (лінійна реалізація). */
  isFull() {
    return this.rear === this.maxSize - 1;
  }

  enqueue(value) {
    if (this.isFull()) return { ok: false, reason: 'overflow' };
    if (this.front === -1) this.front = 0;
    this.rear++;
    this.data[this.rear] = Number(value);
    return { ok: true, index: this.rear };
  }

  dequeue() {
    if (this.isEmpty()) return { ok: false, reason: 'empty' };
    const value = this.data[this.front];
    this.data[this.front] = null;
    if (this.front === this.rear) {
      this.front = this.rear = -1;
    } else {
      this.front++;
    }
    return { ok: true, value };
  }

  peek() {
    if (this.isEmpty()) return { ok: false, reason: 'empty' };
    return { ok: true, value: this.data[this.front] };
  }

  min() {
    if (this.isEmpty()) return null;
    let m = Infinity;
    for (let i = this.front; i <= this.rear; i++) if (this.data[i] < m) m = this.data[i];
    return m;
  }

  max() {
    if (this.isEmpty()) return null;
    let m = -Infinity;
    for (let i = this.front; i <= this.rear; i++) if (this.data[i] > m) m = this.data[i];
    return m;
  }

  /** @returns {Array<{index:number, value:(number|null), role:('front'|'rear'|'active'|'empty')}>} */
  snapshot() {
    return this.data.map((value, index) => {
      let role = 'empty';
      if (this.isEmpty()) role = 'empty';
      else if (index === this.front && index === this.rear) role = 'active';
      else if (index === this.front) role = 'front';
      else if (index === this.rear) role = 'rear';
      else if (index > this.front && index < this.rear) role = 'active';
      return { index, value, role };
    });
  }

  toArray() {
    if (this.isEmpty()) return [];
    return this.data.slice(this.front, this.rear + 1);
  }

  clear() {
    this.data = new Array(this.maxSize).fill(null);
    this.front = -1;
    this.rear = -1;
  }
}

export class CircularArrayQueue {
  constructor(maxSize = 8) {
    this.maxSize = Math.max(2, maxSize);
    this.data = new Array(this.maxSize).fill(null);
    this.front = -1;
    this.rear = -1;
    this.count = 0;
  }

  isEmpty() {
    return this.count === 0;
  }

  isFull() {
    return this.count === this.maxSize;
  }

  enqueue(value) {
    if (this.isFull()) return { ok: false, reason: 'overflow' };
    if (this.isEmpty()) this.front = 0;
    this.rear = (this.rear + 1) % this.maxSize;
    this.data[this.rear] = Number(value);
    this.count++;
    return { ok: true, index: this.rear };
  }

  dequeue() {
    if (this.isEmpty()) return { ok: false, reason: 'empty' };
    const value = this.data[this.front];
    this.data[this.front] = null;
    this.count--;
    if (this.count === 0) {
      this.front = this.rear = -1;
    } else {
      this.front = (this.front + 1) % this.maxSize;
    }
    return { ok: true, value };
  }

  peek() {
    if (this.isEmpty()) return { ok: false, reason: 'empty' };
    return { ok: true, value: this.data[this.front] };
  }

  /** Слоти масиву з позначками front/rear для візуалізації. */
  snapshot() {
    return this.data.map((value, index) => {
      const hasValue = value !== null && !this.isEmpty() && (
        this.front <= this.rear
          ? index >= this.front && index <= this.rear
          : index >= this.front || index <= this.rear
      );
      let role = 'empty';
      if (!hasValue) role = 'empty';
      else if (index === this.front && index === this.rear) role = 'active';
      else if (index === this.front) role = 'front';
      else if (index === this.rear) role = 'rear';
      else role = 'active';
      return { index, value: hasValue ? value : null, role };
    });
  }

  clear() {
    this.data = new Array(this.maxSize).fill(null);
    this.front = this.rear = -1;
    this.count = 0;
  }
}
