/**
 * Debug/developer control endpoints.
 *
 * These endpoints exist only for development/testing via Postman.
 * They allow runtime configuration of failure injection behavior.
 *
 * Configuration is **client-specific**: each client (identified by
 * `X-Client-Id` header) has its own config. If the header is missing,
 * a shared "anonymous" config is used.
 */

import {
  Router,
  type Request,
  type Response,
  type Router as RouterType,
} from "express";
import {
  getActiveClientCount,
  getClientConfig,
  resetClientConfig,
  setClientInjectFailuresDefault,
  updateClientConfig,
} from "../config/httpFailureInjectionConfig.js";
import {
  getConfig as getStreamConfig,
  resetConfig as resetStreamConfig,
  updateConfig as updateStreamConfig,
} from "../config/streamConfig.js";
import {
  getWebSocketFailureConfig,
  resetWebSocketFailureConfig,
  updateWebSocketFailureConfig,
} from "../config/webSocketFailureConfig.js";
import { logger } from "../logger.js";
import { getClientId, validateAdminApiKey } from "../utils/request.js";
import {
  isInvalidNonNegativeNumber,
  isInvalidProbability,
} from "../utils/validation.js";
import { getStreamStats } from "../ws/events.js";
import { getIsPaused, setIsPaused } from "../ws/streamState.js";

export const debugRouter: RouterType = Router();

// =============================================================================
// Toggle Failure Injection Default
// =============================================================================

/**
 * POST /api/debug/errors
 *
 * Toggle the failure injection default for this client.
 *
 * Headers: X-Client-Id (optional, falls back to anonymous)
 * Body: { enabled: boolean }
 */
debugRouter.post("/api/debug/errors", (req: Request, res: Response) => {
  const clientId = getClientId(req);
  const { enabled } = req.body;

  if (typeof enabled !== "boolean") {
    res.status(400).json({
      error: "Invalid body: expected { enabled: boolean }",
    });
    return;
  }

  setClientInjectFailuresDefault(clientId, enabled);

  logger.info(
    { clientId, injectFailuresDefault: enabled },
    "Updated injectFailuresDefault for client"
  );

  res.json({
    message: `Failure injection default ${enabled ? "enabled" : "disabled"}`,
    clientId,
    config: getClientConfig(clientId),
  });
});

// =============================================================================
// Configure Failure Injection Rates
// =============================================================================

/**
 * POST /api/debug/errors/config
 *
 * Configure failure injection rates and delays for this client.
 *
 * Headers: X-Client-Id (optional, falls back to anonymous)
 * Body: {
 *   errorRate?: number,      // 0-1, probability of 500 error
 *   partialRate?: number,    // 0-1, probability of truncated response
 *   delayRate?: number,      // 0-1, probability of extra delay
 *   extraDelayMs?: number    // extra delay in ms
 * }
 */
debugRouter.post("/api/debug/errors/config", (req: Request, res: Response) => {
  const clientId = getClientId(req);
  const { errorRate, partialRate, delayRate, extraDelayMs } = req.body;

  // Validate types if provided
  if (isInvalidProbability(errorRate)) {
    res
      .status(400)
      .json({ error: "errorRate must be a number between 0 and 1" });
    return;
  }
  if (isInvalidProbability(partialRate)) {
    res
      .status(400)
      .json({ error: "partialRate must be a number between 0 and 1" });
    return;
  }
  if (isInvalidProbability(delayRate)) {
    res
      .status(400)
      .json({ error: "delayRate must be a number between 0 and 1" });
    return;
  }
  if (isInvalidNonNegativeNumber(extraDelayMs)) {
    res
      .status(400)
      .json({ error: "extraDelayMs must be a non-negative number" });
    return;
  }

  updateClientConfig(clientId, {
    errorRate,
    partialRate,
    delayRate,
    extraDelayMs,
  });

  logger.info(
    { clientId, errorRate, partialRate, delayRate, extraDelayMs },
    "Updated failure injection config for client"
  );

  res.json({
    message: "Failure injection config updated",
    clientId,
    config: getClientConfig(clientId),
  });
});

// =============================================================================
// Get Current Config
// =============================================================================

/**
 * GET /api/debug/errors/config
 *
 * Get the current failure injection configuration for this client.
 *
 * Headers: X-Client-Id (optional, falls back to anonymous)
 */
