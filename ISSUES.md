# NotepaperAI — Open Issues & Contribution Notes

This is the working issue list for NotepaperAI (Laravel 12 backend in `Backend/`, React 19 + Vite frontend in `Frontend/`).
It is intended both as the team's work backlog and as a curated onboarding list for external contributors.

Every item is tagged with the area it touches and a severity.

| Severity | Meaning |
|----------|---------|
| 🔴 Critical | Security/privacy hole or data-loss bug — fix first |
| 🟠 High | Bug or broken behaviour affecting real users |
| 🟡 Medium | Incomplete feature, robustness, or config gap |
| 🔵 Low | Polish, cleanup, tech debt |

`[frontend]`, `[backend]`, or `[both]` marks where the work lives. Items marked **good first issue** are isolated, well-scoped, and safe for a first contribution.

---

## 1. Security & privacy

### 🔴 Critical — Public share routes expose every user's private content (no opt-in flag)
**Areas:** `[backend]` · **Files:**
- `Backend/app/Services/WorkSpaceService.php:182`
- `Backend/app/Services/QuizService.php:41`
- `Backend/app/Services/PaperService.php:92`
- `Backend/app/Services/FlashcardService.php:70`

**Description:** The "public" endpoints (`GET /api/v1/public/notes|papers|quizzes|flashcards/{id}`) call bare `findOrFail($id)` with **no visibility check and no ownership model** — there is no `is_public`/shared column anywhere (confirmed by searching all migrations). The `BelongsToUser` global scope (`Backend/app/Traits/BelongsToUser.php:13`) only applies a `user_id` filter when `Auth::check()` is true, so unauthenticated requests get no filter at all. Result: **anybody who knows (or guesses) a ULID can read anyone's private notes, papers, quizzes and flashcards**. Sharing was never explicitly designed in — only unguessable IDs protect it.

**Fix:** Introduce an explicit sharing concept — e.g. an `is_public`/`shared_token` column per resource, and have `findPublic*` require it (`where('shared_token', $token)` or `where('is_public', true)`), returning 404 otherwise. Add a migration + feature tests.

---

### 🔴 Critical — AI "materials" generation reads other users' resources (IDOR)
**Areas:** `[backend]` · **Files:**
- `Backend/app/Services/MaterialExtractorService.php:42` (`extract()` → bare `Note::find`, `Paper::find`, `Flashcard::find`, `Quiz::find`, `Presentation::find`)
- `Backend/app/Http/Requests/StudyPlanRequest.php:34`, `Backend/app/Http/Requests/SprintRequest.php:23`
- `Backend/app/Services/GenerateFromContentService.php:24`

**Description:** `material_ids` on study plans, sprints and `/ai/generate/*` are validated only for shape (`type` + `id`), never for ownership. `MaterialExtractorService` resolves each ID with an unscoped `find()`. A user can submit **another user's note/paper/quiz/flashcard/presentation ID** and that private content is pulled into the AI prompt and emitted into their generated study plan, flashcards, quiz, etc.

**Fix:** Scope every extraction by the current user (`where('user_id', $user->id)`), and/or validate ownership while enqueueing (study plan / sprint jobs need the owner baked in and re-checked in the worker).

---

### 🟠 High — Public support chatbot: cost abuse + user-controlled system prompt (prompt injection)
**Areas:** `[backend]` · **Files:** `Backend/app/Http/Controllers/SupportChatbotController.php:21-72`, route `Backend/routes/public.php:10`

**Description:** `POST /api/v1/public/support/chatbot` is unauthenticated, uses the **platform's** Gemini key, and is gated only by `throttle:20,1`. The request accepts an attacker-controlled `system` field (up to 8000 chars) passed straight into Gemini's `systemInstruction`, and a free-form `history`. Anyone can override the assistant's guardrails and burn platform quota — a prompt-injection + cost-abuse vector.

**Fix:** Remove the `system` field from the request (server-defined system prompt only); tighten and cap history/parts; add per-IP throttling with backoff and a max message length.

---

### 🟠 High — Real-looking API key committed in `.env.example` (public repo)
**Areas:** `[backend]` · **File:** `Backend/.env.example:74`

