import { cn } from "@/lib/utils";

const TILES = [
  { src: "/lifestyle/story-young.jpg", alt: "A young woman in soft California light", className: "col-span-2 row-span-2" },
  { src: "/lifestyle/story-mid.jpg", alt: "A woman in her thirties, calm and luminous", className: "col-span-1 row-span-1" },
  { src: "/lifestyle/story-botanical.jpg", alt: "Silk, water, and olive branches", className: "col-span-1 row-span-1" },
  { src: "/lifestyle/story-prime.jpg", alt: "A woman in midlife, warm and sure", className: "col-span-1 row-span-1" },
  { src: "/lifestyle/story-elder.jpg", alt: "A woman in her seventies, radiant and kind", className: "col-span-1 row-span-1" },
] as const;

export function StoryCollage({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "grid grid-cols-4 grid-rows-2 gap-1.5 overflow-hidden rounded-xl sm:gap-2",
        className,
      )}
    >
      {TILES.map((tile) => (
        <img
          key={tile.src}
          src={tile.src}
          alt={tile.alt}
          className={cn("h-full min-h-0 w-full object-cover", tile.className)}
        />
      ))}
    </div>
  );
}
