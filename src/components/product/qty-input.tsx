import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function QtyInput({
  value,
  min = 1,
  max = 99,
  onChange,
  className,
}: {
  value: number;
  min?: number;
  max?: number;
  onChange: (n: number) => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex h-11 items-center rounded-md border border-border bg-card",
        className,
      )}
    >
      <button
        type="button"
        className="grid size-11 place-items-center text-muted-foreground hover:text-foreground"
        aria-label="Decrease quantity"
        onClick={() => onChange(Math.max(min, value - 1))}
      >
        <Minus className="size-3.5" />
      </button>
      <span className="min-w-8 text-center text-sm tabular-nums">{value}</span>
      <button
        type="button"
        className="grid size-11 place-items-center text-muted-foreground hover:text-foreground"
        aria-label="Increase quantity"
        onClick={() => onChange(Math.min(max, value + 1))}
      >
        <Plus className="size-3.5" />
      </button>
    </div>
  );
}
