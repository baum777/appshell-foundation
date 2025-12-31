import { useSearchParams } from "react-router-dom";
import { PageContainer } from "@/components/layout/PageContainer";

export default function Chart() {
  const [searchParams] = useSearchParams();
  const isReplayMode = searchParams.get("replay") === "true";

  return (
    <PageContainer testId="page-chart">
      <h1 className="text-2xl font-bold text-foreground mb-4">
        {isReplayMode ? "Chart Replay" : "Live Chart"}
      </h1>
      <p className="text-muted-foreground">
        {isReplayMode
          ? "Review historical price action in replay mode."
          : "Real-time charting and technical analysis."}
      </p>
      {/* BACKEND_TODO: Fetch chart data and indicators */}
    </PageContainer>
  );
}
