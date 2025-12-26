import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFiltersStore } from "@/stores/useFiltersStore";
import { X } from "lucide-react";
import { EVENT_TYPES, REGIONS, REGION_DESCRIPTIONS, SERVICES } from "shared";

export function TabletFiltersBar() {
  const service = useFiltersStore((state) => state.service);
  const region = useFiltersStore((state) => state.region);
  const eventType = useFiltersStore((state) => state.eventType);
  const setService = useFiltersStore((state) => state.setService);
  const setRegion = useFiltersStore((state) => state.setRegion);
  const setEventType = useFiltersStore((state) => state.setEventType);
  const clearService = useFiltersStore((state) => state.clearService);
  const clearRegion = useFiltersStore((state) => state.clearRegion);
  const clearEventType = useFiltersStore((state) => state.clearEventType);

  const getRegionLabel = (regionValue: string) => {
    if (regionValue === "all") return "All Regions";
    return (
      REGION_DESCRIPTIONS[regionValue as keyof typeof REGION_DESCRIPTIONS] ||
      regionValue
    );
  };

  return (
    <div className="flex items-center gap-3 px-4 py-3 overflow-x-auto custom-scrollbar">
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide shrink-0">
        Filters
      </span>

      {/* Service Filter */}
      {service !== "all" ? (
        <Badge
          variant="secondary"
          className="cursor-pointer hover:bg-secondary/80 shrink-0"
          onClick={clearService}
        >
          <span className="text-xs">Service: {service}</span>
          <X className="h-3 w-3 ml-1" />
        </Badge>
      ) : (
        <Select value={service} onValueChange={setService}>
          <SelectTrigger className="h-8 w-auto min-w-[120px] text-xs shrink-0">
            <SelectValue placeholder="Service" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Services</SelectItem>
            {SERVICES.map((svc) => (
              <SelectItem key={svc} value={svc}>
                {svc}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Region Filter */}
      {region !== "all" ? (
        <Badge
          variant="secondary"
          className="cursor-pointer hover:bg-secondary/80 shrink-0"
          onClick={clearRegion}
        >
          <span className="text-xs">Region: {getRegionLabel(region)}</span>
          <X className="h-3 w-3 ml-1" />
        </Badge>
      ) : (
        <Select value={region} onValueChange={setRegion}>
          <SelectTrigger className="h-8 w-auto min-w-[120px] text-xs shrink-0">
            <SelectValue placeholder="Region" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Regions</SelectItem>
            {REGIONS.map((reg) => (
              <SelectItem key={reg} value={reg}>
                {REGION_DESCRIPTIONS[reg]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Event Type Filter */}
      {eventType !== "all" ? (
        <Badge
          variant="secondary"
          className="cursor-pointer hover:bg-secondary/80 shrink-0"
          onClick={clearEventType}
        >
          <span className="text-xs">Type: {eventType}</span>
          <X className="h-3 w-3 ml-1" />
        </Badge>
      ) : (
        <Select value={eventType} onValueChange={setEventType}>
          <SelectTrigger className="h-8 w-auto min-w-[120px] text-xs shrink-0">
            <SelectValue placeholder="Type" />
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
      )}
    </div>
  );
}
