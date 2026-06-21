# Worklog

## admin-pages-batch — 2025

**Agent:** general-purpose
**Task:** Build 4 admin panel pages (services, testimonials, contact, settings) for the Maryam photography site.

### Context
The admin panel already had: layout + sidebar (with all nav links pre-wired), login, dashboard, hero, about, and projects pages. Reusable admin components live in `src/components/admin/Fields.tsx` (`Field`, `TextAreaField`, `ToggleField`, `SaveButton`, `SectionCard`, `Toast`). API routes for services, testimonials, and settings already existed.

### Files Created

1. **`src/app/admin/services/page.tsx`** — Full CRUD for services.
   - Grid of cards with icon, title, price, duration, featured badge, published status.
   - Full-screen modal editor (similar to projects page but without image upload).
   - Features editor: textarea where each line is a feature — converted to/from JSON string array on load/save (`featuresToText` / `textToFeaturesJson` helpers).
   - 4-button icon selector (Heart, Camera, Building2, Sparkles) rendered via lucide-react.
   - accentFrom color picker as text input with live swatch preview.
   - featured toggle, published toggle, order number.
   - Delete via `confirm()` + Toast notifications.

2. **`src/app/admin/testimonials/page.tsx`** — Full CRUD for testimonials.
   - List (not grid) of cards with avatar circle, name, role, star rating, quote preview, status badge.
   - Full-screen modal editor.
   - Clickable 5-star rating selector component (`Stars` with optional `onClick`).
   - Avatar input limited to 2 characters (`slice(0, 2)`).
   - published toggle + order number.
   - Delete via `confirm()` + Toast notifications.

3. **`src/app/admin/contact/page.tsx`** — Form-based settings page (hero page pattern).
   - SectionCard "معلومات التواصل": contactTitleAr, contactSubtitleEn, contactEmail (type=email), contactPhone, contactAddress, contactInstagram, contactWhatsapp.
   - SectionCard "الفوتر": footerDesc (textarea), footerCopyright.
   - SaveButton + Toast on save.
   - Uses `{ ...emptySettings, ...data }` merge to safely handle missing fields.

4. **`src/app/admin/settings/page.tsx`** — Form-based site settings page.
   - SectionCard "عناوين الأقسام": 6 inputs for portfolioTitleAr/En, servicesTitleAr/En, testimonialsTitleAr/En.
   - SectionCard "الألوان": primaryColor + backgroundColor text inputs with live swatch previews (custom `ColorField` component). HTML color input isn't used because it can't accept oklch directly.
   - SaveButton + Toast on save.

### Patterns Followed (consistency with existing pages)
- `"use client"` directive at top.
- `motion.div` with `initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}` for page headers.
- Centered spinner for loading state.
- Arabic UI text, gold accent color (primary), `font-amiri` headings / `font-inter` labels.
- RTL inherited from admin layout.
- Reusable components from `@/components/admin/Fields` reused where appropriate.
- For CRUD pages: full-screen overlay editor (`fixed inset-0 z-50 bg-background/95 backdrop-blur-xl overflow-y-auto`), `confirm()` for delete, Toast for feedback, sticky bottom save bar.
- For settings pages: SectionCard groupings, single SaveButton at bottom.

### Verification
- `npx tsc --noEmit` reports 0 errors in any of the new files (4 unrelated errors in `examples/` and `skills/` directories only).
- Sidebar nav (in `src/app/admin/layout.tsx`) already includes links to `/admin/services`, `/admin/testimonials`, `/admin/contact`, `/admin/settings` — so navigation works out of the box.
- API routes verified: `GET/POST /api/services`, `GET/POST /api/testimonials`, `GET/PUT /api/settings`, plus `[id]` PUT/DELETE for services and testimonials. All allowed fields confirmed against the route handlers.

### Next Actions
- Manual smoke test in browser (login → navigate to each new page → create/edit/delete a record → confirm Toast appears and DB persists).
- Verify color oklch values saved from the settings page actually render on the public site (depends on how the public layout consumes `primaryColor` / `backgroundColor`).
- Optionally add image/avatar upload for testimonials in a future batch (currently uses initials only, which matches the spec).

---

## public-site-db-integration — 2025

**Agent:** general-purpose
**Task:** Replace hardcoded content in the 9 public-facing section components with data fetched from the existing API routes (`/api/settings`, `/api/projects`, `/api/services`, `/api/testimonials`, `/api/philosophy`).

### Approach
Every section component was already a client component (`"use client"`). For each one I added a `useEffect` fetch + `useState` data slot + a minimal centered spinner loading skeleton, then wired the JSX to read from the fetched data instead of the hardcoded constants. All Tailwind classes, framer-motion animations, and the dark cinematic gold theme were preserved exactly. Only the DATA SOURCE changed.

### Files Updated (all under `src/components/sections/`)

1. **`Navbar.tsx`** — Added a small fetch to `/api/settings` to read `siteNameAr` / `siteNameEn`. Nav items array left untouched (stable per spec). The two logo spans (desktop + mobile menu header) now render `settings?.siteNameAr ?? "مريم"` and `settings?.siteNameEn ?? "Maryam"`. The "احجز جلسة" CTA stays hardcoded (no matching setting field). Render happens immediately with fallbacks — no loading skeleton here so the navbar is always visible.

2. **`Hero.tsx`** — Fetches `/api/settings`, shows a centered spinner inside the full-screen section while loading. All hero text now bound to settings: `taglineEn`, `heroTitleAr`, `heroSubtitleEn`, `heroDescAr`, `heroCta1Ar`, `heroCta2Ar`, and the three stats (`heroStat1Num/Label`, `heroStat2Num/Label`, `heroStat3Num/Label`). Renamed the inner map variable from `s` to `stat` to avoid shadowing the settings `s`.

3. **`About.tsx`** — Uses `Promise.all` to fetch both `/api/settings` and `/api/philosophy` in parallel. Settings drive the section header (`aboutTitleAr`, `aboutSubtitleEn`), the h3 heading (`aboutHeadingAr`), the two paragraphs (`aboutPara1`, `aboutPara2`), the tag chips (`aboutTags` split by comma), and the signature (`aboutSignature`). Philosophy cards come from the API as an array; the `icon` string is mapped to a Lucide component via an `iconMap` (Camera, Globe2, Award, Heart). The section header title is split on first space to preserve the gold/foreground dual-color styling. If `philosophy.length === 0`, the philosophy grid is hidden.

4. **`Marquee.tsx`** — Fetches `/api/settings`, splits `marqueeWords` by comma into an array. Falls back to the original hardcoded word list until the fetch resolves (or if it fails). Returns `null` if the resolved array is empty. Animation, separator star SVG, and the Arabic-vs-English font detection regex all preserved.

5. **`Portfolio.tsx`** — The biggest change. Removed the hardcoded 9-project array. Added a fetch from `/api/projects` with a loading skeleton and an empty-state message ("لا توجد أعمال منشورة بعد."). The `Project` type now matches the API shape: `palette1`/`palette2`/`palette3` (separate strings), `motif` (string), `span` ("normal"|"wide"|"tall"), `imageData` (base64 data URL), `description`, `featured`, etc. A small `paletteOf(project)` helper rebuilds the `[c1,c2,c3]` array for the existing `MotifSvg`. The `MotifSvg` component is kept fully intact (just retyped its `motif` prop to `string` and cast internally). For each card: if `imageData` is non-empty, render `<img src={imageData} className="object-cover" />` instead of `<MotifSvg>`; the Lightbox modal follows the same rule. The lightbox description now prefers `selected.description` and falls back to a generated sentence using the category label. Category filter buttons and span-aware grid layout logic unchanged.

6. **`Services.tsx`** — Removed the hardcoded 4-service array. Fetches `/api/services`. The `Service` type now matches the API: `features` is a JSON string (parsed via `JSON.parse` inside a try/catch with array-type guard), `icon` is a string mapped through `iconMap` (Heart, Camera, Building2, Sparkles), `accentFrom` is a raw oklch color string used via inline `style={{ background: linear-gradient(...) }}` (since Tailwind can't compose dynamic color classes). Empty state shows "لا توجد خدمات منشورة بعد." Optional `price` and `duration` only render when non-empty.

7. **`Testimonials.tsx`** — Removed the hardcoded 4-testimonial array. Fetches `/api/testimonials`. Added a guard `useEffect` that clamps `idx` back to 0 if the testimonials array shrinks below the current index (defensive — happens if records get deleted in another tab). If the API returns no testimonials, the whole section returns `null` (graceful empty state per spec). Avatar rendering falls back to first-letters of `nameAr` when the `avatar` field is empty. Star count is clamped to `Math.min(rating, 5)`. The hardcoded stats bar at the bottom was kept as-is (spec didn't ask for it to be dynamic).

8. **`Contact.tsx`** — Fetches `/api/settings`. Section header now uses `contactTitleAr` (split-on-first-space for the gold/foreground split, same pattern as About/Portfolio) and `contactSubtitleEn`. The three contact info cards (Email/Phone/Studio) are built from `s.contactEmail`, `s.contactPhone`, `s.contactAddress`. The `tel:` href strips non-digits (except leading `+`). The social icons row (Instagram, WhatsApp, Email) now wires to real hrefs derived from `contactInstagram` (handles `@user`, raw username, or full URL), `contactWhatsapp` (handles phone number or full URL via `wa.me`), and `contactEmail`. External links get `target="_blank" rel="noopener noreferrer"`. The form state, submission flow, and all input styling are untouched. The `services` array (used for the form's service-type selector) is kept as a constant — it's a UI affordance, not DB content.

9. **`Footer.tsx`** — Fetches `/api/settings`. Brand block name, big decorative brand mark, and copyright text all bound to `siteNameAr` / `footerCopyright`. The footer description paragraph reads `footerDesc`. Social icons row uses the same `instagramHref` / `whatsappHref` / `emailHref` derivation logic as Contact. The `footerLinks` array (Services/Explore/Connect columns) is left as a constant — spec only asked for `siteNameAr`, `footerDesc`, `footerCopyright` to be dynamic.

### Patterns Followed
- `"use client"` directive preserved on all 9 files.
- Standard data-fetch pattern: `useState<T | null>(null)` + `useState(true)` for loading + `useEffect` with `.then(r => r.json()).then(...).catch(() => {}).finally(() => setLoading(false))`.
- Loading skeleton: a centered gold spinner (`w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin`) inside the section's shell with matching `id`/`bg-*` so scroll anchors and the page background don't jump.
- Empty state: graceful `return null` (Testimonials) or inline message (Portfolio/Services) when the API returns an empty array.
- All framer-motion `motion.div`/`AnimatePresence` blocks, `whileInView` animations, and Tailwind class strings left byte-for-byte identical. Only the variable references inside JSX changed.
- Defensive fallbacks: `?? "مريم"` / `?? "Maryam"` for Navbar so it renders before fetch completes; `Array.isArray(d) ? d : []` for all list endpoints to guard against a non-array response; try/catch around `JSON.parse(service.features)`.

### Verification
- `npx tsc --noEmit` reports **0 errors** in any of the 9 modified section files. The only 4 remaining errors are the pre-existing ones in `examples/websocket/*` and `skills/*` (unrelated, documented in the previous worklog entry).
- Filtered specifically: `npx tsc --noEmit 2>&1 | rg "components/sections"` returns no output (clean).

### Notes / Decisions
- The `aboutTitleAr` and `contactTitleAr` strings are split on the FIRST space to preserve the existing "first word gold-gradient + rest foreground" dual-color styling. This works for the default values ("قصة خلف العدسة", "لنبدأ حكايتك") but admins editing those fields should be aware the first word gets the gold treatment.
- The `aboutHeadingAr` previously had a mid-sentence gold span on "عدسة العالم". Since that's hard to generalize, the heading now renders entirely in foreground. The visual loss is minimal (one less gold accent in that h3).
- For Portfolio cards, the existing `MotifSvg` is kept as the fallback when `imageData` is empty — so projects without uploaded images still get the gorgeous generative SVG visuals (bride/face/tower/desert/wave/city/tree) colored by their palette.
- For Services, the original hardcoded `accent` was a full Tailwind class string like `"from-[oklch(0.78_0.13_75_/_0.15)] to-transparent"`. The API only stores `accentFrom` as a raw oklch color, so the accent gradient now uses inline `style` with `linear-gradient(to bottom, accentFrom, transparent)`. Visually equivalent.

### Next Actions
- Smoke test in browser: visit `/`, confirm each section loads from DB (kill the dev server's cache first if needed), check Network tab that all 5 endpoints respond 200.
- In the admin panel, edit a few fields (e.g. hero title, a project's image, a service's features) and reload the public site to confirm changes propagate.
- Optionally wire the `footerLinks` Connect column (email/phone/address) to settings too — left hardcoded for now since the spec didn't request it.
- Optionally make the Testimonials stats bar (`+250 عميل سعيد` etc.) dynamic from settings — currently still hardcoded.

---

## admin-enhancements-batch — 2025

**Agent:** general-purpose
**Task:** Add enhanced admin features: gallery images per project, activity log, change password, data export/import/reset, About portrait upload, Projects search+filter, account & data admin pages, dashboard activity feed, plus Vercel Blob cleanup on image replacement/delete.

### Context
The Prisma schema already had new models (`ProjectImage`, `ActivityLog`) and new fields on `SiteSettings` (`aboutImageData`, `heroImageData`) and a `Project.images` relation. No Prisma client regeneration had been run, so `db.projectImage` / `db.activityLog` were undefined — first task was to run `npx prisma generate`.

### Files Created

1. **`src/lib/activity.ts`** — Tiny helper that writes a row to `ActivityLog`. All failures are swallowed (`console.error` only) so activity logging never breaks the calling request. Signature: `logActivity(action, entity, entityId="", details="", username="maryam")`.

2. **`src/app/api/activity/route.ts`** — `GET` admin-only, returns last 20 activity logs newest-first.

3. **`src/app/api/projects/[id]/images/route.ts`** — `GET` public (list gallery for a project, ordered by `order` then `id`); `POST` admin-only, creates a `ProjectImage` row from `{ url, caption?, order? }`. Verifies the parent project exists before creating. Auto-increments `order` based on max existing. Logs `create/projectImage`.

4. **`src/app/api/projects/[id]/images/[imageId]/route.ts`** — `PATCH` admin-only (update `caption` / `order`); `DELETE` admin-only (deletes DB row + Vercel Blob if URL contains `vercel-storage.com`). Logs `delete/projectImage`.

5. **`src/app/api/auth/change-password/route.ts`** — `POST` admin-only. Verifies `currentPassword` against DB hash (or the default hash fallback `maryam2024` if no DB row). Validates `newPassword.length >= 6`. Hashes new password with `bcrypt.hash(newPassword, 10)`. Tries `db.adminUser.update` first; if no row exists, falls back to `db.adminUser.upsert` to create one. Logs `update/admin`.

6. **`src/app/api/data/export/route.ts`** — `GET` admin-only. Runs 5 parallel `Promise.all` queries (`siteSettings`, `project.findMany({ include: images })`, services, testimonials, philosophy). Returns `{ exportedAt, version, settings, projects, services, testimonials, philosophy }`.

7. **`src/app/api/data/import/route.ts`** — `POST` admin-only. Accepts the export JSON shape. Whitelists settings fields (same list as the settings PUT, including the new `aboutImageData` / `heroImageData`). For each collection, does a delete-all then re-creates rows (in a `$transaction` for `projectImage` + `project` to respect the FK). Gallery images are nested inside each project and re-created against the newly-generated project id. Logs `import/data` with a count summary.

8. **`src/app/api/data/reset/route.ts`** — `POST` admin-only (not in original spec but referenced by the data admin page's "Reset to Defaults" button). Wipes all collections + settings and re-seeds from `src/lib/defaultData.ts`. Logs `reset/data`.

9. **`src/app/admin/account/page.tsx`** — Three password fields (current/new/confirm), all type=password. Client-side validation: all required, new===confirm, new length >= 6. POSTs to `/api/auth/change-password`. Uses `Field`, `SaveButton`, `SectionCard`, `Toast`. Includes a "Security tips" info card with `Shield`/`KeyRound` icons.

10. **`src/app/admin/data/page.tsx`** — Three sections: Export (button → fetches `/api/data/export`, builds a `Blob`, triggers a browser download named `maryam-cms-backup-YYYY-MM-DD.json`); Import (file input + warning panel + double-confirm via `confirm()` before POSTing to `/api/data/import`, shows resulting counts in Toast); Danger Zone (red reset button with TWO `confirm()` dialogs before POSTing to `/api/data/reset`). Plus an info card explaining backup strategy.

### Files Modified

11. **`src/app/api/settings/route.ts`** — Added `aboutImageData`, `heroImageData` to `allowedFields`. Imported `logActivity` and call it after the upsert with `Object.keys(data).join(", ")` as the details string.

12. **`src/app/api/projects/route.ts`** — Imported `logActivity`. Logs `create/project` after `db.project.create` with the new project's title in details.

13. **`src/app/api/projects/[id]/route.ts`** — Major rewrite:
    - Imported `del` from `@vercel/blob` and `logActivity`.
    - Added `deleteBlobIfVercel(url)` helper that only deletes if URL contains `vercel-storage.com`, wrapped in try/catch.
    - PUT: when `imageData` is in the body and differs from the existing value, fetches the existing project first, then deletes the old blob.
    - DELETE: fetches project + gallery images BEFORE deleting (so we have the URLs), deletes the project (cascade removes `ProjectImage` rows), then deletes the main image blob AND each gallery image blob. Logs `update/project` and `delete/project` respectively.

14. **`src/app/api/services/route.ts`** + **`[id]/route.ts`** — Added `logActivity` calls on POST (`create/service`), PUT (`update/service`), DELETE (`delete/service`). DELETE fetches the title first so it can be in the log details.

15. **`src/app/api/testimonials/route.ts`** + **`[id]/route.ts`** — Same pattern as services, entities are `testimonial`.

16. **`src/app/api/philosophy/route.ts`** + **`[id]/route.ts`** — Same pattern, entities are `philosophy`.

17. **`src/app/api/auth/login/route.ts`** — Minor pre-existing TS fix: widened the local `admin` type annotation to include `password: string` (was previously missing, causing a TS2339 on `admin.password`). Added `password: DEFAULT_PASSWORD_HASH` to the default-admin fallback object too.

18. **`src/app/admin/about/page.tsx`** — Added a new top-of-page SectionCard "صورة البورتريه" above the bio sections. Has three states: existing portrait (shows `aspect-[3/4]` preview with a hover-to-reveal red trash button that calls `/api/delete-image` and clears `aboutImageData`); uploading (spinner); empty (dashed upload dropzone). Upload flow: `FormData` → `/api/upload` → `data.url` → immediately PUT to `/api/settings` with `{ aboutImageData }`. Extended the local `Settings` type with `aboutImageData: string`. Added `Upload` icon to imports; added `formatFileSize` import from `@/lib/imageCompress` for the upload toast.

19. **`src/app/admin/projects/page.tsx`** — Three additions:
    - **Search bar**: text input at the top filters by `titleAr`, `titleEn`, `location` (case-insensitive). Includes a `Search` icon on the right (RTL layout).
    - **Category filter dropdown**: `<select>` with options `all` + the 4 categories. Combined with search via `filteredProjects`.
    - **Gallery section in editor modal**: only shown when `editing.id !== 0` (existing project). When opening the editor for an existing project, fetches `/api/projects/{id}/images` into a `gallery` state. "Add gallery image" button is a `<label>` wrapping a hidden file input — uploads via `/api/upload`, then POSTs `{ url, caption: "" }` to `/api/projects/{id}/images`, appends to gallery state. Each gallery thumbnail is a square image with a hover-trash (DELETE) and a caption text input that PATCHes on blur. For new (unsaved) projects, shows an info note that gallery is available after first save. Confirms project deletion with a stronger message warning about gallery image cleanup.

20. **`src/app/admin/layout.tsx`** — Added `Shield` and `Database` to the lucide imports. Appended two new nav items to `navItems`: `{ href: "/admin/account", labelAr: "الحساب والأمان", icon: Shield }` after settings, and `{ href: "/admin/data", labelAr: "البيانات والنسخ", icon: Database }` after account.

21. **`src/app/admin/page.tsx`** — Replaced the bottom "Tip" card with a "Recent Activity" section. Fetches `/api/activity` on mount (alongside the existing stats fetches), takes the first 8 entries. Renders each as a list item with:
    - An icon picked from the action string via `iconForAction` (`create`→`Plus`, `update`→`Edit3`, `delete`→`Trash2`, `login`→`LogIn`, `import`/`reset`→`Activity`, default→`Settings`).
    - A friendly Arabic entity label via `labelForEntity` (project→"عمل", projectImage→"صورة معرض", service→"خدمة", testimonial→"رأي عميل", philosophy→"بطاقة فلسفة", settings→"الإعدادات", admin→"الحساب", data→"البيانات").
    - A relative time-ago string in Arabic via a small `timeAgo` helper ("قبل لحظات", "قبل X دقيقة", "قبل X ساعة", "قبل X يوم", "قبل X شهر", "قبل X سنة").
    - `@username` displayed underneath.
    Empty state shows a "لا يوجد نشاط مسجّل بعد" message; loading state shows the gold spinner.

### Patterns Followed
- All new admin API routes check `getSession()` and return 401 if missing.
- All DB operations wrapped in try/catch with `console.error` + JSON error response.
- `logActivity` called at the END of each successful mutation (after the DB write completes), so logs only record what actually happened.
- `deleteBlobIfVercel` pattern: only deletes if URL contains `vercel-storage.com`; wraps `del(url)` in try/catch so a Blob API failure doesn't fail the user request.
- Gallery image upload uses the existing `/api/upload` endpoint (FormData + Vercel Blob) for the file, then the new `/api/projects/[id]/images` POST to persist the URL — exactly the pattern the spec requested.
- New admin pages follow the established pattern: `"use client"`, `motion.div` header with `initial/animate`, RTL inherited, `SectionCard` + `Toast` from `@/components/admin/Fields`, gold accent color.
- Reset button uses TWO `confirm()` calls for added friction (this is a destructive, irreversible action).
- The data export downloads as `maryam-cms-backup-YYYY-MM-DD.json` via a `Blob` + anchor `<a download>` — no server-side file writing needed.

### Verification
- `npx prisma generate` run first to pick up the new models (`ProjectImage`, `ActivityLog`) and the `Project.images` relation. Without this, every reference to `db.projectImage` / `db.activityLog` failed TS2339.
- `npx tsc --noEmit` reports **0 errors** in any new/modified file. The only 5 remaining errors are all pre-existing and unrelated:
  - `examples/websocket/frontend.tsx` and `examples/websocket/server.ts` (missing `socket.io` deps)
  - `next.config.ts` (`eslint` not in `NextConfig` type — Next 16 change)
  - `skills/image-edit/scripts/image-edit.ts` and `skills/stock-analysis-skill/src/analyzer.ts` (SDK type mismatches)
- Also fixed a pre-existing TS error in `src/app/api/auth/login/route.ts` (the `admin` local type annotation was missing `password`).

### Notes / Decisions
- The reset endpoint (`/api/data/reset`) is NOT in the original spec's "Files to create" list, but task #10 references it ("POST to a reset endpoint"), so I created it for completeness. It re-uses `src/lib/defaultData.ts` as the source of truth for defaults.
- The `change-password` route handles three scenarios: (a) DB row exists → update hash in place; (b) DB available but no row exists → upsert to create one (using the session's username); (c) DB not available → returns 500 with a clear Arabic error. This means the FIRST password change after deploy will silently create the admin row in the DB if it didn't exist yet.
- The activity log records `username` from `session.username` (so if a future batch adds multi-admin support, logs will distinguish actors).
- For the dashboard activity feed, I imported `Activity as ActivityIcon` and `Settings as SettingsIcon` to avoid name collisions with the existing `Settings` import (lucide `Settings` icon vs the `Settings` type used elsewhere — though the dashboard doesn't actually use a Settings type, this is defensive).
- The About page portrait upload auto-saves the URL to settings immediately (so even if the user navigates away without clicking "Save changes", the portrait is persisted). This matches the spec wording "saves to `aboutImageData` in settings" and is more forgiving than requiring the user to also click the bottom Save button.
- The projects gallery section calls `e.currentTarget.value = ""` after each upload so the same file can be re-selected if needed.

### Next Actions
- Smoke test in browser:
  1. Login → confirm activity log entry appears on dashboard.
  2. Open `/admin/about` → upload portrait → confirm it appears in the About section of the public site.
  3. Open `/admin/projects` → use search and category filter → confirm filtering works.
  4. Edit an existing project → upload gallery images → reload → confirm they persist; delete one → confirm blob is gone (check Vercel Blob dashboard).
  5. Replace a project's main image → confirm old image is deleted from Blob (no orphaned blobs accumulating).
  6. Delete a project with gallery images → confirm main + gallery blobs are all gone.
  7. `/admin/account` → change password → logout → login with new password.
  8. `/admin/data` → export → keep the JSON → make a small content change → import the JSON → confirm content reverts to exported state.
  9. `/admin/data` → reset → confirm all content returns to defaults.
- Consider running `prisma db push` to apply the schema changes (new `ProjectImage` + `ActivityLog` tables, new `aboutImageData` / `heroImageData` columns on `SiteSettings`) to the production DB if not already applied. The build script in `package.json` already calls `prisma db push` so a fresh deploy will handle this.
- Optionally: surface the activity log on the `/admin/data` page too (e.g. show the last 5 imports/resets) — left for a future batch.

