import "server-only";
import { cache } from "react";
import { notFound } from "next/navigation";
import { NoteHubApiError } from "./client";
import { fetchNoteById } from "./notes";

// Share the request between metadata and the page without caching across users.
export const fetchNoteForPage = cache(async (id: string) => {
  try {
    return await fetchNoteById(id);
  } catch (error) {
    if (
      error instanceof NoteHubApiError &&
      (error.status === 400 || error.status === 404)
    ) {
      notFound();
    }
    throw error;
  }
});
