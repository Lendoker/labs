/**
 * @file hashMapTable.js
 * @description Проста навчальна hashMapTable з ланцюжками (separate chaining).
 */

/**
 * Навчальна хеш-таблиця для пар ключ-значення.
 * Підтримує:
 * - Insert
 * - SearchKey
 * - Remove
 * - зміну хеш-функції
 * - автоматичне розширення таблиці
 */
export class hashMapTable {
  constructor(initialCapacity = 8, hashFunctionName = 'sum') {
    this.capacity = Math.max(4, initialCapacity);
    this.size = 0;
    this.collisionCount = 0;
    this.resizeCount = 0;
    this.hashFunctionName = hashFunctionName;
    this.buckets = Array.from({ length: this.capacity }, () => []);
  }

  // --- Хеш-функції ---
  static hashSum(key) {
    const s = String(key);
    let h = 0;
    for (let i = 0; i < s.length; i++) h += s.charCodeAt(i);
    return h;
  }

  static hashDjb2(key) {
    const s = String(key);
    let h = 5381;
    for (let i = 0; i < s.length; i++) h = ((h << 5) + h) + s.charCodeAt(i);
    return h >>> 0;
  }

  static hashPolynomial(key) {
    const s = String(key);
    let h = 0;
    const p = 31;
    for (let i = 0; i < s.length; i++) h = (h * p + s.charCodeAt(i)) >>> 0;
    return h;
  }

  _getHashValue(key) {
    if (this.hashFunctionName === 'djb2') return hashMapTable.hashDjb2(key);
    if (this.hashFunctionName === 'poly') return hashMapTable.hashPolynomial(key);
    return hashMapTable.hashSum(key);
  }

  _index(key) {
    return this._getHashValue(key) % this.capacity;
  }

  setHashFunction(name) {
    this.hashFunctionName = ['sum', 'djb2', 'poly'].includes(name) ? name : 'sum';
    // Перехешовуємо всі елементи при зміні функції.
    const allEntries = this.entries();
    this.buckets = Array.from({ length: this.capacity }, () => []);
    this.size = 0;
    for (const { key, value } of allEntries) this._insertInternal(key, value, false);
  }

  _insertInternal(key, value, allowResize = true) {
    const idx = this._index(key);
    const bucket = this.buckets[idx];

    for (let i = 0; i < bucket.length; i++) {
      if (bucket[i].key === key) {
        bucket[i].value = value;
        return { action: 'updated', bucketIndex: idx, collision: false };
      }
    }

    if (bucket.length > 0) this.collisionCount++;
    bucket.push({ key, value });
    this.size++;

    if (allowResize && this.loadFactor() > 0.75) {
      this._resize(this.capacity * 2);
      return { action: 'inserted_resized', bucketIndex: idx, collision: bucket.length > 1 };
    }
    return { action: 'inserted', bucketIndex: idx, collision: bucket.length > 1 };
  }

  insert(key, value) {
    return this._insertInternal(String(key), String(value), true);
  }

  searchKey(key) {
    const idx = this._index(key);
    const bucket = this.buckets[idx];
    let probes = 0;
    for (const pair of bucket) {
      probes++;
      if (pair.key === String(key)) {
        return { found: true, value: pair.value, bucketIndex: idx, probes };
      }
    }
    return { found: false, value: null, bucketIndex: idx, probes };
  }

  remove(key) {
    const idx = this._index(key);
    const bucket = this.buckets[idx];
    for (let i = 0; i < bucket.length; i++) {
      if (bucket[i].key === String(key)) {
        bucket.splice(i, 1);
        this.size--;
        return { removed: true, bucketIndex: idx };
      }
    }
    return { removed: false, bucketIndex: idx };
  }

  _resize(newCapacity) {
    const oldEntries = this.entries();
    this.capacity = newCapacity;
    this.buckets = Array.from({ length: this.capacity }, () => []);
    this.size = 0;
    this.resizeCount++;
    for (const { key, value } of oldEntries) this._insertInternal(key, value, false);
  }

  entries() {
    return this.buckets.flatMap((bucket) => bucket.map((e) => ({ ...e })));
  }

  loadFactor() {
    return this.capacity === 0 ? 0 : this.size / this.capacity;
  }

  getStats() {
    const nonEmptyBuckets = this.buckets.filter((b) => b.length > 0).length;
    const maxChain = this.buckets.reduce((m, b) => Math.max(m, b.length), 0);
    return {
      size: this.size,
      capacity: this.capacity,
      loadFactor: this.loadFactor(),
      collisions: this.collisionCount,
      resizeCount: this.resizeCount,
      nonEmptyBuckets,
      maxChain,
      hashFunctionName: this.hashFunctionName,
    };
  }

  /**
   * Порівнює розподіл ключів для доступних хеш-функцій.
   * @returns {{sum: Object, djb2: Object, poly: Object}}
   */
  compareHashFunctions() {
    const keys = this.entries().map((e) => e.key);
    const evaluate = (fnName) => {
      const counts = Array.from({ length: this.capacity }, () => 0);
      for (const key of keys) {
        let h = 0;
        if (fnName === 'djb2') h = hashMapTable.hashDjb2(key);
        else if (fnName === 'poly') h = hashMapTable.hashPolynomial(key);
        else h = hashMapTable.hashSum(key);
        counts[h % this.capacity]++;
      }
      const used = counts.filter((c) => c > 0).length;
      const max = counts.reduce((m, c) => Math.max(m, c), 0);
      const collisions = counts.reduce((acc, c) => acc + Math.max(0, c - 1), 0);
      return { usedBuckets: used, maxChain: max, collisions };
    };
    return {
      sum: evaluate('sum'),
      djb2: evaluate('djb2'),
      poly: evaluate('poly'),
    };
  }
}
