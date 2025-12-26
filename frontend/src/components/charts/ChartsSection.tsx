import { ErrorRateChart } from "@/components/charts/ErrorRateChart";
import { EventsPerSecondChart } from "@/components/charts/EventsPerSecondChart";
import { LatencyChart } from "@/components/charts/LatencyChart";
import { Button } from "@/components/ui/button";
import { useChartLayoutStore } from "@/stores/useChartLayoutStore";
import { LayoutGrid, LayoutList } from "lucide-react";

export function ChartsSection() {
  const layout = useChartLayoutStore((state) => state.layout);
  const toggleLayout = useChartLayoutStore((state) => state.toggleLayout);

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-muted-foreground">Charts</h2>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={toggleLayout}
          className="hidden md:flex"
          aria-label={`Switch to ${
            layout === "horizontal" ? "vertical" : "horizontal"
          } layout`}
          title={`Switch to ${
            layout === "horizontal" ? "vertical" : "horizontal"
          } layout`}
        >
          {layout === "horizontal" ? (
            <LayoutList className="h-4 w-4" />
          ) : (
            <LayoutGrid className="h-4 w-4" />
          )}
        </Button>
      </div>
      <div
        className={`flex gap-4 ${
          layout === "horizontal" ? "flex-col md:flex-row" : "flex-col"
        }`}
      >
        <EventsPerSecondChart />
        <ErrorRateChart />
        <LatencyChart />
      </div>
    </section>
  );
}
