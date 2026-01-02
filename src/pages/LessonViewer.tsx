import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, CheckCircle2, Circle } from "lucide-react";
import { useLearnStub } from "@/stubs/hooks";
import { cn } from "@/lib/utils";

const difficultyColors: Record<string, string> = {
  easy: "bg-success/10 text-success border-success/20",
  medium: "bg-warning/10 text-warning border-warning/20",
  hard: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function LessonViewer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { lessons, setLessons } = useLearnStub();

  const lesson = lessons.find((l) => l.id === id);

  // Local progress state for UI-only updates
  const [localProgress, setLocalProgress] = useState(lesson?.progress ?? 0);

  if (!lesson) {
    return (
      <PageContainer testId="page-lesson-viewer">
        <div className="space-y-6">
          <h1 className="sr-only">Lesson not found</h1>
          <Button variant="ghost" size="sm" onClick={() => navigate("/learn")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to lessons
          </Button>

          <Card className="py-12">
            <CardContent className="flex flex-col items-center justify-center text-center">
              <h2 className="mb-2 text-lg font-semibold text-foreground">
                Lesson not found
              </h2>
              <p className="mb-4 text-sm text-muted-foreground">
                The lesson you're looking for doesn't exist or has been removed.
              </p>
              <Button asChild>
                <Link to="/learn">Browse lessons</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    );
  }

  const handleUpdateProgress = (newProgress: number) => {
    setLocalProgress(newProgress);
    // BACKEND_TODO: persist progress update
    setLessons((prev) =>
      prev.map((l) => (l.id === id ? { ...l, progress: newProgress } : l))
    );
  };

  const checklistItems = [
    { id: "1", label: "Read the overview", completed: localProgress >= 25 },
    { id: "2", label: "Understand the key idea", completed: localProgress >= 50 },
    { id: "3", label: "Review the examples", completed: localProgress >= 75 },
    { id: "4", label: "Complete the quiz", completed: localProgress >= 100 },
  ];

  return (
    <PageContainer testId="page-lesson-viewer">
      <div className="space-y-6">
        {/* Back button */}
        <Button variant="ghost" size="sm" onClick={() => navigate("/learn")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to lessons
        </Button>

        {/* Header */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className={cn("text-xs", difficultyColors[lesson.difficulty])}
            >
              {lesson.difficulty}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {lesson.category}
            </Badge>
          </div>
          <h1 className="text-2xl font-bold text-foreground">{lesson.title}</h1>
        </div>

        {/* Progress */}
        <Card>
          <CardContent className="py-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Your progress</span>
                <span className="font-medium text-foreground">{localProgress}%</span>
              </div>
              <Progress value={localProgress} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Overview section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This lesson covers the fundamental concepts and practical applications.
              You'll learn key strategies and techniques used by professional traders.
            </p>
            <p className="text-sm text-muted-foreground">
              Take your time to understand each section before moving on.
              Practice makes perfect!
            </p>
            {/* BACKEND_TODO: load lesson content */}
          </CardContent>
        </Card>

        {/* Key idea section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Key Idea</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
              <p className="text-sm font-medium text-foreground">
                "Success in trading comes from consistent application of proven
                principles, not from predicting the future."
              </p>
            </div>
            {/* BACKEND_TODO: load lesson key idea */}
          </CardContent>
        </Card>

        {/* Checklist section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Checklist</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {checklistItems.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                {item.completed ? (
                  <CheckCircle2 className="h-5 w-5 text-success" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground" />
                )}
                <span
                  className={cn(
                    "text-sm",
                    item.completed ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {item.label}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Separator />

        {/* Progress update buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleUpdateProgress(25)}
            disabled={localProgress >= 25}
          >
            Mark 25%
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleUpdateProgress(50)}
            disabled={localProgress >= 50}
          >
            Mark 50%
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleUpdateProgress(75)}
            disabled={localProgress >= 75}
          >
            Mark 75%
          </Button>
          <Button
            size="sm"
            onClick={() => handleUpdateProgress(100)}
            disabled={localProgress >= 100}
          >
            Complete lesson
          </Button>
        </div>
      </div>
    </PageContainer>
  );
}
