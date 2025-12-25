import { ErrorRateChart } from "@/components/charts/ErrorRateChart";
import { EventsPerSecondChart } from "@/components/charts/EventsPerSecondChart";
import { LatencyChart } from "@/components/charts/LatencyChart";

export function ChartsSection() {
  return (
    <section>
      <h2 className="sr-only">Charts</h2>
      <div className="flex gap-4">
        <EventsPerSecondChart />
        <ErrorRateChart />
        <LatencyChart />
      </div>
    </section>
  );
}
