import { Button } from "@/components/ui/button";
import { formatRelativeTime } from "@/lib/timeUtils";
import { useTimeWindowStore } from "@/stores/useTimeWindowStore";
import { RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";

export function LastUpdateIndicator() {
  const timeWindow = useTimeWindowStore((state) => state.timeWindow);
  const lastRefresh = useTimeWindowStore((state) => state.lastRefresh);
  const triggerRefresh = useTimeWindowStore((state) => state.triggerRefresh);
  const [relativeTime, setRelativeTime] = useState("0s ago");

  // Update relative time display every second
  useEffect(() => {
    const updateRelativeTime = () => {
      setRelativeTime(formatRelativeTime(lastRefresh));
    };

    // Initial update
    updateRelativeTime();

    // Update every second
    const interval = setInterval(updateRelativeTime, 1000);

    return () => clearInterval(interval);
  }, [lastRefresh]);

  const handleRefresh = () => {
    triggerRefresh();
  };

  return (
    <div
      className={`flex items-center gap-2 transition-opacity ${
        timeWindow === "Live" ? "opacity-0" : "opacity-100"
      }`}
    >
      <span className="text-xs text-muted-foreground font-mono tabular-nums min-w-24">
        Updated {relativeTime}
      </span>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={handleRefresh}
        className="h-8 w-8 cursor-pointer"
        title="Refresh data"
      >
        <RefreshCw className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
