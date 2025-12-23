/**
 * WebSocket failure injection configuration.
 *
 * Global configuration for WebSocket stream failure simulation.
 * Affects all WebSocket connections (not scoped per-client).
 */

/**
 * Global WebSocket failure injection configuration.
 * Affects all WebSocket connections.
 */
export interface WebSocketFailureConfig {
  /**
   * Probability (0-1) of sending a malformed batch (for failure simulation).
   */
  malformedBatchProbability: number;

  /**
   * Probability (0-1) of dropping a random connection (for failure simulation).
   */
  connectionDropProbability: number;
}

const webSocketFailureConfig: WebSocketFailureConfig = {
  malformedBatchProbability: 0.01, // 1%
  connectionDropProbability: 0.005, // 0.5%
};

// =============================================================================
// WebSocket Failure Injection API (Global)
// =============================================================================

/**
 * Gets the probability of sending a malformed batch.
 */
export function getWebSocketMalformedBatchProbability(): number {
  return webSocketFailureConfig.malformedBatchProbability;
}

/**
 * Sets the probability of sending a malformed batch.
 */
export function setWebSocketMalformedBatchProbability(
  probability: number
): void {
  webSocketFailureConfig.malformedBatchProbability = Math.max(
    0,
    Math.min(1, probability)
  );
}

/**
 * Gets the probability of dropping a random connection.
 */
export function getWebSocketConnectionDropProbability(): number {
  return webSocketFailureConfig.connectionDropProbability;
}

/**
 * Sets the probability of dropping a random connection.
 */
export function setWebSocketConnectionDropProbability(
  probability: number
): void {
  webSocketFailureConfig.connectionDropProbability = Math.max(
    0,
    Math.min(1, probability)
  );
}

/**
 * Gets the complete WebSocket failure injection config.
 */
export function getWebSocketFailureConfig(): Readonly<WebSocketFailureConfig> {
  return { ...webSocketFailureConfig };
}

/**
 * Updates WebSocket failure injection config values.
 * Only provided keys are updated.
 */
export function updateWebSocketFailureConfig(
  updates: Partial<WebSocketFailureConfig>
): void {
  if (updates.malformedBatchProbability !== undefined) {
    setWebSocketMalformedBatchProbability(updates.malformedBatchProbability);
  }
  if (updates.connectionDropProbability !== undefined) {
    setWebSocketConnectionDropProbability(updates.connectionDropProbability);
  }
}

/**
 * Resets WebSocket failure injection config to safe defaults.
 */
export function resetWebSocketFailureConfig(): void {
  webSocketFailureConfig.malformedBatchProbability = 0.01;
  webSocketFailureConfig.connectionDropProbability = 0.005;
}
