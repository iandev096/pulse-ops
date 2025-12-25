import type { ReactNode } from "react";

interface FiltersPanelProps {
  children: ReactNode;
}

export function FiltersPanel({ children }: FiltersPanelProps) {
  return (
    <div className="flex flex-col gap-6 p-4">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
        Filters
      </h2>
      {children}
    </div>
  );
}