debugRouter.get("/api/debug/errors/config", (req: Request, res: Response) => {
  const clientId = getClientId(req);

  res.json({
    clientId,
    config: getClientConfig(clientId),
    activeClients: getActiveClientCount(),
  });
});

// =============================================================================
// Reset Config
// =============================================================================

/**
 * POST /api/debug/errors/reset
 *
 * Reset failure injection config to safe defaults for this client.
 *
 * Headers: X-Client-Id (optional, falls back to anonymous)
 */
debugRouter.post("/api/debug/errors/reset", (req: Request, res: Response) => {
  const clientId = getClientId(req);

  resetClientConfig(clientId);

  logger.info(
    { clientId },
    "Reset failure injection config to defaults for client"
  );

  res.json({
    message: "Failure injection config reset to defaults",
    clientId,
    config: getClientConfig(clientId),
  });
});

// =============================================================================
// Stream Control (Protected)
// =============================================================================

/**
 * POST /api/debug/stream
 *
 * Control the global WebSocket event stream (pause/resume).
 * **Protected**: Requires X-API-Key header matching ADMIN_API_KEY env var.
 *
 * Headers: X-API-Key (required)
 * Body: { action: "pause" | "resume" }
 */
debugRouter.post("/api/debug/stream", (req: Request, res: Response) => {
  // Validate API key
  if (!validateAdminApiKey(req)) {
    res.status(401).json({
      error:
        "Unauthorized: X-API-Key header required and must match ADMIN_API_KEY",
    });
    return;
  }

  const { action } = req.body;

  if (action !== "pause" && action !== "resume") {
    res.status(400).json({
      error: "Invalid action: expected 'pause' or 'resume'",
    });
    return;
  }

  const wasPaused = getIsPaused();
  const shouldPause = action === "pause";

  if (wasPaused === shouldPause) {
    // Already in the requested state
    res.json({
      message: `Stream is already ${shouldPause ? "paused" : "resumed"}`,
      isPaused: shouldPause,
      stats: getStreamStats(),
    });
    return;
  }

  setIsPaused(shouldPause);

  logger.info(
    { action, previousState: wasPaused, newState: shouldPause },
    "Stream state changed"
  );

  res.json({
    message: `Stream ${shouldPause ? "paused" : "resumed"}`,
    isPaused: shouldPause,
    stats: getStreamStats(),
  });
});

// =============================================================================
// Stream Configuration (Protected)
// =============================================================================

/**
 * POST /api/debug/stream/config
 *
 * Configure WebSocket stream behavior (failure probabilities, interval range, batch size).
 * **Protected**: Requires X-API-Key header matching ADMIN_API_KEY env var.
 *
 * Headers: X-API-Key (required)
 * Body: {
 *   malformedBatchProbability?: number,    // 0-1, probability of malformed batch
 *   connectionDropProbability?: number,   // 0-1, probability of connection drop
 *   intervalMinMs?: number,                // minimum interval in ms
 *   intervalMaxMs?: number,                // maximum interval in ms
 *   batchSizeMin?: number,                 // minimum events per batch
 *   batchSizeMax?: number                  // maximum events per batch
 * }
 */
