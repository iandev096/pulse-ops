/**
 * WebSocket live event stream.
 *
 * Broadcasts EVENT_BATCH messages to all connected clients every 500-1000ms.
 * Supports global pause/resume control and failure simulation.
 */

import crypto from "node:crypto";
import type { Server } from "node:http";
import { WebSocket, WebSocketServer } from "ws";
import {
  getBatchSizeMax,
  getBatchSizeMin,
  getIntervalMaxMs,
  getIntervalMinMs,
} from "../config/streamConfig.js";
import {
  getWebSocketConnectionDropProbability,
  getWebSocketMalformedBatchProbability,
} from "../config/webSocketFailureConfig.js";
import { generateEventBatch } from "../generator/eventGenerator.js";
import { logger } from "../logger.js";
import { type Event } from "../schema/event.js";
import { eventStore } from "../store/eventStore.js";
import { getIsPaused } from "./streamState.js";

// =============================================================================
// WebSocket Message Types
// =============================================================================

/**
 * Union type for all WebSocket messages sent to clients.
 */
export type WebSocketMessage =
  | { type: "EVENT_BATCH"; emittedAt: number; events: Event[] }
  | { type: "STREAM_PAUSED" }
  | { type: "STREAM_RESUMED" }
  | { type: "STREAM_ERROR"; reason: string }
  | { type: "HELLO"; connectionId: string; message: string };

// =============================================================================
// Connection Tracking
// =============================================================================

/**
 * Set of all active WebSocket connections.
 */
const activeConnections = new Set<WebSocket>();

/**
 * Gets the number of active WebSocket connections.
 */
export function getActiveConnectionCount(): number {
  return activeConnections.size;
}

// =============================================================================
// Broadcast Helpers
// =============================================================================

/**
 * Broadcasts a message to all active connections.
 * Removes dead connections from the set.
 */
function broadcast(message: WebSocketMessage): void {
  const messageStr = JSON.stringify(message);
  const deadConnections: WebSocket[] = [];

  for (const ws of activeConnections) {
    if (ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(messageStr);
      } catch (err) {
        logger.warn({ err }, "Failed to send WebSocket message");
        deadConnections.push(ws);
      }
    } else {
      deadConnections.push(ws);
    }
  }

  // Clean up dead connections
  for (const ws of deadConnections) {
    activeConnections.delete(ws);
  }
}

/**
 * Sends a message to a specific connection.
 */
function sendToConnection(ws: WebSocket, message: WebSocketMessage): void {
  if (ws.readyState === WebSocket.OPEN) {
    try {
      ws.send(JSON.stringify(message));
    } catch (err) {
      logger.warn({ err }, "Failed to send WebSocket message to connection");
    }
  }
}

// =============================================================================
// Event Batch Generation & Broadcasting
// =============================================================================

/**
 * Generates a random batch size between batchSizeMin and batchSizeMax (from config).
 */
function randomBatchSize(): number {
  const min = getBatchSizeMin();
  const max = getBatchSizeMax();
  const range = max - min + 1;
  return Math.floor(Math.random() * range) + min;
}

/**
 * Generates a random interval between intervalMinMs and intervalMaxMs (from config).
 */
function randomInterval(): number {
  const min = getIntervalMinMs();
  const max = getIntervalMaxMs();
  const range = max - min;
  return Math.floor(Math.random() * range) + min;
}

/**
 * Generates and broadcasts an event batch.
 * Stores each event in the ring buffer before broadcasting.
 */
function emitEventBatch(): void {
  const emittedAt = Date.now();
  const batchSize = randomBatchSize();
  const events = generateEventBatch(emittedAt, batchSize);

  // Store each event in the ring buffer before broadcasting
  let storedCount = 0;
  let errorCount = 0;
  for (const event of events) {
    try {
      eventStore.append(event);
      storedCount++;
    } catch (err) {
      errorCount++;
      logger.warn(
        { err, eventId: event.id },
        "Failed to store event in ring buffer"
      );
    }
  }

  const message: WebSocketMessage = {
    type: "EVENT_BATCH",
    emittedAt,
    events,
  };

  broadcast(message);

  logger.debug(
    { batchSize, storedCount, errorCount, connections: activeConnections.size },
    "Emitted event batch"
  );
}

// =============================================================================
// Failure Simulation
// =============================================================================

/**
 * Generates and broadcasts a malformed event batch (for failure simulation).
 * Events are generated and stored normally, but only IDs and timestamps are sent
 * in the WebSocket message, allowing the frontend to detect malformed batches
 * and recover by fetching full events from the HTTP endpoint.
 */
function emitMalformedBatch(): void {
  const emittedAt = Date.now();
  const batchSize = randomBatchSize();
  const events = generateEventBatch(emittedAt, batchSize);

  // Store each event in the ring buffer (so they're available via HTTP endpoint)
  let storedCount = 0;
  let errorCount = 0;
  for (const event of events) {
    try {
      eventStore.append(event);
      storedCount++;
    } catch (err) {
      errorCount++;
      logger.warn(
        { err, eventId: event.id },
        "Failed to store event in ring buffer"
      );
    }
  }

  // Send malformed message with only IDs and timestamps (missing required fields)
  // Frontend can detect this is malformed and recover by fetching full events
  const malformedEvents = events.map((event) => ({
    id: event.id,
    timestamp: event.timestamp,
  }));

  const malformedMessage = {
    type: "EVENT_BATCH",
    emittedAt,
    events: malformedEvents, // Malformed: missing required fields like service, eventType, etc.
  } as unknown as WebSocketMessage;

  broadcast(malformedMessage);

  logger.warn(
    { emittedAt, batchSize, storedCount, errorCount },
    "Emitted malformed batch (failure simulation) - events stored, only IDs sent"
  );
}

