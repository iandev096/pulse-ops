/**
 * In-memory event store using a ring buffer for fixed capacity + FIFO eviction.
 *
 * - Validates all inserts against `EventSchema`
 * - Supports time-window queries (newest → oldest)
 * - Configurable capacity via env (default 200,000)
 */

import { type Event, EventSchema } from "shared";
import { RingBuffer } from "./ringBuffer.js";

/**
 * Default store capacity (200k events).
 */
export const DEFAULT_CAPACITY = 400_000;

/**
 * Get capacity from environment or use default.
 */
function getCapacityFromEnv(): number {
  const envVal = process.env.EVENT_STORE_CAPACITY;
  if (envVal) {
    const parsed = parseInt(envVal, 10);
    if (!isNaN(parsed) && parsed > 0) {
      return parsed;
    }
  }
  return DEFAULT_CAPACITY;
}

/**
 * In-memory event store with ring buffer backing.
 */
export class EventStore {
  private events: RingBuffer<Event>;

  constructor(capacity: number = getCapacityFromEnv()) {
    this.events = new RingBuffer<Event>(capacity);
  }

  /**
   * Current number of events in the store.
   */
  get size(): number {
    return this.events.size;
  }

  /**
   * Maximum capacity of the store.
   */
  get capacity(): number {
    return this.events.capacity;
  }

  /**
   * Appends an event to the store after validating against schema.
   * If the store is full, the oldest event is evicted (FIFO).
   *
   * @param event - The event data (will be validated)
   * @returns The validated Event that was stored
   * @throws ZodError if validation fails
   */
  append(event: unknown): Event {
    const validated = EventSchema.parse(event);
    this.events.push(validated);
    return validated;
  }

  /**
   * Returns events with timestamp >= sinceMs, newest first.
   * Stops early once timestamps fall below sinceMs.
   *
   * @param sinceMs - Unix timestamp (ms) — return events >= this time
   * @param limit - Maximum number of events to return (default: Infinity)
   */
  getSince(sinceMs: number, limit: number = Infinity): Event[] {
    const out: Event[] = [];

    this.events.forEachNewestFirst((event) => {
      if (event.timestamp < sinceMs) {
        // Stop early: all remaining events are older
        return false;
      }
      out.push(event);
      if (out.length >= limit) {
        return false;
      }
    });

    return out;
  }

  /**
   * Returns events within a time window, newest first.
   * Equivalent to `getSince(nowMs - windowMs, limit)`.
   *
   * @param nowMs - Current Unix timestamp (ms)
   * @param windowMs - Window size in milliseconds (e.g., 5 * 60 * 1000 for 5m)
   * @param limit - Maximum number of events to return (default: Infinity)
   */
  getWindow(
    nowMs: number,
    windowMs: number,
    limit: number = Infinity
  ): Event[] {
    const sinceMs = nowMs - windowMs;
    return this.getSince(sinceMs, limit);
  }

  /**
   * Returns all events, newest first.
   *
   * @param limit - Maximum number of events to return (default: Infinity)
   */
  getAll(limit: number = Infinity): Event[] {
    if (limit >= this.events.size) {
      return this.events.toArrayNewestFirst();
    }

    const out: Event[] = [];
    this.events.forEachNewestFirst((event) => {
      out.push(event);
      if (out.length >= limit) {
        return false;
      }
    });
    return out;
  }

  /**
   * Clears all events from the store.
   */
  clear(): void {
    this.events.clear();
  }
}

/**
 * Singleton event store instance.
 * Use this for the main application store.
 */
export const eventStore = new EventStore();
