/**
 * Historical events endpoint.
 *
 * GET /api/events
 * - Returns events from ring buffer for a time window
 * - Applies artificial latency (300–800ms base)
 * - Supports configurable failure injection (client-specific)
 *
 * Configuration is read from the client-specific config store
 * using the `X-Client-Id` header. If not provided, falls back
 * to a shared "anonymous" config.
 */

import {
  Router,
  type Request,
  type Response,
  type Router as RouterType,
} from "express";
import {
  getClientConfig,
  getClientInjectFailuresDefault,
} from "../config/httpFailureInjectionConfig.js";
import { logger } from "../logger.js";
import { eventStore } from "../store/eventStore.js";
import {
  determineInjections,
  type InjectionResult,
} from "../utils/failureInjection.js";
import { getClientId } from "../utils/request.js";
import { parseWindow, randomBaseLatency, sleep } from "../utils/time.js";

export const eventsRouter: RouterType = Router();

// =============================================================================
// Route Handler
// =============================================================================

eventsRouter.get("/api/events", async (req: Request, res: Response) => {
  const startTime = Date.now();
  const clientId = getClientId(req);

  // Parse query parameters
  const windowParam = req.query.window as string | undefined;
  const limitParam = req.query.limit as string | undefined;
  const injectFailuresParam = req.query.injectFailures as string | undefined;

  // Validate window parameter (required)
  if (!windowParam) {
    res.status(400).json({
      error: "Missing required parameter: window",
      example: "?window=5m&limit=1000",
    });
    return;
  }

  const windowMs = parseWindow(windowParam);
  if (windowMs === null) {
    res.status(400).json({
      error: "Invalid window format",
      example: "5m, 30m, 1h",
    });
    return;
  }

  // Parse limit (default 10000, max 100000)
  let limit = 10000;
  if (limitParam) {
    const parsed = parseInt(limitParam, 10);
    if (!isNaN(parsed) && parsed > 0) {
      limit = Math.min(parsed, 100000);
    }
  }

  // Determine effective injection flag
  // Per-request query param overrides client's default if provided
  let effectiveInjectFailures: boolean;
  if (injectFailuresParam !== undefined) {
    effectiveInjectFailures = injectFailuresParam === "true";
  } else {
    effectiveInjectFailures = getClientInjectFailuresDefault(clientId);
  }

  // Get client's failure injection config for meta
  const clientConfig = getClientConfig(clientId);
  const { errorRate, partialRate, delayRate, extraDelayMs } = clientConfig;

  // Always apply base artificial latency (300–800ms)
  const baseLatency = randomBaseLatency();
  await sleep(baseLatency);

  // Determine and apply failure injections if enabled
  let injections: InjectionResult = {
    shouldError: false,
    shouldTruncate: false,
    extraDelay: 0,
  };

  if (effectiveInjectFailures) {
    injections = determineInjections(clientId);
    logger.info({ clientId, injections }, "Injections determined for client");

    // Apply extra delay if triggered
    if (injections.extraDelay > 0) {
      logger.info(
        { clientId, extraDelay: injections.extraDelay },
        "Applying extra delay injection"
      );
      await sleep(injections.extraDelay);
    }

    // Return 500 error if triggered
    if (injections.shouldError) {
      logger.info({ clientId }, "Injecting 500 error response");
      res.status(500).json({
        error: "Internal server error (simulated)",
        injected: true,
        clientId,
        meta: {
          latencyMs: Date.now() - startTime,
          injectionApplied: effectiveInjectFailures,
          failureInjection: {
            errorRate,
            partialRate,
            delayRate,
            extraDelayMs,
          },
        },
      });
      return;
    }
  }

  // Query events from ring buffer
  const generatedAt = Date.now();
  let events = eventStore.getWindow(generatedAt, windowMs, limit);

  // Check if we have partial data (requested window exceeds available data)
  let actualWindowMs: number | undefined;
  let isPartialData = false;
  if (events.length > 0) {
    const oldestEvent = events[events.length - 1];
    const newestEvent = events[0];
    actualWindowMs = newestEvent.timestamp - oldestEvent.timestamp;
    // If actual window is less than requested window, we have partial data
    if (actualWindowMs < windowMs) {
      isPartialData = true;
      logger.debug(
        {
          clientId,
          requestedWindowMs: windowMs,
          actualWindowMs,
          eventCount: events.length,
        },
        "Returning partial data - requested window exceeds available data"
      );
    }
  } else {
    // No events found in buffer
    logger.debug(
      { clientId, windowMs, generatedAt },
      "No events found in buffer for requested window"
    );
  }

  // Apply partial truncation if triggered (failure injection)
  let truncatedByInjection = false;
  let originalCount: number | undefined;
  if (effectiveInjectFailures && injections.shouldTruncate) {
    originalCount = events.length;
    const truncateRatio = 0.3 + Math.random() * 0.4; // Keep 30-70%
    const truncatedCount = Math.floor(events.length * truncateRatio);
    logger.info(
      { clientId, originalCount: events.length, truncatedCount },
      "Applying partial data truncation"
    );
    events = events.slice(0, truncatedCount);
    truncatedByInjection = true;
  }

  // Build response
  const response = {
    meta: {
      window: windowParam,
      count: events.length,
      generatedAt,
      latencyMs: Date.now() - startTime,
      injectionApplied: effectiveInjectFailures,
      clientId,
      truncatedByInjection,
      failureInjection: {
        errorRate,
        partialRate,
        delayRate,
        extraDelayMs,
      },
      ...(isPartialData && {
        isPartialData: true,
        actualWindowMs,
        requestedWindowMs: windowMs,
      }),
      ...(truncatedByInjection && {
        originalCount,
      }),
    },
    data: events,
  };

  res.json(response);
});
