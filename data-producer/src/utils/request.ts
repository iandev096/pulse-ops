/**
 * Request utility functions.
 */

import { type Request } from "express";
import { ANONYMOUS_CLIENT_ID } from "../config/httpFailureInjectionConfig.js";

/**
 * Extracts the client ID from the `X-Client-Id` header.
 * Falls back to ANONYMOUS_CLIENT_ID if not provided.
 *
 * @param req - Express request object
 * @returns The client ID from the header, or ANONYMOUS_CLIENT_ID if not provided
 */
export function getClientId(req: Request): string {
  const clientId = req.headers["x-client-id"];
  if (typeof clientId === "string" && clientId.trim()) {
    return clientId.trim();
  }
  return ANONYMOUS_CLIENT_ID;
}

/**
 * Validates the admin API key from the request.
 * Returns true if valid, false otherwise.
 *
 * @param req - Express request object
 * @returns `true` if the `X-API-Key` header matches `ADMIN_API_KEY` env var, `false` otherwise
 */
export function validateAdminApiKey(req: Request): boolean {
  const apiKey = req.headers["x-api-key"];
  const expectedKey = process.env.ADMIN_API_KEY;

  if (!expectedKey) {
    // If no ADMIN_API_KEY is set, reject all requests
    return false;
  }

  return typeof apiKey === "string" && apiKey === expectedKey;
}
