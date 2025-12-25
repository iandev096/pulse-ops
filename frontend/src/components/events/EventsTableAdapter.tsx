import { EventsTableNaive } from "@/components/events/EventsTableNaive";
import { type EventData } from "@/lib/mockData";

interface EventsTableAdapterProps {
  events: EventData[];
  /**
   * Implementation mode - currently only "naive" is implemented.
   * "virtualized" is a stub for future implementation.
   */
  mode?: "naive" | "virtualized";
}

/**
 * Adapter component that allows swapping between table implementations.
 * Currently defaults to naive implementation.
 */
export function EventsTableAdapter({
  events,
  mode = "naive",
}: EventsTableAdapterProps) {
  // For now, always use naive implementation
  // Virtualized implementation will be added later
  if (mode === "virtualized") {
    // Stub: fall back to naive for now
    return <EventsTableNaive events={events} />;
  }

  return <EventsTableNaive events={events} />;
}
