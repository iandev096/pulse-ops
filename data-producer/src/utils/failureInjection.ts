/**
 * Failure injection utilities.
 *
 * Determines which failure injections to apply based on client-specific configuration.
 */

import {
  getClientDelayRate,
  getClientErrorRate,
  getClientExtraDelayMs,
  getClientPartialRate,
} from "../config/httpFailureInjectionConfig.js";
import { logger } from "../logger.js";

/**
 * Result of determining which failure injections to apply.
 */
export interface InjectionResult {
  shouldError: boolean;
  shouldTruncate: boolean;
  extraDelay: number;
}

/**
 * Determines which failure injections to apply based on client-specific rates.
 *
 * @param clientId - The client ID to get configuration for
 * @returns Injection result indicating which failures to apply
 */
export function determineInjections(clientId: string): InjectionResult {
  const errorRate = getClientErrorRate(clientId);
  const partialRate = getClientPartialRate(clientId);
  const delayRate = getClientDelayRate(clientId);
  const extraDelayMs = getClientExtraDelayMs(clientId);

  logger.info(
    {
      clientId,
      errorRate,
      partialRate,
      delayRate,
    },
    "Determining injections for client"
  );

  return {
    shouldError: Math.random() < errorRate,
    shouldTruncate: Math.random() < partialRate,
    extraDelay: Math.random() < delayRate ? extraDelayMs : 0,
  };
}
