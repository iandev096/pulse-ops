import cors from "cors";
import express from "express";
import http from "node:http";
import { errorHandler, requestLogger } from "./middleware/index.js";
import { debugRouter, eventsRouter, healthRouter } from "./routes/index.js";
import { attachWebSocket } from "./ws/events.js";

export function createServer() {
  const app = express();

  const corsOrigin = process.env.CORS_ORIGIN || "http://localhost:5173";

  // Middleware (order matters)
  app.use(requestLogger);
  app.use(cors({ origin: corsOrigin }));
  app.use(express.json());

  // Routes
  app.use(healthRouter);
  app.use(eventsRouter);
  app.use(debugRouter);

  // Error handler (must be last)
  app.use(errorHandler);

  const server = http.createServer(app);

  // Attach WebSocket
  attachWebSocket(server);

  return server;
}
