import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ChartsSectionSkeleton() {
  return (
    <section>
      <h2 className="sr-only">Charts</h2>
      <div className="flex gap-4">
        <Card className="flex-1 bg-muted/70">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-medium text-muted-foreground/30 uppercase tracking-wide animate-pulse">
                EPS
              </CardTitle>
              <div className="text-[10px] text-muted-foreground/30 font-mono tabular-nums leading-tight text-right animate-pulse">
                <div>x: time</div>
                <div>y: events/sec</div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-32 bg-muted-foreground/10 rounded animate-pulse" />
          </CardContent>
        </Card>
        <Card className="flex-1 bg-muted/70">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-medium text-muted-foreground/30 uppercase tracking-wide animate-pulse">
                ERR
              </CardTitle>
              <div className="text-[10px] text-muted-foreground/30 font-mono tabular-nums leading-tight text-right animate-pulse">
                <div>x: time</div>
                <div>y: %</div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-32 bg-muted-foreground/10 rounded animate-pulse" />
          </CardContent>
        </Card>
        <Card className="flex-1 bg-muted/70">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-medium text-muted-foreground/30 uppercase tracking-wide animate-pulse">
                P95
              </CardTitle>
              <div className="text-[10px] text-muted-foreground/30 font-mono tabular-nums leading-tight text-right animate-pulse">
                <div>x: time</div>
                <div>y: ms</div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-32 bg-muted-foreground/10 rounded animate-pulse" />
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
