import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

export function ChartBottomTabs() {
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="w-full justify-start bg-muted/50">
        <TabsTrigger value="overview" className="text-xs sm:text-sm">
          Overview
        </TabsTrigger>
        <TabsTrigger value="notes" className="text-xs sm:text-sm">
          Notes
        </TabsTrigger>
        <TabsTrigger value="pulse" className="text-xs sm:text-sm">
          Pulse
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="mt-3">
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">
              Market overview and key metrics will appear here.
            </p>
            {/* BACKEND_TODO: fetch market overview data */}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="notes" className="mt-3">
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">
              Your chart notes and annotations will appear here.
            </p>
            {/* BACKEND_TODO: fetch user notes */}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="pulse" className="mt-3">
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">
              Market pulse and sentiment data will appear here.
            </p>
            {/* BACKEND_TODO: fetch pulse data */}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
