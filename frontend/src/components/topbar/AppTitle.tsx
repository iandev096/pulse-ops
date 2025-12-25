import { Activity } from "lucide-react";

export function AppTitle() {
  return (
    <div className="flex items-center gap-2">
      <Activity className="size-5 text-primary" />
      <span className="text-lg font-bold tracking-tight">PulseOps</span>
    </div>
  );
}
