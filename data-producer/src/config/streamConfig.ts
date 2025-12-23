/**
 * WebSocket stream operational configuration.
 *
 * Controls operational behavior of the event stream broadcast:
 * - Broadcast interval range
 * - Batch size range
 *
 * All settings are global (affect all WebSocket connections).
 * Note: Failure injection is configured separately in httpFailureInjectionConfig.ts and webSocketFailureConfig.ts
 */

export interface StreamConfig {
  /**
   * Minimum interval between event batches (ms).
   */
  intervalMinMs: number;

  /**
   * Maximum interval between event batches (ms).
   */
  intervalMaxMs: number;

  /**
   * Minimum number of events per batch.
   */
  batchSizeMin: number;

  /**
   * Maximum number of events per batch.
   */
  batchSizeMax: number;
}

/**
 * In-memory config with safe defaults.
 */
const config: StreamConfig = {
  intervalMinMs: 500,
  intervalMaxMs: 1000,
  batchSizeMin: 50,
  batchSizeMax: 200,
};

// =============================================================================
// Getters
// =============================================================================

export function getIntervalMinMs(): number {
  return config.intervalMinMs;
}

export function getIntervalMaxMs(): number {
  return config.intervalMaxMs;
}

export function getBatchSizeMin(): number {
  return config.batchSizeMin;
}

export function getBatchSizeMax(): number {
  return config.batchSizeMax;
}

export function getConfig(): Readonly<StreamConfig> {
  return { ...config };
}

// =============================================================================
// Setters
// =============================================================================

export function setIntervalMinMs(ms: number): void {
  config.intervalMinMs = Math.max(0, ms);
  // Ensure min <= max
  if (config.intervalMinMs > config.intervalMaxMs) {
    config.intervalMaxMs = config.intervalMinMs;
  }
}

export function setIntervalMaxMs(ms: number): void {
  config.intervalMaxMs = Math.max(0, ms);
  // Ensure min <= max
  if (config.intervalMaxMs < config.intervalMinMs) {
    config.intervalMinMs = config.intervalMaxMs;
  }
}

export function setBatchSizeMin(size: number): void {
  config.batchSizeMin = Math.max(0, size);
  // Ensure min <= max
  if (config.batchSizeMin > config.batchSizeMax) {
    config.batchSizeMax = config.batchSizeMin;
  }
}

export function setBatchSizeMax(size: number): void {
  config.batchSizeMax = Math.max(0, size);
  // Ensure min <= max
  if (config.batchSizeMax < config.batchSizeMin) {
    config.batchSizeMin = config.batchSizeMax;
  }
}

/**
 * Bulk update config values.
 * Only provided keys are updated.
 */
export function updateConfig(updates: Partial<StreamConfig>): void {
  if (updates.intervalMinMs !== undefined) {
    setIntervalMinMs(updates.intervalMinMs);
  }
  if (updates.intervalMaxMs !== undefined) {
    setIntervalMaxMs(updates.intervalMaxMs);
  }
  if (updates.batchSizeMin !== undefined) {
    setBatchSizeMin(updates.batchSizeMin);
  }
  if (updates.batchSizeMax !== undefined) {
    setBatchSizeMax(updates.batchSizeMax);
  }
}

/**
 * Reset config to safe defaults.
 */
export function resetConfig(): void {
  config.intervalMinMs = 500;
  config.intervalMaxMs = 1000;
  config.batchSizeMin = 50;
  config.batchSizeMax = 200;
}
