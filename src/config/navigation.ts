import {
  LayoutDashboard,
  BookOpen,
  LineChart,
  Bell,
  Settings,
  PenLine,
  Eye,
  Sparkles,
  BookMarked,
  ChevronDown,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  testId: string;
  activeRoutes?: string[];
}

export interface NavGroup {
  label: string;
  testId: string;
  triggerTestId: string;
  icon: LucideIcon;
  items: NavItem[];
  featureFlag?: string;
}

export const primaryNavItems: NavItem[] = [
  {
    label: "Dashboard",
    path: "/",
    icon: LayoutDashboard,
    testId: "nav-dashboard",
  },
  {
    label: "Journal",
    path: "/journal",
    icon: PenLine,
    testId: "nav-journal",
  },
  {
    label: "Learn",
    path: "/lessons",
    icon: BookOpen,
    testId: "nav-learn",
    activeRoutes: ["/lessons"],
  },
  {
    label: "Chart",
    path: "/chart",
    icon: LineChart,
    testId: "nav-chart",
    activeRoutes: ["/chart", "/chart/replay", "/replay"],
  },
  {
    label: "Alerts",
    path: "/alerts",
    icon: Bell,
    testId: "nav-alerts",
  },
  {
    label: "Settings",
    path: "/settings",
    icon: Settings,
    testId: "nav-settings",
  },
];

// Sidebar-only nav items (Watchlist + Oracle always visible, Handbook under dev flag)
export const sidebarOnlyItems: NavItem[] = [
  {
    label: "Watchlist",
    path: "/watchlist",
    icon: Eye,
    testId: "nav-watchlist",
  },
  {
    label: "Oracle",
    path: "/oracle",
    icon: Sparkles,
    testId: "nav-oracle",
  },
];

export const advancedNavGroup: NavGroup = {
  label: "Advanced",
  testId: "nav-advanced",
  triggerTestId: "nav-advanced-trigger",
  icon: ChevronDown,
  featureFlag: "VITE_ENABLE_DEV_NAV",
  items: [
    {
      label: "Handbook",
      path: "/handbook",
      icon: BookMarked,
      testId: "nav-handbook",
    },
  ],
};

// Mobile nav shows subset of primary items
export const mobileNavItems: NavItem[] = [
  primaryNavItems[0], // Dashboard
  primaryNavItems[1], // Journal
  primaryNavItems[2], // Learn
  primaryNavItems[3], // Chart
  primaryNavItems[5], // Settings
];

export function isRouteActive(currentPath: string, navItem: NavItem): boolean {
  if (navItem.activeRoutes) {
    return navItem.activeRoutes.some(
      (route) => currentPath === route || currentPath.startsWith(route + "/")
    );
  }
  if (navItem.path === "/") {
    return currentPath === "/";
  }
  return currentPath.startsWith(navItem.path);
}

export function isDevNavEnabled(): boolean {
  return import.meta.env.VITE_ENABLE_DEV_NAV === "true";
}
