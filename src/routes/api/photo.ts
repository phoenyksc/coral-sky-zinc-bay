import { createFileRoute } from "@tanstack/react-router";
import { handleCleanPhotoRequest } from "../../../scripts/clean-listing-photo.mjs";

export const Route = createFileRoute("/api/photo")({
  server: {
    handlers: {
      GET: async ({ request }) => handleCleanPhotoRequest(request),
    },
  },
});
