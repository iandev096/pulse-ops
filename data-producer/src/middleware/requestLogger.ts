import type { NextFunction, Request, Response } from "express";
import crypto from "node:crypto";
import { logger } from "../logger.js";

declare global {
  namespace Express {
    interface Request {
      requestId: string;
      startTime: number;
    }
  }
}

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const requestId =
    (req.headers["x-request-id"] as string) || crypto.randomUUID();
  const startTime = Date.now();

  req.requestId = requestId;
  req.startTime = startTime;

  res.setHeader("x-request-id", requestId);

  res.on("finish", () => {
    const durationMs = Date.now() - startTime;
    const { method, originalUrl, ip } = req;
    const { statusCode } = res;

    const logData = {
      requestId,
      method,
      path: originalUrl,
      statusCode,
      durationMs,
      remoteAddress: ip,
    };

    if (statusCode >= 400) {
      logger.warn(logData, `${method} ${originalUrl} ${statusCode}`);
    } else {
      logger.info(logData, `${method} ${originalUrl} ${statusCode}`);
    }
  });

  next();
}
