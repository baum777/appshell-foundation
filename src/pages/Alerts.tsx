import { PageContainer } from "@/components/layout/PageContainer";

export default function Alerts() {
  return (
    <PageContainer testId="page-alerts">
      <h1 className="text-2xl font-bold text-foreground mb-4">Price Alerts</h1>
      <p className="text-muted-foreground">
        Manage your price alerts and notifications.
      </p>
      {/* BACKEND_TODO: Fetch user alerts and notification settings */}
    </PageContainer>
  );
}
