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


---
Task ID: blog-feature
Agent: general-purpose
Task: Create blog feature with full CRUD (API + public pages + admin page)

Work Log:
- Read worklog.md (3 prior batches) + reference files: api/projects/route.ts, api/projects/[id]/route.ts, admin/projects/page.tsx (skimmed structure), components/admin/Fields.tsx, components/admin/ConfirmDialog.tsx, lib/activity.ts, app/admin/layout.tsx, components/sections/Navbar.tsx, app/globals.css (theme), app/admin/page.tsx, app/page.tsx, app/layout.tsx, prisma/schema.prisma (verified BlogPost model at line 198), api/upload/route.ts.
- Ran `npx prisma generate` to regenerate the Prisma client — the BlogPost model existed in schema.prisma but the generated client didn't have `db.blogPost` yet. Verified by grepping node_modules/.prisma/client/index.d.ts.
- Created `/src/app/api/blog/route.ts`:
  - GET (public): `?all=1` (admin only via getSession, returns ALL), `?category=X` (filter), `?featured=1` (featured only), `?limit=N` (default 50). Order by `order asc, createdAt desc`. Falls back to `[]` on DB error (no defaults file for blog).
  - POST (admin only): Validates titleAr + titleEn. Auto-generates slug from titleEn via `generateSlug()` (lowercase, dash-separated, strip non-alphanumeric). Auto-calculates readTime from contentAr via `calcReadTime()` (words / 200, min 1) if not provided. Ensures unique slug by appending `-2`, `-3`, etc. Logs `create/blogPost` with the titleAr in details.
- Created `/src/app/api/blog/[slug]/route.ts`:
  - GET (public): fetches by slug. `?all=1` allows admin to fetch unpublished (otherwise unpublished → 404).
  - PUT (admin): Updates post by slug. Whitelists all 15 fields. If slug is being changed, regenerates + ensures uniqueness (excluding current id). If coverImage is changing, deletes old blob via `deleteBlobIfVercel()`. Logs `update/blogPost`.
  - DELETE (admin): Fetches post first (to get coverImage URL + title for log), deletes the post, deletes the blob if Vercel Blob URL. Logs `delete/blogPost`.
- Created `/src/components/blog/BlogShareButtons.tsx` (client component) — WhatsApp, Twitter/X, copy-link buttons. Uses `navigator.clipboard` with a fallback to a hidden textarea + `document.execCommand('copy')`. Shows a green check for 2s after copy. URL constructed from `window.location.origin + /blog/[slug]`.
- Created `/src/app/blog/page.tsx` (public listing, server component, `dynamic = "force-dynamic"`):
  - Hero header with "مدوّنة مريم" / "Maryam's Journal" — gold gradient on "مدوّنة" word, `font-amiri` 5xl/7xl.
  - Category filter pills (all, general, tutorials, stories, gear, behind-the-scenes) with Arabic labels. Selected = filled gold; uses `?category=` query param via `<Link>`.
  - Featured posts section at top — only shows on "all" view, displays up to 3 featured posts in a 3-col grid.
  - All posts grid (sm:2 / lg:3 cols) — each card has coverImage (or gradient fallback with PenSquare icon), category badge (gold pill), title (`font-amiri`), excerpt (line-clamp-3), readTime pill, formatted date (Arabic locale via date-fns), and a hover-revealed "اقرأ المقال" arrow + decorative big number.
  - Loading: n/a (server component, data fetched at request time). Empty state: centered PenSquare icon + Arabic message.
  - Uses `lift-card` class for hover animation. Includes Navbar + Footer + CursorGlow. Uses `searchParams` (Promise in Next 16) to read `?category=`.
- Created `/src/app/blog/[slug]/page.tsx` (public detail, server component with SSG):
  - `generateStaticParams()`: fetches all published slugs (returns `[]` on error — falls back to on-demand rendering).
  - `generateMetadata()`: Returns title (`{titleAr} | مدوّنة مريم`), description (excerptAr or titleAr), authors, keywords (from tags), openGraph (article type, publishedTime, authors, tags, images[1200×630] from coverImage), twitter card (summary_large_image if coverImage).
  - Fetches post by slug; `notFound()` if missing or unpublished.
  - Full-width cover image (max-h-[60vh]) at top with gradient overlay; header overlaps the cover by `-mt-32` for cinematic effect (only when cover exists).
  - Title in `font-amiri` 4xl/6xl with gold gradient; English subtitle in Playfair italic; excerpt in a gold-bordered right-border blockquote style.
  - Author row (avatar circle + User icon + author name) + share buttons.
  - Markdown content rendered server-side via `react-markdown` with custom component mappings (Arabic-friendly: `font-amiri` for h1-h4, `list-disc`/`list-decimal` with `pr-6` for RTL, `blockquote` styled like Arabic quote with `border-r-4`, code blocks `dir="ltr"`, etc.).
  - Tags rendered as pills at the bottom with a `Tag` icon.
  - "العودة إلى كل المقالات" back link.
  - Related posts section: 3 posts from same category (excluding current), rendered as cards.
  - Navbar + Footer + CursorGlow included.
- Created `/src/app/admin/blog/page.tsx` (admin CRUD, `"use client"`):
  - Grid of post cards (sm:2 / lg:3 cols) showing cover thumbnail (or gradient + PenSquare icon), featured/published badges, category badge, title, slug preview (`/slug`), readTime + date, and 3 buttons: تعديل (edit), ExternalLink (view in new tab), Trash (delete).
  - Search bar filters by titleAr/titleEn/tags. Category filter dropdown.
  - "مقال جديد" button opens full-screen modal editor (same pattern as projects page).
  - Editor fields: coverImage upload (via `/api/upload`, with toast progress, delete via ConfirmDialog, blob cleanup via `/api/delete-image`), titleAr*, titleEn* (auto-syncs slug until user touches slug field — tracked via `slugTouched` state), slug (with `/blog/` prefix display), excerptAr, excerptEn, contentAr (large textarea, 14 rows, monospace, auto-calcs readTime on type), contentEn (optional, 8 rows), category select (with both Arabic + English label per option), author, tags (comma-separated), readTime (number, auto-calc but editable), order (number), featured toggle, published toggle (with Eye/EyeOff icons).
  - Save → POST `/api/blog` (new) or PUT `/api/blog/[slug]` (existing). Toast on success/error. Slug update on save is handled (PUT response replaces the old row).
  - Delete with ConfirmDialog (red, danger) — message includes the post title.
  - Cover image delete with separate ConfirmDialog — handles both cases (saved post → PUT to clear; unsaved new post → direct blob delete).
  - Sticky bottom save bar in editor (Cancel + Save buttons).
  - Toast notifications reused from `@/components/admin/Fields`.
