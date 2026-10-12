"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { deleteNote } from "@/lib/api";
import { notesQueryOptions } from "@/lib/notes-query";
import type { NoteTag } from "@/types/note";
import Modal from "@/components/Modal/Modal";
import NoteForm from "@/components/NoteForm/NoteForm";
import NoteList from "@/components/NoteList/NoteList";
import Pagination from "@/components/Pagination/Pagination";
import SearchBox from "@/components/SearchBox/SearchBox";
import css from "./NotesPage.module.css";

const SEARCH_DELAY = 300;

interface NotesClientProps {
  tag?: NoteTag;
}

export default function NotesClient({ tag }: NotesClientProps) {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const updateSearch = useDebouncedCallback((value: string) => {
    setSearch(value.trim());
    setPage(1);
  }, SEARCH_DELAY);

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    updateSearch(value);
  };

  const { data, isError, isFetching, isLoading } = useQuery({
    ...notesQueryOptions(page, search, tag),
    placeholderData: (previousData, previousQuery) =>
      previousQuery?.queryKey[4] === (tag ?? null) ? previousData : undefined,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteNote,
    onSuccess: async (deletedNote) => {
      queryClient.removeQueries({
        queryKey: ["note", deletedNote.id],
        exact: true,
      });
      if (
        page > 1 &&
        data?.notes.length === 1 &&
        data.notes[0].id === deletedNote.id
      ) {
        setPage(page - 1);
      }
      await queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });

  return (
    <main className={css.app}>
      <header className={css.toolbar}>
        <SearchBox value={searchInput} onChange={handleSearchChange} />
        {data && data.totalPages > 1 && (
          <Pagination
            pageCount={data.totalPages}
            currentPage={page}
            onPageChange={setPage}
          />
        )}
        <button
          className={css.button}
          type="button"
          onClick={() => setIsModalOpen(true)}
        >
          Create note +
        </button>
      </header>
      {isLoading && <p role="status">Loading notes...</p>}
      {isError && <p role="alert">Failed to load notes. Please try again.</p>}
      {isFetching && !isLoading && <p role="status">Updating notes...</p>}
      {deleteMutation.isError && (
        <p role="alert">Could not delete note. Please try again.</p>
      )}
      {data && data.notes.length > 0 && (
        <NoteList
          notes={data.notes}
          onDelete={(id) => deleteMutation.mutate(id)}
          deletingNoteId={
            deleteMutation.isPending ? deleteMutation.variables : undefined
          }
        />
      )}
      {data && data.notes.length === 0 && !isFetching && !isError && (
        <p>No notes found.</p>
      )}
      {isModalOpen && (
        <Modal onClose={() => setIsModalOpen(false)}>
          <NoteForm onCancel={() => setIsModalOpen(false)} />
        </Modal>
      )}
    </main>
  );
}
