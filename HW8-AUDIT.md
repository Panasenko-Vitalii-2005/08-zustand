# HW8 final security and formatting audit

Completed on 25 October 2026 in `D:\GoIT_Projects\TS homework\08-zustand`.

## Result

Both `npm audit` and `npm audit --omit=dev` now exit successfully with **zero known vulnerabilities**. Lint, production build, TypeScript, repository-wide Prettier, five isolated tests and whitespace checks pass.

The application remains on Next.js 16 and uses the same App Router, React, TanStack Query and Zustand architecture. No major dependency upgrade, forced audit fix, commit or push was performed.

## Exact advisories and fixes

The initial audit reported two vulnerable packages, containing four advisories. The following ranges were verified against the GitHub advisory records and npm audit data:

| Advisory                                                                                                          | Issue                                                                                         | Severity | Affected versions                              | First patched versions |
| ----------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | -------- | ---------------------------------------------- | ---------------------- |
| [GHSA-2464-fhr4-w9xw](https://github.com/vercel/next.js/security/advisories/GHSA-2464-fhr4-w9xw)                  | Next.js unauthenticated remote code execution in Image Optimization when SVG files are used   | Critical | Next `>=10.0.0 <=15.5.27`; `>=16.0.0 <=16.4.0` | `15.5.28`; `16.4.1`    |
| [GHSA-p3m5-59mp-jv5r](https://github.com/vercel/next.js/security/advisories/GHSA-p3m5-59mp-jv5r) / CVE-2026-94482 | Next.js App Router Server Actions denial of service                                           | High     | Next `>=13.0.0 <=15.5.27`; `>=16.0.0 <=16.4.0` | `15.5.28`; `16.4.1`    |
| [GHSA-673q-mjm6-r5xr](https://github.com/vercel/next.js/security/advisories/GHSA-673q-mjm6-r5xr)                  | Next.js unauthenticated remote code execution in `use cache` functions returning typed arrays | Critical | Next `>=16.0.0 <=16.4.0`                       | `16.4.1`               |
| [GHSA-mrhx-c7xc-m3w5](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5) / CVE-2023-54404                         | Zod memory exhaustion while validating oversized constrained collections                      | High     | Zod `<4.6.6`                                   | `4.6.6`                |

The GitHub API advisory records did not supply CVE identifiers for the two Next.js RCE records, so they are identified here by their exact GHSA IDs.

The advisory for SVG optimization also identifies `sharp >=0.35.5` as the fixed upstream dependency. The installed dependency tree contains `sharp@0.35.5`.

## Dependency changes

| Package            | Before this audit | After this audit | Scope                                        |
| ------------------ | ----------------- | ---------------- | -------------------------------------------- |
| next               | 16.3.8            | **16.4.3**       | Production dependency, pinned                |
| eslint-config-next | 16.3.8            | **16.4.3**       | Development dependency, aligned with Next    |
| zod                | 4.6.5             | **4.6.7**        | Compatible transitive development dependency |
| react / react-dom  | 19.2.8            | 19.2.8           | Unchanged                                    |
| zustand            | 5.0.16            | 5.0.16           | Unchanged                                    |

Next.js 16.4.3 is the compatible version recommended by npm audit and includes the fixes first released in 16.4.1. Its declared Node and React requirements are satisfied by Node 22.20.0 and React 19.2.8 in this project.

Zod remains transitive through `eslint-config-next` → `eslint-plugin-react-hooks` and `zod-validation-error`. A targeted `npm update zod` selected 4.6.7 within the existing dependency ranges. No direct Zod dependency or override was added. The package lock records the patched resolution.

Commands used to update dependencies:

```powershell
npm install next@16.4.3 eslint-config-next@16.4.3 --save-exact --ignore-scripts --no-audit --no-fund
npm update zod --ignore-scripts --no-audit --no-fund
```

Initial full audit: **1 critical and 1 high vulnerable package**. Initial production-only audit: **1 critical vulnerable package**, Next.js. Zod was development-only.

Final full audit: **0 vulnerabilities**, exit code 0. Final production-only audit: **0 vulnerabilities**, exit code 0. No advisories remain in the installed dependency tree according to these registry audits. This is a dependency advisory check, not a penetration test.

## Investigation of all 34 Prettier failures

The failures were reproduced before formatting and classified by rerunning Prettier against content with only CRLF converted to LF:

- **29 files** passed after line-ending normalization alone.
- **5 files** also needed ordinary Prettier line wrapping/layout: `app/notes/[id]/NoteDetails.client.tsx`, `components/Pagination/Pagination.module.css`, `components/Pagination/Pagination.tsx`, `components/TanStackProvider/TanStackProvider.tsx` and `next.config.ts`.

The project source files, CSS Modules, configuration and Markdown files were formatted. No application logic was rewritten by this audit. Formatting the local `HW7-REPORT.md` copy in HW8 did not modify the HW7 reference project.

Added `.prettierrc.json` with LF line endings and `.prettierignore` with explicit exclusions for dependencies, `.next`, generated declarations, TypeScript build information, output/build/coverage folders, environment files and private-key files.

Prettier's file-info API confirmed that `.env.local`, `node_modules/next/package.json`, `.next/types/validator.ts`, `next-env.d.ts` and `tsconfig.tsbuildinfo` are ignored. Generated files and dependencies were excluded from formatting; normal build outputs and npm-managed dependency installation were handled by their own tools.

Added repeatable scripts to package.json:

```powershell
npm run format
npm run format:check
npm run typecheck
npm test
```

## Final quality checks

| Check                                                                        | Result                                                               |
| ---------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| `npm audit --json`                                                           | Passed; zero vulnerabilities                                         |
| `npm audit --omit=dev --json`                                                | Passed; zero production vulnerabilities                              |
| `npm run lint`                                                               | Passed                                                               |
| `npm run build`                                                              | Passed on Next.js 16.4.3, including TypeScript and static generation |
| `npm run typecheck`                                                          | Passed after the production build                                    |
| `npm test`                                                                   | Passed: 5 tests, 0 failures                                          |
| `npm run format:check`                                                       | Passed for the entire non-ignored repository                         |
| `git diff --check`                                                           | Passed                                                               |
| `npm ls next eslint-config-next zod sharp react react-dom zustand --depth=3` | Valid installed tree; patched versions confirmed                     |

The installed 16.4.3 metadata, intercepting-route and TanStack Query guidance was read after the dependency update. AGENTS.md continues to point to the bundled version-matched documentation.

## Runtime regression checks after updating dependencies

The patched production build was run on `http://127.0.0.1:3108`.

Read-only HTTP checks confirmed:

- Home and create-page metadata.
- Server-rendered All notes HTML with 12 note headings and React hydration data.
- Server-rendered Shopping HTML with 4 note headings and React hydration data.
- Direct note details HTML and note-specific metadata.
- Custom not-found metadata.

Browser checks confirmed:

- The initial notes list hydrates and displays search, pagination and deletion controls.
- Todo, Work, Personal, Meeting and Shopping routes navigate. Populated filters display matching tags; Meeting is empty.
- Pagination switches to 12 different notes on page 2.
- Debounced Shopping search returns matching titles/content and resets pagination.
- An intercepted note preview opens over the list.
- Escape closes the preview; Back closes it and Forward reopens it.
- A direct note URL and refresh display full-page details with no dialog and correct note-specific metadata.
- The create route uses native fields and the computed Roboto font.
- A title/content/Work draft survives Cancel and return, refresh, a second tab, and closing/reopening the test tab.
- A whitespace-only title produces a validation error without a create request.
- The original local draft was restored after testing.
- Custom 404 markup, title, Open Graph URL and noindex metadata render on an unmatched URL.

The five isolated tests additionally verify partial updates, persistence of draft only, fresh-store rehydration, fresh initial values on clear, mocked creation success ordering/cache invalidation/navigation, failure preservation, invalid form data and Cancel behavior. They make no backend requests.

### Observed runtime limitation

Rapid browser route traversal caused two NoteHub API **429** responses. React reported them as minified server-render error 441; the production server logs identified both as sanitized `NoteHubApiError` rate-limit failures. They were not hydration mismatch errors. A paced HTTP/browser recheck of the affected Shopping route passed with all four notes.

No hydration warnings were observed in the inspected browser logs. The final reopened create-page session had no warning/error logs. The test server was stopped after verification.

Live backend creation and deletion were not performed, consistent with the original restriction on automated persistent operations. Real mutation flows and a blocked/delayed request's browser UI remain manual checks; successful/failed creation logic was exercised with mocks.

## Workspace and secrets

- `.env.local` was not opened, edited, copied or revealed. Next.js loaded it normally for builds and runtime.
- `.env.local` is ignored and is not tracked by Git.
- All project writes were confined to HW8. HW6 and HW7 project directories were not modified.
- Existing uncommitted HW8 implementation work was retained.
- Changes remain unstaged and uncommitted. No commit or push was made.

The initial implementation history is retained in [HW8-REPORT.md](HW8-REPORT.md); this document supplies the final dependency and formatting results.