**Description:** A valid-format Pexels key (`Pexels key placeholder`… actually a full 56-char key) is checked into the repo, which is public on GitHub. If it's a real key it should be **revoked** immediately and the placeholder replaced with an empty `PEXELS_API_KEY=`. Note it's also **unused**: `ImageSearchController` reads `services.pixabay.key` (`PIXABAY_API_KEY`), not Pexels (`Backend/app/Http/Controllers/ImageSearchController.php:16`).

**Fix:** Rotate/remove the key; decide Pexels vs Pixabay and align config + `.env.example`.

---

### 🟡 Medium — `dangerouslySetInnerHTML` on rich/AI content without a sanitizer
**Areas:** `[frontend]` · **Files:** `src/components/generate/AutoDiagramTab.jsx:475`, `src/components/generate/Generate.jsx:517,589`, `src/components/flashcard/FlashcardCard.jsx:147`, `src/components/note/NotePageSidebar.jsx:55`, `src/components/note/NoteVersionSidebar.jsx:128`, `src/components/paper/PaperVersionSidebar.jsx:34`, `src/components/paper/DocumentImportModal.jsx:118`

**Description:** Eight `dangerouslySetInnerHTML` call sites. `markdownToHtml` (`src/utils/markdown.js`) escapes `<`, `>`, `&` first, so the markdown path is reasonably safe today — but that's incidental, not a guarantee, and the mermaid/SVG path and note/paper preview paths are not sanitized. One future change to the markdown util (or a provider emitting SVG/HTML) becomes self-XSS / stored-XSS.

**Fix:** Add DOMPurify (or equivalent) and wrap every HTML injection point, especially AI-generated and imported-document HTML and the SVG node in `AutoDiagramTab`.

---

### 🟡 Medium — Paper version history is readable across users (IDOR)
**Areas:** `[backend]` · **File:** `Backend/app/Services/PaperService.php:97-110`

**Description:** `PaperController::versions` → `PaperService::versions` queries `paper_versions` filtered only by `paper_id`, with no ownership check (Note versions *are* guarded in `WorkSpaceService::versions:187`). A logged-in user can enumerate any other user's paper revision history if they know the paper ULID.

**Fix:** Verify paper ownership before serving versions (same pattern as notes).

---

### 🔵 Low — Verify cookie/CORS hardening for cookie-based JWT auth
**Areas:** `[both]` · **Files:** `Backend/app/Http/Middleware/InjectCookieToken.php`, `Backend/bootstrap/app.php:35`, `Frontend/src/api/apiClient.js:20`

**Description:** Auth relies on a `np_token` HttpOnly cookie plus `credentials: 'include'`. Confirm the cookie is set with `Secure` + `SameSite` (Lax or Strict) and that no state-changing endpoint is reachable without CSRF protection, since the cookie rides every same-site/cross-site request. There is currently no CSRF token anywhere in the API. Not confirmed vulnerable — **verify and document the decision**.

---

## 2. Bugs / broken behaviour

### 🟠 High — "Application Settings" page does nothing (all UI, no persistence)
**Areas:** `[frontend]` · **File:** `src/components/ApplicationSettings.jsx`

**Description:** Headline says "Customize your AI-powered creative space". `SettingsHeader`'s save button just calls `console.log('Settings saved')` (line 6-8). The handwriting style cards, paper preferences, pen thickness, and every toggle (`SystemSyncSection`, dark-mode paper, auto-correction…) are local component state only — nothing is stored or applied, and the settings are not wired into the actual Note/Paper editor. It's a visual mockup presented as a real page.

**Fix:** Decide the actual settings surface (persist per-user server-side or per-account), wire it to the note/paper renderer, or clearly mark the page as preview-only until then.

---

### 🟠 High — Password-reset "Resend email" button is dead
**Areas:** `[frontend]` · **File:** `src/components/CheckMail.jsx:16-19`

**Description:** On the "Check your email" screen after requesting a password reset, clicking "Didn't get it? Resend email" only `console.log`s. Users who didn't receive the link have no way to resend from that screen.

**Fix:** Wire it to the existing backend `POST /api/v1/auth/resend-verification`/reset flow (dedupe with the `forgot-password` resend) + loading/error state.

---

### 🟡 Medium — Quiz "best score" lives only in the browser
**Areas:** `[frontend]` · **Files:** `src/components/quizzes/QuizPlay.jsx:200`, `src/components/quizzes/Quizzes.jsx:17`

**Description:** Best percentage is stored in `localStorage` keyed by quiz id — it is lost on a new device/session wipe and isn't attributable server-side. Inconsistent with the rest of the product being server-backed.

