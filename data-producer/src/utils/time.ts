/**
 * Time and delay utility functions.
 */

/**
 * Parses a window string (e.g., "5m", "30m", "1h") to milliseconds.
 * Returns null if invalid.
 *
 * @param window - Time window string (e.g., "5m", "30m", "1h")
 * @returns Milliseconds or null if invalid format
 */
export function parseWindow(window: string): number | null {
  const match = window.match(/^(\d+)(s|m|h)$/);
  if (!match) return null;

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case "s":
      return value * 1000;
    case "m":
      return value * 60 * 1000;
    case "h":
      return value * 60 * 60 * 1000;
    default:
      return null;
  }
}

/**
 * Sleep for the specified duration.
 *
 * @param ms - Milliseconds to sleep
 * @returns Promise that resolves after the specified duration
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generate random base latency between 300–800ms.
 *
 * @returns Random latency in milliseconds (300-800ms)
 */
export function randomBaseLatency(): number {
  return Math.floor(Math.random() * 500) + 300;
}
