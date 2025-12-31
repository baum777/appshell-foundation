import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  testId?: string;
}

export function PageContainer({
  children,
  className,
  testId,
}: PageContainerProps) {
  return (
    <div
      className={cn(
        "max-w-6xl mx-auto px-4 md:px-6 py-4 pb-20 md:pb-4 animate-fade-in",
        className
      )}
      data-testid={testId}
    >
      {children}
    </div>
  );
}