**Fix:** Add a server-side `scores`/`attempts` table + API, and surface it in the quiz list page.

---

### 🔵 Low — `GET` endpoints return HTTP `201 Created`
**Areas:** `[backend]` · **File:** `Backend/app/Http/Controllers/WorkSpaceController.php:29`

**Description:** `GET /api/v1/workspace` (feed) returns status 201 on a read. Wrong semantics; breaks generic API clients/caches.

**Fix:** Return 200.

---

### 🔵 Low — Hardcoded production API fallback in the frontend
**Areas:** `[frontend]` · **Files:** `src/api/apiClient.js:7`, `src/api/generateService.js:1`, `src/utils/aiRuntime.js:54`, `src/lib/echo.js:6`

**Description:** Every API module falls back to `https://notepaperai-api.synchrome.co/api/v1` when `VITE_API_URL` is unset. A dev who runs `npm run dev` without a local `.env` **silently talks to production**. There is no `Frontend/.env.example` at all.

**Fix:** Commit a `Frontend/.env.example` pointing at `http://localhost:8000/api/v1` (matching the backend) and make dev builds fail loudly rather than defaulting to prod.

---

## 3. Incomplete / half-built features

### 🟠 High — No real public-sharing feature (routes exist, release gate missing)
**Areas:** `[both]` · **Files:** routes in `Backend/routes/public.php`, learners' pages `Frontend/src/pages/PublicNotePage.jsx`, `PublicPaperPage.jsx`, `PublicQuizPage.jsx`, `PublicFlashcardPage.jsx`

**Description:** The share story is the flip side of the critical issue above: there is no UI to *make something public* (no toggle/button), no revoke, no list of shared items, and nothing that tells the backend the item was deliberately shared. Fixing the security issue should land together with a real "Share" action → generates a link, sets the flag, allows un-sharing.

---

### 🟠 High — AI quiz generation from topics is "coming soon"
**Areas:** `[frontend]` · **File:** `src/pages/QuizCreatePage.jsx:246`

**Description:** The quiz builder advertises "AI quiz generation from topics" but shows a *coming soon* placeholder. Either ship it (the backend agents already support topic-based generation for flashcards/presentations) or remove the option to avoid a dead end in the UI.

---

### 🟡 Medium — `/ai/images/search` endpoint has no frontend consumer
**Areas:** `[backend]` · **Files:** `Backend/routes/ai.php:53`, `Backend/app/Http/Controllers/ImageSearchController.php`

**Description:** The server-side image search endpoint exists (Pixabay), but no search results or greps in `Frontend/` reference it. Either build the picker UI (e.g., inside Paper/Note image insert or presentation builder) or delete the endpoint.

---

### 🟡 Medium — Study plan / sprint generations can't be retried or cancelled
**Areas:** `[both]` · **Files:** `Backend/app/Jobs/GenerateStudyPlanJob.php`, `GenerateSprintJob.php`

**Description:** On failure the model is permanently marked `Failed` (with a notification) and there is no "Try again" or "Cancel" action in the UI, even though the create flow already exists. Users with a failed plan have to delete and recreate.

**Fix:** Add a `retry` (re-dispatch job) and `cancel` endpoint + buttons on the AI-generating/progress screens; also add a backoff in the jobs (`tries` exists, no `backoff`).

---

### 🔵 Low — Echo instance leaks to global scope (debug leftover)
**Areas:** `[frontend]` · **File:** `src/lib/echo.js:44`

**Description:** `window.echo = echo; // 👈 add this temporarily` ships to production. Remove it, and guard the `new Echo({...})` construction for missing reverb env vars so the module can't throw at import time.

---

## 4. Testing & CI

### 🟠 High — Backend test suite is tiny; CI coverage gate likely fails
**Areas:** `[backend]` · **Files:** `Backend/tests/**` (12 files), `.github/workflows/ci-cd-notepaperai.yml`

**Description:** Only 12 test files exist for a 40-table, 26-controller, 33-agent/service app. The CI job runs `php artisan test --coverage --min=25` (with Xdebug); a **25% minimum coverage gate on this suite will almost certainly fail the first pipeline run**. Either the threshold needs tuning *and* a plan to grow coverage.

