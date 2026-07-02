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
