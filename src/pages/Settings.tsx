import { PageContainer } from "@/components/layout/PageContainer";

export default function Settings() {
  return (
    <PageContainer testId="page-settings">
      <h1 className="text-2xl font-bold text-foreground mb-4">Settings</h1>
      <p className="text-muted-foreground">
        Configure your account and application preferences.
      </p>
      {/* BACKEND_TODO: Fetch user settings and preferences */}
    </PageContainer>
  );
}
