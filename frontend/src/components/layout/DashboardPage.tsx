import type { ReactNode } from "react";

interface DashboardPageProps {
  children: ReactNode;
}

export function DashboardPage({ children }: DashboardPageProps) {
  return <div className="flex h-screen flex-col">{children}</div>;
}
