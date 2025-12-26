import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFiltersStore } from "@/stores/useFiltersStore";
import { REGIONS, REGION_DESCRIPTIONS } from "shared";

export function RegionFilter() {
  const region = useFiltersStore((state) => state.region);
  const setRegion = useFiltersStore((state) => state.setRegion);

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-medium text-muted-foreground">
        Region
      </label>
      <Select value={region} onValueChange={setRegion}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="All Regions" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Regions</SelectItem>
          {REGIONS.map((region: (typeof REGIONS)[number]) => (
            <SelectItem key={region} value={region}>
              {REGION_DESCRIPTIONS[region]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
