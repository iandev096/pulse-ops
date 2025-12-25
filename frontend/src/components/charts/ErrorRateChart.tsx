import { TimeSeriesLineChart } from "@/components/charts/TimeSeriesLineChart";
import { Abbreviation } from "@/components/ui/Abbreviation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getErrorRateTimeSeries } from "@/lib/mockData";

export function ErrorRateChart() {
  const data = getErrorRateTimeSeries(60);

  return (
    <Card className="flex-1 bg-muted/70">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs font-medium text-foreground uppercase tracking-wide">
            <Abbreviation abbr="ERR" fullText="Error Rate" />
          </CardTitle>
          <div className="text-[10px] text-muted-foreground font-mono tabular-nums leading-tight text-right">
            <div>x: time</div>
            <div>y: %</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-32">
          <TimeSeriesLineChart
            data={data}
            unit="%"
            yDomain={[0, 15]}
            threshold={5}
            color="--destructive"
          />
        </div>
      </CardContent>
    </Card>
  );
}
