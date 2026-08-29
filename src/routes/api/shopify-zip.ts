import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { createFileRoute } from "@tanstack/react-router";

const FILES: Record<string, { name: string; mime: string }> = {
  theme: { name: "sol-beautiful-theme.zip", mime: "application/zip" },
  kit: { name: "sol-beautiful-shopify-upload.zip", mime: "application/zip" },
  csv: { name: "sol-beautiful-products.csv", mime: "text/csv; charset=utf-8" },
};

export const Route = createFileRoute("/api/shopify-zip")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const kind = new URL(request.url).searchParams.get("file") ?? "theme";
        const file = FILES[kind] ?? FILES.theme;
        const buf = await readFile(join(process.cwd(), "public/downloads", file.name));
        return new Response(new Uint8Array(buf), {
          headers: {
            "Content-Type": file.mime,
            "Content-Disposition": `attachment; filename="${file.name}"`,
            "Content-Length": String(buf.byteLength),
            "Cache-Control": "no-store",
          },
        });
      },
    },
  },
});
