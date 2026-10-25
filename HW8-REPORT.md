# Homework 8 implementation report

The [final security and formatting audit](HW8-AUDIT.md) supersedes the initial
dependency versions, audit findings and Prettier limitations recorded below.
Next.js is now 16.4.3, Zod is 4.6.7, both npm audits report zero vulnerabilities,
and the repository-wide formatting check passes.

Verified on 25 October 2026. Work was limited to `08-zustand`.

## 1. Files created

- `app/[...catchAll]/page.tsx`
- `app/notes/action/create/page.tsx`
- `app/notes/action/create/CreateNote.module.css`
- `lib/metadata.ts`
- `lib/store/noteStore.ts`
- `lib/api/client.ts`
- `lib/api/notes.ts`
- `lib/api/index.ts`
- `lib/api/server.ts`
- `scripts/hw8.test.mjs`
- `HW8-REPORT.md`

## 2. Files modified

- `app/layout.tsx`
- `app/globals.css`
- `app/not-found.tsx`
- `app/notes/filter/[...slug]/page.tsx`
- `app/notes/filter/[...slug]/Notes.client.tsx`
- `app/notes/filter/[...slug]/NotesPage.module.css`
- `app/notes/[id]/page.tsx`
- `app/notes/[id]/NoteDetails.module.css`
- `app/@modal/(.)notes/[id]/page.tsx`
- `app/@modal/(.)notes/[id]/NotePreview.module.css`
- `components/Header/Header.module.css`
- `components/Footer/Footer.module.css`
- `components/NoteList/NoteList.tsx`
- `components/NoteList/NoteList.module.css`
- `components/NoteForm/NoteForm.tsx`
- `types/note.ts`
- `package.json`
- `package-lock.json`

The package name is `08-zustand` in both package files. The pre-existing Zustand 5 installation was retained. Unused Formik and Yup dependencies were removed, together with their unused transitive dependencies.

## 3. Files removed or moved

`lib/api.ts` was replaced by the modules in `lib/api/`. There is no conflicting standalone API file. No HW6 or HW7 files were changed.

## 4. SEO metadata

`lib/metadata.ts` centralizes metadata generation, the site URL, the shared image and note excerpts. `NEXT_PUBLIC_SITE_URL` can supply the deployment origin; the fallback is `https://notehub.com/`. No environment file was changed to configure this.

The layout, custom 404 and create page export typed static metadata. Filter and note pages export async `generateMetadata(): Promise<Metadata>`, await route params and supply titles, descriptions, Open Graph titles/descriptions/URLs/images. Note metadata uses the retrieved note title and a whitespace-normalized content excerpt of at most 160 characters.

The required [Open Graph image](https://ac.goit.global/fullstack/react/notehub-og-meta.jpg) was inspected in memory: its actual dimensions are **1536 × 1024**. The image metadata includes those dimensions and alt text.

The main catch-all invokes `notFound()` in both its page and metadata function. This fixes an observed interaction with the modal catch-all where arbitrary URLs displayed the 404 markup but inherited home metadata. The final HTTP check confirmed the requested 404 metadata and `noindex, nofollow`.

Invalid filters and missing/invalid note identifiers render the custom 404. Sanitized API status codes allow missing-note handling without exposing request headers. React `cache` shares a note request between metadata and server rendering within the request.

Next.js can send HTTP 200 for a streamed not-found response because the root loading boundary has already started the response; this was observed in the HTTP checks and is documented in the installed Next.js guide. The 404 content and noindex metadata were verified.

## 5. Roboto

Roboto is loaded through `next/font/google`, with weights 400, 500 and 700, `display: "swap"`, Latin and Cyrillic subsets, and variable `--font-roboto`. Its variable class is applied to the body and global CSS uses it. Browser computed styles confirmed `Roboto, "Roboto Fallback", sans-serif`.

The first sandboxed build could not reach Google Fonts. The subsequent builds with network access passed using the real font.

## 6. Create route and official styles

`/notes/action/create` is a Server Component named `CreateNote`, with the required main/container/title/NoteForm markup. The notes toolbar links to it and no longer opens a create modal.

All corresponding files from the [official HW8 styles](https://github.com/goitacademy/react-notehub-styles/tree/hw-08) were retrieved and compared. Matching files were retained; differing corresponding files were copied. The create link adds `text-decoration: none` to preserve the previous button appearance. No requested styles were unavailable.

## 7. Native form action

NoteForm uses native input, textarea, select and form elements. React `useActionState` supplies the function named `formAction` to `<form action={formAction}>`. Submission reads FormData and calls the existing Axios create function through TanStack Query `mutateAsync`.

Validation preserves title length 3–50, optional content up to 500 characters and the five shared tags. Trimmed empty titles are rejected. Pending state disables fields and both action buttons. Errors are visible. A failed action remounts the uncontrolled form from the saved draft so React's native form reset does not discard the visible fields.

## 8. Zustand store

The typed store uses `create<NoteStore>()(...)` and contains `draft`, `setDraft(Partial<NoteDraft>)` and `clearDraft`. Partial updates merge with previous state. Clear creates a fresh copy of the initial empty title/content and Todo tag.

## 9. Persistence

Zustand persist uses the `notehub-draft` localStorage key. `partialize` stores only `draft` inside Zustand's normal state/version envelope. Actions are not persisted. `skipHydration: true` and explicit client rehydration prevent uncontrolled fields from mounting before their saved defaults are ready.

## 10. Restoration and clearing

Cancel calls `router.back()` and keeps the draft. Successful creation clears the draft, invalidates all notes queries with `refetchType: "all"`, then pushes `/notes/filter/all`. Refetching inactive cached queries prevents a prefetched old list from hiding the new note. Failed creation keeps the draft and stays on the create page.

## 11. API organization

- `client.ts`: shared Axios client, existing public token configuration and sanitized status-bearing errors.
- `notes.ts`: fetchNotes, fetchNoteById, createNote, deleteNote and API parameter/response types.
- `index.ts`: public exports compatible with existing `@/lib/api` imports.
- `server.ts`: request-scoped note fetching and not-found handling.

The All filter supplies no API tag. Query keys still match between SSR and CSR.

## 12. HW6 mentor fixes

The initial audit found both fixes missing. The fixed HW6 NoteList was read as a reference. NoteList now owns useMutation, useQueryClient, deletion, detail-cache removal and notes-cache invalidation. NotesClient only handles the optional empty-page pagination callback. The unnecessary `connection()` call was removed. SSR prefetch, dehydrate and HydrationBoundary remain.

## 13. HW7 routing

Header, sidebar, catch-all filters, routed previews, parallel modal slot, direct details, search and pagination were preserved. The root layout still renders Header, Footer, TanStackProvider, children and modal. The create path has its own static route and does not collide with the note ID route.

## 14. Lint

`npm run lint`: passed on the final application and test sources.

## 15. Build and TypeScript

`npm run build`: passed with Next.js 16.3.8 and real Google Fonts. The final build followed restoration of the original favicon binary after an incidental cleanup change. No favicon change remains.

`npx --no-install tsc --noEmit`: passed. The production build also completed its TypeScript check.

## 16. Prettier and whitespace

Changed/new source and package files were formatted and their Prettier check passed. The report was formatted and checked after creation.

The repository-wide `prettier --check .` reports **34 unchanged files** with pre-existing formatting/CRLF differences. Those unrelated files were kept in their original formatting. This is not a repository-wide Prettier pass.

`git diff --check`: passed. Source checks found no TypeScript `any`, `console.log`, Formik usage or `connection()` calls in the implementation.

## 17. Tests actually performed

In Chrome against the production build at `http://127.0.0.1:3108`:

- Create page renders native fields and controls.
- Title, content and Work tag survive Cancel and return navigation.
- All three fields survive a full browser refresh.
- Whitespace-only title produces an action error without a backend request.
- All, Todo, Work, Personal, Meeting and Shopping sidebar routes render; populated categories show matching tags. Meeting has an empty result.
- Search for Shopping returns matching titles/content and resets pagination.
- Pagination changes the displayed notes.
- Delete controls are present; none were clicked.
- View details opens an intercepted preview over the list.
- Escape and backdrop clicks close the preview.
- Browser Back closes and Forward reopens the preview.
- Direct note access and refresh render full-page details without a modal.
- Home, create, Work and direct-note metadata were inspected in the DOM.
- Computed Roboto styling was checked.
- No warning/error logs were captured in the console checks performed before automation stopped; no hydration warning was observed.

Read-only HTTP checks covered home, all six filters, create, an existing note, missing note, invalid filter, extra filter segments and an unmatched URL. Required titles/descriptions/Open Graph fields were present. The unmatched URL's final metadata was rechecked after the fix. A later server request hit API rate limiting (429), with sanitized error output.

`node --test scripts/hw8.test.mjs`: **5 passed, 0 failed**. These isolated tests run the real store/form-action source with in-memory storage and mocked React/router/query/API boundaries. They verify persistence-only-draft, fresh-store restoration, partial-field preservation, fresh clear values, mocked successful creation order/navigation, failed creation draft preservation, validation and Cancel. They do not make network requests or prove browser rendering of an API failure.

## 18. Manual checks remaining

- Submit a real valid note; verify it appears in All notes and a return to Create shows cleared fields.
- Perform a real deletion, including deleting the last note on a paginated page.
- Block the create request in browser developer tools and confirm the visible error, retained fields and lack of navigation; verify pending controls during a delayed request.
- Inspect the browser's actual localStorage entry directly and verify draft restoration after closing/reopening the tab.
- Verify metadata using the eventual deployed site URL.

Browser automation stopped while opening developer tools because it could not determine the current Windows browser URL confidently. Further browser interactions were stopped. No live creation/deletion was attempted; the backend mutation scenarios remain manual as requested.

## 19. npm audit

Both requested audits were executed successfully with registry access and rerun after dependency removal. Both exit with code 1 because vulnerabilities remain.

| Package | Installed version | Severity | Production dependency? | Finding                                                                                |
| ------- | ----------------- | -------- | ---------------------- | -------------------------------------------------------------------------------------- |
| next    | 16.3.8            | Critical | Yes, direct            | Image Optimization SVG RCE; App Router Server Actions DoS; typed-array `use cache` RCE |
| zod     | 4.6.5             | High     | No                     | Oversized constrained collections can exhaust memory                                   |

Full audit: **2 vulnerable packages: 1 critical, 1 high**. Production-only audit: **1 critical package (`next`)**. Zod is brought in through `eslint-config-next` → `eslint-plugin-react-hooks` (and zod-validation-error).

npm reports Next 16.4.3 as a non-major fix and Zod 4.6.6 as the patched threshold. Versions were left unchanged; no forced audit fix or unrelated upgrade was performed. Package presence establishes dependency exposure; exploitability of each advisory was not tested.

Advisories: [SVG optimization](https://github.com/advisories/GHSA-2464-fhr4-w9xw), [Server Actions](https://github.com/advisories/GHSA-p3m5-59mp-jv5r), [typed arrays](https://github.com/advisories/GHSA-673q-mjm6-r5xr), [Zod collections](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5).

## 20. Git status

The final working tree contains the 18 modified files, 11 new files and 1 removed file listed above. Changes are unstaged and uncommitted. The original uncommitted Zustand installation in the package files was retained.

## 21. Environment protection

`.env.local` was not opened, edited, copied or revealed by the implementation work. Next.js loaded it normally for builds/server operation. `git check-ignore .env.local` confirms it is ignored; `git ls-files -- .env.local` returns no tracked file.

## 22. Commit/push

No commit or push was made. No changes were made to the reference projects.
