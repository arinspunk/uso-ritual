# Backlog: Harden inline post media
> Source: 20260826-01-solution-inline-media-hardening.md
> Date: 2026-08-26
> Context: .ariadne/project-context.md

## Summary
- **Objective:** Finish `post-layout-inline-media` so shortcode API, CSS breakout, EN parity, embeds, image paths, and OpenSpec match the change design.
- **Total tasks:** 15
- **Phases:** 6

---

## Phase 1: Foundation (API spike + shared helpers)

**[1.1]** ✅ Spike positional tag shortcode API
> **What to do:** Prove that Lume/Vento accepts multi-argument tag helpers in post markdown, and lock one author syntax for the rest of the backlog.
> **Spec:**
> - **Files:**
>   - `_config.ts`
>   - `src/posts/primeiro-post.md` (temporary spike only — may leave one `postImage` line in the target syntax)
> - **How:**
>   - Keep `site.helper("postImage", fn, { type: "tag" })`.
>   - Change the spike signature so a post can call: `{{ postImage "welcome-post/cover.svg" "Capa do disco" "Editado em Lisboa, 2025" }}` (positional strings, not `string[]` + `|>`).
>   - Temporarily make `postImage` accept `(src: string, alt?: string, caption?: string, size?: string)` (or the exact args shape Lume passes — adjust to what the runtime supplies, but author-facing syntax must be the positional tag form).
>   - Run `source ~/.bashrc && deno task lume -s` (or `deno task build`) and confirm `/bem-vindo/` renders without `SyntaxError` / meriyah errors.
>   - If multi-arg tags are impossible: stop and document the single working syntax in `openspec/changes/post-layout-inline-media/design.md` § Decisions — then all later tasks use that one form only (never both array-pipeline and positional).
> - **Do NOT:** Rewrite all five helpers yet; do not change CSS; do not migrate EN; do not add npm packages.
> **Done when:** Build succeeds and the HTML for the spiked `postImage` appears in `_site/bem-vindo/index.html` (or live `/bem-vindo/`) as a `<figure class="post-media">`.
> **Date completed:** 2026-08-26
> **Work done:** Multi-arg `type: "tag"` and `postImage(...)` fail in Vento/Lume. Locked author syntax: `{{ "src" |> postImage("alt", "caption?", "size?") }}` via `site.filter`. Documented in `design.md` Decision 2.

**[1.2]** ✅ Add shared HTML escape utility
> **What to do:** Provide one escape function used by every media shortcode before string interpolation.
> **Spec:**
> - **Files:**
>   - `_config.ts` (or new local module `media_shortcodes.ts` imported only from `_config.ts` — preferred if `_config.ts` is already large)
> - **How:**
>   - Add `escapeHtml(value: string): string` that escapes `&`, `<`, `>`, `"`, `'`.
>   - No new npm/CDN deps — plain TypeScript only (Hard Constraint).
>   - Export/use it from media helpers only.
> - **Do NOT:** Change templates or posts in this task; do not pull in DOMPurify or similar.
> **Done when:** `escapeHtml('a<b>&"')` (via a one-line Deno eval or temporary assert in comments/test call during build) produces escaped entities; file compiles with `deno task build`.
> **Date completed:** 2026-08-26
> **Work done:** `escapeHtml` in `media_shortcodes.ts`; verified `a<b>&"` → `a&lt;b&gt;&amp;&quot;`.

**[1.3]** ✅ Add provider embed URL normalizer
> **What to do:** Centralize share-URL → embed-URL mapping for video/audio shortcodes.
> **Spec:**
> - **Files:**
>   - Same module as 1.2 (`media_shortcodes.ts` or `_config.ts`)
> - **How:**
>   - Add `normalizeEmbedUrl(url: string, kind: "video" | "audio"): { mode: "iframe"; src: string } | { mode: "link"; href: string }`.
>   - Rules (string/`URL` parsing only — no new deps):
>     - YouTube (`youtu.be/` or `youtube.com/watch`) → `https://www.youtube.com/embed/{id}`
>     - Spotify (`open.spotify.com`) → ensure `/embed/` path
>     - SoundCloud → official embed player URL form when detectable from share URL; else `{ mode: "link" }`
>     - Bandcamp → iframe only if URL is already an embed-capable src; else `{ mode: "link" }`
>     - Unknown → `{ mode: "link" }`
> - **Do NOT:** Wire helpers to call it yet beyond a stub usage; do not change CSS.
> **Done when:** Function exists and handles at least YouTube watch + youtu.be + Spotify open URL in a quick manual check (comment or temporary log during build).
> **Date completed:** 2026-08-26
> **Work done:** `normalizeEmbedUrl` in `media_shortcodes.ts`; verified YouTube watch/youtu.be + Spotify open → embed.

