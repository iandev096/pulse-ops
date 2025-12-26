import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { type Event } from "shared";

interface EventsTableNaiveProps {
  events: Event[];
}

function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function getStatusBadgeVariant(
  eventType: Event["eventType"]
): "default" | "destructive" | "secondary" {
  switch (eventType) {
    case "success":
      return "default";
    case "error":
      return "destructive";
    case "warning":
      return "secondary";
    default:
      return "default";
  }
}

export function EventsTableNaive({ events }: EventsTableNaiveProps) {
  return (
    <Table className="table-fixed">
      <TableBody>
        {events.map((event) => (
          <TableRow
            key={event.id}
            className={cn(
              "border-l-2 transition-colors duration-75 hover:bg-muted/30",
              event.eventType === "error" && "border-l-destructive",
              event.eventType === "warning" && "border-l-yellow-500",
              event.eventType === "success" && "border-l-transparent"
            )}
          >
            <TableCell className="w-24 font-mono text-xs text-muted-foreground">
              {formatTimestamp(event.timestamp)}
            </TableCell>
            <TableCell className="w-40 font-medium">{event.service}</TableCell>
            <TableCell className="w-32 text-muted-foreground">
              {event.region}
            </TableCell>
            <TableCell className="w-32">
              <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                {event.eventType}
              </code>
            </TableCell>
            <TableCell className="w-24 text-right tabular-nums font-mono">
              <span
                className={cn(
                  "transition-colors duration-150",
                  event.latencyMs > 300 && "text-destructive",
                  event.latencyMs > 200 &&
                    event.latencyMs <= 300 &&
                    "text-yellow-600 dark:text-yellow-500"
                )}
              >
                {event.latencyMs}ms
              </span>
            </TableCell>
            <TableCell className="w-28">
              <Badge variant={getStatusBadgeVariant(event.eventType)}>
                {event.eventType}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