debugRouter.post("/api/debug/stream/config", (req: Request, res: Response) => {
  // Validate API key
  if (!validateAdminApiKey(req)) {
    res.status(401).json({
      error:
        "Unauthorized: X-API-Key header required and must match ADMIN_API_KEY",
    });
    return;
  }

  const {
    malformedBatchProbability,
    connectionDropProbability,
    intervalMinMs,
    intervalMaxMs,
    batchSizeMin,
    batchSizeMax,
  } = req.body;

  // Validate types and ranges if provided
  if (isInvalidProbability(malformedBatchProbability)) {
    res.status(400).json({
      error: "malformedBatchProbability must be a number between 0 and 1",
    });
    return;
  }

  if (isInvalidProbability(connectionDropProbability)) {
    res.status(400).json({
      error: "connectionDropProbability must be a number between 0 and 1",
    });
    return;
  }

  if (isInvalidNonNegativeNumber(intervalMinMs)) {
    res.status(400).json({
      error: "intervalMinMs must be a non-negative number",
    });
    return;
  }

  if (isInvalidNonNegativeNumber(intervalMaxMs)) {
    res.status(400).json({
      error: "intervalMaxMs must be a non-negative number",
    });
    return;
  }

  // Validate intervalMinMs <= intervalMaxMs if both provided
  if (
    intervalMinMs !== undefined &&
    intervalMaxMs !== undefined &&
    intervalMinMs > intervalMaxMs
  ) {
    res.status(400).json({
      error: "intervalMinMs must be <= intervalMaxMs",
    });
    return;
  }

  if (isInvalidNonNegativeNumber(batchSizeMin)) {
    res.status(400).json({
      error: "batchSizeMin must be a non-negative number",
    });
    return;
  }

  if (isInvalidNonNegativeNumber(batchSizeMax)) {
    res.status(400).json({
      error: "batchSizeMax must be a non-negative number",
    });
    return;
  }

  // Validate batchSizeMin <= batchSizeMax if both provided
  if (
    batchSizeMin !== undefined &&
    batchSizeMax !== undefined &&
    batchSizeMin > batchSizeMax
  ) {
    res.status(400).json({
      error: "batchSizeMin must be <= batchSizeMax",
    });
    return;
  }

  // Update operational settings (interval, batch size)
  const streamUpdates: {
    intervalMinMs?: number;
    intervalMaxMs?: number;
    batchSizeMin?: number;
    batchSizeMax?: number;
  } = {};
  if (intervalMinMs !== undefined) streamUpdates.intervalMinMs = intervalMinMs;
  if (intervalMaxMs !== undefined) streamUpdates.intervalMaxMs = intervalMaxMs;
  if (batchSizeMin !== undefined) streamUpdates.batchSizeMin = batchSizeMin;
  if (batchSizeMax !== undefined) streamUpdates.batchSizeMax = batchSizeMax;

  if (Object.keys(streamUpdates).length > 0) {
    updateStreamConfig(streamUpdates);
  }

  // Update failure injection settings (malformed batch, connection drop)
  const failureUpdates: {
    malformedBatchProbability?: number;
    connectionDropProbability?: number;
  } = {};
  if (malformedBatchProbability !== undefined)
    failureUpdates.malformedBatchProbability = malformedBatchProbability;
  if (connectionDropProbability !== undefined)
    failureUpdates.connectionDropProbability = connectionDropProbability;

  if (Object.keys(failureUpdates).length > 0) {
    updateWebSocketFailureConfig(failureUpdates);
  }

  logger.info(
    {
      malformedBatchProbability,
      connectionDropProbability,
      intervalMinMs,
      intervalMaxMs,
      batchSizeMin,
      batchSizeMax,
    },
    "Updated stream config"
  );

  res.json({
    message: "Stream config updated",
    streamConfig: getStreamConfig(),
    failureConfig: getWebSocketFailureConfig(),
  });
});

/**
 * GET /api/debug/stream/config
 *
 * Get the current WebSocket stream configuration.
 * **Protected**: Requires X-API-Key header matching ADMIN_API_KEY env var.
 *
 * Headers: X-API-Key (required)
 */
debugRouter.get("/api/debug/stream/config", (req: Request, res: Response) => {
  // Validate API key
  if (!validateAdminApiKey(req)) {
    res.status(401).json({
      error:
        "Unauthorized: X-API-Key header required and must match ADMIN_API_KEY",
    });
    return;
  }

  res.json({
    streamConfig: getStreamConfig(),
    failureConfig: getWebSocketFailureConfig(),
  });
});

/**
 * POST /api/debug/stream/reset
 *
 * Reset WebSocket stream configuration to safe defaults.
 * **Protected**: Requires X-API-Key header matching ADMIN_API_KEY env var.
 *
 * Headers: X-API-Key (required)
 */
debugRouter.post("/api/debug/stream/reset", (req: Request, res: Response) => {
  // Validate API key
  if (!validateAdminApiKey(req)) {
    res.status(401).json({
      error:
        "Unauthorized: X-API-Key header required and must match ADMIN_API_KEY",
    });
    return;
  }

  resetStreamConfig();
  resetWebSocketFailureConfig();

  logger.info("Reset stream config to defaults");

  res.json({
    message: "Stream config reset to defaults",
    streamConfig: getStreamConfig(),
    failureConfig: getWebSocketFailureConfig(),
  });
});
