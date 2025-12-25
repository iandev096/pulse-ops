import { useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface TimeSeriesLineChartProps {
  data: Array<{ t: number; v: number }>;
  unit?: string;
  yDomain?: [number | "auto", number | "auto"];
  threshold?: number;
  color?: string;
}

function getCssVariable(variable: string): string {
  if (typeof window === "undefined") return "";
  return getComputedStyle(document.documentElement)
    .getPropertyValue(variable)
    .trim();
}

export function TimeSeriesLineChart({
  data,
  unit = "",
  yDomain,
  threshold,
  color,
}: TimeSeriesLineChartProps) {
  const [colors, setColors] = useState({
    mutedForeground: "",
    lineColor: "",
    destructive: "",
    popover: "",
    border: "",
  });

  useEffect(() => {
    const updateColors = () => {
      // If color starts with --, it's a CSS variable name, otherwise use it as-is
      const lineColor = color
        ? color.startsWith("--")
          ? getCssVariable(color)
          : color
        : getCssVariable("--chart-1");

      setColors({
        mutedForeground: getCssVariable("--muted-foreground"),
        lineColor,
        destructive: getCssVariable("--destructive"),
        popover: getCssVariable("--popover"),
        border: getCssVariable("--border"),
      });
    };

    // Initial read
    updateColors();

    // Listen for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "class"
        ) {
          updateColors();
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, [color]);

  const nfCompact = useMemo(
    () =>
      new Intl.NumberFormat("en", {
        notation: "compact",
        maximumFractionDigits: 1,
      }),
    []
  );

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const formatTickValue = (value: number) => {
    // Keep Y-axis ticks clean: no units, minimal decimals
    if (unit === "%") return Math.round(value).toString();
    if (unit === "ms") return Math.round(value).toString();
    return nfCompact.format(value);
  };

  const formatTooltipValue = (value: number) => {
    // Tooltip can be explicit with units
    if (unit === "%") return `${value.toFixed(1)}%`;
    if (unit === "ms") return `${Math.round(value)}ms`;
    return Math.round(value).toString();
  };

  // Don't render until colors are loaded
  if (!colors.lineColor) {
    return <div className="h-32" />;
  }

  return (
    <ResponsiveContainer width="100%" height={128}>
      <LineChart data={data} margin={{ top: 6, right: 8, left: 4, bottom: 0 }}>
        <CartesianGrid
          vertical={false}
          stroke={colors.border}
          strokeOpacity={0.18}
          strokeDasharray="3 3"
        />
        <XAxis
          dataKey="t"
          type="number"
          domain={["dataMin", "dataMax"]}
          tickFormatter={formatTime}
          tick={{ fill: colors.mutedForeground, fontSize: 11 }}
          tickMargin={6}
          stroke="none"
          tickLine={false}
          axisLine={{
            stroke: colors.mutedForeground,
            strokeWidth: 1,
            strokeOpacity: 0.5,
          }}
          interval="preserveStartEnd"
          minTickGap={60}
        />
        <YAxis
          domain={yDomain || ["auto", "auto"]}
          tick={{ fill: colors.mutedForeground, fontSize: 11 }}
          stroke="none"
          tickLine={false}
          axisLine={{
            stroke: colors.mutedForeground,
            strokeWidth: 1,
            strokeOpacity: 0.5,
          }}
          tickFormatter={formatTickValue}
          tickCount={4}
          width={34}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: colors.popover,
            border: `1px solid ${colors.border}`,
            borderRadius: "6px",
            fontSize: "12px",
            padding: "8px 12px",
          }}
          labelFormatter={formatTime}
          formatter={(value: number | undefined) => [
            value !== undefined ? formatTooltipValue(value) : "",
          ]}
        />
        {threshold !== undefined && (
          <ReferenceLine
            y={threshold}
            stroke={colors.destructive}
            strokeDasharray="3 3"
            strokeWidth={1.5}
          />
        )}
        <Line
          type="monotone"
          dataKey="v"
          stroke={colors.lineColor}
          strokeWidth={2.25}
          strokeLinecap="round"
          dot={false}
          activeDot={{ r: 3 }}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
