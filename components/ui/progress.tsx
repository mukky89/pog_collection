import { cn } from "@/lib/utils";

export function Progress({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className={cn("progress-track", className)}>
      <div className="progress-fill" style={{ width: `${clamped}%` }} />
    </div>
  );
}
