import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFiltersStore } from "@/stores/useFiltersStore";
import { SERVICES } from "shared";

export function ServiceFilter() {
  const service = useFiltersStore((state) => state.service);
  const setService = useFiltersStore((state) => state.setService);

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-medium text-muted-foreground">
        Service
      </label>
      <Select value={service} onValueChange={setService}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="All Services" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Services</SelectItem>
          {SERVICES.map((service) => (
            <SelectItem key={service} value={service}>
              {service}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
