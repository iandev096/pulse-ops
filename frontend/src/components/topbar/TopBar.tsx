import type { ReactNode } from "react";

interface TopBarProps {
  children: ReactNode;
}

export function TopBar({ children }: TopBarProps) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-card px-4">
      {children}
    </header>
  );
}
