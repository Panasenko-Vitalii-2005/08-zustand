import { noteHubApi } from "./client";
import type { Note, NoteTag } from "@/types/note";

export interface FetchNotesParams {
  page: number;
  perPage: number;
  search?: string;
  tag?: NoteTag;
}

export interface FetchNotesResponse {
  notes: Note[];
  totalPages: number;
}

export interface CreateNoteParams {
  title: string;
  content: string;
  tag: NoteTag;
}

export async function fetchNotes({
  page,
  perPage,
  search,
  tag,
}: FetchNotesParams): Promise<FetchNotesResponse> {
  const response = await noteHubApi.get<FetchNotesResponse>("/notes", {
    params: { page, perPage, search, ...(tag === undefined ? {} : { tag }) },
  });
  return response.data;
}

export async function fetchNoteById(id: string): Promise<Note> {
  const response = await noteHubApi.get<Note>(
    `/notes/${encodeURIComponent(id)}`,
  );
  return response.data;
}

export async function createNote(note: CreateNoteParams): Promise<Note> {
  const response = await noteHubApi.post<Note>("/notes", note);
  return response.data;
}

export async function deleteNote(noteId: string): Promise<Note> {
  const response = await noteHubApi.delete<Note>(
    `/notes/${encodeURIComponent(noteId)}`,
  );
  return response.data;
}
