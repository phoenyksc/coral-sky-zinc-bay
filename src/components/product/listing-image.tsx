import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

function isRemoteListing(src: string) {
  try {
    const u = new URL(src);
    return u.hostname === "i.ebayimg.com" || u.hostname.endsWith(".ebayimg.com");
  } catch {
    return false;
  }
}

function cleanedSrc(src: string) {
  return isRemoteListing(src) ? `/api/photo?u=${encodeURIComponent(src)}&v=8` : src;
}

function nextSrc(src: string, original?: string): string | null {
  if (src.startsWith("/api/photo") && original) return original;
  if (src.includes("/s-l800.jpg")) return src.replace("/s-l800.jpg", "/s-l500.jpg");
  if (src.includes("/s-l500.jpg")) return src.replace("/s-l500.jpg", "/s-l300.jpg");
  return null;
}

export function ListingImage({
  src,
  alt,
  className,
  imgClassName,
  priority = false,
}: {
  src?: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
}) {
  const [current, setCurrent] = useState(src ? cleanedSrc(src) : src);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setCurrent(src ? cleanedSrc(src) : src);
    setFailed(false);
  }, [src]);

  if (!current || failed) {
    return (
      <div className={cn("grid place-items-center bg-card text-[11px] tracking-[0.16em] text-muted-foreground uppercase", className)}>
        Sol Beautiful
      </div>
    );
  }

  const uncleaned = Boolean(src && current === src && isRemoteListing(src));

  return (
    <div className={cn("relative overflow-hidden bg-card", className)}>
      <img
        src={current}
        alt={alt}
        className={cn("size-full object-contain", imgClassName)}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        referrerPolicy="no-referrer"
        onError={() => {
          const fallback = nextSrc(current, src);
          if (fallback) setCurrent(fallback);
          else setFailed(true);
        }}
      />
      {uncleaned ? (
        <span
          aria-hidden
          className="pointer-events-none absolute bottom-[2%] left-[2%] h-[11%] w-[38%] bg-card"
        />
      ) : null}
    </div>
  );
}
