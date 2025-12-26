import type { ReactNode } from "react";

interface LayoutProps {
  sidebar: ReactNode;
  children: ReactNode;
}

export function Layout({ sidebar, children }: LayoutProps) {
  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Left sidebar - Filters Panel (desktop only) */}
      <aside className="hidden lg:block w-44 xl:w-64 shrink-0 border-r border-border bg-card overflow-y-auto">
        {sidebar}
      </aside>

      {/* Main content area */}
      <main className="flex-1 overflow-y-scroll overflow-x-hidden p-6 custom-scrollbar">
        {children}
      </main>
    </div>
  );
}