**Fix (in order):** (1) Run CI once and calibrate the floor or remove `--min` temporarily; (2) add feature tests for the highest-risk flows — auth/JWT, 2FA, note/paper CRUD + versions, the public-sharing endpoints (regression for §1), quiz play, tickets — and the AI material extraction ownership check (regression for §1).

---

### 🟠 High — No frontend tests at all
**Areas:** `[frontend]`

**Description:** `package.json` has no test script, no runner, no component test setup. The app is JS logic-heavy (auth context, AI-key cache, draft synchronisation hooks, SSE stream parsing) with zero coverage.

**Fix:** Add Vitest + Testing Library; test `useAIKeys` storage/cache rules, `useNoteSync`/`usePaperSync` drafts, `markdown.js`, `aiRuntime.js` stream parsing, and a couple of route/hydration guards.

---

### 🔵 Low — No static analysis for the backend
**Areas:** `[backend]`

**Description:** Pint is present but no PHPStan/Larastan (or Rector) is wired for CI. Several services rely on implied types (e.g., `MaterialExtractorService` return shapes) that static analysis would catch.

**Fix:** Add Larastan at level 5-6 and a CI step with `--no-progress`.

---

## 5. Tech debt / maintainability

### 🟠 High — Single monolithic frontend bundle (no route-level code splitting)
**Areas:** `[frontend]` · **Files:** `src/utils/AppRoutes.jsx`, `vite.config.js`

**Description:** Every page is statically imported in one router file, so the first paint downloads pdfjs-dist, docx, pptxgenjs, jspdf, mermaid, mammoth, qrcode and all UI. The production build already warns about chunks > 500 kB.

**Fix:** Convert page imports to `React.lazy(() => import(...))` + `<Suspense>`, and/or add `manualChunks` for the heavy export/generation libs. Big UX win on the marketing → app transition.

---

### 🟡 Medium — Dead frontend AI SDK dependencies
**Areas:** `[frontend]` · **Files:** `Frontend/package.json` (`@ai-sdk/anthropic`, `@ai-sdk/google`, `@ai-sdk/openai`, `ai`)

**Description:** The AI-SDK packages are listed but **never imported anywhere** in `src/` (grep-verified) — leftovers from a client-side AI approach that was replaced by the server proxy. They inflate installs and confuse contributors about the architecture.

**Fix:** Remove them; keep a comment in `package.json` or a doc note that all provider calls go through `Backend/app/Http/Controllers/AiProxyController.php` (BYOK, decrypted server-side).

---

### 🟡 Medium — Two parallel auth styles (header token vs cookie injection)
**Areas:** `[backend]` · **Files:** `Backend/bootstrap/app.php:28-31`, `Backend/app/Http/Middleware/InjectCookieToken.php`

**Description:** User/workspace/AI routes get the JWT via the `np_token` cookie (injected into the Authorization header), while admin routes rely on the token being sent directly. This dual path is a common source of confusion and subtle CSRF/header bugs.

**Fix:** Document the model clearly (cookie = browser clients, header = admins/integrations) or collapse to one; add tests asserting both paths work.

---

### 🔵 Low — `console.log` leftovers
**Areas:** `[frontend]` · **Files:** `src/components/CheckMail.jsx:17`, `src/components/ApplicationSettings.jsx:7`

**Description:** Debug logs shipped in user-facing handlers (both also point at the dead flows in §2).

---

### 🔵 Low — Shell typo on the simplify success message
**Areas:** `[backend]` · **File:** `Backend/app/Http/Controllers/GenerateFromContentController.php:247`

**Description:** `'Simplification  queued'` (double space) — cosmetic but it's user-facing text.

---

### 🔵 Low — Review Mailable ↔ Notification overlap
**Areas:** `[backend]` · **Files:** `Backend/app/Mail/**` (23 classes) vs `Backend/app/Notifications/**` (16 classes)

**Description:** Several events appear to be mailable twice (e.g., `WelcomeMail`/`ActivatedMail` vs `AccountVerified` notification). Not confirmed duplicates — worth an audit so users don't get double emails for one event.

---

### 🔵 Low — `WorkSpaceController::folder/updateFolder` rely on global scope instead of policies
**Areas:** `[backend]` · **File:** `Backend/app/Http/Controllers/WorkSpaceController.php:59-83`

**Description:** Folder reads/updates use `$request->id` + the `BelongsToUser` scope rather than route-model binding + `$this->authorize()` like the rest of the resource controllers. Works today, but it's inconsistent and fragile if the scope ever changes.