- Updated `/src/app/admin/layout.tsx`: Added `PenSquare` to lucide imports. Inserted `{ href: "/admin/blog", labelAr: "المدونة", icon: PenSquare }` into `navItems` array right after the projects entry.
- Updated `/src/components/sections/Navbar.tsx`: Restructured navItems to `NavItem` type with optional `href?: string`. Added blog entry `{ id: "blog", labelAr: "المدوّنة", labelEn: "Blog", href: "/blog" }` between testimonials and contact. Rendering logic:
  - Desktop nav: renders `<Link href={item.href}>` for items with href, otherwise the existing `<button onClick={scrollTo(item.id)}>` for in-page sections. Active underline logic preserved.
  - Mobile menu: same Link/button split.
  - `isActive()` helper: for href items, true if `pathname === item.href` or `pathname.startsWith(item.href + "/")`. For id items, only true if `pathname === "/"` AND `activeSection === item.id` (so in-page sections don't appear active when on `/blog`).
  - Scroll-spy useEffect now filters out items with `href` (skips them — they're not in-page sections).
  - Logo: rendered as `<button>` with `scrollTo("home")` on `/`, and as `<Link href="/">` on other pages (so it always navigates home).
  - CTA "احجز جلسة": same pattern — `scrollTo("contact")` on `/`, `<Link href="/#contact">` elsewhere.
  - Imported `Link` from `next/link` and `usePathname` from `next/navigation`.
- Updated `/src/app/admin/page.tsx`: Added `case "blogPost": return "مقال";` to the `labelForEntity` function so the activity log shows "مقال" instead of raw "blogPost" entity name. (activity.ts itself needed no changes — it's generic and stores whatever strings are passed.)
- Verified: `npx tsc --noEmit` reports 0 errors in any new/modified `src/` file. The only 3 errors in the whole repo are the pre-existing ones (`examples/websocket/*`, `next.config.ts` eslint type — all documented in previous worklog entries).
- Verified: `npx next build` succeeds. Output shows:
  - `/admin/blog` (Static) ✓
  - `/api/blog` (Dynamic) ✓
  - `/api/blog/[slug]` (Dynamic) ✓
  - `/blog` (Static) ✓
  - `/blog/[slug]` (SSG — uses generateStaticParams) ✓
  - The `generateStaticParams (blog) error` log during build is expected — the sandbox has no DATABASE_URL, so the try/catch returns `[]` and pages are rendered on-demand instead. In production with a real DB, all published posts will be pre-rendered at build time.

Stage Summary:
- Full blog feature shipped end-to-end: 2 API routes, 2 public pages (listing + detail with SSG + SEO metadata), 1 admin CRUD page, 1 client share-buttons component, 3 file updates (admin layout, public Navbar, admin dashboard activity label).
- Files created:
  - `/src/app/api/blog/route.ts` (GET + POST)
  - `/src/app/api/blog/[slug]/route.ts` (GET + PUT + DELETE)
  - `/src/app/blog/page.tsx` (public listing)
  - `/src/app/blog/[slug]/page.tsx` (public detail with generateStaticParams + generateMetadata)
  - `/src/app/admin/blog/page.tsx` (admin CRUD)
  - `/src/components/blog/BlogShareButtons.tsx` (client share buttons)
- Files modified:
  - `/src/app/admin/layout.tsx` (added PenSquare import + blog nav item)
  - `/src/components/sections/Navbar.tsx` (restructured to support `href` for separate-page items; added blog link; conditional Link-vs-button rendering in desktop + mobile)
  - `/src/app/admin/page.tsx` (added `case "blogPost": return "مقال"` to labelForEntity)
- Patterns followed: `getSession()` 401 guard on admin routes, try/catch on every DB op, `logActivity()` after successful mutations, `deleteBlobIfVercel()` for Vercel Blob cleanup on image replace/delete, full-screen modal editor with sticky save bar (matching projects page), ConfirmDialog for all destructive actions, Toast for feedback, Arabic UI text throughout, gold + cinematic dark theme preserved (`bg-background`, `text-foreground`, `text-gold-gradient`, `font-amiri`, `font-display`, `font-inter`), `react-markdown` for public-side rendering with custom Arabic-friendly component mappings, `date-fns` with `ar` locale for dates, plain `<img>` (with `loading="lazy"` + alt) for cover images from Vercel Blob per spec.
- Next Actions: 
  1. Smoke test in browser: visit `/blog` → confirm empty state shows → login → `/admin/blog` → create a post with title + content + cover image → confirm toast → visit `/blog` again → confirm card appears → click card → confirm markdown renders + share buttons work → confirm related posts section shows after creating a 2nd post in same category.
  2. Test slug auto-generation: create a post with English title "My First Post" → confirm slug is `my-first-post` → create another with same title → confirm slug is `my-first-post-2` (uniqueness check).
  3. Test SEO: view-source on a blog detail page → confirm `<title>`, `<meta property="og:title">`, `<meta property="og:image">` (when cover image is set), and `<meta name="twitter:card">` tags are present.
  4. Test Navbar: from `/blog`, click "الرئيسية" → confirms it navigates home (not scroll). From home, click "المدوّنة" → confirms it navigates to `/blog`. From `/blog/[slug]`, confirms blog nav item is highlighted as active.
  5. Run `prisma db push` in production deploy so the BlogPost table is created (the build script already does this).

---
Task ID: booking-gallery-feature
Agent: general-purpose
Task: Create booking system + fullscreen gallery page

Work Log:
- Read worklog.md (4 prior batches including blog-feature) + reference files: api/projects/route.ts, api/projects/[id]/route.ts, api/contact-messages/route.ts, api/contact-messages/[id]/route.ts, components/sections/Portfolio.tsx (had MotifSvg inline), components/sections/Contact.tsx (WhatsApp message-building pattern), app/admin/layout.tsx, app/admin/page.tsx (had inline timeAgo + labelForEntity), components/sections/Navbar.tsx, app/blog/page.tsx (server-component public-page pattern), app/globals.css (theme), components/admin/Fields.tsx + ConfirmDialog.tsx (admin patterns).
- Verified `BookingRequest` model already exists in prisma/schema.prisma (lines 224-238) AND the Prisma client already has `db.bookingRequest` (no `prisma generate` needed).
- Created `/src/components/shared/MotifSvg.tsx`: extracted the inline `MotifSvg` from Portfolio.tsx into a shared component. Added a new `"mountain"` motif variant (was referenced in the MotifName union but missing from the original implementation). Same API: `<MotifSvg motif={...} palette={[c1, c2, c3]} />`.
- Updated `/src/components/sections/Portfolio.tsx`: removed the inline 116-line `MotifSvg` function + the local `MotifName` type, replaced with `import { MotifSvg } from "@/components/shared/MotifSvg"`. No other changes — all behavior preserved.
- Created `/src/lib/timeAgo.ts`: extracted the `timeAgo` helper from admin/page.tsx into a shared lib. Same logic, accepts `string | Date`.
- Updated `/src/app/admin/page.tsx`: removed inline `timeAgo`, imported from `@/lib/timeAgo`. Added `CalendarCheck` to lucide imports. Added `case "bookingRequest": return "حجز"` to `labelForEntity`. Added 5th stats fetch (`/api/bookings?status=new`) in the dashboard `useEffect`. Added 5th stats card "حجوزات جديدة" linking to `/admin/bookings` (green-tinted icon color). Changed the stats grid from `lg:grid-cols-4` to `lg:grid-cols-5` so all 5 cards fit on one row at large breakpoints. Added a new quick action "احجز جلسة جديدة" linking to `/booking` (placed as the 2nd item, right after "إضافة عمل جديد").
- Created `/src/app/api/bookings/route.ts`:
  - POST (public): Validates `name` + `phone` required (returns 400 with Arabic message otherwise). Normalizes `service` to one of wedding|portrait|commercial|workshop|other (defaults to `other` if invalid). Parses `preferredDate` via `new Date()` (null if missing/invalid). Rate limit: queries `db.bookingRequest.findMany` for rows with the same phone in the last 10 minutes — returns 429 if >= 3. Creates the row with all fields (sliced to safe lengths), status="new". Calls `logActivity("create", "bookingRequest", id, details, "public")` — username is "public" since this is a public submission. Returns 201 with `{ success, id, service, preferredDate }` so the client can build a WhatsApp reminder link with the saved values.
  - GET (admin only): `getSession()` check, 401 if missing. Reads `?status=` query param. Returns bookings filtered by status (or all if status is "all"/missing), ordered by `createdAt desc`, capped at 500.
- Created `/src/app/api/bookings/[id]/route.ts`:
  - PATCH (admin only): Validates id is integer. Accepts `status` (validated against the 4 allowed values — returns 400 if invalid), plus optionally `name`, `email`, `phone`, `location`, `message` for editing. Updates the row, logs `update/bookingRequest` with the new status.
  - DELETE (admin only): Fetches the booking first (to get the name for the log), 404 if not found, deletes the row, logs `delete/bookingRequest`.
- Created `/src/app/booking/page.tsx` (public booking page, client component):
  - Fetches `/api/settings` on mount for contact info (phone, email, address, WhatsApp).
  - Two-column layout: form (3/5 width) on right, info panel (2/5 width) on left, all RTL.
  - Form fields: name* (text), phone* (tel, dir=ltr), email (optional, validated client-side via regex), service (select dropdown with 5 options showing both Arabic + English labels), preferredDate (HTML date input, dir=ltr), location (text), message (textarea, 4 rows).
  - Client-side validation: name + phone required, email format check. Errors shown in red box below form.
  - Loading state: spinner inside submit button. Success state: replaces the form with a centered success card — green check icon, "تم استلام طلبك" heading, personalized with saved name + service, plus two CTAs: "إرسال تذكير عبر WhatsApp" (green button, opens wa.me with prefilled message `السلام عليكم مريم، أحجزت جلسة [service] بتاريخ [date]. اسمي: [name]`, URL-encoded) and "حجز جديد" (resets form).
  - Info panel (right column) has 3 cards: "ما الذي تتوقعه؟" (3 tips with icons: قبل الجلسة / أثناء التصوير / بعد الجلسة), "زمن الاستجابة" (24h response + live "متاحة" pulse), "معلومات التواصل" (phone/email/address/WhatsApp links pulled from settings). Plus a "استعرض أعمالي السابقة" link card back to /#portfolio.
  - Reuses the same cinematic theme (glass-card class, gold gradient, font-amiri headings, font-inter labels, CursorGlow + Navbar + Footer).
- Created `/src/app/admin/bookings/page.tsx` (admin bookings management, client component):
  - 4 status-count cards at top (جديد/مؤكد/مكتمل/ملغي) — clickable to filter, show count + colored dot.
  - Filter pills row + "تحديث" button (re-fetches).
  - List of bookings — each row shows: ID badge, name (with pulse dot if status=new), service + phone, preferred date + relative time (using shared `timeAgo`), status badge (color-coded), expand caret.
  - Click row to expand: 3-column panel with (a) contact info (name/phone/email/location as clickable links), (b) booking details (service, preferred date, request date in Arabic locale), (c) message box + action buttons: WhatsApp (green, opens wa.me with prefilled Arabic reminder), Confirm/Complete/Cancel (only shown if status is not already that — color-coded), Delete (red).
  - Status updates optimistic — patches the local state after a successful PATCH. Shows spinner on the active button via `updatingId` state.
  - Delete via ConfirmDialog (red, danger) — message includes the booking name.
  - Toast notifications (reused from `@/components/admin/Fields`) for all feedback.
  - motion.div header (RTL, gold gradient), motion.button rows with layout animations.
- Created `/src/components/gallery/GalleryClient.tsx` (client component for the gallery page):
  - Receives `images: GalleryImage[]` as props (server-fetched by the page).
  - State: category filter, layout mode (masonry|grid), sort (newest|oldest|featured), activeIdx (lightbox).
  - Filter bar: 5 category pills + layout toggle (Columns3/LayoutGrid icons) + sort dropdown (ArrowUpDown icon, custom-styled select).
  - Count display: "X صورة" with ImageIcon.
  - Masonry layout uses `columns-1 sm:columns-2 lg:columns-3` with `break-inside-avoid`. Grid layout uses `grid-cols-2 md:grid-cols-3 lg:grid-cols-4 aspect-square`.
  - Each thumbnail: plain `<img loading="lazy">` (or `MotifSvg` placeholder for projects with no imageData), hover overlay + caption (year, featured star, title, location), motion.button with layout + stagger.
  - Fullscreen lightbox: opens on click, locks body scroll, supports Esc to close + ArrowLeft/ArrowRight for next/prev (RTL-aware: left arrow goes to next image, right arrow goes to prev). Top bar shows category + year + image counter. Center shows the current image (max-h-[72vh], object-contain) or MotifSvg placeholder. Prev/Next circular buttons on the sides. Bottom info panel shows project title (font-amiri), English subtitle, location, hairline divider, and description. AnimatePresence handles enter/exit + image-switch transitions.
- Created `/src/app/gallery/page.tsx` (server component, `dynamic = "force-dynamic"`):
  - Fetches all published projects WITH their `images` relation (gallery images) in one query.
  - Builds a flat `GalleryImage[]` array: for each project, pushes the cover image first (even if no URL — so MotifSvg shows in the gallery), then each gallery image (skipping if its URL duplicates the cover URL). Each item carries the parent project's titleAr/titleEn/category/year/location/description/motif/palette for the lightbox info panel.
  - Renders Navbar + hero header ("المعرض الكامل" / "Full Gallery" with gold gradient + image count) + `<GalleryClient images={images} />` + Footer + CursorGlow. Same cinematic theme.
- Updated `/src/app/admin/layout.tsx`: Added `CalendarCheck` to lucide imports. Inserted `{ href: "/admin/bookings", labelAr: "الحجوزات", icon: CalendarCheck }` into `navItems` array right after the blog entry.
- Updated `/src/components/sections/Navbar.tsx`: Added `{ id: "gallery", labelAr: "المعرض", labelEn: "Gallery", href: "/gallery" }` to `navItems` (between portfolio and services). Updated the CTA "احجز جلسة" to point to `/booking` (a dedicated page now) instead of scrolling to `#contact` — both the desktop CTA and the mobile menu CTA use a single `<Link href="/booking">` now (no more conditional scroll-vs-navigate logic for the CTA).
- Verified: `npx tsc --noEmit` reports **0 errors** in any new/modified file. The only 3 errors in the whole repo are the pre-existing ones documented in previous worklog entries (`examples/websocket/*` missing socket.io deps, `next.config.ts` eslint type — Next 16 change). None are in `src/`.
- Verified: `npx next build` succeeds. New routes showing in the output:
  - `/admin/bookings` (Static) ✓
  - `/api/bookings` (Dynamic) ✓
  - `/api/bookings/[id]` (Dynamic) ✓
  - `/booking` (Static — client component) ✓
  - `/gallery` (Dynamic — server component with `force-dynamic`) ✓
  - The `generateStaticParams (blog) error` log during build is the same expected Prisma-client-init error from the sandbox having no `DATABASE_URL` (already documented in the blog-feature worklog). Same applies to the gallery page fetch — falls through to the empty state in production-without-DB, and real data in production-with-DB.

Stage Summary:
- Full booking system + fullscreen gallery shipped end-to-end: 2 API routes, 1 public booking page, 1 admin bookings page, 1 public gallery page (split into server page + client component), 2 shared component/lib extractions (MotifSvg + timeAgo), 3 file updates (admin layout nav, admin dashboard stats, public Navbar).
- Files created:
  - `/src/components/shared/MotifSvg.tsx` (extracted from Portfolio.tsx, added missing "mountain" motif)
  - `/src/lib/timeAgo.ts` (extracted from admin/page.tsx)
  - `/src/app/api/bookings/route.ts` (POST public + GET admin)
  - `/src/app/api/bookings/[id]/route.ts` (PATCH + DELETE admin)
  - `/src/app/booking/page.tsx` (public booking page with WhatsApp reminder)
  - `/src/app/admin/bookings/page.tsx` (admin bookings management)
  - `/src/components/gallery/GalleryClient.tsx` (client gallery + lightbox)
  - `/src/app/gallery/page.tsx` (server gallery page that fetches all published projects + gallery images)
- Files modified:
  - `/src/components/sections/Portfolio.tsx` (replaced inline MotifSvg with import from shared)
  - `/src/app/admin/page.tsx` (extracted timeAgo, added bookingRequest label, added 5th stats card + new quick action + new stats fetch)
  - `/src/app/admin/layout.tsx` (added CalendarCheck import + bookings nav item after blog)
  - `/src/components/sections/Navbar.tsx` (added gallery nav link, repointed CTA "احجز جلسة" to /booking)
- Patterns followed: `getSession()` 401 guard on admin-only routes, try/catch on every DB op with `console.error`, `logActivity()` after successful mutations (username="public" for public booking submissions since no admin session exists), plain `<img loading="lazy" alt=...>` for all images per spec, WhatsApp message URL-encoding pattern reused from Contact.tsx, full Arabic RTL throughout, gold + cinematic dark theme preserved (`glass-card`, `text-gold-gradient`, `font-amiri`, `font-inter`, `font-display`, `lift-card`, `hairline`, `bg-background`, `bg-card`, `text-muted-foreground`, `border-primary/40` etc.), `ConfirmDialog` for destructive actions, `Toast` for feedback, motion.div/AnimatePresence for animations, framer-motion `layout` for filter transitions, keyboard nav (Esc/Arrows) + body-scroll lock in lightbox.
- Next Actions:
  1. Smoke test in browser:
     a. Visit `/booking` → fill form (name + phone + service + date) → submit → confirm "تم استلام طلبك" success card → click "إرسال تذكير عبر WhatsApp" → confirm WhatsApp opens with prefilled Arabic message → click "حجز جديد" → confirm form resets.
     b. Login → visit `/admin/bookings` → confirm the new booking appears at top of list with "جديد" badge → expand it → confirm all details show → click "تأكيد" → confirm badge changes to "مؤكد" → click "WhatsApp" → confirm wa.me opens with the customer's phone + prefilled reminder → click "حذف" → confirm ConfirmDialog → confirm row disappears.
     c. Visit `/gallery` → confirm hero + filter bar + masonry of all project covers + gallery images → click a category pill → confirm list filters → toggle to grid layout → change sort to "المميزة أولاً" → confirm featured items bubble to top → click any image → confirm lightbox opens with prev/next buttons + keyboard arrows + Esc to close + image info panel below.
     d. Visit `/admin` (dashboard) → confirm 5th stats card "حجوزات جديدة" appears with the correct count → confirm "احجز جلسة جديدة" appears as the 2nd quick action → click it → confirm it navigates to `/booking`.
     e. Visit `/` (home) → confirm Navbar shows "المعرض" link between "أعمالي" and "الخدمات" → click "المعرض" → confirm it navigates to `/gallery` → click "احجز جلسة" CTA → confirm it navigates to `/booking` (no longer scrolls to #contact).
  2. Run `prisma db push` in production deploy so the BookingRequest table is created (the build script already does this — no schema changes were needed since the model existed already).
  3. Optional enhancements (not in spec, just ideas for later):
     - Calendar export (.ics) button on confirmed bookings.
     - Email notification to admin when a new booking is submitted (currently relies on admin checking the dashboard).
     - Lazy-load gallery images with intersection observer for better initial load (currently using `loading="lazy"` which is good but not as smart as IO-based preloading).
     - Infinite scroll or pagination on the gallery page if the image count grows past ~200.

---
Task ID: security-seo-perf
Agent: general-purpose
Task: Security hardening + SEO improvements + performance optimizations

Work Log:
- Read reference files: worklog, login route, auth.ts, middleware.ts, vercel.json, seed.ts, layout.tsx, globals.css, Navbar.tsx, activity.ts, page.tsx, Portfolio.tsx, gallery/GalleryClient.tsx, blog page + blog/[slug], admin/projects + admin/blog.

GROUP 1 — Security
- Rewrote `src/app/api/auth/login/route.ts`: removed `DEFAULT_PASSWORD_HASH` constant and default-credentials fallback. Login now requires an admin row in the DB. If DB is unavailable or no admin row found, returns the same Arabic 401 ("بيانات الدخول غير صحيحة") so DB-down status is never revealed. Failed login attempts are logged via `logActivity("login_failed", "admin", "", "Failed login for ${username}", "system")` only when DB is available; otherwise a console.warn is emitted without failing the request. Successful login attempts are also logged. Username is still normalized to lowercase.
- Added in-memory per-IP rate limiting to the login route: max 5 attempts per IP per 15 minutes, returns HTTP 429 with `Retry-After` header and Arabic message "محاولات كثيرة فاشلة. حاول مرة أخرى بعد X دقيقة." Cleanup runs every 100 requests to prune expired entries. IP is read from `x-forwarded-for` (first hop) or `x-real-ip`, falling back to "unknown".
- Verified `prisma/seed.ts` already upserts the `maryam` admin user with `bcrypt.hash("maryam2024", 10)` and that `package.json` build script runs `prisma db push` + `tsx prisma/seed.ts` before `next build`, so the admin can log in with `maryam`/`maryam2024` after first deploy. No seed changes needed.
- `src/lib/auth.ts`: removed `"maryam-photography-secret-key-change-in-prod"` fallback. AUTH_SECRET now throws a clear Error at module load if unset. Added a code comment noting CSRF is mitigated via httpOnly + sameSite=lax (per instructions, the X-Requested-With CSRF check (1.5) was intentionally skipped).
- `src/middleware.ts`: same AUTH_SECRET mandatory change (throws at module load if unset).
- `vercel.json`: added `Strict-Transport-Security`, `Permissions-Policy` (camera/microphone/geolocation = ()), and `X-XSS-Protection` headers, kept existing X-Content-Type-Options, X-Frame-Options, Referrer-Policy.

GROUP 2 — SEO
- Created `src/app/sitemap.ts`: dynamic Next.js sitemap with static entries for /, /blog, /gallery, /booking plus dynamic per-post entries (`/blog/[slug]`) fetched from DB (try/catch returns static-only on failure). Uses NEXT_PUBLIC_SITE_URL with `https://maryam-photography.vercel.app` fallback.
- Created `src/app/robots.ts`: allows all, disallows `/admin/` and `/api/`, points to `${siteUrl}/sitemap.xml`. Deleted legacy `public/robots.txt` so the new `robots.ts` takes precedence.
- Created `src/components/seo/JsonLd.tsx` with `Person`, `WebSite`, `LocalBusiness` (ProfessionalService), and `BreadcrumbList` schemas. SiteJsonLd convenience wrapper renders the three site-wide schemas. BreadcrumbJsonLd is exported for use on blog detail pages.
- Added `SiteJsonLd` to `src/app/layout.tsx` (renders Person + WebSite + LocalBusiness globally).
- Added `BreadcrumbJsonLd` to `src/app/blog/[slug]/page.tsx` (Home → Blog → Post).
- Created `src/app/opengraph-image.tsx`: 1200×630 dynamic OG image via next/og (edge runtime). Dark cinematic background, large gold "مريم" in serif, "Maryam Photography" subtitle, "YEMENI VISUAL STORYTELLER" tagline, decorative concentric gold rings, "SANA'A · YEMEN" bottom accent.
- Created `src/app/blog/[slug]/opengraph-image.tsx`: per-post 1200×630 OG image with the post title (RTL-aligned), category, read time, and brand badge — fetched from DB with try/catch fallback.
- Created `src/app/icon.svg`: SVG favicon matching the Navbar logo (dark rounded square, gold concentric circles, gold serif "M"). Next.js auto-discovers it.
- Enhanced `src/app/layout.tsx` metadata: added `metadataBase` from NEXT_PUBLIC_SITE_URL, `alternates.canonical`, `openGraph.images` pointing to `/opengraph-image` (1200×630 with alt), `twitter.card: "summary_large_image"` with title/description/images, `robots` block (index/follow + googleBot with `max-image-preview: large`), and `verification.google` populated from `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` env var when set.

GROUP 3 — Performance
- Image optimization (no next/image switch — Vercel Blob URLs kept as plain `<img>`):
  - `src/components/sections/Portfolio.tsx`: grid thumbnails — first item `loading="eager"` (LCP), rest `loading="lazy"`, all with `decoding="async"`. Lightbox main image set to `loading="eager"`. Lightbox thumbnails get `loading="lazy"`, `decoding="async"`, and explicit `width={64} height={64}`.
  - `src/components/gallery/GalleryClient.tsx`: gallery thumbnails — first 6 set to `loading="eager"` (above-the-fold), rest `loading="lazy"`, all with `decoding="async"`. Lightbox main image set to `loading="eager"` + `decoding="async"`.
  - `src/app/blog/page.tsx`: PostCard cover image gets `decoding="async"` + `width={1600} height={1000}` (matches 16/10 aspect).
  - `src/app/blog/[slug]/page.tsx`: cover image promoted to `loading="eager"` (article LCP) + `decoding="async"`. Markdown `img` component gets `decoding="async"`. Related-post cards get `decoding="async"` + `width/height`.
  - `src/app/admin/projects/page.tsx`: all 3 `<img>` tags (thumbnail, preview, gallery grid) get `loading="lazy"` + `decoding="async"`.
  - `src/app/admin/blog/page.tsx`: both `<img>` tags (thumbnail, cover preview) get `loading="lazy"` + `decoding="async"`.
- Installed `@vercel/analytics` (npm install) and added `<Analytics />` from `@vercel/analytics/next` to the end of `<body>` in `src/app/layout.tsx`.
- Created `src/app/not-found.tsx`: standalone 404 page (no Navbar/Footer per instructions). Full-screen dark background with film-grain, letterbox bars, decorative gold glow, large "404" in font-amiri with gold gradient, Arabic "الصفحة غير موجودة" + English "Page Not Found", subtitle "يبدو أنك سُرت بعيدًا عن العدسة...", buttons "العودة للرئيسية" → / and "تصفح المعرض" → /gallery.
- Created `src/app/error.tsx`: client error boundary. Same cinematic styling. "حدث خطأ ما" / "Something went wrong", subtitle, "المحاولة مرة أخرى" button calling `reset()`, "العودة للرئيسية" link. Logs to `console.error` (no external service).
- Created `src/app/loading.tsx`: root loading state. Full-screen centered gold spinner (2px gold ring with spinning top arc) + "جاري التحميل..." text, letterbox bars.
- Created `src/components/shared/ScrollProgress.tsx`: 2px fixed top progress bar using framer-motion `useScroll` + `useSpring`. Gold gradient background with subtle glow, `origin-left` so it grows from the start side. z-50.
- Created `src/components/shared/BackToTop.tsx`: floating gold-arrow button, appears after `scrollY > 600`. Fixed `bottom-6 left-6` (RTL-friendly). Framer Motion fade + slide-in. Smooth-scrolls to top on click.
- Added `<ScrollProgress />` at top of `src/app/page.tsx` (before Navbar) and `<BackToTop />` at the end (after Footer).

Verification
- Ran `npx tsc --noEmit`: zero new errors in any modified or newly created file. Only pre-existing errors in `examples/websocket/*` (missing socket.io deps) and `next.config.ts` (the `eslint` key, pre-existing) — both unrelated to this task. `next.config.ts` already sets `typescript.ignoreBuildErrors: true` and `eslint.ignoreDuringBuilds: true`.

Stage Summary:
- 9 files created: `src/app/sitemap.ts`, `src/app/robots.ts`, `src/app/opengraph-image.tsx`, `src/app/blog/[slug]/opengraph-image.tsx`, `src/app/icon.svg`, `src/app/not-found.tsx`, `src/app/error.tsx`, `src/app/loading.tsx`, `src/components/seo/JsonLd.tsx`, `src/components/shared/ScrollProgress.tsx`, `src/components/shared/BackToTop.tsx`.
- 1 file deleted: `public/robots.txt`.
- 12 files modified: `src/app/api/auth/login/route.ts`, `src/lib/auth.ts`, `src/middleware.ts`, `vercel.json`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/blog/[slug]/page.tsx`, `src/app/blog/page.tsx`, `src/components/sections/Portfolio.tsx`, `src/components/gallery/GalleryClient.tsx`, `src/app/admin/projects/page.tsx`, `src/app/admin/blog/page.tsx`.
- 1 package added: `@vercel/analytics`.
- Security posture: no default password fallback, mandatory AUTH_SECRET, per-IP rate limit on login, hardened response headers. Admin still seedable via `prisma db seed` (maryam/maryam2024) for first deploy.
- SEO: dynamic sitemap.ts + robots.ts, JSON-LD (Person/WebSite/LocalBusiness + BreadcrumbList on blog), dynamic OG images (site + per blog post), SVG favicon, comprehensive metadata (metadataBase, canonical, OG/Twitter images, robots, verification placeholder).
- Performance: lazy/eager loading + async decoding + CLS-preventing width/height on every relevant `<img>`, Vercel Analytics, dedicated 404/error/loading UIs, scroll progress bar, back-to-top button.
- Next actions: (1) Set `AUTH_SECRET` (already present in `.env` for local dev; ensure it's set in the Vercel project env vars for production). (2) Optionally set `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` once you have a Search Console verification token. (3) For production-grade rate limiting, consider Upstash Redis to persist login attempt counts across serverless instances.

---
Task ID: i18n-stats-final
Agent: general-purpose
Task: Dynamic testimonials stats + dynamic footer + newsletter + language switcher + next.config fix

Work Log:
- Read reference files: worklog, Testimonials, Footer, Navbar, Hero, Contact, layout, next.config, schema.prisma, testimonials/projects/bookings API routes, db.ts, auth.ts, globals.css.

TASK 1 — Dynamic testimonials stats
- Added `Project` type + `computeStats(testimonials, projects)` helper to `Testimonials.tsx` that derives: happyClients (`+N` from testimonials count, floor "+250" if empty), albums (`+N` from published projects count), avgRating (mean of testimonial ratings to 1 decimal, with "★" suffix, fallback "5.0★"), awards kept as "+40" (no DB source).
- Replaced the single `/api/testimonials` fetch with `Promise.all([fetch('/api/testimonials'), fetch('/api/projects')])` and stored both arrays in state.
- Replaced the hardcoded 4-item array in the stats bar with `computeStats(testimonials, projects).map(...)`.

TASK 2 — Dynamic footer + newsletter form
- Rewrote `Footer.tsx`: removed the module-level `footerLinks` array and rebuilt columns inside the component. The "Services" and "Explore" columns are now static `FooterColumn[]` (with bilingual labelAr/labelEn). The "Connect" column is constructed dynamically from `s.contactEmail`, `s.contactPhone`, `s.contactAddress` (with sensible fallbacks if missing). "احجز جلسة" now links to `/booking` (Next `<Link>`) instead of `#contact`.
- Added "المدونة" → /blog and "المعرض الكامل" → /gallery to the "Explore" column.
- Wrapped the newsletter `<input>` + `<button>` in a `<form onSubmit={handleNewsletterSubmit}>`, added `required` to the input, added loading/success/error states with localized messages ("تم الاشتراك بنجاح!", error: "تعذّر الاشتراك. حاول مرة أخرى لاحقًا."). Uses Check / Loader2 / AlertCircle icons.
- Applied `t()` to brand name, column titles, link labels, "Newsletter" label, "Subscribe" button, privacy/terms links (lightweight i18n).

TASK 2.1 — Newsletter API + Prisma model
- Added `NewsletterSubscriber` model to `prisma/schema.prisma` (id, unique email, createdAt, @@index([email])).
- Created `src/app/api/newsletter/route.ts`:
  - `POST` (public): validates email format via simple regex (max 200 chars), normalizes to lowercase, inserts into DB. On Prisma P2002 (unique violation) returns 200 idempotent success. Logs `logActivity("create", "newsletterSubscriber", email, ...)` on success. Returns 201 / 400 / 500.
  - `GET` (admin only): requires session via `getSession()`, returns all subscribers ordered by createdAt desc (cap 1000).
- Ran `npx prisma generate` — Prisma client updated successfully.

TASK 3.1–3.2 — LanguageProvider + wrap layout
- Created `src/components/shared/LanguageProvider.tsx` with the exact API from the spec: `lang`, `setLang`, `toggle`, `t(ar, en)`. Stores lang in localStorage, syncs `<html lang/dir>`. Hydration effect uses `// eslint-disable-next-line react-hooks/set-state-in-effect` with a clear comment (standard SSR-safe localStorage restore pattern; lazy-init impossible because localStorage is unavailable during SSR).
- Wrapped `{children}`, `<Toaster />`, `<Analytics />`, and `<SiteJsonLd />` with `<LanguageProvider>` in `src/app/layout.tsx`. Imported `LanguageProvider` from `@/components/shared/LanguageProvider`.

TASK 3.3 — LanguageToggle component
- Created `src/components/shared/LanguageToggle.tsx`: small gold-styled round button (border-primary/40, hover:bg-primary, font-inter). Shows "EN" when current lang is "ar" (switch to English), "ع" when current lang is "en" (switch to Arabic). Bilingual aria-label/title. Accepts optional `className` prop for visibility/sizing overrides.

TASK 3.4 — Add toggle to Navbar
- Imported `useLang` + `LanguageToggle` in `Navbar.tsx`.
- Desktop: added `<LanguageToggle className="hidden md:inline-flex" />` next to the "احجز جلسة" CTA button.
- Mobile: added `<LanguageToggle />` centered below the booking CTA inside the mobile menu drawer.
- Applied `t(item.labelAr, item.labelEn)` to all nav items (desktop + mobile) and `t("احجز جلسة", "Book a Session")` / `t("احجز جلسة تصوير", "Book a Photo Session")` to CTAs.

TASK 3.5 — Lightweight i18n for key UI text
- Navbar: nav item labels and CTA buttons via `t()` (see above).
- Hero: imported `useLang`. Main `<h1>` now shows `lang === "en" ? s.heroSubtitleEn : s.heroTitleAr` (so English visitors see the big English wordmark). The secondary line swaps accordingly. Tagline (`s.heroDescAr`) kept as-is per "don't overdo it" guidance.
- Footer: brand name, column titles, link labels, "Newsletter", "Subscribe", privacy/terms, success message all via `t()`.
- Contact: imported `useLang`. Section title swaps between `contactTitleAr` (AR) and `contactSubtitleEn` (EN); the small upper tagline swaps inversely. Submit button + status messages + helper paragraph translated via `t()`.

TASK 4 — next.config.ts
- Set `typescript.ignoreBuildErrors: false`.
- Removed the `eslint.ignoreDuringBuilds` key: Next.js 16 removed the built-in ESLint integration (`next lint` and the `eslint` config field are gone). Added a comment explaining lint is now run via `npm run lint` (eslint .) which is already in package.json.
- Kept `reactStrictMode: false` and `experimental.serverActions.bodySizeLimit: "30mb"`.
- Added `images.remotePatterns` for `*.vercel-storage.com` and `vercel-storage.com` (future next/image compat with Vercel Blob).
- Added `poweredByHeader: false`.

Verification
- `npx prisma generate` — succeeded (Prisma Client v6.19.3).
- `npx tsc --noEmit` — only the two pre-existing errors in `examples/websocket/*` (missing socket.io / socket.io-client deps, documented as "leave them"). Zero new errors from this task's changes.
- `npx eslint <changed files>` — zero errors in all newly created/modified files. The single pre-existing `react-hooks/set-state-in-effect` error in `Testimonials.tsx` (the `setIdx(0)` clamp effect) was confirmed pre-existing via `git stash` and is left untouched per task instructions. Other pre-existing instances of the same rule (`carousel.tsx`, `use-mobile.ts`, etc.) are also untouched.

Stage Summary:
- 3 files created: `src/app/api/newsletter/route.ts`, `src/components/shared/LanguageProvider.tsx`, `src/components/shared/LanguageToggle.tsx`.
- 8 files modified: `src/components/sections/Testimonials.tsx`, `src/components/sections/Footer.tsx`, `src/components/sections/Navbar.tsx`, `src/components/sections/Hero.tsx`, `src/components/sections/Contact.tsx`, `src/app/layout.tsx`, `next.config.ts`, `prisma/schema.prisma`.
- Stats bar now reflects real DB data (testimonial count, published project count, average rating) with sensible floors. Awards kept as marketing claim.
- Footer "Connect" column now reflects settings (`contactEmail`, `contactPhone`, `contactAddress`); booking CTA points to `/booking`; newsletter form is wired to a real `POST /api/newsletter` endpoint with idempotent deduplication on email.
- Language toggle (Arabic RTL ↔ English LTR) live in navbar (desktop + mobile). `<html lang/dir>` + localStorage persisted on toggle. Major UI labels (nav, CTAs, hero title, footer columns, contact title/button) translated via `t()` — lightweight i18n, not full routing.
- Build posture hardened: TypeScript errors no longer ignored at build time, Vercel Blob whitelisted for next/image, x-powered-by header disabled. ESLint must now run via `npm run lint` (Next.js 16 dropped built-in ESLint).
- Next actions: (1) `prisma db push` will be run automatically by the existing build script — the new `NewsletterSubscriber` table will be created on next deploy. (2) Optionally add an admin page to view newsletter subscribers (API already exists at `GET /api/newsletter`). (3) Consider deeper translation coverage (About, Services, Portfolio section titles) in a future task if English UX feedback warrants it.

---
Task ID: rebuild-hero-nav-footer
Agent: general-purpose
Task: Rebuild Hero, Navbar, Footer with editorial design

Work Log:
- Read `src/app/globals.css` to inventory tokens (warm-black `--background`, champagne gold `--primary` ramp, neutral `--border`, `--ease: cubic-bezier(0.2, 0.8, 0.2, 1)`, utility classes `.eyebrow`, `.body-lg`, `.vertical-text`, `.hairline`, `.surface-card`, `.font-amiri/display/inter`) and confirmed the design-system anti-pattern guidance (no glow orbs, no excessive glassmorphism, no gradient-text everywhere, no pure black/white, no cramped padding, no flat hierarchy, no everything-centered, no monotonous spacing).
- Read `src/components/shared/LanguageProvider.tsx` (`useLang()` → `{ lang, setLang, toggle, t }`) and `LanguageToggle.tsx` (already gold-bordered pill; kept as-is).
- Read existing `Navbar.tsx` / `Hero.tsx` / `Footer.tsx` to preserve all behavior contracts (settings fetch shape, scroll-spy logic, `/blog` and `/booking` routes, newsletter POST endpoint, developer signature link to Wasim).
- Rebuilt **`src/components/sections/Navbar.tsx`**:
  - Extracted a module-level `LogoMark` (pure presentational) so the inline `Logo` component was no longer created during render (ESLint `react-hooks/static-components`).
  - Sticky header: transparent + py-5 at top; `bg-background/80 backdrop-blur-sm border-b border-border py-3` past 40px scroll. Single transition targeting only `background-color, border-color, padding` with `motion-ease`.
  - Logo: w-9 h-9 SVG circle with "M" in `font-display`, paired with stacked "مريم" (font-amiri) + "MARYAM" (font-inter, 9px, tracking 0.35em, muted). Foreground color — no gold gradient.
  - Nav items trimmed to: home, about, portfolio, services, testimonials, blog (route), contact. Each link uses `font-amiri text-sm`; active link = `text-foreground` + animated 2px gold underline (`transition-[width]` with `motion-ease`, w-0→w-full on hover/active). Logical `start-0` for RTL correctness.
  - CTA "احجز جلسة" → solid `bg-primary text-primary-foreground`, `rounded-md` (NOT pill), `px-5 py-2 text-sm font-medium`, hover `bg-primary-pale`.
  - Mobile: full-screen overlay (`fixed inset-0 bg-background`), stagger animation 0.06s per item, close button on visual left (RTL end) with brand on visual right (RTL start), body scroll locked while open.
  - `LanguageToggle` kept inline next to CTA on desktop; rendered below CTA in mobile overlay.
- Rebuilt **`src/components/sections/Hero.tsx`**:
  - Asymmetric grid `lg:grid-cols-[3fr_2fr]`: text 60% on visual LEFT, portrait 40% on visual RIGHT (achieved via `dir="ltr"` on section + `dir="rtl"` on text column so Arabic still renders correctly).
  - Background: solid `bg-background`. All glow orbs, radial gradients, film-grain, and gold-blur removed.
  - Left column (top→bottom, staggered 0.1s each with `var(--ease)`):
    1. Eyebrow with short 8px gold hairline before it (`.eyebrow` class, uses `s.taglineEn`)
    2. Massive Arabic name `clamp(5rem, 12vw, 11rem)`, `font-amiri font-bold`, `leading-[0.9]`, `text-foreground` (NOT gold gradient) — single accent is a small `w-2.5 h-2.5` gold dot beside the name
    3. English subtitle `M·A·R·Y·A·M` in `font-display`, wide tracking (0.45em), muted
    4. Description in `.body-lg` style + `max-w-xl` (uses `s.heroDescAr`)
    5. CTA row: solid gold "استكشف الأعمال" (rounded-md, hover `bg-primary-pale`, ArrowDown that nudges on hover) + outline neutral "قصة مريم" (border-border, hover border-strong + text-primary)
    6. Stats: 3 inline, NOT in cards, separated by `w-px h-10 bg-primary/25` gold dividers. Number in `font-display text-2xl text-primary`, label `text-xs text-muted-foreground`.
  - Right column: `aspect-[3/4]` container with `border border-border-strong/40`. If `s.heroImageData` exists → plain `<img loading="lazy" object-cover>`. Else → refined inline `ApertureDiagram` SVG (concentric rings, 36 tick marks with major/minor distinction, 6-blade aperture polygon, center crosshair, "ƒ/1.4 · 50 mm" + "MARYAM · LENS" labels) in gold hairlines. Floating `.vertical-text` "EST · 2018" label on the side. Entrance: fade + x-offset 30→0.
  - Scroll indicator at bottom-center: thin `w-px h-12` line + 1px gold dot animating y:[0,44] opacity:[0,1,0] infinite, paired with `.eyebrow text-[0.6rem]` "Scroll" label.
  - Star-rating widget removed (was an anti-pattern decorative element competing with the eyebrow).
- Rebuilt **`src/components/sections/Footer.tsx`**:
  - Top 4-column grid (`grid-cols-2 md:grid-cols-4`): Brand + Services + Explore + Connect. Brand col hosts logo + name + `footerDesc` + minimal social icons (just `w-9 h-9` icons with `hover:bg-muted hover:text-primary`, NO bubble circles). The other three columns are list-style with `font-inter text-[10px] tracking-[0.35em] text-primary uppercase` headers and `text-sm text-muted-foreground hover:text-primary` links.
  - Newsletter moved into its own slim row (between the top grid and bottom bar): minimal inline email input + arrow button sharing a single underline (`border-b border-border focus-within:border-border-strong`). NO card container. Arrow icon rotates 180° in RTL. Submitting hits existing `/api/newsletter` endpoint; success/error states render as small caption beneath.
  - Decorative background wordmark: absolutely-positioned "مريم" in `font-amiri font-bold`, `font-size: clamp(4rem, 15vw, 12rem)`, `text-foreground/[0.04]` (very subtle texture), translated down 20% so it bleeds off the bottom — clearly background, not feature.
  - Bottom bar: `border-t border-border py-6 flex justify-between`. In RTL the first child (copyright text) sits visual right; the second (Crafted in Sana'a + back-to-top button) sits visual left. Back-to-top is `w-8 h-8 border border-border hover:border-border-strong` with ArrowUp icon, `rounded-sm`.
  - Developer signature preserved exactly as before — `وسيم الزبيري` in `font-amiri text-sm text-primary` with Code2 + Heart + MessageCircle icons, centered, links to Wasim's WhatsApp. Heart uses `fill-destructive/70 text-destructive/70` (the destructive ramp has a coral hue that reads as "red" without being pure red).
  - NO glassmorphism, NO glow gradient on the top hairline, NO cards-inside-cards. All borders are neutral `border-border` (gold reserved for the primary accent only).
- Ran `npx tsc --noEmit` → exit 0. Ran ESLint on the three files → exit 0 (resolved the `react-hooks/static-components` error by extracting `LogoMark` to module scope).

Stage Summary:
- 3 components rebuilt to editorial standard: `src/components/sections/Navbar.tsx`, `src/components/sections/Hero.tsx`, `src/components/sections/Footer.tsx`.
- Anti-patterns eliminated across all three: removed dark-glow orbs, gold-gradient logo/wordmark, centered hero, pill-rounded CTAs, bubble-circle social icons, cards-inside-cards, and decorative star-rating clutter.
- Design system tokens wired correctly: `.eyebrow`, `.body-lg`, `.vertical-text`, `--primary` ramp, `--border` (neutral), `--border-strong` (gold), `.motion-ease`, `font-amiri/display/inter`. All motion uses `[0.2, 0.8, 0.2, 1]` easing array (matches `var(--ease)`).
- RTL correctness: hero uses `dir="ltr"` on grid wrapper + `dir="rtl"` on text column to honor the literal "text left / image right" instruction; navbar mobile overlay places brand on RTL start (visual right) and close button on RTL end (visual left); footer copyright auto-places on RTL start (visual right) via `justify-between`.
- Settings fetch preserved (`/api/settings`); all field names match the Prisma schema (`heroImageData`, `taglineEn`, `heroStat*Num/Label`, `footerDesc`, `footerCopyright`, `contact*`).
- Type-check + ESLint clean. No other files touched.

---
Task ID: rebuild-about-marquee-services
Agent: general-purpose
Task: Rebuild About, Marquee, Services with editorial design

Work Log:
- Read `globals.css`, `Hero.tsx`, `LanguageProvider.tsx`, existing `About.tsx`, `Marquee.tsx`, `Services.tsx`, and `Navbar.tsx` (LogoMark pattern reference) to internalize the editorial design language: warm-black lacquer surfaces, neutral hairlines (gold reserved for emphasis), `.section-title` / `.eyebrow` / `.body-lg` / `.display-heading` / `.surface-card` / `.motion-ease` utilities, single easing `[0.2, 0.8, 0.2, 1]` matching `var(--ease)`.
- Verified `/api/settings` whitelist (`marqueeWords`, `aboutImageData`, `aboutSignature`, `aboutHeadingAr`, etc.) and `/api/philosophy` + `/api/services` return shapes before touching the components.
- Rebuilt **`src/components/sections/About.tsx`**:
  - Editorial split header (left-aligned, NOT centered): short gold hairline + `.eyebrow` ("About The Artist") + `section-title` "قصة خلف العدسة" + 24px `.hairline` rule below.
  - Bio grid: `lg:grid-cols-12` with portrait `col-span-5` and text `col-span-7`. Portrait `aspect-[3/4]` with a single 1px gold hairline frame (`border border-primary/30`, NOT the previous thick double-frame). Image: plain `<img loading="lazy" object-cover>` with hover zoom `scale-[1.04]` over 700ms using `var(--ease)`. Fallback: replaced the filled silhouette with a refined `MonogramPortrait` SVG — warm radial wash, inset hairline frame, large Amiri "م" monogram, "MARYAM" tracking label, "EST · 2018 · SANA'A" caption, and four corner ticks (typographic mark, NOT a silhouette). Floating "7+ Years" badge: 80×80 neutral square (`bg-background border border-border-strong/40`), NO `pulse-glow`, NO `rounded-full`.
  - Text column: `.eyebrow` "THE STORY" + short hairline, then h3 in `.display-heading` (font-amiri, line-height 1.05), then two paragraphs in `.body-lg`. Tags as inline `.rounded-full` pills (NOT cards) with `border-border` → `hover:border-border-strong hover:text-primary`. Signature row: `font-amiri text-primary` signature + flex-1 gradient hairline + "Maryam Al-Hadhrami" label + "Visual Storyteller" sub-label.
  - Philosophy grid: `sm:grid-cols-2 lg:grid-cols-4 gap-5`. Each card uses `.surface-card` (1px neutral hairline, NO thick border, NO nested cards, NO corner accents). Contents: line-style icon with `strokeWidth={1.5}`, `.eyebrow` English title, `font-amiri text-2xl` Arabic title, `text-sm` description. Hover: `-translate-y-1` (4px) with `duration-500 motion-ease` — no shadow, no glow.
  - Removed all `pulse-glow`, `film-grain`, `text-gold-gradient`, `backdrop-blur`, decorative background orbs. Wired `useLang().t` for Arabic/English label toggles.
- Rebuilt **`src/components/sections/Marquee.tsx`**:
  - `bg-secondary` (warm muted) with `border-y border-border` (top + bottom hairlines) — replaced the loud `bg-primary` yellow band.
  - Height: `py-8` (was `py-10`).
  - Words rendered by detecting Arabic via `/[\u0600-\u06FF]/`: Arabic words → `font-amiri text-3xl md:text-4xl text-secondary-foreground`; English words → `font-display italic text-xl md:text-2xl text-muted-foreground`. Alternation falls naturally out of the comma-separated list order.
  - Separator between every word: 12px (`w-3 h-3`) gold star/diamond SVG (`text-primary`, opacity 0.85) — was previously 24px.
  - Speed: `animationDuration: '40s'` (was 30s) on `.animate-marquee`. Pause on hover via `group-hover:[animation-play-state:paused]`.
  - Edge fades: two `w-24` gradient masks from `from-secondary to-transparent` on each side for a refined transition (no hard cutoff).
  - `aria-hidden` + `dir="ltr"` so the LTR marquee track scrolls correctly regardless of the page RTL state.
- Rebuilt **`src/components/sections/Services.tsx`**:
  - Editorial split header: short hairline + `.eyebrow` ("Services & Packages") + `section-title` "خدمات التصوير" + `.body-lg` subtitle + 24px `.hairline`. All left-aligned, max-w-3xl.
  - Grid: `sm:grid-cols-2 lg:grid-cols-4 gap-5`. Each card uses `.surface-card` (solid `bg-card`, 1px neutral border). Removed the `bg-gradient-to-b from-primary/5` featured tint and the absolute accent-gradient overlay (both anti-patterns).
  - Featured badge: small `rounded-full px-2.5 py-1 bg-primary text-primary-foreground text-[10px]` pill at top-left (RTL → visual right) — gold bg, NOT a giant featured frame.
  - Icon: small square `w-10 h-10 border border-border` (NOT a circle, NOT a gradient bubble) with line-style icon `strokeWidth={1.5}`.
  - `.eyebrow` English title → `font-amiri text-xl` Arabic title → `font-display text-lg text-primary` price (solid gold, NOT `.text-gold-gradient`) → `text-xs text-muted-foreground` duration → `.hairline` divider → feature list with `Check` icon `w-3.5 h-3.5 strokeWidth={1.5} text-primary` and `text-sm` body → full-width button.
  - Button: `rounded-md` (NOT `rounded-full`). Featured = solid `bg-primary text-primary-foreground hover:bg-primary-pale`. Non-featured = `border border-border` outline that lifts to `hover:border-border-strong hover:text-primary`. All scroll to `#contact`.
  - Hover on the card: `-translate-y-1` (4px) + `hover:border-border-strong` with `duration-500 motion-ease`. No shadow, no gradient lift.
  - Bottom note: small italic `text-sm text-muted-foreground` paragraph, left-aligned (NOT centered), about package customization. Wired `useLang().t` throughout.
- Ran `npx tsc --noEmit` → exit 0 (no type errors). No other files touched.

Stage Summary:
- 3 components rebuilt to editorial standard: `src/components/sections/About.tsx`, `src/components/sections/Marquee.tsx`, `src/components/sections/Services.tsx`.
- Anti-patterns eliminated: removed `pulse-glow` badge animation, `text-gold-gradient` everywhere, backdrop-blur nested cards, decorative glow orbs, gradient-accent service cards, `rounded-full` CTA buttons, centered headers (now left-aligned editorial splits), filled silhouette portrait fallback (replaced with typographic Amiri monogram).
- Design system tokens wired correctly: `.section-title`, `.eyebrow`, `.body-lg`, `.display-heading`, `.surface-card`, `.hairline`, `.motion-ease`, `border-border` (neutral) vs `border-border-strong` (gold emphasis), `bg-secondary` for marquee ground. All motion uses the `[0.2, 0.8, 0.2, 1]` easing array to match `var(--ease)`.
- API fetch patterns preserved: About hits `/api/settings` + `/api/philosophy`; Marquee hits `/api/settings.marqueeWords`; Services hits `/api/services`. All field names match the existing Prisma schema (`aboutImageData`, `aboutSignature`, `aboutHeadingAr`, `aboutTags`, `marqueeWords`, service `features` JSON string, `featured` flag).
- `useLang().t` consumed in About + Services (Marquee is purely decorative, no copy). RTL preserved (`dir="rtl"` on About + Services sections; `dir="ltr"` on Marquee track so the loop scrolls correctly).
- Type-check clean. No other files modified.

---
Task ID: rebuild-portfolio-testimonials
Agent: general-purpose
Task: Rebuild Portfolio, Testimonials with editorial design

Work Log:
- Read globals.css, Hero.tsx, About.tsx, Services.tsx, Marquee.tsx to internalize the editorial design language (warm-black lacquer + champagne gold + neutral hairlines, eyebrow + section-title + body-lg pattern, var(--ease), rounded-md not rounded-full, no glass-cards/glow orbs).
- Read LanguageProvider.tsx (useLang: lang, t(ar, en)) and MotifSvg.tsx (kept for placeholder fallback).
- Read existing Portfolio.tsx and Testimonials.tsx to preserve API fetch patterns (/api/projects, /api/projects/[id]/images, /api/testimonials).

Portfolio.tsx — full rewrite:
  - Replaced dark custom oklch(0.06) background with bg-background for consistency with Hero/About/Services.
  - Header: editorial split (left-aligned, dir="rtl") — short gold hairline + eyebrow "أعمال مختارة/Selected Works" + section-title "معرض الأعمال" + body-lg subtitle + 24-px hairline divider.
  - Filters: rounded-md pill buttons (NOT rounded-full). Active = solid bg-primary/border-primary. Inactive = neutral border + muted text + hover:border-border-strong. Each filter shows a small count badge (font-inter 10px, rounded-sm) computed live from projects.
  - Masonry grid kept (columns-1 sm:columns-2 lg:columns-3 gap-4 md:gap-6). Each card uses motion.button with break-inside-avoid.
  - Cards: natural-aspect image (loading lazy + decoding async; first card eager for LCP). Subtle bottom-only gradient (from-background/85 → transparent) NOT a full overlay. Removed the maximize-icon circle in center (anti-pattern icon-tile-stack); whole card is clickable.
  - Caption: row 1 = year (gold eyebrow) + category label (muted font-inter). Row 2 = title (font-amiri) + location (font-display small). Caption slides up -1 on hover. Image scales 1.03 (NOT 1.1).
  - Top-right index number: idx+1 padded to "01" in font-inter tiny gold (was using project.id — now uses visual order).
  - Lightbox redesigned: top bar with hairline + eyebrow category + image counter "01 / 02" + close button (rounded-md, hairline border). Main image centered max-h-[70vh] (lowered from 75vh to make room for the info panel). Prev/next buttons: rounded-md, hairline border, no backdrop blur (removed glass). RTL-aware chevron direction preserved.
  - Bottom info panel: bg-card surface (NOT glass-card). 2-col grid: left = year eyebrow + category + title (font-amiri 3xl) + English subtitle + 16px hairline + description; right = meta (location, year in font-inter labels + amiri values) + thumbnail strip (rounded-sm, border-primary on active).
  - Empty state: minimal text-only message, no icon-tile.
  - Bottom CTA: outline button (rounded-md, border-border, hover:border-border-strong + text-primary) linking to /gallery via next/link. Includes ArrowUpRight icon that nudges on hover.
  - Keyboard nav preserved (Esc/ArrowLeft/ArrowRight) with RTL semantics.
  - All transitions use motion-ease + var(--ease) and EASE constant.

Testimonials.tsx — full rewrite:
  - Replaced dark custom background + decorative glow orb + glass-card with bg-background + surface-card (anti-patterns removed: glow orbs, glassmorphism, gradient-text everywhere).
  - Header: editorial split (left-aligned, dir="rtl") — gold hairline + eyebrow "أصوات العملاء/Client Voices" + section-title "آراء العملاء" + body-lg + 24-px hairline.
  - Testimonial display: surface-card container. 2-col grid (md:grid-cols-5) when image present — image col-span-2 (40%), content col-span-3 (60%). Single col centered when no image.
  - Image side: full-height object-cover img, lazy + async. Clickable to open lightbox. Verified "موثّقة" badge top-right — small rounded-md pill with emerald tint (bg-emerald-500/15 + border-emerald-400/40 + emerald-300 text) — kept the green "verified" convention but rendered editorially (no rounded-full, no shadow). Decorative corner accents: thin gold (border-primary/60) L-shapes at opposite corners. Subtle hover hint pill ("عرض كامل").
  - Content side: big Quote icon (text-primary/15, strokeWidth 1). Rating stars left-aligned (RTL-natural). Quote text font-amiri text-xl/2xl right-aligned with « » guillemets. 20-px hairline divider. Author row: small avatar circle (rounded-full, border-primary/30, bg-secondary) with font-amiri initials + name (font-amiri) + role (muted) + roleEn (font-inter eyebrow gold).
  - Navigation: prev/next rounded-md hairline buttons (border-border, hover:border-border-strong + text-primary). Dots indicator: rounded-sm (NOT rounded-full), active = w-8 bg-primary, inactive = w-2 bg-border. Counter "01 / 04" in font-inter tracking-[0.3em].
  - Stats bar: 4 stats in a row separated by thin vertical 1px hairlines (w-px h-12 bg-border), NOT card containers. Each stat: font-display text-2xl/3xl gold (NOT gradient) + 10-12px muted label.
  - Lightbox kept: minimal redesign — emerald badge moved to top-left, X button to top-right (rounded-md hairline), border-border on image instead of border-primary/20 glow.
  - All transitions use motion-ease + var(--ease) and EASE constant.
  - useLang() used throughout for bilingual labels.

Verification:
- npx tsc --noEmit passes cleanly (no errors).

Stage Summary:
- Portfolio.tsx and Testimonials.tsx fully rebuilt to match the editorial design standard set by Hero/About/Services/Marquee: warm-black bg-background surfaces, neutral hairlines, gold reserved for emphasis only, rounded-md (not rounded-full) for pills/buttons, surface-card for containers, var(--ease) on all transitions, no glow/glass/gradient-text anti-patterns.
- Both sections now use the editorial split header pattern (eyebrow + section-title + body-lg + 24-px hairline).
- Portfolio: masonry layout preserved, filter pills with count badges, redesigned lightbox with surface-card info panel, CTA links to /gallery.
- Testimonials: 2-col image+content layout with verified badge + corner accents, vertical-hairline-separated stats bar, dots/counter navigation preserved.
- Existing API fetch patterns and MotifSvg fallback preserved. No other files touched.

---
Task ID: rebuild-subpages
Agent: general-purpose
Task: Rebuild blog, gallery, booking pages to match cinematic design

Work Log:
- Read reference design system: globals.css (design tokens, .eyebrow/.section-title/.body-lg/.hairline/.surface-card/.lift-card/.text-gold-gradient utilities, EASE constant), Hero.tsx (motion pattern + EASE), About.tsx (editorial left-aligned header pattern), Portfolio.tsx (card + lightbox patterns).
- Rebuilt `/src/app/blog/page.tsx` as a server component. SSR-fetches posts via `db.blogPost.findMany` filtered by `searchParams.category` (validated against 5 valid categories). Renders Navbar + `<BlogClient>` + Footer. Removed `CursorGlow`, decorative blur orbs, and centered hero — now editorial left-aligned.
- Created `/src/app/blog/BlogClient.tsx` (client component) which renders: editorial hero (eyebrow `JOURNAL` + section-title `مدوّنة مريم` split gold/foreground + body-lg subtitle), category filter pills (`rounded-md`, active=`bg-primary`, inactive=`border border-border`), featured strip when category=null, post grid `sm:grid-cols-2 lg:grid-cols-3 gap-6`, PostCard with `aspect-[4/3]` cover (or gradient + PenSquare fallback), category eyebrow + Arabic date, `font-amiri text-xl` title, `text-sm text-muted-foreground line-clamp-2` excerpt, "اقرأ المزيد ←" link + read-time, `surface-card` + `lift-card` hover. Minimal empty state.
- Rebuilt `/src/app/gallery/page.tsx` as a server component. SSR-fetches published projects with images, flattens into `GalleryImage[]` (cover + per-project images), returns `{ images, projectCount }`. Renders Navbar + `<GalleryClient>` + Footer. Removed CursorGlow and decorative orbs.
- Rebuilt `/src/components/gallery/GalleryClient.tsx` (client component, now accepts `projectCount` prop): editorial hero (eyebrow `FULL GALLERY` + section-title `المعرض الكامل` + body-lg + stats line `X صورة في Y مشروع`), filter bar (category pills `rounded-md` + layout toggle `Columns3`/`LayoutGrid` + sort dropdown), count hairline, masonry (`columns-1 sm:columns-2 lg:columns-3 gap-4`) or grid layout, GalleryThumb with natural aspect + hover overlay caption + `MotifSvg` fallback for empty URLs, lightbox with hairline borders, top bar (eyebrow + counter + close), prev/next buttons (RTL: `ChevronRight`=prev, `ChevronLeft`=next), keyboard nav (Esc/arrows), info panel with title/description. No glassmorphism.
- Rebuilt `/src/app/booking/page.tsx` (client component): editorial hero (eyebrow `BOOK A SESSION` + section-title `احجزي جلسة تصوير` + body-lg), 2-col layout `lg:grid-cols-12` with form `lg:col-span-7` and info `lg:col-span-5`. Form uses underline-style inputs (`bg-transparent border-0 border-b border-border focus:border-primary`) for Name/Phone/Email/Service/Date/Location/Message, solid primary submit button "إرسال الطلب", success state with checkmark (primary-colored circle, hairline border) + WhatsApp reminder + new-booking reset. Info panel: WHAT TO EXPECT (3 items with Camera/Sparkles/Clock icons), RESPONSE TIME note, CONTACT info (phone/email/address/WhatsApp), portfolio link card. Uses `useLang()` for all strings, POSTs to `/api/bookings`. Removed CursorGlow and decorative orbs.
- All three pages use `const EASE = [0.22, 0.61, 0.36, 1] as const;`, framer-motion with `whileInView` reveal, `surface-card`/`lift-card`/`hairline` classes, `eyebrow`/`section-title`/`body-lg` typography, plain `<img loading="lazy" decoding="async" />`, `rounded-md` for pills (NOT `rounded-full`), neutral hairline borders, gold reserved for accent only.
- Verified `npx tsc --noEmit` passes with exit code 0 (no type errors).

Stage Summary:
- 4 files modified: `src/app/blog/page.tsx`, `src/app/gallery/page.tsx`, `src/components/gallery/GalleryClient.tsx`, `src/app/booking/page.tsx`.
- 1 file created: `src/app/blog/BlogClient.tsx`.
- All three sub-pages now match the cinematic quiet-luxury design language used by Hero/About/Portfolio: editorial left-aligned headers, gold as accent only, neutral hairlines, solid surface-card containers, generous whitespace, unified EASE motion.
- Blog: SSR + searchParams filter + PostCard grid with featured strip.
- Gallery: SSR + client filter/sort/layout + masonry/grid + clean lightbox with keyboard nav.
- Booking: client form with underline inputs + 2-col info panel + success state with WhatsApp reminder.
- No other files touched. TypeScript clean.

---
Task ID: luxury-about-portfolio-gallery
Agent: general-purpose
Task: Build About, Marquee, Portfolio, Gallery with luxury ivory design

Work Log:
- Read globals.css (design tokens, .eyebrow/.section-title/.display-heading/.body-lg/.text-gradient/.text-gold-gradient/.glass-dark/.image-luxury/.btn-luxury/.animate-marquee/.animate-slow-pulse/.no-scrollbar, EASE cubic-bezier(0.25,0.46,0.45,0.94)), Hero.tsx (EASE const, motion patterns, ambient-glow orbs at primary/5 + accent/5 blur-[150px]), Navbar.tsx (nav style), LanguageProvider (useLang() → {lang, t, toggle}), MotifSvg (fallback palette/motif), and worklog.md.
- Rebuilt About.tsx: section py-24 md:py-36 bg-background with ambient champagne top-right + rose bottom-left glow orbs (blur-[150px], animate-slow-pulse). Eyebrow "The Artist/الفنانة" with gold line. 2-col grid (lg:grid-cols-2 gap-12 lg:gap-20). LEFT: portrait aspect-[3/4] max-w-[480px] rounded-2xl shadow-2xl, decorative border frame -top-4 -right-4, floating glass-dark card bottom-right with italic quote "Light is my first language." RIGHT: display-heading two-line "Behind Every Frame, A Story Unfolds" (text-gradient on second line), body-lg paragraphs (aboutPara1/2), pull quote with border-r-2 border-primary/30 (RTL-correct), tags with ✦ separators, 4-stat grid (12+ Years / 500+ Projects / 15 Awards / 8 Countries) with lucide icons (CalendarDays, Camera, Award, Globe2), signature. Motion: x-offset entrance (lang-aware ±40), staggered stats with delay 0.3+i*0.08.
- Rebuilt Marquee.tsx: bg-primary text-primary-foreground py-8 overflow-hidden dir=ltr. Shimmer overlay white/[0.06] gradient on edges + top/bottom hairlines. Words looped 4× for seamless -50% marquee. Auto AR/EN font detection: Amiri for Arabic (/[\u0600-\u06FF]/), Cormorant_Garamond italic (via inline style var(--font-cormorant)) for English. Custom GoldStar SVG separator between words using text-accent (rose gold on champagne).
- Rebuilt Portfolio.tsx: section py-24 md:py-36 bg-background with ambient glows. Eyebrow "Selected Works" + section-title "معرض الأعمال" (text-gold-gradient on "الأعمال"). Filter pills rounded-full (active=bg-primary border-primary text-primary-foreground; inactive=border-border text-muted-foreground). Masonry columns-1 sm:columns-2 lg:columns-3 gap-5. Each card: rounded-2xl overflow-hidden, image-luxury hover, caption overlay from-black/80 gradient, font-amiri title, font-inter year eyebrow uppercase, category label, ★ Featured badge. Lightbox: fullscreen bg-background/95 backdrop-blur-md, glass-dark top bar (category + title + counter + close), prev/next glass-dark rounded-full buttons (RTL: prev=right-4 ChevronRight, next=left-4 ChevronLeft), AnimatePresence image swap, thumbnail strip (w-16 h-16 rounded-md, ring-primary when active), caption footer with title/description. Keyboard nav (Esc/arrows) + body scroll lock via useEffect cleanup.
- Created Gallery.tsx (NEW section): fetches /api/projects + /api/projects/[id]/images in parallel, collects cover + gallery images, slices first 8. Section py-24 md:py-36 bg-secondary (different bg from Portfolio). Eyebrow "Full Gallery" + section-title "المعرض الكامل" (text-gold-gradient). body-lg description. Header row with "View All / عرض الكل" btn-luxury button linking to /gallery with RTL-aware arrow (ArrowLeft in AR, ArrowRight in EN). Grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3. Each item: aspect-square rounded-lg overflow-hidden, image-luxury hover, hover caption overlay (font-amiri title + year eyebrow).
- Verified all four files use EASE=[0.25,0.46,0.45,0.94], plain <img loading="lazy" decoding="async"> (NOT next/image) with eslint-disable comments, framer-motion for animations, lucide-react for icons, useLang() for translations, Arabic RTL throughout.
- Ran `npx tsc --noEmit`. Result: only one pre-existing error in src/app/layout.tsx (Playfair_Display weight "300" not in allowed union "400"|"500"|"600"|"700"|"800"|"900"). This file was modified before this task by the luxury-ivory-rebuild branch (Cormorant_Garamond addition) and I did NOT touch it per the "DO NOT touch other files" constraint. All 4 of my files (About/Marquee/Portfolio/Gallery) type-check cleanly with zero errors.

Stage Summary:
- 4 files rebuilt/created: About.tsx (luxury 2-col with portrait+glass card+stats), Marquee.tsx (gold bar with star separators + shimmer), Portfolio.tsx (magazine masonry with glass-dark lightbox + thumbnail strip), Gallery.tsx (NEW bg-secondary 8-image teaser with View All CTA → /gallery).
- All use the luxury ivory design DNA: warm ivory bg, champagne gold + rose gold accents, ambient blur-[150px] glow orbs, glass-dark floating cards, rounded-2xl image containers, image-luxury hover, btn-luxury shimmer sweep, eyebrow+gold-line section pattern, text-gradient / text-gold-gradient on display headings.
- EASE=[0.25,0.46,0.45,0.94] used everywhere. Plain <img> with loading="lazy" decoding="async". useLang() for AR/EN switching. Arabic RTL preserved (RTL-correct prev/next arrows in lightbox, border-r-2 on pull quote).
- All 4 of my files pass TypeScript cleanly. The only tsc error is pre-existing in src/app/layout.tsx (invalid Playfair weight "300") — recommend surgical fix: change weight:["300","400","500","600","700"] → ["400","500","600","700"] in that file (NOT touched per task constraint).
- Gallery.tsx is NOT yet wired into src/app/page.tsx (per "DO NOT touch other files" constraint) — user can add <Gallery /> after <Portfolio /> when ready.

---
Task ID: luxury-services-testimonials-contact-footer
Agent: general-purpose
Task: Build Services, Testimonials, Contact, Footer with luxury ivory design

Work Log:
- Read globals.css (design tokens + utilities incl. .eyebrow/.section-title/.body-lg/.text-gradient/.text-gold-gradient/.glass/.glass-dark/.surface-card/.glass-card/.gold-rule/.hairline/.lift-card/.btn-luxury/.image-luxury/.ambient-glow/.animate-slow-pulse/.motion-ease/.no-scrollbar, EASE cubic-bezier(0.25,0.46,0.45,0.94)), Hero.tsx (EASE const, ambient-glow orbs at primary/5 + accent/5 blur-[150px], motion patterns), About.tsx (section structure: eyebrow+gold-line → section-title → body-lg; x-offset entrance lang-aware), LanguageProvider (useLang → {lang, t, setLang, toggle}), existing Services/Testimonials/Contact/Footer (replaced), API routes for services/testimonials/contact-messages/projects (shapes confirmed), defaultData.ts (default Service/Testimonial shapes), Portfolio.tsx (reference for lightbox pattern + RTL-correct arrows + AnimatePresence). Confirmed page.tsx wires <Services/><Testimonials/><Contact/><Footer/> already.
- Rebuilt Services.tsx: section py-24 md:py-36 bg-background border-t border-border with ambient champagne top-right + rose bottom-left glow orbs (blur-[150px], animate-slow-pulse). Eyebrow "Services & Packages" + section-title "خدمات التصوير" (text-gold-gradient on "التصوير") + body-lg description. Grid grid sm:grid-cols-2 lg:grid-cols-4 gap-5. Each card p-7 rounded-2xl lift-card flex flex-col: featured uses glass-dark + border-primary/30 + ambient-glow (dark glass with white text); non-featured uses surface-card (light card with foreground text). Featured ribbon top-left "المميزة". Icon w-14 h-14 rounded-full bg-primary/10 border border-primary/20. eyebrow titleEn + font-amiri titleAr. font-display price text-gradient (dir=ltr). duration as font-inter uppercase eyebrow. gold-rule divider. Features list with Check icons (text-primary, strokeWidth=2). btn-luxury CTA "احجزي الآن" rounded-full with ArrowLeft (RTL-forward). Bottom note with custom GoldStar SVG (✦-style star) flanking the customization note. Service type properly extended with optional `published` field.
- Rebuilt Testimonials.tsx: section py-24 md:py-36 bg-secondary (different bg from Services). Centered eyebrow "Client Voices" with w-12 h-px gold lines on BOTH sides. Centered section-title "آراء العملاء". Fetches /api/testimonials + /api/projects in parallel. Carousel: ONE testimonial at a time using AnimatePresence mode="wait" with custom slide variants (enter/center/exit + direction-aware x-offset 60). Auto-advance every 6.5s with pausedRef on hover. Card: glass-dark rounded-3xl overflow-hidden. If has imageData → grid-cols-1 md:grid-cols-5 (image col-span-2 with aspect-[4/5] / md:min-h-[420px]; content col-span-3). If no image → centered single column max-w-3xl mx-auto p-8 md:p-14 text-center. Both layouts: Quote icon (lucide) + rating stars (Star fill-primary) + font-amiri quote in «guillemets» + gold-rule + author row (avatar circle with font-amiri initials OR avatar image) + roleEn eyebrow + green BadgeCheck verified badge if has image. Navigation: prev/next glass-dark rounded-full w-11 h-11 buttons (RTL-correct: prev=right ChevronRight, next=left ChevronLeft). Dots row (active=w-8 bg-primary, inactive=w-2 bg-border) + counter "01 / 03" font-inter dir=ltr. Stats bar mt-16 grid grid-cols-2 lg:grid-cols-4 gap-4: 4 glass-card rounded-2xl p-6 lift-card with gold numbers (text-gold-gradient font-display text-3xl) — clients (derived from projects.length*30, min 120+), albums (projects.length, fallback 4), avg rating (computed from testimonials.rating, toFixed(1)), awards (+15). Icons: Users, Camera, Sparkles, Award. Lightbox: AnimatePresence overlay bg-background/95 backdrop-blur-md with rounded-lg image, X close button top-left, escape key + body scroll lock via useEffect cleanup.
- Rebuilt Contact.tsx: section py-24 md:py-36 bg-background border-t border-border. Ambient glows (champagne top-right, rose bottom-left, blur-[150px]). Eyebrow (contactSubtitleEn from settings) + section-title "لنبدأ حكايتك" (text-gold-gradient on "حكايتك") + body-lg. Fetches /api/settings + /api/services in parallel (services used for pill selectors). 2-col grid lg:grid-cols-12: LEFT lg:col-span-5 = 4 glass-card rounded-2xl p-5 lift-card info rows (Email mailto, Phone tel, Address, Studio Hours) each with w-11 h-11 rounded-full bg-primary/10 border border-primary/20 icon circle (Mail/Phone/MapPin/Clock), group-hover swaps to bg-primary; + row of 3 social glass-circle icons (Instagram/WhatsApp/Mail). RIGHT lg:col-span-7 = glass-dark rounded-3xl p-8 md:p-10 form with inner ambient glow top-right. Fields: grid sm:grid-cols-2 (name + phone required), email (optional) full-width, service type as pill selectors (fetched from /api/services titles + "Other" appended; active=bg-primary border-primary text-primary-foreground; inactive=border-white/15 text-white/70), message textarea (required). Inputs: rounded-xl bg-white/5 border border-white/15 text-white placeholder:text-white/35 focus:border-primary focus:bg-white/10 transition-colors. Error state via AnimatePresence with AlertCircle icon. Submit btn-luxury w-full py-4 px-6 rounded-full with Send/Loader2/Check icon swap (sending/sent states); sent state shows green bg + "تم الإرسال بنجاح" + thank-you note. POSTs name/phone/email/service/message to /api/contact-messages. Email field typed as `email` + `dir=ltr text-right` for proper RTL display.
- Rebuilt Footer.tsx: bg-background border-t border-border with gold-rule at very top + ambient glow top-center (blur-[150px]). Decorative wordmark: absolute inset-x-0 bottom-0 flex justify-center, font-amiri text-foreground/[0.04] (4% opacity) with inline style fontSize clamp(8rem, 22vw, 20rem) + translate-y-[28%] for crop. Main grid lg:grid-cols-12: LEFT lg:col-span-5 brand block — rotating logo mark (motion.div animate rotate:360 over 30s linear infinite) with concentric rings (border-primary/30 solid outer + border-dashed border-primary/40 inner) + center font-amiri initial letter; brand name (siteNameAr) + "Visual Storyteller" eyebrow; description (footerDesc); 3 social glass-circle icons (Instagram/WhatsApp/Mail). RIGHT lg:col-span-7 grid sm:grid-cols-3 gap-8 = 3 link columns (Explore / Services / Connect) each with eyebrow heading + gold line + list of links with ✦ bullet markers that turn gold on hover. Hairline divider before bottom bar. Bottom bar: copyright (footerCopyright) + "Crafted in Sana'a" eyebrow + developer signature "وسيم الزبيري" with Heart icon (accent rose-gold color, fill on hover) linking to wa.me/967778140990 + back-to-top button (group-hover swaps border→primary, bg→primary, text→primary-foreground) with ArrowUp in w-8 h-8 rounded-full.
- Verified all 4 files use EASE=[0.25,0.46,0.45,0.94], plain <img loading="lazy" decoding="async"> with eslint-disable comments (NOT next/image), framer-motion for animations, lucide-react for icons, useLang() for AR/EN translations, Arabic RTL throughout. Featured Service card correctly inverts text colors (white on dark glass-dark). Testimonials carousel correctly handles single-testimonial edge case (no nav buttons rendered). Contact form correctly handles error/success/sending/loading states.
- Ran `npx tsc --noEmit`. Result: EXIT 0 — zero errors. All 4 files (Services/Testimonials/Contact/Footer) and the entire codebase type-check cleanly. The previous pre-existing tsc error in src/app/layout.tsx (invalid Playfair weight "300") appears to have been fixed in an earlier branch — no longer present.

Stage Summary:
- 4 files rebuilt: Services.tsx (luxury 4-col card grid with featured glass-dark cards + ambient-glow), Testimonials.tsx (carousel with auto-advance + RTL-aware prev/next + dots + counter + 4-stat glass cards bar + lightbox), Contact.tsx (5+7 grid: glass-card info rows + glass-dark form with pill selectors + 3 submit states), Footer.tsx (5+7 grid: rotating logo mark + 3 link columns + decorative 4%-opacity giant wordmark + developer signature + back-to-top).
- All use luxury ivory DNA: warm ivory bg (#fdfbf8), champagne gold (#c9a96e) + rose gold (#b76e79) accents, ambient blur-[150px] glow orbs, glass-dark floating cards for dramatic contrast, glass-card light chips for info rows, gold-rule dividers, lift-card hover (translateY -6px), btn-luxury shimmer sweep on CTAs, image-luxury hover, eyebrow+gold-line section pattern, text-gradient / text-gold-gradient on display headings, font-amiri for Arabic display, font-display (Playfair) for prices, font-inter for uppercase labels.
- EASE=[0.25,0.46,0.45,0.94] used in every motion transition. Plain <img> with loading="lazy" decoding="async". useLang() for AR/EN switching. Arabic RTL preserved (RTL-correct prev/next arrows in testimonials carousel, dir=ltr on prices/phone/email counters, dir=rtl on developer signature).
- `npx tsc --noEmit` passes with EXIT 0 — zero errors across all 4 rebuilt files and the entire codebase.

---
Task ID: admin-complete-control
Agent: general-purpose
Task: Complete admin panel upgrade — full control over all content

Work Log:
- Read all reference files: api/settings/route.ts (allowed fields), admin/layout.tsx (sidebar nav), admin/hero/page.tsx (missing image upload), admin/about/page.tsx (image upload pattern), admin/projects/page.tsx (cover + gallery image upload pattern), components/admin/Fields.tsx (Field, TextAreaField, SaveButton, SectionCard, Toast), components/admin/ConfirmDialog.tsx (confirm dialog), lib/imageCompress.ts (formatFileSize helper), api/upload/route.ts (POST FormData with "file"), api/delete-image/route.ts (POST { url }). Also read all 11 admin pages (services, testimonials, contact, settings, blog, bookings, messages, dashboard) and all 8 public section components (Hero, About, Marquee, Portfolio, Services, Testimonials, Contact, Footer).
- Verified admin pages: about (✓ has portrait upload + all 7 text fields + philosophy cards CRUD), projects (✓ has cover upload + gallery upload + all fields + 3 ConfirmDialogs), services (✓ all fields incl features editor + icon picker + color picker + toggles, no image upload needed), testimonials (✓ has imageData upload + all fields + Stars rating + ConfirmDialogs), contact (✓ all 9 contact/footer fields), settings (✓ section titles for portfolio/services/testimonials + primaryColor/backgroundColor with ColorField swatch), blog (✓ cover image upload + all fields incl slug auto-gen + readTime auto-calc + ConfirmDialogs), bookings (✓ list + status filter + update status + delete + WhatsApp reply + ConfirmDialog), messages (✓ list + mark read + delete + WhatsApp reply + filter + ConfirmDialog), dashboard (✓ 5 stat cards + quick actions + recent activity feed). All admin pages functional — no fixes required.
- Rewrote /admin/hero/page.tsx to ADD missing image upload section for heroImageData. New features: (1) Image upload section at the top of the form (before text fields) with preview, swap button, delete button (via ConfirmDialog), upload state with Loader2 spinner; (2) Hero stats fields already existed (heroStat1Num/Label, heroStat2Num/Label, heroStat3Num/Label) — verified intact; (3) marqueeWords field already existed — verified intact; (4) heroImageData field added to Settings type with null-coalesced default; (5) upload persists URL immediately via PUT /api/settings so public site reflects change without explicit Save; (6) delete cleans up Vercel Blob via /api/delete-image; (7) uses formatFileSize for upload feedback, ConfirmDialog for delete confirmation — matches the about page pattern.
- Updated src/components/sections/Hero.tsx to DISPLAY heroStat1-3 from settings (was previously fetched by admin but never rendered in public Hero). Added stats array built from heroStat1Num/Label, heroStat2Num/Label, heroStat3Num/Label — filtered to only include entries with a value. Added new motion.div block above the scroll indicator rendering the stats horizontally with white/15 vertical dividers between entries. Stats only render if at least one has a value (hasStats guard). Preserved all existing Hero layout (eyebrow, massive name, tagline, description, CTAs, scroll indicator, side Est. 2018 decoration).
- Updated src/components/sections/About.tsx to USE aboutTitleAr and aboutSubtitleEn from settings (previously fetched but never rendered). Replaced hardcoded eyebrow `t("الفنانة", "The Artist")` with `s.aboutSubtitleEn` (with fallback to old hardcoded). Replaced hardcoded two-line display heading `t("خلف كل إطار", "Behind Every Frame,")` + `t("حكاية تُروى", "A Story Unfolds")` with two-tone split of `s.aboutTitleAr`: splits at last whitespace so first part renders in `text-foreground` and last word in `text-gradient` — preserves the original two-line block design. Falls back to old hardcoded text if aboutTitleAr is empty. Kept aboutHeadingAr blockquote, aboutPara1/2, aboutTags, aboutSignature, aboutImageData all reading from settings (already correct).
- Updated src/components/sections/Portfolio.tsx to READ portfolioTitleAr + portfolioSubtitleEn from /api/settings. Added SectionSettings type + sectionSettings state + settings fetch in useEffect. Replaced hardcoded `t("Selected Works", "Selected Works")` eyebrow with `sectionSettings.portfolioSubtitleEn` (fallback to old text). Replaced hardcoded two-tone `<span>معرض</span> <span class="gold-gradient">الأعمال</span>` heading with two-tone split of `portfolioTitleAr` (same split-at-last-space pattern as About).
- Updated src/components/sections/Services.tsx to READ servicesTitleAr + servicesSubtitleEn from /api/settings. Same pattern: SectionSettings type + state + fetch + two-tone split of servicesTitleAr for heading + servicesSubtitleEn for eyebrow, with fallbacks to old hardcoded "خدمات التصوير" / "Services & Packages".
- Updated src/components/sections/Testimonials.tsx to READ testimonialsTitleAr + testimonialsSubtitleEn from /api/settings. Added settings fetch in the existing Promise.all (parallel with testimonials + projects). Same two-tone split pattern for the centered heading. Replaced hardcoded `t("Client Voices", "Client Voices")` eyebrow with `sectionSettings.testimonialsSubtitleEn` fallback. Replaced hardcoded `<span>آراء</span> <span class="gold-gradient">العملاء</span>` heading with two-tone split of `testimonialsTitleAr`.
- Updated src/components/sections/Contact.tsx to READ contactTitleAr from settings for the section heading (was previously fetched but never rendered — eyebrow already used contactSubtitleEn correctly). Replaced hardcoded two-tone `<span>لنبدأ</span> <span class="gold-gradient">حكايتك</span>` heading with two-tone split of `s.contactTitleAr` (fallback to "لنبدأ حكايتك").
- Verified Marquee.tsx already correctly reads marqueeWords from settings with default fallback. Verified Footer.tsx already correctly reads siteNameAr + footerDesc + footerCopyright + contactInstagram + contactWhatsapp + contactEmail from settings with default fallbacks. No changes needed for these two.
- Ran `npx tsc --noEmit` after each set of changes — EXIT 0 every time, zero TypeScript errors across all modified files (hero admin page + Hero.tsx + About.tsx + Portfolio.tsx + Services.tsx + Testimonials.tsx + Contact.tsx) and the entire codebase.

Stage Summary:
- 1 admin page rewritten: /admin/hero/page.tsx — added full heroImageData upload section (preview + swap + delete via ConfirmDialog + upload state spinner + immediate persist via PUT /api/settings + Vercel Blob cleanup via /api/delete-image). All pre-existing fields (site identity, hero content, hero stats 1-3, marquee words) preserved and verified.
- 6 public section components updated to read all required settings fields from /api/settings:
  - Hero.tsx: now displays heroStat1-3 (3-stat horizontal bar with dividers, hidden if no stats set)
  - About.tsx: now uses aboutTitleAr (two-tone split heading) + aboutSubtitleEn (eyebrow) — previously fetched but never rendered
  - Portfolio.tsx: now uses portfolioTitleAr (two-tone heading) + portfolioSubtitleEn (eyebrow)
  - Services.tsx: now uses servicesTitleAr (two-tone heading) + servicesSubtitleEn (eyebrow)
  - Testimonials.tsx: now uses testimonialsTitleAr (two-tone heading) + testimonialsSubtitleEn (eyebrow)
  - Contact.tsx: now uses contactTitleAr (two-tone heading) — eyebrow already used contactSubtitleEn
- All section headings preserve the original two-tone design pattern (first part in `text-foreground`, last word in `text-gold-gradient` / `text-gradient`) via split-at-last-whitespace helper. Fallbacks to original hardcoded text ensure no visual regression when settings fields are empty.
- All 10 other admin pages (about, projects, services, testimonials, contact, settings, blog, bookings, messages, dashboard) verified complete and functional — no fixes required.
- All image uploads go through /api/upload (FormData with "file"), all deletions through /api/delete-image (POST { url }) with Vercel Blob URL safety check, all upload feedback uses formatFileSize, all deletions use ConfirmDialog where appropriate.
- `npx tsc --noEmit` passes with EXIT 0 — zero errors. Arabic RTL preserved throughout. No existing functionality broken.
