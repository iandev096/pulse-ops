// Placeholder data for PulseOps dashboard
// Updated to match backend schema from data-producer/src/schema/event.ts

export const SERVICES = [
  "auth",
  "payments",
  "orders",
  "notifications",
] as const;

export const REGIONS = ["NA", "EU", "APAC", "MEA"] as const;

export const REGION_DESCRIPTIONS: Record<Region, string> = {
  NA: "North America",
  EU: "Europe",
  APAC: "Asia-Pacific",
  MEA: "Middle East & Africa",
};

export const EVENT_TYPES = ["success", "error", "warning"] as const;

export type Service = (typeof SERVICES)[number];
export type Region = (typeof REGIONS)[number];
export type EventType = (typeof EVENT_TYPES)[number];

// Metrics placeholder data
export interface MetricsData {
  eventsPerSecond: number;
  errorRate: number;
  p95Latency: number;
  activeServices: number;
}

export function getPlaceholderMetrics(): MetricsData {
  return {
    eventsPerSecond: 1247,
    errorRate: 2.3,
    p95Latency: 142,
    activeServices: 4, // Updated to match new service count
  };
}

// Chart placeholder data
export interface ChartDataPoint {
  timestamp: number;
  value: number;
}

export function getPlaceholderChartData(points: number = 30): ChartDataPoint[] {
  const now = Date.now();
  const interval = 60000; // 1 minute intervals

  return Array.from({ length: points }, (_, i) => ({
    timestamp: now - (points - 1 - i) * interval,
    value: Math.floor(Math.random() * 100) + 50,
  }));
}

// Time-series data for charts
export interface TimeSeriesDataPoint {
  t: number; // timestamp in ms
  v: number; // value
}

/**
 * Generate Events Per Second (EPS) time-series data
 * Values range from 200-3000 with occasional spikes
 */
export function getEpsTimeSeries(points: number = 60): TimeSeriesDataPoint[] {
  const now = Date.now();
  const interval = 10000; // 10 second intervals
  const baseValue = 1200;
  const variance = 400;

  return Array.from({ length: points }, (_, i) => {
    const t = now - (points - 1 - i) * interval;

    // Create occasional spikes (10% chance)
    const hasSpike = Math.random() > 0.9;
    const spikeMultiplier = hasSpike ? 1.5 + Math.random() : 1;

    // Add some natural variation with sine wave
    const wave = Math.sin(i / 10) * variance * 0.3;
    const noise = (Math.random() - 0.5) * variance;

    const v = Math.max(
      200,
      Math.floor((baseValue + wave + noise) * spikeMultiplier)
    );

    return { t, v };
  });
}

/**
 * Generate Error Rate time-series data
 * Values range from 0-10% with occasional bursts
 */
export function getErrorRateTimeSeries(
  points: number = 60
): TimeSeriesDataPoint[] {
  const now = Date.now();
  const interval = 10000; // 10 second intervals
  const baseValue = 2.0; // 2% base error rate

  return Array.from({ length: points }, (_, i) => {
    const t = now - (points - 1 - i) * interval;

    // Create occasional error bursts (5% chance)
    const hasBurst = Math.random() > 0.95;
    const burstValue = hasBurst ? 5 + Math.random() * 5 : 0;

    // Add natural variation
    const noise = (Math.random() - 0.5) * 1.5;

    const v = Math.max(0, Math.min(15, baseValue + noise + burstValue));

    return { t, v: Number(v.toFixed(2)) };
  });
}

/**
 * Generate P95 Latency time-series data
 * Values range from 50-500ms with occasional latency spikes
 */
export function getP95LatencyTimeSeries(
  points: number = 60
): TimeSeriesDataPoint[] {
  const now = Date.now();
  const interval = 10000; // 10 second intervals
  const baseValue = 150;
  const variance = 50;

  return Array.from({ length: points }, (_, i) => {
    const t = now - (points - 1 - i) * interval;

    // Create occasional latency spikes (8% chance)
    const hasSpike = Math.random() > 0.92;
    const spikeValue = hasSpike ? 200 + Math.random() * 200 : 0;

    // Add some natural variation with sine wave
    const wave = Math.sin(i / 8) * variance * 0.5;
    const noise = (Math.random() - 0.5) * variance;

    const v = Math.max(50, Math.floor(baseValue + wave + noise + spikeValue));

    return { t, v };
  });
}

// Event placeholder data
// Updated to match backend Event schema
export interface EventData {
  id: string; // UUID
  timestamp: number; // Unix epoch ms
  service: Service;
  eventType: EventType; // Renamed from "type"
  userId: string; // NEW: User identifier
  region: Region;
  latencyMs: number; // Renamed from "latency"
  payloadSizeKb: number; // NEW: Payload size in KB
}

/**
 * Generate a simple UUID v4 for mock events
 */
function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Generate a random user ID
 */
function generateUserId(): string {
  return `user-${Math.floor(Math.random() * 10000)
    .toString()
    .padStart(5, "0")}`;
}

export function generateRandomEvent(): EventData {
  const service = SERVICES[Math.floor(Math.random() * SERVICES.length)];
  const region = REGIONS[Math.floor(Math.random() * REGIONS.length)];
  const latencyMs = Math.floor(Math.random() * 500) + 10;

  // Generate eventType with weighted distribution (more success than errors)
  const eventTypeRoll = Math.random();
  const eventType: EventType =
    eventTypeRoll > 0.95
      ? "error"
      : eventTypeRoll > 0.85
      ? "warning"
      : "success";

  // Generate payload size between 0.1 KB and 50 KB
  const payloadSizeKb = Number((Math.random() * 49.9 + 0.1).toFixed(2));

  return {
    id: generateUUID(),
    timestamp: Date.now(),
    service,
    eventType,
    userId: generateUserId(),
    region,
    latencyMs,
    payloadSizeKb,
  };
}

export function getPlaceholderEvents(count: number = 50): EventData[] {
  // Generate events with slightly varied timestamps going back in time
  const events: EventData[] = [];
  const now = Date.now();

  for (let i = 0; i < count; i++) {
    const event = generateRandomEvent();
    event.timestamp = now - i * 100; // 100ms apart
    events.push(event);
  }

  return events;
}
