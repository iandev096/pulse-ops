import { z } from "zod";

// =============================================================================
// Region Definitions
// =============================================================================

/**
 * Geographic region codes representing where events originate.
 */
export const REGIONS = ["NA", "EU", "APAC", "MEA"] as const;

/**
 * Human-readable descriptions for each region code.
 */
export const REGION_DESCRIPTIONS: Record<Region, string> = {
  NA: "North America",
  EU: "Europe",
  APAC: "Asia-Pacific",
  MEA: "Middle East & Africa",
};

export const RegionSchema = z.enum(REGIONS);
export type Region = z.infer<typeof RegionSchema>;

// =============================================================================
// Service Definitions
// =============================================================================

/**
 * Backend services that can emit events.
 */
export const SERVICES = [
  "auth",
  "payments",
  "orders",
  "notifications",
] as const;

export const ServiceSchema = z.enum(SERVICES);
export type Service = z.infer<typeof ServiceSchema>;

// =============================================================================
// Event Type Definitions
// =============================================================================

/**
 * Classification of event outcomes.
 * - success: Operation completed successfully
 * - warning: Operation completed with potential issues
 * - error: Operation failed
 */
export const EVENT_TYPES = ["success", "error", "warning"] as const;

export const EventTypeSchema = z.enum(EVENT_TYPES);
export type EventType = z.infer<typeof EventTypeSchema>;

// =============================================================================
// Event Schema
// =============================================================================

/**
 * Core event schema representing an operational event from a backend service.
 *
 * @property id - Unique identifier (UUID)
 * @property timestamp - Unix epoch timestamp in milliseconds
 * @property service - The backend service that emitted the event
 * @property eventType - Classification of the event outcome
 * @property userId - Identifier of the user associated with the event
 * @property region - Geographic region where the event originated
 * @property latencyMs - Request latency in milliseconds
 * @property payloadSizeKb - Size of the event payload in kilobytes
 */
export const EventSchema = z.object({
  id: z.uuid(),
  timestamp: z.number().int().nonnegative(),
  service: ServiceSchema,
  eventType: EventTypeSchema,
  userId: z.string(),
  region: RegionSchema,
  latencyMs: z.number().nonnegative(),
  payloadSizeKb: z.number().nonnegative(),
});

export type Event = z.infer<typeof EventSchema>;