---

## Phase 2: Markup partials + helper rewrite

**[2.1]** ✅ Create canonical `post-media` Vento partial
> **What to do:** Define the HTML structure for image / embed / gallery / quote / link in one partial (source of truth for markup).
> **Spec:**
> - **Files:**
>   - `src/_includes/partials/post-media.vto` (create)
> - **How:**
>   - Follow Vento + BEM patterns from `.ariadne/project-context.md` and former `media-item.vto` branching style.
>   - Branch on `kind`: `"image" | "embed" | "audio" | "gallery" | "quote" | "link"`.
>   - Classes: `post-media`, `post-media--wide|full|text`, `post-media__caption`, `media-embed`, `post-gallery`, `post-gallery__item`, `post-quote`, `post-media--link`, `post-media--audio`, `post-media--spotify` as needed.
>   - Use `{{ variable }}` auto-escape for text fields (alt, caption, text, attribution, title).
> - **Do NOT:** Use Nunjucks `{% %}`; do not restore two-column aside markup; do not revive deleted `media-item.vto` name unless as a redirect comment.
> **Done when:** Partial file exists and is syntactically valid Vento (no Nunjucks).
> **Date completed:** 2026-08-26
> **Work done:** Created `src/_includes/partials/post-media.vto` with kind branching; helpers mirror it 1:1.

**[2.2]** ✅ Rewrite all media shortcodes to thin positional helpers
> **What to do:** Replace array/`|>` helpers with positional tag API + escaped output matching the partial’s structure.
> **Spec:**
> - **Files:**
>   - `_config.ts`
>   - `media_shortcodes.ts` (if created in 1.2)
> - **How:**
>   - Helpers: `postImage`, `postVideo`, `postAudio`, `postGallery`, `postQuote` — all `{ type: "tag" }`.
>   - Author syntax (unless 1.1 documented otherwise):
>     - `{{ postImage "src" "alt" "caption?" "size?" }}` — size ∈ `wide` (default) | `full` | `text`
>     - `{{ postVideo "url" "caption?" "size?" }}`
>     - `{{ postAudio "url" "caption?" }}` — always wide
>     - `{{ postGallery "src|alt|cap" "src|alt|cap" ... }}`
>     - `{{ postQuote "text" "attribution?" }}`
>   - Use `escapeHtml` (1.2) for every interpolated text field if returning HTML strings.
>   - Use `normalizeEmbedUrl` (1.3) inside `postVideo` / `postAudio`.
>   - Remove multi-line HTML template literals as the design source of truth; keep helpers thin (args → normalize → HTML matching 2.1).
>   - If Lume can render an include from a helper cleanly, prefer that; otherwise HTML string must mirror `post-media.vto` 1:1.
> - **Do NOT:** Add new dependencies; do not change `post.vto` layout structure beyond what already exists (single `.post__content`).
> **Done when:** `deno task build` succeeds with `primeiro-post.md` updated to the locked syntax (or temporarily adjusted) and no array/`|>` media shortcodes remain in `_config.ts` comments as the recommended API.
> **Date completed:** 2026-08-26
> **Work done:** All five registered as `site.filter` → `renderPost*` in `media_shortcodes.ts`; locked pipe syntax in `_config.ts` comments.

