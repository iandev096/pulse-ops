/**
 * Generic ring buffer (circular buffer) with fixed capacity and FIFO eviction.
 *
 * - O(1) push (even when full — overwrites oldest)
 * - O(n) iteration (oldest→newest or newest→oldest)
 * - Fixed memory footprint
 */
export class RingBuffer<T> {
  private buf: (T | undefined)[];
  private head = 0; // index of oldest element
  private _size = 0;

  constructor(private readonly _capacity: number) {
    if (_capacity <= 0) {
      throw new Error("RingBuffer capacity must be > 0");
    }
    this.buf = new Array<T | undefined>(_capacity);
  }

  /**
   * Maximum number of items the buffer can hold.
   */
  get capacity(): number {
    return this._capacity;
  }

  /**
   * Current number of items in the buffer.
   */
  get size(): number {
    return this._size;
  }

  /**
   * Whether the buffer is at full capacity.
   */
  get isFull(): boolean {
    return this._size === this._capacity;
  }

  /**
   * Pushes an item into the buffer.
   * If full, the oldest item is overwritten (FIFO eviction).
   */
  push(item: T): void {
    if (this._size < this._capacity) {
      // Not full: write at tail
      const tail = (this.head + this._size) % this._capacity;
      this.buf[tail] = item;
      this._size++;
    } else {
      // Full: overwrite oldest at head, advance head
      this.buf[this.head] = item;
      this.head = (this.head + 1) % this._capacity;
    }
  }

  /**
   * Returns items in order from oldest to newest.
   */
  toArrayOldestFirst(): T[] {
    const out: T[] = [];
    for (let i = 0; i < this._size; i++) {
      const idx = (this.head + i) % this._capacity;
      const item = this.buf[idx];
      if (item !== undefined) {
        out.push(item);
      }
    }
    return out;
  }

  /**
   * Returns items in order from newest to oldest.
   */
  toArrayNewestFirst(): T[] {
    const out: T[] = [];
    const tail = (this.head + this._size) % this._capacity;
    for (let i = 0; i < this._size; i++) {
      const idx = (tail - 1 - i + this._capacity) % this._capacity;
      const item = this.buf[idx];
      if (item !== undefined) {
        out.push(item);
      }
    }
    return out;
  }

  /**
   * Iterates from newest to oldest, calling the callback for each item.
   * If callback returns `false`, iteration stops early.
   */
  forEachNewestFirst(
    callback: (item: T, index: number) => boolean | void
  ): void {
    const tail = (this.head + this._size) % this._capacity;
    for (let i = 0; i < this._size; i++) {
      const idx = (tail - 1 - i + this._capacity) % this._capacity;
      const item = this.buf[idx];
      if (item !== undefined) {
        const result = callback(item, i);
        if (result === false) break;
      }
    }
  }

  /**
   * Iterates from oldest to newest, calling the callback for each item.
   * If callback returns `false`, iteration stops early.
   */
  forEachOldestFirst(
    callback: (item: T, index: number) => boolean | void
  ): void {
    for (let i = 0; i < this._size; i++) {
      const idx = (this.head + i) % this._capacity;
      const item = this.buf[idx];
      if (item !== undefined) {
        const result = callback(item, i);
        if (result === false) break;
      }
    }
  }

  /**
   * Clears all items from the buffer.
   */
  clear(): void {
    this.buf = new Array<T | undefined>(this._capacity);
    this.head = 0;
    this._size = 0;
  }
}
