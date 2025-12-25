import { Button } from "@/components/ui/button";
import { useTimeWindowStore } from "@/stores/useTimeWindowStore";

const TIME_WINDOWS = ["Live", "5m", "30m", "1h"] as const;

export function TimeWindowSelector() {
  const timeWindow = useTimeWindowStore((state) => state.timeWindow);
  const setTimeWindow = useTimeWindowStore((state) => state.setTimeWindow);

  return (
    <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
      {TIME_WINDOWS.map((window) => (
        <Button
          key={window}
          variant={timeWindow === window ? "default" : "ghost"}
          size="sm"
          onClick={() => setTimeWindow(window)}
          className="h-7 px-3 text-xs"
        >
          {window}
        </Button>
      ))}
    </div>
  );
}
