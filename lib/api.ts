import axios from "axios";
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

const noteHubApi = axios.create({
  baseURL: "https://notehub-public.goit.study/api",
  headers: {
    Authorization: `Bearer ${process.env.NEXT_PUBLIC_NOTEHUB_TOKEN}`,
  },
});

// Axios errors contain request headers; keep credentials out of error boundaries.
noteHubApi.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const message =
      axios.isAxiosError(error) && error.response
        ? `NoteHub request failed (${error.response.status}).`
        : "Could not connect to NoteHub.";

    return Promise.reject(new Error(message));
  },
);

export const fetchNotes = async ({
  page,
  perPage,
  search,
  tag,
}: FetchNotesParams): Promise<FetchNotesResponse> => {
  const response = await noteHubApi.get<FetchNotesResponse>("/notes", {
    params: { page, perPage, search, ...(tag === undefined ? {} : { tag }) },
  });
  return response.data;
};

export const createNote = async (note: CreateNoteParams): Promise<Note> => {
  const response = await noteHubApi.post<Note>("/notes", note);
  return response.data;
};

export const deleteNote = async (noteId: string): Promise<Note> => {
  const response = await noteHubApi.delete<Note>(`/notes/${noteId}`);
  return response.data;
};

export const fetchNoteById = async (id: string): Promise<Note> => {
  const response = await noteHubApi.get<Note>(`/notes/${id}`);
  return response.data;
};
