import type { ReactNode } from "react";

interface LayoutProps {
  sidebar: ReactNode;
  children: ReactNode;
}

export function Layout({ sidebar, children }: LayoutProps) {
  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Left sidebar - Filters Panel */}
      <aside className="w-64 shrink-0 border-r border-border bg-card overflow-y-auto">
        {sidebar}
      </aside>

      {/* Main content area */}
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  );
}
