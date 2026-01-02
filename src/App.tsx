import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import Dashboard from "@/pages/Dashboard";
import Journal from "@/pages/Journal";
import Learn from "@/pages/Learn";
import LessonViewer from "@/pages/LessonViewer";
import Chart from "@/pages/Chart";
import Replay from "@/pages/Replay";
import Alerts from "@/pages/Alerts";
import SettingsPage from "@/pages/SettingsPage";
import Watchlist from "@/pages/Watchlist";
import Oracle from "@/pages/Oracle";
import Handbook from "@/pages/Handbook";
import NotFound from "@/pages/NotFound";
import JournalEntry from "@/pages/JournalEntry";
import JournalReview from "@/pages/JournalReview";
import JournalInsights from "@/pages/JournalInsights";
import OracleInbox from "@/pages/OracleInbox";
import OracleInsight from "@/pages/OracleInsight";
import OracleStatus from "@/pages/OracleStatus";
import SettingsProviders from "@/pages/SettingsProviders";
import SettingsData from "@/pages/SettingsData";
import SettingsExperiments from "@/pages/SettingsExperiments";
import SettingsPrivacy from "@/pages/SettingsPrivacy";
import Asset from "@/pages/Asset";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell />}>
            {/* Redirects (Frozen) */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Primary Routes (Frozen) */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/chart" element={<Chart />} />
            <Route path="/replay" element={<Replay />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/watchlist" element={<Watchlist />} />
            <Route path="/oracle" element={<Oracle />} />
            <Route path="/handbook" element={<Handbook />} />
            <Route path="/learn" element={<Learn />} />
            <Route path="/settings" element={<SettingsPage />} />

            {/* Secondary Routes (Frozen Additions) */}
            <Route path="/journal/review" element={<JournalReview />} />
            <Route path="/journal/insights" element={<JournalInsights />} />
            <Route path="/journal/:entryId" element={<JournalEntry />} />

            <Route path="/oracle/inbox" element={<OracleInbox />} />
            <Route path="/oracle/status" element={<OracleStatus />} />
            <Route path="/oracle/:insightId" element={<OracleInsight />} />

            <Route path="/settings/providers" element={<SettingsProviders />} />
            <Route path="/settings/data" element={<SettingsData />} />
            <Route path="/settings/experiments" element={<SettingsExperiments />} />
            <Route path="/settings/privacy" element={<SettingsPrivacy />} />

            <Route path="/asset/:assetId" element={<Asset />} />

            {/* Existing Learn detail route (non-tab deep link) */}
            <Route path="/learn/:id" element={<LessonViewer />} />
          </Route>

          {/* 404 outside AppShell */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
