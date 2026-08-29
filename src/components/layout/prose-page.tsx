import type { ReactNode } from "react";

export function ProsePage({
  kicker,
  title,
  children,
}: {
  kicker?: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <main className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
      {kicker ? <p className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">{kicker}</p> : null}
      <h1 className="mt-2 font-display text-5xl">{title}</h1>
      <div className="mt-8 space-y-4 text-sm leading-relaxed text-muted-foreground [&_a]:text-foreground [&_a]:underline [&_h2]:mt-10 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:text-foreground [&_li]:mt-1 [&_strong]:text-foreground [&_ul]:list-disc [&_ul]:pl-5">
        {children}
      </div>
    </main>
  );
}
