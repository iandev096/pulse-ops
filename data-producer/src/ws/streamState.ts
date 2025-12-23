/**
 * Global stream state management for WebSocket event stream.
 *
 * Controls pause/resume state that affects all WebSocket connections.
 * Not client-specific - all clients share the same stream state.
 */

/**
 * Global pause state for the event stream.
 * When true, no EVENT_BATCH messages are emitted.
 */
let isPaused = false;

/**
 * Gets the current pause state.
 */
export function getIsPaused(): boolean {
  return isPaused;
}

/**
 * Sets the pause state.
 *
 * @param paused - Whether the stream should be paused
 * @returns The previous pause state
 */
export function setIsPaused(paused: boolean): boolean {
  const previous = isPaused;
  isPaused = paused;
  return previous;
}

/**
 * Toggles the pause state.
 *
 * @returns The new pause state
 */
export function togglePause(): boolean {
  isPaused = !isPaused;
  return isPaused;
}
