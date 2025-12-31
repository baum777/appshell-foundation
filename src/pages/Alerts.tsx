import { useState, useEffect, useRef, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { PageContainer } from "@/components/layout/PageContainer";
import { useAlertsStub } from "@/stubs/hooks";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import {
  AlertsHeader,
  AlertsQuickCreate,
  AlertsFilterBar,
  AlertCard,
  AlertsEmptyState,
  AlertsFilterEmpty,
  AlertsSkeleton,
  type AlertStatusFilter,
} from "@/components/alerts";

interface PrefillData {
  symbol?: string;
  condition?: string;
  targetPrice?: number;
  timeframe?: string;
}

export default function Alerts() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { pageState, alerts, createAlert, deleteAlert, toggleStatus } = useAlertsStub();
  
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);
  const [filter, setFilter] = useState<AlertStatusFilter>("all");
  const [prefillData, setPrefillData] = useState<PrefillData | undefined>();
  const prefillAppliedRef = useRef(false);

  // URL prefill - apply once on mount
  useEffect(() => {
    if (prefillAppliedRef.current) return;
    
    const symbol = searchParams.get("symbol");
    const condition = searchParams.get("condition");
    const targetPriceStr = searchParams.get("targetPrice");
    const timeframe = searchParams.get("timeframe");
    
    const hasParams = symbol || condition || targetPriceStr;
    
    if (hasParams) {
      prefillAppliedRef.current = true;
      
      const data: PrefillData = {};
      if (symbol) data.symbol = symbol;
      if (condition) data.condition = condition;
      if (targetPriceStr) {
        const parsed = parseFloat(targetPriceStr);
        if (!isNaN(parsed)) data.targetPrice = parsed;
      }
      if (timeframe) data.timeframe = timeframe;
      
      setPrefillData(data);
      setIsQuickCreateOpen(true);
      toast.info("Applied from link");
      
      // Clean query params
      setSearchParams({}, { replace: true });
    }
    // BACKEND_TODO: Validate params against allowed values
  }, [searchParams, setSearchParams]);

  const handleCreateClick = () => {
    setPrefillData(undefined);
    setIsQuickCreateOpen(true);
  };

  const handleExampleClick = (example: { symbol: string; condition: string; targetPrice: number }) => {
    setPrefillData(example);
    setIsQuickCreateOpen(true);
  };

  const handleCreateAlert = (symbol: string, condition: string, targetPrice: number) => {
    createAlert(symbol, condition, targetPrice);
    toast.success("Alert created");
  };

  const handleRetry = () => {
    pageState.setState("loading");
    setTimeout(() => pageState.setState("ready"), 1000);
  };

  // Filter alerts
  const filteredAlerts = useMemo(() => {
    if (filter === "all") return alerts;
    return alerts.filter((alert) => alert.status === filter);
  }, [alerts, filter]);

  const isListEmpty = alerts.length === 0;
  const isFilterEmpty = filteredAlerts.length === 0 && !isListEmpty;

  // Loading state
  if (pageState.isLoading) {
    return (
      <PageContainer testId="page-alerts">
        <AlertsSkeleton />
      </PageContainer>
    );
  }

  // Error state
  if (pageState.isError) {
    return (
      <PageContainer testId="page-alerts">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Alerts
            </h1>
            <p className="text-sm text-muted-foreground">
              Monitor key levels
            </p>
          </div>
          
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>Failed to load alerts. Please try again.</span>
              <Button variant="outline" size="sm" onClick={handleRetry}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </PageContainer>
    );
  }

  // Empty state (pageState.isEmpty OR no alerts)
  if (pageState.isEmpty || isListEmpty) {
    return (
      <PageContainer testId="page-alerts">
        <div className="space-y-6">
          <AlertsHeader onCreateClick={handleCreateClick} />
          
          <AlertsQuickCreate
            isOpen={isQuickCreateOpen}
            onOpenChange={setIsQuickCreateOpen}
            onSubmit={handleCreateAlert}
            prefillData={prefillData}
          />
          
          <AlertsEmptyState
            onCreateClick={handleCreateClick}
            onExampleClick={handleExampleClick}
          />
        </div>
      </PageContainer>
    );
  }

  // Ready state with alerts
  return (
    <PageContainer testId="page-alerts">
      <div className="space-y-6">
        <AlertsHeader onCreateClick={handleCreateClick} />
        
        <AlertsQuickCreate
          isOpen={isQuickCreateOpen}
          onOpenChange={setIsQuickCreateOpen}
          onSubmit={handleCreateAlert}
          prefillData={prefillData}
        />
        
        <AlertsFilterBar
          filter={filter}
          onFilterChange={setFilter}
          resultsCount={filteredAlerts.length}
          totalCount={alerts.length}
        />
        
        {isFilterEmpty ? (
          <AlertsFilterEmpty onClearFilter={() => setFilter("all")} />
        ) : (
          <div className="space-y-3">
            {filteredAlerts.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                onToggleStatus={toggleStatus}
                onDelete={deleteAlert}
              />
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
