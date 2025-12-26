import { AppTitle } from "@/components/topbar/AppTitle";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

interface MobileNavBarProps {
  onMenuClick: () => void;
}

export function MobileNavBar({ onMenuClick }: MobileNavBarProps) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-card px-4 sm:hidden">
      <AppTitle />
      <Button
        variant="ghost"
        size="icon"
        onClick={onMenuClick}
        aria-label="Open settings"
      >
        <Settings className="h-5 w-5" />
      </Button>
    </header>
  );
}
