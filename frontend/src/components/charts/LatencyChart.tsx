import { TimeSeriesLineChart } from "@/components/charts/TimeSeriesLineChart";
import { Abbreviation } from "@/components/ui/Abbreviation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getP95LatencyTimeSeries } from "@/lib/mockData";

export function LatencyChart() {
  const data = getP95LatencyTimeSeries(60);

  return (
    <Card className="flex-1 bg-muted/70">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs font-medium text-foreground uppercase tracking-wide">
            <Abbreviation abbr="P95" fullText="95th Percentile Latency" />
          </CardTitle>
          <div className="text-[10px] text-muted-foreground font-mono tabular-nums leading-tight text-right">
            <div>x: time</div>
            <div>y: ms</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-32">
          <TimeSeriesLineChart data={data} unit="ms" color="--chart-3" />
        </div>
      </CardContent>
    </Card>
  );
}