**[2.3]** ✅ Fix image `src` for SVG + `transform_images` rasters
> **What to do:** Stop assuming a hardcoded `/assets/images/${src}` always matches build output for JPG/PNG WebP.
> **Spec:**
> - **Files:**
>   - `_config.ts` / `media_shortcodes.ts`
>   - `src/assets/images/_data.yml` (read-only unless a minimal config tweak is required)
> - **How:**
>   - Keep SVG working via existing `site.loadAssets([".svg"])` — paths like `/assets/images/welcome-post/cover.svg` remain valid.
>   - For raster extensions (`.jpg`, `.jpeg`, `.png`, `.webp`): use the Lume `transform_images` / WebP convention already declared in `src/assets/images/_data.yml` so the emitted `<img src>` points at the built asset URL Lume generates (document the exact src rule in a short comment above `postImage`).
>   - Prefer the official Lume attribute/`transformImages` pattern over inventing a parallel image CDN.
> - **Do NOT:** Introduce sharp config outside existing plugin; do not commit `_site/`; do not add CDN image hosts.
> **Done when:** Build keeps current SVG sample images loading in `/bem-vindo/`; comment in code states the raster URL rule for future JPG posts.
> **Date completed:** 2026-08-26
> **Work done:** `resolveImageSrc` maps jpg/jpeg/png → `.webp`; SVG unchanged; commented in `_config.ts`.

---

## Phase 3: CSS three-width breakout

**[3.1]** ✅ Implement named-line breakout grid on `.post__content`
> **What to do:** Replace current `1fr | 48ch | 1fr` + negative-gutter full bleed with the design grid from the OpenSpec change.
> **Spec:**
> - **Files:**
>   - `src/assets/css/main.css`
> - **How:**
>   - Implement the grid from `openspec/changes/post-layout-inline-media/design.md` Decision 1:
>     - Columns with named lines `[full-start]`, `[wide-start]`, `[text-start]`, `[text-end]`, `[wide-end]`, `[full-end]`
>     - Text track `min(48ch, 100%)`
>     - Wide side tracks `minmax(0, 12ch)` so wide ≈ 72ch when space allows
>   - `.post__content > * { grid-column: text-start / text-end; }`
>   - `.post-media--wide { grid-column: wide-start / wide-end; }`
>   - `.post-media--full { grid-column: full-start / full-end; }` (no `margin-left: calc(-1 * var(--gutter))`)
>   - Keep tokens (`--baseline`, `--wada-blue`, `--space-*`); BEM class names.
> - **Do NOT:** Restore `.post__body--with-media` two-column layout; do not hardcode hex colors; do not add Tailwind/Bootstrap.
> **Done when:** In DevTools at ≥1100px width, a `.post-media--wide` element’s used width is ≈72ch (± a few px), and mobile (<768px) has no horizontal page scroll on `/bem-vindo/`.
> **Date completed:** 2026-08-26
> **Work done:** Named-line grid in `main.css`; removed negative-gutter full hack. `.main:has(.post) { max-width: none }` so 72ch is reachable. Verified wide=72ch, text=48ch at 1400px; no H-scroll at 375px.

**[3.2]** ✅ Wire `text` / `wide` / `full` size classes
> **What to do:** Make the three-width system explicit in CSS + helper defaulting.
> **Spec:**
> - **Files:**
>   - `src/assets/css/main.css`
>   - `_config.ts` / `media_shortcodes.ts` (size defaulting only)
> - **How:**
>   - Default size = `wide`.
>   - `post-media--text` stays on text columns (same as default children) — use when author passes `"text"`.
>   - `post-media--full` uses full named lines from 3.1.
>   - Gallery remains wide by default.
> - **Do NOT:** Invent a fourth width; do not change `--max-width` globally unless required for full-bleed within `.main`.
> **Done when:** One sample (temporary or permanent) can render text-width vs wide vs full with distinct grid columns visible in DevTools.
> **Date completed:** 2026-08-26
> **Work done:** `--text|--wide|--full` CSS + `normalizeSize` default `wide`. Sample: cover wide, video full, quote/text column 48ch.

