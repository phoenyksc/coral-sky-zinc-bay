import { discountPercent, formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";

export function Price({
  price,
  compareAt,
  size = "md",
}: {
  price: string;
  compareAt?: string;
  size?: "sm" | "md" | "lg";
}) {
  const pct = discountPercent(price, compareAt);
  return (
    <div
      className={cn(
        "flex flex-wrap items-baseline gap-2 tabular-nums",
        size === "sm" && "text-sm",
        size === "md" && "text-base",
        size === "lg" && "text-xl",
      )}
    >
      <span className="font-medium">{formatMoney(price)}</span>
      {pct ? (
        <>
          <span className="text-muted-foreground line-through decoration-foreground/30">
            {formatMoney(compareAt)}
          </span>
          <span className="text-xs font-medium tracking-wide text-sale">{pct}% off</span>
        </>
      ) : null}
    </div>
  );
}
