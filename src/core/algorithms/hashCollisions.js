/**
 * @file hashCollisions.js
 * @description Хеш-таблиця з двома методами розв'язання колізій: відкрита
 *   адресація (квадратичне пробування) та метод ланцюжків (separate chaining).
 *   Використовує мультиплікативну хеш-функцію.
 */

/**
 * Хеш-таблиця з підтримкою двох методів вирішення колізій.
 * Для обчислення індексу застосовується мультиплікативний метод:
 *   index = floor(size * frac(key * A)), де A = 0.618033.
 */
export class CollisionHashTable {
  constructor(size = 11, A = 0.618033) {
    this.size = Math.max(3, size);
    this.A = A;
    this.reset();
  }

  reset() {
    this.openSlots = Array.from({ length: this.size }, () => ({ used: false, key: null }));
    this.chainSlots = Array.from({ length: this.size }, () => []);
    this.openCollisions = 0;
    this.chainCollisions = 0;
  }

  hash(key) {
    const k = Number(key);
    const x = k * this.A;
    const frac = x - Math.floor(x);
    return Math.floor(this.size * frac);
  }

  /**
   * Вставка у відкриту адресацію з квадратичним пробуванням.
   * @returns {{inserted: boolean, index: number, attempts: number, probes: number[], collided: boolean}}
   */
  insertOpen(key) {
    const base = this.hash(key);
    const probes = [];
    let collided = false;
    for (let attempt = 0; attempt < this.size; attempt++) {
      const index = (base + attempt * attempt) % this.size;
      probes.push(index);
      if (!this.openSlots[index].used) {
        this.openSlots[index] = { used: true, key: Number(key) };
        if (attempt > 0) this.openCollisions++;
        return { inserted: true, index, attempts: attempt + 1, probes, collided };
      }
      if (this.openSlots[index].key === Number(key)) {
        return { inserted: false, index, attempts: attempt + 1, probes, collided, duplicate: true };
      }
      collided = true;
    }
    return { inserted: false, index: -1, attempts: this.size, probes, collided, full: true };
  }

  /**
   * Пошук у відкритій адресації.
   * @returns {{found: boolean, index: number, attempts: number, probes: number[]}}
   */
  searchOpen(key) {
    const base = this.hash(key);
    const probes = [];
    for (let attempt = 0; attempt < this.size; attempt++) {
      const index = (base + attempt * attempt) % this.size;
      probes.push(index);
      if (!this.openSlots[index].used) return { found: false, index, attempts: attempt + 1, probes };
      if (this.openSlots[index].key === Number(key)) return { found: true, index, attempts: attempt + 1, probes };
    }
    return { found: false, index: -1, attempts: this.size, probes };
  }

  /**
   * Вставка методом ланцюжків.
   * @returns {{inserted: boolean, index: number, collided: boolean}}
   */
  insertChain(key) {
    const index = this.hash(key);
    const bucket = this.chainSlots[index];
    if (bucket.includes(Number(key))) return { inserted: false, index, collided: false, duplicate: true };
    const collided = bucket.length > 0;
    bucket.push(Number(key));
    if (collided) this.chainCollisions++;
    return { inserted: true, index, collided };
  }

  /**
   * Пошук методом ланцюжків.
   * @returns {{found: boolean, index: number, probes: number}}
   */
  searchChain(key) {
    const index = this.hash(key);
    const bucket = this.chainSlots[index];
    let probes = 0;
    for (const v of bucket) {
      probes++;
      if (v === Number(key)) return { found: true, index, probes };
    }
    return { found: false, index, probes };
  }

  getStats() {
    const openUsed = this.openSlots.filter((s) => s.used).length;
    const chainUsed = this.chainSlots.filter((b) => b.length > 0).length;
    const chainMax = this.chainSlots.reduce((m, b) => Math.max(m, b.length), 0);
    return {
      size: this.size,
      openUsed,
      openCollisions: this.openCollisions,
      chainUsed,
      chainCollisions: this.chainCollisions,
      chainMax,
    };
  }
}