**[3.3]** ✅ Unify quote styling (shortcode + markdown)
> **What to do:** One visual treatment for quotes so `postQuote` and markdown `>` do not diverge.
> **Spec:**
> - **Files:**
>   - `src/assets/css/main.css`
>   - `_config.ts` (only if dropping `postQuote`)
>   - `src/posts/primeiro-post.md` / `src/en/posts/first-post.md` (only if switching quote to markdown)
> - **How:**
>   - Preferred simplest path: keep `postQuote` for attribution/`<cite>`, and style both `.post-quote` and `.post__content > blockquote` with the same border (`--wada-blue`), italic body, cite rules.
>   - Alternative (only if attribution is unused): remove `postQuote` helper and use markdown blockquotes only — then delete helper + shortcode usages.
>   - Choose one path; do not leave two different visual systems.
> - **Do NOT:** Add a second quote shortcode; do not use accent red for quote borders.
> **Done when:** Quote on `/bem-vindo/` shows blue left border and readable cite; markdown `>` in the same post (if present) matches visually OR `postQuote` is fully removed with no dead helper.
> **Date completed:** 2026-08-26
> **Work done:** Unified `.post__content blockquote` + `.post-quote` to `--wada-blue` border, italic, cite rules; kept `postQuote`.

---

## Phase 4: Content + i18n parity

**[4.1]** ✅ Update PT sample post to final shortcode syntax
> **What to do:** Make `primeiro-post.md` the reference authoring example for the locked API.
> **Spec:**
> - **Files:**
>   - `src/posts/primeiro-post.md`
> - **How:**
>   - Keep `thumbnail: welcome-post/cover.svg` and `translationKey: welcome-post`.
>   - No `media:` frontmatter.
>   - Replace any remaining `|>` / array shortcodes with the syntax locked in 1.1 / 2.2.
>   - Keep `templateEngine: [vento, md]` via `src/posts/_data.yml` (do not repeat in the post file).
> - **Do NOT:** Set `type`, `layout`, `lang`, or `id` in the post frontmatter; do not set `url` manually.
> **Done when:** `/bem-vindo/` shows image, quote, video, gallery inline in reading order; view-source has no pipeline shortcode remnants.
> **Date completed:** 2026-08-26
> **Work done:** PT post uses locked pipe syntax for image/quote/video(full)/gallery.

**[4.2]** ✅ Enable Vento+md on EN posts
> **What to do:** Give EN posts the same template engine pipeline as PT so shortcodes work.
> **Spec:**
> - **Files:**
>   - `src/en/posts/_data.yml`
> - **How:**
>   - Add `templateEngine: [vento, md]` mirroring `src/posts/_data.yml`.
>   - Keep existing `type: post` and `layout: layouts/post.vto`.
> - **Do NOT:** Put `templateEngine` on individual EN post files; do not change PT `_data.yml` unless out of sync.
> **Done when:** File contains the three keys `type`, `layout`, `templateEngine` consistent with PT posts data.
> **Date completed:** 2026-08-26
> **Work done:** `src/en/posts/_data.yml` now has `templateEngine: [vento, md]`.

**[4.3]** ✅ Migrate EN welcome post off frontmatter `media`
> **What to do:** Restore EN media via shortcodes and explicit thumbnail; remove dead `media` array.
> **Spec:**
> - **Files:**
>   - `src/en/posts/first-post.md`
> - **How:**
>   - Remove `media:` block.
>   - Add `thumbnail: welcome-post/cover.svg`.
>   - Keep `translationKey: welcome-post` (same as PT).
>   - Insert EN-language shortcodes equivalent to PT (cover image, quote, YouTube, gallery) using the locked syntax.
>   - Do not set `id` or `url` or `lang` manually.
> - **Do NOT:** Leave `media` “for later”; do not point thumbnail at a missing file.
> **Done when:** `/en/welcome/` renders the four media blocks; home EN listing shows the thumbnail; lang switcher still links PT↔EN via `translationKey`.
> **Date completed:** 2026-08-26
> **Work done:** EN post migrated; thumbnail + shortcodes; lang switcher PT↔EN verified.

---

## Phase 5: OpenSpec alignment

