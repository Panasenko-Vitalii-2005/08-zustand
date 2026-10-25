import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { fetchNoteForPage } from "@/lib/api/server";
export { generateMetadata } from "@/app/notes/[id]/page";
import NotePreviewClient from "./NotePreview.client";

interface NotePreviewProps {
  params: Promise<{ id: string }>;
}

export default async function NotePreview({ params }: NotePreviewProps) {
  const { id } = await params;
  const queryClient = new QueryClient();
  const queryKey = ["note", id];

  await queryClient.prefetchQuery({
    queryKey,
    queryFn: () => fetchNoteForPage(id),
  });
  const error = queryClient.getQueryState(queryKey)?.error;
  if (error) throw error;

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <NotePreviewClient />
    </HydrationBoundary>
  );
}
