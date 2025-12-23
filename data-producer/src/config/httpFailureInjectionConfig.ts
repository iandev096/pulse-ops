/**
 * HTTP endpoint failure injection configuration.
 *
 * Manages per-client failure injection for HTTP endpoints.
 * Each client (identified by `X-Client-Id` header) has its own config
 * with TTL eviction to prevent unbounded growth.
 */

import { logger } from "../logger.js";

// =============================================================================
// Types - HTTP Failure Injection (Per-Client)
// =============================================================================

/**
 * HTTP endpoint failure injection configuration (per-client).
 * Each client (identified by `X-Client-Id` header) has its own config.
 */
export interface HttpFailureInjectionConfig {
  /**
   * Client-specific default for whether to inject failures.
   * Per-request `injectFailures` query param can override this.
   */
  injectFailuresDefault: boolean;

  /**
   * Probability (0-1) of returning a 500 error response.
   */
  errorRate: number;

  /**
   * Probability (0-1) of truncating response data (partial response).
   */
  partialRate: number;

  /**
   * Probability (0-1) of adding extra delay beyond base latency.
   */
  delayRate: number;

  /**
   * Extra delay in ms when delay injection triggers (on top of base latency).
   */
  extraDelayMs: number;
}

interface ClientConfigEntry {
  config: HttpFailureInjectionConfig;
  lastSeen: number;
}

// =============================================================================
// Constants
// =============================================================================

/**
 * Client ID used when `X-Client-Id` header is not provided.
 */
export const ANONYMOUS_CLIENT_ID = "__anonymous__";

/**
 * TTL for client configs in milliseconds (30 minutes).
 */
const CONFIG_TTL_MS = 30 * 60 * 1000;

/**
 * How often to run eviction cleanup (5 minutes).
 */
const EVICTION_INTERVAL_MS = 5 * 60 * 1000;

// =============================================================================
// HTTP Failure Injection Store (Per-Client)
// =============================================================================

const clientConfigs = new Map<string, ClientConfigEntry>();

/**
 * Creates a fresh HTTP failure injection config with safe defaults.
 */
function createDefaultHttpConfig(): HttpFailureInjectionConfig {
  return {
    injectFailuresDefault: false,
    errorRate: 0.3,
    partialRate: 0.5,
    delayRate: 0.5,
    extraDelayMs: 2500,
  };
}

/**
 * Evicts expired client configs based on TTL.
 */
function evictExpiredConfigs(): void {
  const now = Date.now();
  let evictedCount = 0;

  for (const [clientId, entry] of clientConfigs.entries()) {
    // Don't evict anonymous client
    if (clientId === ANONYMOUS_CLIENT_ID) continue;

    if (now - entry.lastSeen > CONFIG_TTL_MS) {
      clientConfigs.delete(clientId);
      evictedCount++;
    }
  }

  if (evictedCount > 0) {
    logger.info(
      { evictedCount, remainingClients: clientConfigs.size },
      "Evicted expired client configs"
    );
  }
}

// Run eviction periodically
setInterval(evictExpiredConfigs, EVICTION_INTERVAL_MS);

// =============================================================================
// HTTP Failure Injection API (Per-Client)
// =============================================================================

/**
 * Gets the HTTP failure injection config for a client, creating a default if it doesn't exist.
 * Updates the lastSeen timestamp on access.
 *
 * @param clientId - The client identifier (from X-Client-Id header)
 * @returns A copy of the client's config
 */
export function getClientConfig(
  clientId: string
): Readonly<HttpFailureInjectionConfig> {
  const entry = clientConfigs.get(clientId);

  if (entry) {
    entry.lastSeen = Date.now();
    return { ...entry.config };
  }

  // Create new entry with defaults
  const newEntry: ClientConfigEntry = {
    config: createDefaultHttpConfig(),
    lastSeen: Date.now(),
  };
  clientConfigs.set(clientId, newEntry);
  return { ...newEntry.config };
}

/**
 * Gets the injectFailuresDefault for a client.
 */
export function getClientInjectFailuresDefault(clientId: string): boolean {
  return getClientConfig(clientId).injectFailuresDefault;
}

/**
 * Gets the errorRate for a client.
 */
export function getClientErrorRate(clientId: string): number {
  return getClientConfig(clientId).errorRate;
}

/**
 * Gets the partialRate for a client.
 */
export function getClientPartialRate(clientId: string): number {
  return getClientConfig(clientId).partialRate;
}

/**
 * Gets the delayRate for a client.
 */
export function getClientDelayRate(clientId: string): number {
  return getClientConfig(clientId).delayRate;
}

/**
 * Gets the extraDelayMs for a client.
 */
export function getClientExtraDelayMs(clientId: string): number {
  return getClientConfig(clientId).extraDelayMs;
}

/**
 * Sets the injectFailuresDefault for a client.
 */
export function setClientInjectFailuresDefault(
  clientId: string,
  enabled: boolean
): void {
  const entry = clientConfigs.get(clientId);
  if (entry) {
    entry.config.injectFailuresDefault = enabled;
    entry.lastSeen = Date.now();
  } else {
    const newConfig = createDefaultHttpConfig();
    newConfig.injectFailuresDefault = enabled;
    clientConfigs.set(clientId, {
      config: newConfig,
      lastSeen: Date.now(),
    });
  }
}

/**
 * Updates HTTP failure injection config values for a client.
 * Only provided keys are updated.
 */
export function updateClientConfig(
  clientId: string,
  updates: Partial<Omit<HttpFailureInjectionConfig, "injectFailuresDefault">>
): void {
  let entry = clientConfigs.get(clientId);

  if (!entry) {
    entry = {
      config: createDefaultHttpConfig(),
      lastSeen: Date.now(),
    };
    clientConfigs.set(clientId, entry);
  }

  if (updates.errorRate !== undefined) {
    entry.config.errorRate = Math.max(0, Math.min(1, updates.errorRate));
  }
  if (updates.partialRate !== undefined) {
    entry.config.partialRate = Math.max(0, Math.min(1, updates.partialRate));
  }
  if (updates.delayRate !== undefined) {
    entry.config.delayRate = Math.max(0, Math.min(1, updates.delayRate));
  }
  if (updates.extraDelayMs !== undefined) {
    entry.config.extraDelayMs = Math.max(0, updates.extraDelayMs);
  }

  entry.lastSeen = Date.now();
}

/**
 * Resets a client's HTTP failure injection config to safe defaults.
 */
export function resetClientConfig(clientId: string): void {
  clientConfigs.set(clientId, {
    config: createDefaultHttpConfig(),
    lastSeen: Date.now(),
  });
}

/**
 * Gets the number of active client configs (for observability).
 */
export function getActiveClientCount(): number {
  return clientConfigs.size;
}

/**
 * Clears all client configs (mainly for testing).
 */
export function clearAllClientConfigs(): void {
  clientConfigs.clear();
}