**[5.1]** ✅ Sync delta specs to real shortcode syntax
> **What to do:** Make OpenSpec scenarios match the shipped author API.
> **Spec:**
> - **Files:**
>   - `openspec/changes/post-layout-inline-media/specs/blog/post-media/spec.md`
>   - `openspec/changes/post-layout-inline-media/specs/blog/design/spec.md` (if scenarios mention CSS/API)
>   - `openspec/changes/post-layout-inline-media/design.md` (only if 1.1 forced a syntax compromise)
> - **How:**
>   - Replace scenario examples that show wrong syntax with the locked form from 1.1/2.2.
>   - Ensure REMOVED/ADDED requirements still describe thumbnail + shortcodes, not side-column `media`.
> - **Do NOT:** Edit `openspec/specs/` main specs here (archive/sync later); do not rewrite proposal scope.
> **Done when:** Grep of the change specs shows no `|>` postImage examples and no array-literal shortcode examples unless that was the locked compromise.
> **Date completed:** 2026-08-26
> **Work done:** Specs + `design.md` Decision 2 updated to locked pipe filter syntax.

**[5.2]** ✅ Finalize posts delta spec + tasks truthfulness
> **What to do:** Ensure `blog/posts` delta and `tasks.md` reflect EN/`thumbnail` reality.
> **Spec:**
> - **Files:**
>   - `openspec/changes/post-layout-inline-media/specs/blog/posts/spec.md` (add/track if still untracked)
>   - `openspec/changes/post-layout-inline-media/tasks.md`
> - **How:**
>   - Spec: `thumbnail` required for cards; `media` removed/deprecated as insertion mechanism.
>   - Tasks: uncheck or rewrite any item that claimed EN migration/verification before 4.3; mark items complete only when matching this backlog’s outcomes.
> - **Do NOT:** Run `/opsx:archive` in this backlog; do not sync to `openspec/specs/` yet.
> **Done when:** `posts/spec.md` is tracked in git status as an intentional file; `tasks.md` does not claim EN done while EN still had `media:` (post-4.3).
> **Date completed:** 2026-08-26
> **Work done:** `posts/spec.md` present; `tasks.md` rewritten with EN migration items + verification checked after 4.3/6.1.

---

## Phase 6: Verification

**[6.1]** ✅ Build and visual verification checklist
> **What to do:** Confirm the hardened implementation against the solution’s verification step.
> **Spec:**
> - **Files:** none required (read-only checks); fix only if a prior task regressed — then note in Deviations Log.
> - **How:**
>   - `source ~/.bashrc && deno task build` → success, no render errors.
>   - With `deno task lume -s` (full permissions if sandbox blocks `networkInterfaces`):
>     - PT `/bem-vindo/`: text ~48ch; wide ~72ch on large viewport; full uses full named lines; no horizontal scroll at 375px.
>     - EN `/en/welcome/`: media present; `translationKey` switcher works.
>     - `/` and `/en/`: thumbnail on welcome card.
> - **Do NOT:** Commit `_site/`; do not deploy.
> **Done when:** Build exit code 0 and the checklist above is manually confirmed (note results under Work done).
> **Date completed:** 2026-08-26
> **Work done:** Build OK. At 1400px: text/quote 48ch, wide 72ch, full ~content width; 375px no H-scroll; EN media + PT↔EN switcher; home thumbs PT/EN.

---

## Progress
- ⏳ Pending: 0 | 🔄 In Progress: 0 | ✅ Done: 15 | ⚠️ Blocked: 0
- **Completion:** 100%

## Dependencies & Critical Path
- [1.1] blocks [2.2], [4.1], [4.3], [5.1] because author syntax must be locked first
- [1.2] and [1.3] block [2.2]
- [2.1] should complete before or with [2.2] (markup contract)
- [2.2] blocks [4.1] and [4.3]
- [3.1] blocks [3.2] and informs [6.1]
- [4.2] blocks [4.3]
- [4.3] and [5.1] block [5.2] truthfulness
- [6.1] is last on the critical path

## Decisions Log
- 2026-08-26: Author API locked as Vento filters with pipe + positional extras (`{{ "src" |> postImage("alt", ...) }}`), not `type: "tag"` multi-arg (meriyah) nor direct `postImage(...)` calls.
- 2026-08-26: Kept `postQuote` shortcode; unified CSS with markdown `blockquote` via `--wada-blue`.
- 2026-08-26: Sample PT video uses `full` to demonstrate three-width system alongside default-wide media and text-column quote.

## Deviations Log
- 2026-08-26 [3.1/3.2]: Added `.main:has(.post) { max-width: none }` so the breakout grid can reach ~72ch; global `--max-width: 720px` otherwise caps the shell below 72ch at the site font metrics.
