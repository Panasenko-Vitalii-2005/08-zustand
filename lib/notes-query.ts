import { queryOptions } from "@tanstack/react-query";
import { fetchNotes } from "@/lib/api";
import type { NoteTag } from "@/types/note";

export const NOTES_PER_PAGE = 12;

export function notesQueryOptions(page = 1, search = "", tag?: NoteTag) {
  return queryOptions({
    queryKey: ["notes", page, NOTES_PER_PAGE, search, tag ?? null],
    queryFn: () =>
      fetchNotes({
        page,
        perPage: NOTES_PER_PAGE,
        search: search || undefined,
        tag,
      }),
  });
}
