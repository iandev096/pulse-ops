/**
 * Validation utility functions for request body validation.
 */

/**
 * Checks if a value is an invalid probability (must be a number between 0 and 1).
 * Returns `true` if the value is defined AND (not a number OR < 0 OR > 1).
 *
 * @param value - The value to validate
 * @returns `true` if invalid, `false` if valid or undefined
 */
export function isInvalidProbability(value: unknown): boolean {
  if (value === undefined) {
    return false;
  }
  return typeof value !== "number" || value < 0 || value > 1;
}

/**
 * Checks if a value is an invalid non-negative number.
 * Returns `true` if the value is defined AND (not a number OR < 0).
 *
 * @param value - The value to validate
 * @returns `true` if invalid, `false` if valid or undefined
 */
export function isInvalidNonNegativeNumber(value: unknown): boolean {
  if (value === undefined) {
    return false;
  }
  return typeof value !== "number" || value < 0;
}
