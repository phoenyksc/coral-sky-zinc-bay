import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-sm px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.14em]",
  {
    variants: {
      variant: {
        default: "bg-foreground text-background",
        sale: "bg-sale text-primary-foreground",
        low: "bg-low text-primary-foreground",
        outline: "border border-foreground/20 text-foreground",
        muted: "bg-secondary text-muted-foreground",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge };
