"use client";

import Link from "next/link";
import type { Note } from "@/types/note";
import css from "./NoteList.module.css";

interface NoteListProps {
  notes: Note[];
  onDelete: (id: string) => void;
  deletingNoteId?: string;
}

export default function NoteList({
  notes,
  onDelete,
  deletingNoteId,
}: NoteListProps) {
  return (
    <ul className={css.list}>
      {notes.map((note) => (
        <li className={css.listItem} key={note.id}>
          <h2 className={css.title}>{note.title}</h2>
          <p className={css.content}>{note.content}</p>
          <div className={css.footer}>
            <span className={css.tag}>{note.tag}</span>
            <Link
              className={css.link}
              href={`/notes/${note.id}`}
              scroll={false}
            >
              View details
            </Link>
            <button
              className={css.button}
              type="button"
              disabled={deletingNoteId !== undefined}
              onClick={() => onDelete(note.id)}
            >
              {deletingNoteId === note.id ? "Deleting..." : "Delete"}
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
