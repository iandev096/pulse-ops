import type { ReactNode } from "react";

interface MainContentProps {
  children: ReactNode;
}

export function MainContent({ children }: MainContentProps) {
  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">{children}</div>
  );
}
