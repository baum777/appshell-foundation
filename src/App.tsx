import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import Dashboard from "@/pages/Dashboard";
import Journal from "@/pages/Journal";
import Lessons from "@/pages/Lessons";
import LessonViewer from "@/pages/LessonViewer";
import Chart from "@/pages/Chart";
import Alerts from "@/pages/Alerts";
import Settings from "@/pages/Settings";
import Watchlist from "@/pages/Watchlist";
import Oracle from "@/pages/Oracle";
import Handbook from "@/pages/Handbook";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell />}>
            {/* Primary Routes */}
            <Route path="/" element={<Dashboard />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/lessons" element={<Lessons />} />
            <Route path="/lessons/:id" element={<LessonViewer />} />
            <Route path="/chart" element={<Chart />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/settings" element={<Settings />} />

            {/* Advanced Routes */}
            <Route path="/watchlist" element={<Watchlist />} />
            <Route path="/oracle" element={<Oracle />} />
            <Route path="/handbook" element={<Handbook />} />

            {/* Redirects */}
            <Route path="/learn" element={<Navigate to="/lessons" replace />} />
            <Route path="/replay" element={<Navigate to="/chart?replay=true" replace />} />
            <Route path="/chart/replay" element={<Navigate to="/chart?replay=true" replace />} />
          </Route>

          {/* 404 outside AppShell */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
