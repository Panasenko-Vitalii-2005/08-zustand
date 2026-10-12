# Homework #7 implementation report

Project: `D:\GoIT_Projects\TS homework\07-routing-nextjs`  
Verified on October 12, 2026, using the installed Next.js 16.3.8.

## Files created

- `app/not-found.tsx`
- `app/not-found.module.css`
- `app/notes/filter/layout.tsx`
- `app/notes/filter/LayoutNotes.module.css`
- `app/notes/filter/@sidebar/default.tsx`
- `app/notes/filter/@sidebar/SidebarNotes.module.css`
- `app/@modal/default.tsx`
- `app/@modal/page.tsx`
- `app/@modal/[...catchAll]/page.tsx`
- `app/@modal/(.)notes/[id]/page.tsx`
- `app/@modal/(.)notes/[id]/NotePreview.client.tsx`
- `app/@modal/(.)notes/[id]/NotePreview.module.css`
- `app/@modal/(.)notes/[id]/error.tsx`
- `lib/notes-query.ts`
- `HW7-REPORT.md`

## Files modified

- `app/layout.tsx`: accepts the modal slot and renders it inside the existing TanStack provider.
- `components/Header/Header.tsx`: Notes links to `/notes/filter/all`; markup uses the official Header classes.
- `components/Header/Header.module.css`: copied the official hw-07 stylesheet.
- `components/Modal/Modal.tsx`: configurable accessible label and portal rendering after hydration; existing Escape, backdrop, scroll lock, and cleanup remain.
- `components/NoteList/NoteList.tsx`: keeps Next.js Link navigation and disables scrolling when opening details.
- `app/notes/[id]/NoteDetails.module.css`: copied the official hw-07 stylesheet. The full-page server/client components and error boundary remain.
- `lib/api.ts`: accepts an optional typed tag and omits it from request parameters when undefined.
- `package.json`: identifies Homework #7 and adds Prettier as a development dependency.
- `package-lock.json`: matching package name and Prettier dependency.

The other corresponding official styles were fetched and compared with the existing styles. Equivalent files were retained without line-ending-only changes.

## Files moved

| Previous location            | New location                                      |
| ---------------------------- | ------------------------------------------------- |
| `app/notes/page.tsx`         | `app/notes/filter/[...slug]/page.tsx`             |
| `app/notes/Notes.client.tsx` | `app/notes/filter/[...slug]/Notes.client.tsx`     |
| `app/notes/Notes.module.css` | `app/notes/filter/[...slug]/NotesPage.module.css` |
| `app/notes/error.tsx`        | `app/notes/filter/[...slug]/error.tsx`            |

The four old paths were removed after migration. The CSS filenames follow the official hw-07 names where applicable.

## Routing structure

```text
app/
  layout.tsx
  page.tsx
  loading.tsx
  not-found.tsx
  not-found.module.css
  @modal/
    default.tsx
    page.tsx
    [...catchAll]/page.tsx
    (.)notes/[id]/
      page.tsx
      NotePreview.client.tsx
      NotePreview.module.css
      error.tsx
  notes/
    [id]/
      page.tsx
      NoteDetails.client.tsx
      NoteDetails.module.css
      error.tsx
    filter/
      layout.tsx
      LayoutNotes.module.css
      @sidebar/
        default.tsx
        SidebarNotes.module.css
      [...slug]/
        page.tsx
        Notes.client.tsx
        NotesPage.module.css
        error.tsx
```

## Filters, API, and hydration

The server sidebar uses the hardcoded Todo, Work, Personal, Meeting, and Shopping tags, renders links with `map`, and includes All notes. The server layout receives typed `children` and `sidebar` slots.

The catch-all page awaits `params`, accepts exactly one valid filter segment, normalizes `all` to `undefined`, and calls `notFound()` for invalid tags or extra segments. Server prefetch and client querying share `notesQueryOptions` with the key:

```ts
["notes", page, 12, search, tag ?? null];
```

Each selected tag receives a keyed client component, resetting pagination to page 1. Placeholder data is retained only within the same tag. Search remains debounced and resets pagination. Existing Formik/Yup creation, deletion, query invalidation, and the last-note-on-last-page adjustment remain in place.

Read-only checks against the real API confirmed these serialized requests:

```text
/api/notes?page=1&perPage=12
/api/notes?page=1&perPage=12&tag=Todo
/api/notes?page=1&perPage=12&tag=Work
/api/notes?page=1&perPage=12&tag=Personal
/api/notes?page=1&perPage=12&tag=Meeting
/api/notes?page=1&perPage=12&tag=Shopping
/api/notes?page=2&perPage=12&tag=Work
/api/notes?page=1&perPage=12&search=project&tag=Work
```

