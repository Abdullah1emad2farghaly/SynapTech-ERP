import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "sm" | "md";
  className?: string;
}

const SIZE_CLASSES: Record<NonNullable<LoadingSpinnerProps["size"]>, string> = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
};

export function LoadingSpinner({ size = "md", className = "" }: LoadingSpinnerProps) {
  return (
    <Loader2
      className={`animate-spin text-signal motion-reduce:animate-none ${SIZE_CLASSES[size]} ${className}`}
      aria-hidden="true"
    />
  );
}
