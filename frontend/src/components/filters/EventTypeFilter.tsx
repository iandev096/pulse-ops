import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFiltersStore } from "@/stores/useFiltersStore";
import { EVENT_TYPES } from "shared";

export function EventTypeFilter() {
  const eventType = useFiltersStore((state) => state.eventType);
  const setEventType = useFiltersStore((state) => state.setEventType);

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-medium text-muted-foreground">
        Event Type
      </label>
      <Select value={eventType} onValueChange={setEventType}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="All Types" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          {EVENT_TYPES.map((type) => (
            <SelectItem key={type} value={type}>
              {type}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
