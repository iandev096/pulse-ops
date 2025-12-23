/**
 * Seeded pseudo-random number generator utilities.
 *
 * Uses the mulberry32 algorithm for deterministic, reproducible sequences.
 * All helpers take an RNG instance so they remain pure and testable.
 */

/**
 * Creates a seeded PRNG using the mulberry32 algorithm.
 * Returns a function that produces floats in [0, 1) on each call.
 *
 * @param seed - Integer seed value
 * @returns A function that returns the next random float in [0, 1)
 */
export function createRng(seed: number): () => number {
  let state = seed >>> 0; // Ensure unsigned 32-bit integer

  return function nextFloat(): number {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * RNG helper class wrapping a seeded PRNG with convenience methods.
 */
export class Rng {
  private nextFloat: () => number;

  constructor(seed: number) {
    this.nextFloat = createRng(seed);
  }

  /**
   * Returns a random float in [0, 1).
   */
  float(): number {
    return this.nextFloat();
  }

  /**
   * Returns a random integer in [min, max] (inclusive).
   */
  int(min: number, max: number): number {
    return Math.floor(this.nextFloat() * (max - min + 1)) + min;
  }

  /**
   * Returns a random float in [min, max).
   */
  range(min: number, max: number): number {
    return this.nextFloat() * (max - min) + min;
  }

  /**
   * Picks a random element from an array.
   */
  pick<T>(array: readonly T[]): T {
    if (array.length === 0) {
      throw new Error("Cannot pick from empty array");
    }
    return array[this.int(0, array.length - 1)];
  }

  /**
   * Picks an element based on weights.
   * Higher weight = higher probability of selection.
   *
   * @param options - Array of { value, weight } objects
   * @returns The selected value
   */
  weightedPick<T>(options: readonly { value: T; weight: number }[]): T {
    if (options.length === 0) {
      throw new Error("Cannot pick from empty options");
    }

    const totalWeight = options.reduce((sum, opt) => sum + opt.weight, 0);
    if (totalWeight <= 0) {
      throw new Error("Total weight must be positive");
    }

    let random = this.nextFloat() * totalWeight;

    for (const option of options) {
      random -= option.weight;
      if (random < 0) {
        return option.value;
      }
    }

    // Fallback to last option (handles floating point edge cases)
    return options[options.length - 1].value;
  }

  /**
   * Returns true with the given probability (0-1).
   */
  chance(probability: number): boolean {
    return this.nextFloat() < probability;
  }

  /**
   * Generates a deterministic UUID-like string from RNG state.
   * Format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx (v4-like)
   */
  uuid(): string {
    const hex = (n: number, len: number): string =>
      Math.floor(n * 16 ** len)
        .toString(16)
        .padStart(len, "0");

    return [
      hex(this.nextFloat(), 8),
      hex(this.nextFloat(), 4),
      "4" + hex(this.nextFloat(), 3),
      (Math.floor(this.nextFloat() * 4) + 8).toString(16) +
        hex(this.nextFloat(), 3),
      hex(this.nextFloat(), 12),
    ].join("-");
  }
}

/**
 * Default seed from environment or fallback.
 */
export const DEFAULT_SEED = parseInt(process.env.RNG_SEED ?? "42", 10);