**Fix:** Use implicit binding `Folder $folder` + `FolderPolicy::update/delete`.

---

## 6. Configuration / deployment gaps

**Areas:** `[backend]` · **Files:** `Backend/.env.example`, `Backend/config/services.php`, `Backend/config/mail.php`

- `.env.example` is missing keys the code actually reads: `PIXABAY_API_KEY`, `DEEPSEEK_API_KEY`/`GEMINI_API_KEY`/`OPENAI_API_KEY`/`ANTHROPIC_API_KEY` (only needed if the platform wants fallback keys), `RESEND_API_KEY` (mail), `REVERB_*` broadcast vars, and a production `FRONTEND_ORIGINS`.
- With `MAIL_MAILER=log` and no `RESEND_API_KEY`, production mail silently no-ops unless ops adds the var — add it to the example and to the deploy checklist.
- `SuspensionMail` and `RequestAccountDeletionMail` etc. exist but their env inputs aren't documented.

**Fix:** Rebuild `.env.example` to mirror what the code actually consumes, with empty values; add the real vars to the handoff guide.

---

## 7. Suggested features (work backlog / roadmap)

Ordered by product value vs. effort. The first two double as fixes for issues above.

1. **Explicit public sharing** — `[both]` · opt-in `is_public`/shared-token + "Share" UI + revoke + shared-items list. Unlocks the `/note/:id`, `/paper/:id`, `/quiz/:id`, `/flashcards/:id` routes safely (fixes §1.1). *Good first backend slice:* the migration + findPublic gate.
2. **Study/sprint generation retry + cancel** — `[backend]` + `[frontend]` (fixes §3.4).
3. **Server-side quiz scores & study streaks** — `[backend]` + `[frontend]` — gives the product a real "progress" surface (fixes the localStorage-only score).
4. **Flashcard review scheduler (SRS/Leitner)** — `[backend]` + `[frontend]` — flashcards today are static decks; the marketing promises "study with flashcards" but nothing schedules reviews. Big product win.
5. **AI topic-based quiz generation** — `[frontend]` (backend agents already exist) — finishes the "coming soon" in the quiz builder.
6. **Image search picker** — `[frontend]` — wire the existing `/ai/images/search` endpoint into the note/paper/presentation editors.
7. **Bulk actions in the library** (multi-select delete/move/export) — `[frontend]` + small `[backend]` batch endpoints.
8. **Notification preferences** (which channel per event) — `[backend]` + `[frontend]`.
9. **Real dark mode** — `[frontend]` — the settings stub promises it; implement a proper theme (CSS variables/tailwind `dark` mode) and wire the toggle.
10. **A "handwriting input" authoring path** — `[both]` — the brand promise is "your own handwriting"; today input is typed text + speech dictation. A pen/canvas-to-text input (or handwriting-font rendering of typed text, already partially present) would connect the landing-page story to the actual product.
11. **Server-side rate limits & prompt budgets on AI endpoints** — `[backend]` — throttle `/ai/proxy/*` and `/ai/generate/*` per user; add max-length caps to prompts/streaming to prevent abuse and runaway SSE sockets.
12. **i18n** — `[frontend]` — the whole UI is hard-coded English strings; first, extract strings, later add locales.

---

## 8. Quick local setup (for contributors)

```
# Backend
cd Backend
composer install
cp .env.example .env   # set DB_*, mail, and frontend origins
php artisan key:generate
php artisan migrate --seed
php artisan serve
php artisan queue:work --queue=default,ai
php artisan reverb:start   # realtime progress events

# Frontend
cd ../Frontend
cp .env.example .env   # (to be created — see §6)
npm install
npm run dev
```

Notes:
- The app is **bring-your-own-key**: users add Gemini/OpenAI/Claude/DeepSeek keys in Settings; provider calls are proxied server-side. You can demo generation with a personal free-tier Gemini key.
- Local `Http::globalOptions(['verify' => false])` is deliberately set for Windows dev only (`Backend/app/Providers/AppServiceProvider.php:66`).
- CI runs commitlint → backend tests (coverage ≥25%) → frontend lint+build → deploy on `main`.

---

*Generated from a full codebase review — every file:line reference above was verified against the repo at the time of writing. Re-verify line numbers after refactors.*