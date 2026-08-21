/**
 * SeededRandom — PRNG reproducible basado en Mulberry32
 * Garantiza que la misma seed produce el mismo mundo
 */
export class SeededRandom {
  constructor(seed) {
    this.seed = typeof seed === 'string' ? this._hashStr(seed) : seed;
    this._state = this.seed;
  }

  _hashStr(str) {
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
    return h >>> 0;
  }

  /** Devuelve un float [0, 1) */
  next() {
    let t = this._state += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /** Int en rango [min, max] */
  int(min, max) {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  /** Float en rango [min, max] */
  float(min, max) {
    return this.next() * (max - min) + min;
  }

  /** Elige un elemento aleatorio de un array */
  pick(arr) {
    return arr[this.int(0, arr.length - 1)];
  }

  /** Baraja array (Fisher-Yates) */
  shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = this.int(0, i);
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  /** Bool con probabilidad p [0,1] */
  chance(p) {
    return this.next() < p;
  }

  reset() {
    this._state = this.seed;
  }
}
