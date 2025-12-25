import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface MetricCardProps {
  title: string | ReactNode;
  value: string | number;
  unit?: string;
  trend?: "up" | "down" | "neutral";
  className?: string;
}

export function MetricCard({
  title,
  value,
  unit,
  trend,
  className,
}: MetricCardProps) {
  return (
    <Card
      className={cn(
        "py-4 border-l-2",
        trend === "up" && "border-l-green-500",
        trend === "down" && "border-l-red-500",
        trend === "neutral" && "border-l-neutral-500",
        className
      )}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-col">
          <span className="text-3xl font-bold tabular-nums font-mono leading-none metric-value">
            {value}
          </span>
          <div className="flex items-center gap-2 mt-1">
            {unit && (
              <span className="text-xs text-muted-foreground font-mono">
                {unit}
              </span>
            )}
            {trend && trend !== "neutral" && (
              <span
                className={cn(
                  "text-xs",
                  trend === "up" && "text-green-500",
                  trend === "down" && "text-red-500"
                )}
              >
                {trend === "up" ? "↑" : "↓"}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
