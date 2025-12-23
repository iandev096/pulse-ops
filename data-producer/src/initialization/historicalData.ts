/**
 * Historical data initialization.
 *
 * Pre-populates the event store with historical events on server start.
 * Uses deterministic seed for reproducible data across restarts.
 */

import { createEventGenerator } from "../generator/eventGenerator.js";
import { DEFAULT_SEED } from "../generator/rng.js";
import { logger } from "../logger.js";
import { eventStore } from "../store/eventStore.js";

/**
 * Number of historical events to pre-populate.
 */
const HISTORICAL_EVENT_COUNT = 10_000;

/**
 * Pre-populates the event store with historical events.
 * Generates events with timestamps going backwards from server start time,
 * spaced 1ms apart (like generateEventBatch).
 *
 * @param serverStartTime - Unix timestamp (ms) when server started
 */
export async function initializeHistoricalEvents(
  serverStartTime: number
): Promise<void> {
  const startTime = Date.now();
  logger.info(
    { count: HISTORICAL_EVENT_COUNT, serverStartTime },
    "Starting historical event pre-population"
  );

  // Create generator with DEFAULT_SEED for deterministic results
  const generator = createEventGenerator(DEFAULT_SEED);

  // Generate events with timestamps going backwards from server start time
  // Events spaced 1ms apart: serverStartTime - 10000 down to serverStartTime - 1
  let storedCount = 0;
  let errorCount = 0;

  for (let i = 0; i < HISTORICAL_EVENT_COUNT; i++) {
    // Calculate timestamp: newest event is serverStartTime - 1, oldest is serverStartTime - 10000
    const timestamp = serverStartTime - (HISTORICAL_EVENT_COUNT - i);

    try {
      const event = generator(timestamp);
      eventStore.append(event);
      storedCount++;
    } catch (err) {
      errorCount++;
      logger.warn(
        { err, timestamp, index: i },
        "Failed to store historical event"
      );
    }
  }

  const duration = Date.now() - startTime;
  const oldestTimestamp = serverStartTime - HISTORICAL_EVENT_COUNT;
  const newestTimestamp = serverStartTime - 1;

  logger.info(
    {
      storedCount,
      errorCount,
      duration,
      oldestTimestamp,
      newestTimestamp,
      timeRangeMs: HISTORICAL_EVENT_COUNT,
    },
    "Historical event pre-population completed"
  );
}
