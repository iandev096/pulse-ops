import type { NextFunction, Request, Response } from "express";
import { logger } from "../logger.js";

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  const requestId = req.requestId || "unknown";
  const { method, originalUrl } = req;

  logger.error(
    {
      requestId,
      method,
      path: originalUrl,
      err: {
        message: err.message,
        stack: err.stack,
        name: err.name,
      },
    },
    `Error handling ${method} ${originalUrl}`
  );

  const statusCode = res.statusCode >= 400 ? res.statusCode : 500;

  res.status(statusCode).json({
    error: statusCode === 500 ? "Internal Server Error" : err.message,
    requestId,
  });
}
