import { EventTypeFilter } from "@/components/filters/EventTypeFilter";
import { RegionFilter } from "@/components/filters/RegionFilter";
import { ServiceFilter } from "@/components/filters/ServiceFilter";
import { LastUpdateIndicator } from "@/components/topbar/LastUpdateIndicator";
import { ThemeToggle } from "@/components/topbar/ThemeToggle";
import { TimeWindowSelector } from "@/components/topbar/TimeWindowSelector";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useTimeWindowStore } from "@/stores/useTimeWindowStore";

interface MobileSettingsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileSettingsSheet({
  open,
  onOpenChange,
}: MobileSettingsSheetProps) {
  const timeWindow = useTimeWindowStore((state) => state.timeWindow);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-[300px] sm:w-[400px] overflow-y-auto p-0"
      >
        <SheetHeader className="px-6 pt-6 pb-4">
          <SheetTitle>Settings</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col pb-6">
          {/* Time Window Section with integrated refresh */}
          <div className="px-6 space-y-3 pb-6">
            <h3 className="text-sm font-medium text-muted-foreground">
              Time Window
            </h3>
            <TimeWindowSelector />
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                timeWindow !== "Live"
                  ? "max-h-20 opacity-100 pt-2"
                  : "max-h-0 opacity-0 pt-0"
              }`}
            >
              <div className="flex justify-end">
                <LastUpdateIndicator />
              </div>
            </div>
          </div>

          <Separator />

          {/* Theme Section */}
          <div className="px-6 flex items-center justify-between py-6">
            <span className="text-sm font-medium">Theme</span>
            <ThemeToggle />
          </div>

          <Separator />

          {/* Filters Section */}
          <div className="px-6 space-y-4 pt-6">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Filters
            </h3>
            <div className="space-y-4">
              <ServiceFilter />
              <RegionFilter />
              <EventTypeFilter />
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
