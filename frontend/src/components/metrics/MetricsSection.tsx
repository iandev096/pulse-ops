import { MetricCard } from "@/components/metrics/MetricCard";
import { Abbreviation } from "@/components/ui/Abbreviation";
import { getPlaceholderMetrics } from "@/lib/mockData";

export function MetricsSection() {
  const metrics = getPlaceholderMetrics();

  return (
    <section>
      <h2 className="sr-only">Metrics Summary</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title={<Abbreviation abbr="EPS" fullText="Events Per Second" />}
          value={metrics.eventsPerSecond.toLocaleString()}
          trend="up"
        />
        <MetricCard
          title={<Abbreviation abbr="ERR" fullText="Error Rate" />}
          value={metrics.errorRate.toFixed(1)}
          unit="%"
          trend="down"
        />
        <MetricCard
          title={<Abbreviation abbr="P95" fullText="95th Percentile Latency" />}
          value={metrics.p95Latency}
          unit="ms"
          trend="neutral"
        />
        <MetricCard
          title="Services"
          value={metrics.activeServices}
          trend="neutral"
        />
      </div>
    </section>
  );
}
