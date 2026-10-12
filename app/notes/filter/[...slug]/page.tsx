import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { notesQueryOptions } from "@/lib/notes-query";
import type { NoteTag } from "@/types/note";
import NotesClient from "./Notes.client";

interface NotesPageProps {
  params: Promise<{ slug: string[] }>;
}

function isNoteTag(value: string): value is NoteTag {
  return ["Todo", "Work", "Personal", "Meeting", "Shopping"].includes(value);
}

export default async function NotesPage({ params }: NotesPageProps) {
  const { slug } = await params;
  if (slug.length !== 1) notFound();

  const filter = slug[0];
  if (filter !== "all" && !isNoteTag(filter)) notFound();
  const tag = filter === "all" ? undefined : filter;

  await connection();
  const queryClient = new QueryClient();
  const options = notesQueryOptions(1, "", tag);
  await queryClient.prefetchQuery(options);

  const error = queryClient.getQueryState(options.queryKey)?.error;
  if (error) throw error;

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <NotesClient key={tag ?? "all"} tag={tag} />
    </HydrationBoundary>
  );
}
