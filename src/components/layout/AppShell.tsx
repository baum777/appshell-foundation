/**
 * AppShell - Main application layout
 * Wires global providers: Offline, QuickActions, MobileGestures
 * Per Global UI Infrastructure spec
 */

import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { BottomNav } from "./BottomNav";
import { MobileGesturesProvider } from "./MobileGesturesProvider";
import { OfflineProvider } from "@/components/offline";
import { 
  QuickActionsProvider, 
  CommandPalette, 
  QuickActionsSheet, 
  QuickActionsFab 
} from "@/components/quick-actions";

export function AppShell() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Dark-only enforcement (no light/system mode in v1).
  useEffect(() => {
    document.documentElement.classList.add("dark");
    document.documentElement.classList.remove("light");
    try {
      localStorage.setItem("sparkfined_theme_v1", "dark");
    } catch {
      // ignore
    }
  }, []);

  return (
    <OfflineProvider>
      <QuickActionsProvider>
        <MobileGesturesProvider>
          <div className="min-h-screen flex w-full bg-background">
            {/* Desktop Sidebar */}
            <Sidebar
              collapsed={sidebarCollapsed}
              onCollapsedChange={setSidebarCollapsed}
            />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
              <Header />
              <main className="flex-1 pb-20 md:pb-0">
                <Outlet />
              </main>
            </div>

            {/* Mobile Bottom Nav */}
            <BottomNav />
            
            {/* Quick Actions FAB (Mobile) */}
            <QuickActionsFab />
          </div>
          
          {/* Command Palette (Desktop) */}
          <CommandPalette />
          
          {/* Quick Actions Sheet (Mobile) */}
          <QuickActionsSheet />
        </MobileGesturesProvider>
      </QuickActionsProvider>
    </OfflineProvider>
  );
}
