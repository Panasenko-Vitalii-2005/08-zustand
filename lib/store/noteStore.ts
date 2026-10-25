import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { NoteTag } from "@/types/note";

export interface NoteDraft {
  title: string;
  content: string;
  tag: NoteTag;
}

interface NoteStore {
  draft: NoteDraft;
  setDraft: (patch: Partial<NoteDraft>) => void;
  clearDraft: () => void;
}

const initialDraft: NoteDraft = {
  title: "",
  content: "",
  tag: "Todo",
};

export const useNoteStore = create<NoteStore>()(
  persist(
    (set) => ({
      draft: { ...initialDraft },
      setDraft: (patch) =>
        set((state) => ({ draft: { ...state.draft, ...patch } })),
      clearDraft: () => set({ draft: { ...initialDraft } }),
    }),
    {
      name: "notehub-draft",
      partialize: (state) => ({ draft: state.draft }),
      skipHydration: true,
    },
  ),
);
