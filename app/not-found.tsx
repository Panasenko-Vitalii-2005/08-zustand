import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/metadata";
import css from "./not-found.module.css";

export const metadata: Metadata = {
  ...createPageMetadata(
    "404 - Page not found | NoteHub",
    "Sorry, the page you are looking for does not exist.",
    "/404",
  ),
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className={css.main}>
      <div className={css.container}>
        <h1 className={css.title}>404 - Page not found</h1>
        <p className={css.description}>
          Sorry, the page you are looking for does not exist.
        </p>
      </div>
    </main>
  );
}
