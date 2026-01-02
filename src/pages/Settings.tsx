import { useState, useEffect, useRef } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { ErrorBanner } from "@/components/layout/PageStates";
import {
  SettingsHeader,
  SettingsSectionCard,
  SettingsRow,
  SettingsSkeleton,
} from "@/components/settings";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePageState } from "@/stubs/pageState";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "@/hooks/use-toast";
import { Wallet, Copy, Check, AlertTriangle, Bell } from "lucide-react";

// localStorage keys (exact)
const STORAGE_KEYS = {
  theme: "sparkfined_theme_v1",
  recentSearches: "sparkfined_recent_searches_v1",
  recentMarkets: "sparkfined_recent_markets_v1",
  oracleRead: "sparkfined_oracle_read_v1",
  alerts: "sparkfined_alerts_v1",
  reduceMotion: "sparkfined_reduce_motion_v1",
  compactMode: "sparkfined_compact_mode_v1",
  watchlist: "sparkfined_watchlist_v1",
} as const;

type ThemeOption = "dark";

export default function Settings() {
  const isMobile = useIsMobile();
  const pageState = usePageState("ready");

  // Wallet connection (UI-only stub)
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [disconnectDialogOpen, setDisconnectDialogOpen] = useState(false);

  // Theme (persisted)
  const [theme, setTheme] = useState<ThemeOption>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.theme);
    return stored === "dark" ? "dark" : "dark";
  });

  // App preferences (local)
  const [reduceMotion, setReduceMotion] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.reduceMotion) === "true";
  });
  const [compactMode, setCompactMode] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.compactMode) === "true";
  });

  // Notification toggles (UI-only)
  const [priceAlerts, setPriceAlerts] = useState(true);
  const [signalConfirmations, setSignalConfirmations] = useState(true);
  const [dailyOracleTakeaway, setDailyOracleTakeaway] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<string>("default");

  // Developer section
  const [copiedDiagnostics, setCopiedDiagnostics] = useState(false);

  // Reset dialog
  const [resetDialogOpen, setResetDialogOpen] = useState(false);

  // Persist theme to localStorage
  useEffect(() => {
    // Dark-only (v1): persist but never expose light/system.
    localStorage.setItem(STORAGE_KEYS.theme, "dark");
    // BACKEND_TODO: sync across devices
  }, [theme]);

  // Persist app preferences
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.reduceMotion, String(reduceMotion));
  }, [reduceMotion]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.compactMode, String(compactMode));
  }, [compactMode]);

  const handleConnectWallet = () => {
    setIsWalletConnected(true);
    toast({ title: "Wallet connected", description: "Demo wallet connected successfully." });
    // BACKEND_TODO: real wallet connect
  };

  const handleDisconnectWallet = () => {
    setIsWalletConnected(false);
    setDisconnectDialogOpen(false);
    toast({ title: "Wallet disconnected", description: "Your wallet has been disconnected." });
    // BACKEND_TODO: real wallet disconnect
  };

  const handleRequestPermission = () => {
    // UI-only stub
    setNotificationPermission("granted");
    toast({ title: "Permission granted", description: "Browser notifications enabled." });
    // BACKEND_TODO: real permission + SW push
  };

  const handleCopyDiagnostics = async () => {
    const devNavValue = import.meta.env.VITE_ENABLE_DEV_NAV ?? "undefined";
    const diagnostics = `App Version: 0.1.0
VITE_ENABLE_DEV_NAV: ${devNavValue}
User Agent: ${navigator.userAgent}`;

    try {
      await navigator.clipboard.writeText(diagnostics);
      setCopiedDiagnostics(true);
      toast({ title: "Copied", description: "Diagnostics copied to clipboard." });
      setTimeout(() => setCopiedDiagnostics(false), 2000);
    } catch {
      toast({ title: "Failed to copy", description: "Could not copy to clipboard.", variant: "destructive" });
    }
  };

  const handleResetLocalData = () => {
    // Clear specified localStorage keys
    localStorage.removeItem(STORAGE_KEYS.recentSearches);
    localStorage.removeItem(STORAGE_KEYS.recentMarkets);
    localStorage.removeItem(STORAGE_KEYS.oracleRead);
    localStorage.removeItem(STORAGE_KEYS.alerts);
    localStorage.removeItem(STORAGE_KEYS.theme);
    localStorage.removeItem(STORAGE_KEYS.watchlist);

    // Reset local state
    setTheme("dark");
    setReduceMotion(false);
    setCompactMode(false);

    setResetDialogOpen(false);
    toast({ title: "Reset complete", description: "Local data has been cleared." });
    // BACKEND_TODO: account reset vs local reset
  };

  // Connection Section
  const ConnectionSection = () => (
    <div className="space-y-4">
      <SettingsRow
        label="Wallet status"
        description={isWalletConnected ? "Your wallet is connected" : "Connect a wallet to unlock all features"}
      >
        <Badge variant={isWalletConnected ? "default" : "secondary"}>
          {isWalletConnected ? "Connected" : "Not connected"}
        </Badge>
      </SettingsRow>
      <div className="flex flex-wrap gap-2">
        {!isWalletConnected ? (
          <Button onClick={handleConnectWallet}>
            <Wallet className="mr-2 h-4 w-4" />
            Connect wallet
          </Button>
        ) : (
          <Button
            variant="outline"
            className="border-destructive/50 text-destructive hover:bg-destructive/10"
            onClick={() => setDisconnectDialogOpen(true)}
          >
            Disconnect
          </Button>
        )}
      </div>
      {/* BACKEND_TODO: real wallet connect */}
    </div>
  );

  // App Preferences Section
  const AppPreferencesSection = () => (
    <div className="space-y-4">
      <SettingsRow label="Theme" description="Dark mode only (v1)">
        <Badge variant="secondary">Dark</Badge>
      </SettingsRow>
      <SettingsRow label="Reduce motion" description="Minimize animations throughout the app">
        <Switch
          checked={reduceMotion}
          onCheckedChange={setReduceMotion}
          aria-label="Reduce motion"
        />
      </SettingsRow>
      <SettingsRow label="Compact mode" description="Use tighter spacing for more content">
        <Switch
          checked={compactMode}
          onCheckedChange={setCompactMode}
          aria-label="Compact mode"
        />
      </SettingsRow>
      {/* BACKEND_TODO: sync across devices */}
    </div>
  );

  // Notifications Section
  const NotificationsSection = () => (
    <div className="space-y-4">
      <SettingsRow label="Price alerts" description="Get notified when price targets are hit">
        <Switch
          checked={priceAlerts}
          onCheckedChange={setPriceAlerts}
          aria-label="Price alerts"
        />
      </SettingsRow>
      <SettingsRow label="Signal confirmations" description="Notifications for trade signal confirmations">
        <Switch
          checked={signalConfirmations}
          onCheckedChange={setSignalConfirmations}
          aria-label="Signal confirmations"
        />
      </SettingsRow>
      <SettingsRow label="Daily Oracle takeaway" description="Receive the daily Oracle summary">
        <Switch
          checked={dailyOracleTakeaway}
          onCheckedChange={setDailyOracleTakeaway}
          aria-label="Daily Oracle takeaway"
        />
      </SettingsRow>
      <div className="rounded-md bg-muted/50 p-3 space-y-2">
        <p className="text-xs text-muted-foreground flex items-center gap-2">
          <Bell className="h-3.5 w-3.5" />
          Browser notifications require permission
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRequestPermission}
            disabled={notificationPermission === "granted"}
          >
            {notificationPermission === "granted" ? "Permission granted" : "Request permission"}
          </Button>
          {notificationPermission === "granted" && (
            <Badge variant="secondary" className="text-xs">
              <Check className="mr-1 h-3 w-3" />
              Enabled
            </Badge>
          )}
        </div>
      </div>
      {/* BACKEND_TODO: real permission + SW push */}
    </div>
  );

  // Developer Section
  const DeveloperSection = () => {
    const devNavValue = import.meta.env.VITE_ENABLE_DEV_NAV ?? "undefined";

    return (
      <div className="space-y-4">
        <SettingsRow
          label="Developer navigation"
          description="Handbook link visibility is controlled by environment variable"
        >
          <Badge variant="secondary" className="font-mono text-xs">
            VITE_ENABLE_DEV_NAV: {String(devNavValue)}
          </Badge>
        </SettingsRow>
        <div className="pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyDiagnostics}
            className="gap-2"
          >
            {copiedDiagnostics ? (
              <>
                <Check className="h-4 w-4" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy diagnostics
              </>
            )}
          </Button>
        </div>
      </div>
    );
  };

  // Danger Zone Section
  const DangerZoneSection = () => (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        This will clear all locally stored data including recent searches, read states, and preferences.
      </p>
      <Button
        variant="outline"
        className="border-destructive/50 text-destructive hover:bg-destructive/10"
        onClick={() => setResetDialogOpen(true)}
      >
        <AlertTriangle className="mr-2 h-4 w-4" />
        Reset local data
      </Button>
    </div>
  );

  const sections = [
    { id: "connection", title: "Connection", description: "Wallet connection status", content: <ConnectionSection /> },
    { id: "preferences", title: "App Preferences", description: "Theme and display settings", content: <AppPreferencesSection /> },
    { id: "notifications", title: "Notifications", description: "Alert and notification settings", content: <NotificationsSection /> },
    { id: "developer", title: "Developer / Advanced", description: "Diagnostics and developer options", content: <DeveloperSection /> },
  ];

  // Loading state
  if (pageState.state === "loading") {
    return (
      <PageContainer testId="page-settings">
        <SettingsSkeleton />
      </PageContainer>
    );
  }

  // Error state
  if (pageState.state === "error") {
    return (
      <PageContainer testId="page-settings">
        <SettingsHeader />
        <div className="mt-6">
          <ErrorBanner
            message="Failed to load settings"
            onRetry={() => {
              pageState.setState("loading");
              setTimeout(() => pageState.setState("ready"), 1000);
            }}
          />
        </div>
      </PageContainer>
    );
  }

  // Ready state
  return (
    <PageContainer testId="page-settings">
      <div className="space-y-6">
        <SettingsHeader />

        {isMobile ? (
          // Mobile: Accordion layout
          <Accordion type="single" collapsible className="space-y-2">
            {sections.map((section) => (
              <AccordionItem key={section.id} value={section.id} className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">
                  <div className="text-left">
                    <div className="font-medium">{section.title}</div>
                    <div className="text-xs text-muted-foreground">{section.description}</div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-2">
                  {section.content}
                </AccordionContent>
              </AccordionItem>
            ))}
            {/* Danger zone accordion item */}
            <AccordionItem value="danger" className="border border-destructive/50 rounded-lg px-4 bg-destructive/5">
              <AccordionTrigger className="hover:no-underline">
                <div className="text-left">
                  <div className="font-medium text-destructive">Danger Zone</div>
                  <div className="text-xs text-muted-foreground">Reset local data</div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-2">
                <DangerZoneSection />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        ) : (
          // Desktop: Card stack layout
          <div className="space-y-4">
            {sections.map((section) => (
              <SettingsSectionCard
                key={section.id}
                title={section.title}
                description={section.description}
              >
                {section.content}
              </SettingsSectionCard>
            ))}
            {/* Danger zone card */}
            <SettingsSectionCard
              title="Danger Zone"
              description="Reset local data"
              variant="danger"
            >
              <DangerZoneSection />
            </SettingsSectionCard>
          </div>
        )}
      </div>

      {/* Disconnect wallet confirmation dialog */}
      <Dialog open={disconnectDialogOpen} onOpenChange={setDisconnectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Disconnect wallet?</DialogTitle>
            <DialogDescription>
              This will disconnect your wallet from the app. You can reconnect at any time.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDisconnectDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDisconnectWallet}>
              Disconnect
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset local data confirmation dialog */}
      <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">Reset local data?</DialogTitle>
            <DialogDescription>
              This will clear all locally stored data including recent searches, Oracle read states, alerts, and theme preferences. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleResetLocalData}>
              Reset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
