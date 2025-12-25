import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { REGIONS, REGION_DESCRIPTIONS } from "@/lib/mockData";
import { useState } from "react";

export function RegionFilter() {
  const [selected, setSelected] = useState<string>("all");

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-medium text-muted-foreground">
        Region
      </label>
      <Select value={selected} onValueChange={setSelected}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="All Regions" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Regions</SelectItem>
          {REGIONS.map((region) => (
            <SelectItem key={region} value={region}>
              {REGION_DESCRIPTIONS[region]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