/**
 * Randomly drops a connection (for failure simulation).
 */
function simulateConnectionDrop(): void {
  if (activeConnections.size === 0) return;

  const connections = Array.from(activeConnections);
  const randomConnection =
    connections[Math.floor(Math.random() * connections.length)];

  logger.warn(
    { connectionCount: activeConnections.size },
    "Simulating connection drop"
  );

  try {
    randomConnection.close(1000, "Simulated connection drop");
  } catch (err) {
    logger.warn({ err }, "Error during simulated connection drop");
  }
  activeConnections.delete(randomConnection);
}

/**
 * Sends a STREAM_ERROR message to all connections.
 */
function emitStreamError(reason: string): void {
  const message: WebSocketMessage = {
    type: "STREAM_ERROR",
    reason,
  };

  broadcast(message);

  logger.warn({ reason }, "Emitted stream error");
}

// =============================================================================
// Stream Loop
// =============================================================================

let broadcastInterval: NodeJS.Timeout | null = null;
let lastPauseState = false;

/**
 * Starts the event broadcast loop.
 */
function startBroadcastLoop(): void {
  if (broadcastInterval) {
    return; // Already running
  }

  function tick(): void {
    const isPaused = getIsPaused();

    // Send control messages if pause state changed
    if (isPaused !== lastPauseState) {
      if (isPaused) {
        const message: WebSocketMessage = { type: "STREAM_PAUSED" };
        broadcast(message);
        logger.info("Stream paused - broadcasting STREAM_PAUSED");
      } else {
        const message: WebSocketMessage = { type: "STREAM_RESUMED" };
        broadcast(message);
        logger.info("Stream resumed - broadcasting STREAM_RESUMED");
      }
      lastPauseState = isPaused;
    }

    // Skip emission if paused
    if (isPaused) {
      const nextInterval = randomInterval();
      broadcastInterval = setTimeout(tick, nextInterval);
      return;
    }

    // Failure simulation: occasionally send malformed batch
    if (Math.random() < getWebSocketMalformedBatchProbability()) {
      emitMalformedBatch();
      const nextInterval = randomInterval();
      broadcastInterval = setTimeout(tick, nextInterval);
      return;
    }

    // Failure simulation: occasionally drop a connection
    if (Math.random() < getWebSocketConnectionDropProbability()) {
      simulateConnectionDrop();
    }

    // Normal operation: emit event batch
    emitEventBatch();

    // Schedule next tick with random interval
    const nextInterval = randomInterval();
    broadcastInterval = setTimeout(tick, nextInterval);
  }

  // Start the loop
  lastPauseState = getIsPaused();
  const initialInterval = randomInterval();
  broadcastInterval = setTimeout(tick, initialInterval);

  logger.info("Event broadcast loop started");
}

/**
 * Stops the event broadcast loop.
 */
function stopBroadcastLoop(): void {
  if (broadcastInterval) {
    clearTimeout(broadcastInterval);
    broadcastInterval = null;
    logger.info("Event broadcast loop stopped");
  }
}

// =============================================================================
// WebSocket Server Setup
// =============================================================================

export function attachWebSocket(server: Server) {
  const wss = new WebSocketServer({ server, path: "/ws/events" });

  wss.on("connection", (ws: WebSocket) => {
    const connectionId = crypto.randomUUID();

    // Add to active connections
    activeConnections.add(ws);

    logger.info(
      { connectionId, totalConnections: activeConnections.size },
      "WebSocket client connected"
    );

    // Send hello message on connect
    const helloMessage: WebSocketMessage = {
      type: "HELLO",
      connectionId,
      message: "connected to data-producer",
    };
    sendToConnection(ws, helloMessage);

    // If this is the first connection, start the broadcast loop
    if (activeConnections.size === 1) {
      startBroadcastLoop();
    }

    ws.on("close", () => {
      activeConnections.delete(ws);

      logger.info(
        {
          connectionId,
          totalConnections: activeConnections.size,
          event: "disconnected",
        },
        "WebSocket client disconnected"
      );

      // Stop broadcast loop if no connections remain
      if (activeConnections.size === 0) {
        stopBroadcastLoop();
      }
    });

    ws.on("error", (err) => {
      activeConnections.delete(ws);

      logger.error(
        { connectionId, event: "error", err: err.message },
        "WebSocket error"
      );

      // Stop broadcast loop if no connections remain
      if (activeConnections.size === 0) {
        stopBroadcastLoop();
      }
    });
  });

  logger.info("WebSocket server attached at /ws/events");
}

// =============================================================================
// Exports for Observability
// =============================================================================

/**
 * Gets statistics about the WebSocket stream.
 */
export function getStreamStats() {
  return {
    activeConnections: activeConnections.size,
    isPaused: getIsPaused(),
    isBroadcasting: broadcastInterval !== null,
  };
}
