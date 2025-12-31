import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Wallet } from "lucide-react";

interface WalletGuardProps {
  isConnected: boolean;
  onConnect: () => void;
  children: React.ReactNode;
}

export function WalletGuard({ isConnected, onConnect, children }: WalletGuardProps) {
  if (isConnected) {
    return <>{children}</>;
  }

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
            Connect your wallet to access your trading journal and track your entries.
          </p>
          
          <Button onClick={onConnect} size="lg">
            <Wallet className="h-4 w-4 mr-2" />
            Connect Wallet
          </Button>
          {/* BACKEND_TODO: wallet connect integration */}
        </CardContent>
      </Card>
    </div>
  );
}
