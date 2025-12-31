import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { PageContainer } from "@/components/layout/PageContainer";
import { ErrorBanner } from "@/components/layout/PageStates";
import {
  SettingsHeader,
  SetupCompletenessCard,
  SettingsSectionCard,
  SettingsRow,
  SettingsTypedConfirmDialog,
  SettingsSkeleton,
  SettingsEmptyState,
} from "@/components/settings";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSettingsStub } from "@/stubs/hooks";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "@/hooks/use-toast";
import { Upload, Download, Wallet, Trash2, RotateCcw } from "lucide-react";

export default function Settings() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { pageState, settings, updateSetting, resetToDefaults, connectedWallets } =
    useSettingsStub();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [clearCacheDialogOpen, setClearCacheDialogOpen] = useState(false);
  const [factoryResetDialogOpen, setFactoryResetDialogOpen] = useState(false);
  const [deleteDataDialogOpen, setDeleteDataDialogOpen] = useState(false);

  const handleUpdate = () => {
    // BACKEND_TODO: service worker update flow
    toast({ title: "App is up to date", description: "No updates available." });
  };

  const handleExport = () => {
    // BACKEND_TODO: export/import implementation
    toast({ title: "Export started", description: "Preparing your data..." });
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // BACKEND_TODO: export/import implementation
      toast({ title: "Import started", description: `Processing ${file.name}...` });
    }
    e.target.value = "";
  };

  const handleClearCache = () => {
    // BACKEND_TODO: clear local cache
    setClearCacheDialogOpen(false);
    toast({ title: "Cache cleared", description: "Local cache has been cleared." });
  };

  const handleFactoryReset = () => {
    resetToDefaults();
    toast({ title: "Factory reset complete", description: "All settings have been reset to defaults." });
  };

  const handleDeleteAllData = () => {
    resetToDefaults();
    // BACKEND_TODO: delete all data
    toast({ title: "All data deleted", description: "Your data has been permanently deleted." });
  };

  const setupItems = [
    { id: "wallet", label: "Wallet connected", completed: settings.walletConnected, link: "/journal", linkText: "Connect" },
    { id: "alerts", label: "At least 1 alert created", completed: settings.hasAlerts, link: "/alerts", linkText: "Create" },
    { id: "watchlist", label: "Watchlist has items", completed: settings.hasWatchlistItems, link: "/watchlist", linkText: "Add" },
    { id: "chart", label: "Chart preferences set", completed: settings.chartPreferencesSet, link: "/chart", linkText: "Configure" },
    { id: "backup", label: "Backup configured", completed: settings.backupConfigured, link: "#backup", linkText: "Setup" },
  ];

  // Section content components
  const AppearanceSection = () => (
    <>
      <SettingsRow label="Theme" description="Switch between light and dark mode">
        <Select
          value={settings.theme}
          onValueChange={(value: "light" | "dark") => updateSetting("theme", value)}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dark">Dark</SelectItem>
            <SelectItem value="light">Light</SelectItem>
          </SelectContent>
        </Select>
      </SettingsRow>
      <SettingsRow label="Density" description="Adjust UI spacing">
        <Select
          value={settings.density}
          onValueChange={(value: "comfortable" | "compact") => updateSetting("density", value)}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="comfortable">Comfortable</SelectItem>
            <SelectItem value="compact">Compact</SelectItem>
          </SelectContent>
        </Select>
      </SettingsRow>
    </>
  );

  const ChartSection = () => (
    <>
      <SettingsRow label="Default timeframe" description="Initial chart timeframe">
        <Select
          value={settings.defaultTimeframe}
          onValueChange={(value) => updateSetting("defaultTimeframe", value)}
        >
          <SelectTrigger className="w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1m">1m</SelectItem>
            <SelectItem value="5m">5m</SelectItem>
            <SelectItem value="15m">15m</SelectItem>
            <SelectItem value="1h">1h</SelectItem>
            <SelectItem value="4h">4h</SelectItem>
            <SelectItem value="1d">1d</SelectItem>
          </SelectContent>
        </Select>
      </SettingsRow>
      <SettingsRow label="Show volume" description="Display volume bars">
        <Switch
          checked={settings.showVolume}
          onCheckedChange={(checked) => updateSetting("showVolume", checked)}
        />
      </SettingsRow>
      <SettingsRow label="Show indicators panel" description="Display indicators panel by default">
        <Switch
          checked={settings.showIndicatorsPanel}
          onCheckedChange={(checked) => updateSetting("showIndicatorsPanel", checked)}
        />
      </SettingsRow>
    </>
  );

  const NotificationsSection = () => (
    <>
      <SettingsRow label="Price alerts" description="Receive price alert notifications">
        <Switch
          checked={settings.priceAlerts}
          onCheckedChange={(checked) => updateSetting("priceAlerts", checked)}
        />
      </SettingsRow>
      <SettingsRow label="Daily recap" description="Receive daily trading recap">
        <Switch
          checked={settings.dailyRecap}
          onCheckedChange={(checked) => updateSetting("dailyRecap", checked)}
        />
      </SettingsRow>
      <SettingsRow label="Quiet hours" description="Pause notifications during specific hours">
        <Select
          value={settings.quietHours}
          onValueChange={(value) => updateSetting("quietHours", value)}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            <SelectItem value="night">10PM - 8AM</SelectItem>
            <SelectItem value="work">9AM - 5PM</SelectItem>
          </SelectContent>
        </Select>
      </SettingsRow>
    </>
  );

  const WalletsSection = () => (
    <>
      {connectedWallets.length > 0 ? (
        <div className="space-y-2">
          {connectedWallets.map((wallet) => (
            <div
              key={wallet.id}
              className="flex items-center justify-between rounded-md border border-border bg-secondary/30 px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-mono">{wallet.address}</span>
                <Badge variant="secondary" className="text-xs">
                  {wallet.type}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No wallets connected</p>
      )}
      <Button variant="outline" size="sm" className="mt-2">
        <Wallet className="mr-2 h-4 w-4" />
        Connect wallet
      </Button>
      {/* BACKEND_TODO: wallet connect */}
    </>
  );

  const MonitoringSection = () => (
    <SettingsRow
      label="Telemetry"
      description="Help improve the app by sending anonymous usage data"
    >
      <Switch
        checked={settings.telemetry}
        onCheckedChange={(checked) => updateSetting("telemetry", checked)}
      />
    </SettingsRow>
  );

  const JournalDataSection = () => (
    <>
      <SettingsRow label="Auto-capture" description="Automatically log trades to journal">
        <Switch
          checked={settings.autoCapture}
          onCheckedChange={(checked) => updateSetting("autoCapture", checked)}
        />
      </SettingsRow>
      <Separator />
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <div className="text-sm font-medium text-foreground">Clear local cache</div>
          <div className="text-xs text-muted-foreground">Remove cached data from this device</div>
        </div>
        <Button variant="outline" size="sm" onClick={() => setClearCacheDialogOpen(true)}>
          Clear cache
        </Button>
      </div>
    </>
  );

  const TokenUsageSection = () => (
    <Card className="bg-secondary/30">
      <CardContent className="py-4">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-foreground">1,250</div>
            <div className="text-xs text-muted-foreground">Tokens used</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground">8,750</div>
            <div className="text-xs text-muted-foreground">Remaining</div>
          </div>
        </div>
        {/* BACKEND_TODO: real token counters */}
      </CardContent>
    </Card>
  );

  const RiskDefaultsSection = () => (
    <>
      <SettingsRow label="Max risk %" description="Maximum risk per trade (0-100)">
        <Input
          type="number"
          value={settings.maxRiskPercent}
          onChange={(e) => {
            const value = Math.max(0, Math.min(100, Number(e.target.value)));
            updateSetting("maxRiskPercent", value);
          }}
          className="w-20 text-right"
          min={0}
          max={100}
        />
      </SettingsRow>
      <SettingsRow label="Position size" description="Default position size">
        <Input
          type="number"
          value={settings.positionSize}
          onChange={(e) => {
            const value = Math.max(0, Number(e.target.value));
            updateSetting("positionSize", value);
          }}
          className="w-24 text-right"
          min={0}
        />
      </SettingsRow>
    </>
  );

  const BackupRestoreSection = () => (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,.zip"
        onChange={handleFileChange}
        className="hidden"
      />
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          Export data
        </Button>
        <Button variant="outline" size="sm" onClick={handleImport}>
          <Upload className="mr-2 h-4 w-4" />
          Import data
        </Button>
      </div>
      {/* BACKEND_TODO: export/import implementation */}
    </>
  );

  const AdvancedSection = () => {
    const devNavEnabled = import.meta.env.VITE_ENABLE_DEV_NAV === "true";
    return (
      <SettingsRow
        label="Developer navigation"
        description={devNavEnabled ? "Enabled via VITE_ENABLE_DEV_NAV" : "Disabled"}
      >
        <Badge variant={devNavEnabled ? "default" : "secondary"}>
          {devNavEnabled ? "Enabled" : "Disabled"}
        </Badge>
      </SettingsRow>
    );
  };

  const DangerZoneSection = () => (
    <div className="space-y-3">
      <Button
        variant="outline"
        size="sm"
        className="border-destructive/50 text-destructive hover:bg-destructive/10"
        onClick={() => setFactoryResetDialogOpen(true)}
      >
        <RotateCcw className="mr-2 h-4 w-4" />
        Factory reset
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="border-destructive/50 text-destructive hover:bg-destructive/10 ml-2"
        onClick={() => setDeleteDataDialogOpen(true)}
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Delete all data
      </Button>
    </div>
  );

  const sections = [
    { id: "appearance", title: "Appearance", description: "Theme and display settings", content: <AppearanceSection /> },
    { id: "chart", title: "Chart preferences", description: "Default chart settings", content: <ChartSection /> },
    { id: "notifications", title: "Notifications", description: "Alert and recap settings", content: <NotificationsSection /> },
    { id: "wallets", title: "Connected wallets", description: "Manage your wallet connections", content: <WalletsSection /> },
    { id: "monitoring", title: "Monitoring", description: "Usage and telemetry", content: <MonitoringSection /> },
    { id: "journal", title: "Journal data", description: "Trade logging settings", content: <JournalDataSection /> },
    { id: "tokens", title: "Token usage", description: "View your token consumption", content: <TokenUsageSection /> },
    { id: "risk", title: "Risk defaults", description: "Default risk parameters", content: <RiskDefaultsSection /> },
    { id: "backup", title: "Backup & Restore", description: "Export and import your data", content: <BackupRestoreSection /> },
    { id: "advanced", title: "Advanced", description: "Developer and advanced options", content: <AdvancedSection /> },
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
        <SettingsHeader onUpdate={handleUpdate} />
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

  // Empty state
  if (pageState.state === "empty") {
    return (
      <PageContainer testId="page-settings">
        <SettingsHeader onUpdate={handleUpdate} />
        <div className="mt-6">
          <SettingsEmptyState
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
        <SettingsHeader onUpdate={handleUpdate} />
        <SetupCompletenessCard items={setupItems} />

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
                  <div className="font-medium text-destructive">Danger zone</div>
                  <div className="text-xs text-muted-foreground">Irreversible actions</div>
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
              title="Danger zone"
              description="Irreversible actions"
              variant="danger"
            >
              <DangerZoneSection />
            </SettingsSectionCard>
          </div>
        )}
      </div>

      {/* Clear cache confirmation dialog */}
      <Dialog open={clearCacheDialogOpen} onOpenChange={setClearCacheDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clear local cache?</DialogTitle>
            <DialogDescription>
              This will remove all cached data from this device. Your account data will not be affected.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setClearCacheDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleClearCache}>Clear cache</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Factory reset typed confirmation */}
      <SettingsTypedConfirmDialog
        open={factoryResetDialogOpen}
        onOpenChange={setFactoryResetDialogOpen}
        title="Factory reset"
        description="This will reset all settings to their default values. This action cannot be undone."
        confirmPhrase="RESET"
        onConfirm={handleFactoryReset}
      />

      {/* Delete all data typed confirmation */}
      <SettingsTypedConfirmDialog
        open={deleteDataDialogOpen}
        onOpenChange={setDeleteDataDialogOpen}
        title="Delete all data"
        description="This will permanently delete all your data including journal entries, alerts, and settings. This action cannot be undone."
        confirmPhrase="DELETE"
        onConfirm={handleDeleteAllData}
      />
    </PageContainer>
  );
}
