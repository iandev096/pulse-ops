/**
 * Event generator with realistic, biased distributions.
 *
 * Implements the data generation logic from the spec:
 * - eventType: success≈85%, warning≈10%, error≈5% (with occasional spikes)
 * - latencyMs: baseline 50–200ms, 5–10% long-tail 1000–3000ms
 * - service/region: weighted distributions
 *
 * The `generateEvent(now)` function is pure — it uses a seeded RNG and
 * sets timestamp to the provided `now` value. Monotonicity is enforced
 * by the caller passing increasing `now` values.
 */

import {
  type Event,
  type EventType,
  type Region,
  type Service,
  EventSchema,
} from "shared";
import { DEFAULT_SEED, Rng } from "./rng.js";

// =============================================================================
// Distribution Weights (configurable constants)
// =============================================================================

/**
 * Event type weights (baseline — before regime adjustments).
 * success≈85%, warning≈10%, error≈5%
 */
const EVENT_TYPE_WEIGHTS: { value: EventType; weight: number }[] = [
  { value: "success", weight: 85 },
  { value: "warning", weight: 10 },
  { value: "error", weight: 5 },
];

/**
 * Service weights — payments/orders slightly more frequent.
 */
const SERVICE_WEIGHTS: { value: Service; weight: number }[] = [
  { value: "auth", weight: 20 },
  { value: "payments", weight: 30 },
  { value: "orders", weight: 30 },
  { value: "notifications", weight: 20 },
];

/**
 * Region weights — NA and EU heavier traffic.
 */
const REGION_WEIGHTS: { value: Region; weight: number }[] = [
  { value: "NA", weight: 35 },
  { value: "EU", weight: 30 },
  { value: "APAC", weight: 25 },
  { value: "MEA", weight: 10 },
];

// =============================================================================
// Latency Distribution
// =============================================================================

/** Probability of a long-tail latency spike (5–10%). */
const LATENCY_SPIKE_PROBABILITY = 0.07;

/** Baseline latency range (ms). */
const LATENCY_BASELINE_MIN = 50;
const LATENCY_BASELINE_MAX = 200;

/** Long-tail spike latency range (ms). */
const LATENCY_SPIKE_MIN = 1000;
const LATENCY_SPIKE_MAX = 3000;

// =============================================================================
// Payload Size Distribution
// =============================================================================

/** Payload size range (KB). */
const PAYLOAD_SIZE_MIN = 0.5;
const PAYLOAD_SIZE_MAX = 50;

// =============================================================================
// Error Burst / Regime Logic
// =============================================================================

/**
 * Determines if we're in an "error burst" regime based on timestamp.
 * Creates periodic error spikes roughly every 5 minutes, lasting ~10 seconds.
 *
 * @param now - Unix timestamp in ms
 * @returns true if in error burst regime
 */
function isErrorBurstRegime(now: number): boolean {
  const BURST_PERIOD_MS = 5 * 60 * 1000; // Every 5 minutes
  const BURST_DURATION_MS = 10 * 1000; // Lasts 10 seconds
  const timeInPeriod = now % BURST_PERIOD_MS;
  return timeInPeriod < BURST_DURATION_MS;
}

/**
 * Gets event type weights adjusted for current regime.
 * During error bursts, error rate increases significantly.
 */
function getEventTypeWeights(
  now: number
): { value: EventType; weight: number }[] {
  if (isErrorBurstRegime(now)) {
    // Error burst: error≈30%, warning≈20%, success≈50%
    return [
      { value: "success", weight: 50 },
      { value: "warning", weight: 20 },
      { value: "error", weight: 30 },
    ];
  }
  return EVENT_TYPE_WEIGHTS;
}

// =============================================================================
// User ID Generation
// =============================================================================

/**
 * Generates a realistic user ID (user_XXXXX format).
 */
function generateUserId(rng: Rng): string {
  const userNumber = rng.int(10000, 99999);
  return `user_${userNumber}`;
}

// =============================================================================
// Main Generator
// =============================================================================

/**
 * Creates a new event generator instance with the given seed.
 * Returns a function that generates events for a given timestamp.
 *
 * @param seed - RNG seed for reproducibility (defaults to DEFAULT_SEED)
 * @returns A function `(now: number) => Event`
 */
export function createEventGenerator(seed: number = DEFAULT_SEED) {
  const rng = new Rng(seed);

  /**
   * Generates a single event for the given timestamp.
   * Pure function — deterministic given the RNG state.
   *
   * @param now - Unix timestamp in milliseconds
   * @returns A valid Event object
   */
  return function generateEvent(now: number): Event {
    // Pick event type with regime-aware weights
    const eventType = rng.weightedPick(getEventTypeWeights(now));

    // Pick service and region
    const service = rng.weightedPick(SERVICE_WEIGHTS);
    const region = rng.weightedPick(REGION_WEIGHTS);

    // Generate latency with long-tail distribution
    const isSpike = rng.chance(LATENCY_SPIKE_PROBABILITY);
    const latencyMs = isSpike
      ? rng.range(LATENCY_SPIKE_MIN, LATENCY_SPIKE_MAX)
      : rng.range(LATENCY_BASELINE_MIN, LATENCY_BASELINE_MAX);

    // Generate payload size
    const payloadSizeKb = rng.range(PAYLOAD_SIZE_MIN, PAYLOAD_SIZE_MAX);

    return {
      id: rng.uuid(),
      timestamp: now,
      service,
      eventType,
      userId: generateUserId(rng),
      region,
      latencyMs: Math.round(latencyMs * 100) / 100, // 2 decimal places
      payloadSizeKb: Math.round(payloadSizeKb * 100) / 100,
    };
  };
}

// =============================================================================
// Default Generator Instance
// =============================================================================

/**
 * Default generator instance using DEFAULT_SEED.
 * Use `createEventGenerator(seed)` for custom seeds.
 */
export const generateEvent = createEventGenerator();

// =============================================================================
// Validated Generator (Optional)
// =============================================================================

/**
 * Generates an event and validates it against the schema.
 * Throws a ZodError if the generated event is invalid.
 * Useful for catching bugs during development.
 *
 * @param now - Unix timestamp in milliseconds
 * @returns A validated Event object
 */
export function generateEventValidated(now: number): Event {
  const event = generateEvent(now);
  return EventSchema.parse(event);
}

/**
 * Creates a validated event generator with a custom seed.
 *
 * @param seed - RNG seed for reproducibility
 * @returns A function `(now: number) => Event` that validates output
 */
export function createValidatedEventGenerator(seed: number = DEFAULT_SEED) {
  const generator = createEventGenerator(seed);

  return function generateEventValidated(now: number): Event {
    const event = generator(now);
    return EventSchema.parse(event);
  };
}

// =============================================================================
// Batch Generation
// =============================================================================

/**
 * Generates a batch of events starting from the given timestamp.
 * Events are spaced 1ms apart for monotonic timestamps.
 *
 * @param startTime - Starting Unix timestamp in milliseconds
 * @param count - Number of events to generate
 * @param generator - Optional custom generator function
 * @returns Array of Event objects
 */
export function generateEventBatch(
  startTime: number,
  count: number,
  generator: (now: number) => Event = generateEvent
): Event[] {
  const events: Event[] = [];
  for (let i = 0; i < count; i++) {
    events.push(generator(startTime + i));
  }
  return events;
}
