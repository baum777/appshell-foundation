/**
 * Header Component
 * Global header with offline status, quick actions, and user controls
 * Per Global UI Infrastructure spec
 */

import { Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuickActionsHeaderButton } from "@/components/quick-actions";
import { OfflineStatusBadge } from "@/components/offline";

export function Header() {
  return (
    <header className="h-14 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
      <div className="h-full px-4 md:px-6 flex items-center justify-between">
        {/* Mobile Logo + Offline Status */}
        <div className="md:hidden flex items-center gap-2">
          <span className="text-lg font-semibold text-foreground tracking-tight">
            TradeApp
          </span>
          <OfflineStatusBadge compact />
        </div>

        {/* Desktop: Offline Status + Quick Actions Button */}
        <div className="hidden md:flex items-center gap-3">
          <OfflineStatusBadge showLastSynced />
          <QuickActionsHeaderButton />
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-muted-foreground hover:text-foreground"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-muted-foreground hover:text-foreground"
            aria-label="User menu"
          >
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
