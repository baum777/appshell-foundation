import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Wallet, Settings, Play } from "lucide-react";

interface WalletGuardProps {
  isConnected: boolean;
  onDemoMode?: () => void;
  children: React.ReactNode;
}

export function WalletGuard({ isConnected, onDemoMode, children }: WalletGuardProps) {
  const navigate = useNavigate();
  const [demoModeActive, setDemoModeActive] = useState(false);

  // If connected or demo mode active, render children
  if (isConnected || demoModeActive) {
    return <>{children}</>;
  }

  const handleDemoMode = () => {
    setDemoModeActive(true);
    onDemoMode?.();
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="bg-card/50 border-border/50 max-w-md w-full">
        <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <Wallet className="h-8 w-8 text-primary" />
          </div>
          
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Connect your wallet
          </h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm">
            Connect your wallet to unlock journal capture and track your trading entries.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Button onClick={() => navigate("/settings")} size="lg">
              <Settings className="h-4 w-4 mr-2" />
              Go to Settings
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              onClick={handleDemoMode}
            >
              <Play className="h-4 w-4 mr-2" />
              Continue in demo mode
            </Button>
          </div>
          {/* BACKEND_TODO: wire real wallet connection state */}
        </CardContent>
      </Card>
    </div>
  );
}