| Filter   | Notes on the first page | Total pages |
| -------- | ----------------------: | ----------: |
| all      |                      12 |           4 |
| Todo     |                       4 |           1 |
| Work     |                      12 |           2 |
| Personal |                      12 |           2 |
| Meeting  |                       0 |           0 |
| Shopping |                       4 |           1 |

Every returned filtered note matched the requested tag. Work pagination, Work search for `project`, and fetching a note by its ID passed. The first rapid API check received HTTP 429; repeating with two-second intervals passed.

Raw server HTML contained the Work list and full-page note details before browser JavaScript ran, confirming SSR. Both routes returned HTTP 200.

API parameter/response interfaces remain in `lib/api.ts`; shared Note and NoteTag types remain in `types/note.ts`. Axios and `process.env.NEXT_PUBLIC_NOTEHUB_TOKEN` are preserved. Credentials were not printed.

## Routed previews

The root modal slot shares the existing TanStack provider. The intercepted server page awaits the ID, prefetches `['note', id]`, dehydrates the cache, and renders the client preview inside HydrationBoundary.

The preview obtains the ID with `useParams`, queries with the existing detail key and `refetchOnMount: false`, and displays title, tag, content, and the created date using the existing Modal. Its close action uses `router.back()`.

Soft navigation from a list opens the preview at `/notes/{id}` while retaining the background list and its search state. Direct navigation and hard refresh render the preserved full-page details route. The null root page and catch-all modal page clear previews on unrelated navigation. The preview has its own error boundary.

## Verification results

| Check                                                                                            | Result                                            |
| ------------------------------------------------------------------------------------------------ | ------------------------------------------------- |
| `npm run lint`                                                                                   | Passed with no ESLint errors or warnings          |
| `npm run build`                                                                                  | Passed, including TypeScript and route generation |
| Prettier write/check for changed files                                                           | Passed                                            |
| `git diff --check`                                                                               | Passed                                            |
| No `any`, `console.log`, old `/notes` header link, or temporary error throws in application code | Verified by source search                         |

The first sandboxed build could not resolve the Windows project path due to access restrictions. The same build outside the sandbox passed. The local production server runs at `http://127.0.0.1:3100`; Windows denied binding port 3000.

Browser checks actually performed:

- Home and all six filter URLs.
- Correct tags against actual API data; Meeting displays the empty state.
- Work pagination and debounced search; search resets pagination.
- Changing Work page 2 to Personal resets to page 1 without notes from the previous tag.
- Preview from Work, Personal, and All notes with URL changes.
- Background Work search text and list contents preserved while opening and closing the preview.
- Close button, Escape, backdrop click, and clicking inside the preview.
- Browser Back closes the preview; Forward reopens it.
- Navigation through Home and the sidebar clears the active preview.
- Direct `/notes/{id}` navigation and hard refresh, with no overlay or sidebar.
- Custom 404 UI for an unknown route, an unsupported tag, and an extra catch-all segment; Header and Footer remain.
- Create-note modal opening, Formik/Yup minimum-title validation, valid submit enablement, tag selection, Cancel, Escape, backdrop, scroll lock, and cleanup. The form was never submitted.
- Browser console log checks returned no errors or warnings; no hydration errors were observed.

The unknown-route response streams the custom not-found UI with HTTP 200. Next.js documents HTTP 200 for streamed not-found responses; the verified result is the required custom UI, not an HTTP 404 status assertion.

## Styles

The corresponding CSS Modules were obtained from the [official hw-07 styles](https://github.com/goitacademy/react-notehub-styles/tree/hw-07). That branch has no dedicated not-found stylesheet. `app/not-found.module.css` uses the unchanged official Home stylesheet, retaining the existing design.

The tag parameter and allowed values were verified in the [official NoteHub API documentation](https://notehub-public.goit.study/api/docs/).

## Remaining manual checks

Actual note creation and deletion were intentionally not executed against the backend, as requested. Manually verify successful creation under matching/nonmatching tag filters, deletion/refetch, and deleting the final note on the final page. The existing mutation implementations and invalidation were reviewed and preserved.

## Git and protected files

- Initial working tree was clean.
- Final source changes are unstaged: 9 modified tracked files, 4 removed old list files, and 19 new paths including the 4 migrated files and this report.
- `.env.local` matches `.gitignore`; `git ls-files .env.local` returned no tracked file.
- `.env.local` was not modified. No tokens were printed, committed, or pushed.
- The previous `06-notehub-nextjs` project was not modified.
- No commits or pushes were performed.

Screenshots of the preview and full-page details were saved outside the repository in the chat's visualization directory.
