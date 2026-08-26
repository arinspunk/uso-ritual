# Solution: Harden inline post media
> Source: Fix all gaps found in the post-layout-inline-media review (API, i18n, CSS breakout, markup, embeds, OpenSpec drift).
> Date: 2026-08-26
> Context: .ariadne/project-context.md

## Problem

The switch from a side media column to inline shortcodes is the right editorial model, but the current uncommitted implementation diverges from its own OpenSpec design and leaves the EN translation broken. Author API, CSS width system, HTML generation, embed URLs, image pipeline, and specs are misaligned and will cause brittle authoring and silent regressions.

## Proposed Approach

Finish the existing `post-layout-inline-media` change in place — do not introduce a new architecture. Keep Lume `site.helper(..., { type: "tag" })` shortcodes and a single-column post layout, but make the implementation match the design already written in `openspec/changes/post-layout-inline-media/`.

Concretely: restore the named-argument tag API from the design; move HTML markup into Vento partials under `src/_includes/partials/`; keep thin helpers in `_config.ts` that only normalize args / detect providers / return `include`-equivalent HTML safely; implement the design’s three-width breakout grid in `src/assets/css/main.css`; migrate EN post + `templateEngine` parity; normalize provider embed URLs; realign OpenSpec delta specs and tasks with what ships.

Follow existing patterns: Vento templates in `src/_includes/`, helpers registered in `_config.ts`, BEM classes in `main.css`, PT/EN posts under `src/posts/` and `src/en/posts/` with shared `translationKey`, no new npm/CDN deps.

## Implementation Steps

1. **Author API** — Change helpers in `_config.ts` so posts use the design syntax `{{ postImage "src" "alt" "caption?" "wide|full?" }}` (and the same positional style for `postVideo`, `postAudio`, `postGallery`, `postQuote`). Drop the array + `|>` pipeline form. Update `src/posts/primeiro-post.md` to that syntax. If Lume/Vento cannot pass multiple tag args cleanly, document the working signature once in the change design and keep a single consistent form — never both.

2. **Markup out of TS** — Reintroduce focused Vento partials under `src/_includes/partials/` (e.g. `post-media-image.vto`, `post-media-embed.vto`, `post-media-gallery.vto`, `post-media-quote.vto`, or one `post-media.vto` with type branching). Helpers in `_config.ts` only: parse args, pick provider embed URL, escape text, then render via the partial (or return escaped HTML built from a single shared escape helper). Do not keep multi-line HTML string templates as the source of truth in `_config.ts`.

3. **Escape / safety** — Ensure `alt`, `caption`, quote `text`, and `attribution` are HTML-escaped before interpolation. Prefer Vento auto-escape in partials over string concatenation.

4. **Images + Lume pipeline** — Stop hardcoding final `/assets/images/...` paths that bypass `transform_images` for raster files. Use the Lume/`transform_images` pattern already intended by `src/assets/images/_data.yml` (WebP) so JPG/PNG posts resolve to the built asset URL. Keep SVG behavior working as today via `site.loadAssets([".svg"])`.

5. **CSS breakout (design widths)** — In `src/assets/css/main.css`, replace the current `1fr | 48ch | 1fr` + negative-gutter `full` with the named-line grid from `openspec/changes/post-layout-inline-media/design.md`: `full` / `wide` (~72ch via `minmax(0, 12ch)` sides) / `text` (48ch). Default children → text column; `.post-media--wide` / `.post-media--full` span the matching lines. Remove the `margin-left: calc(-1 * var(--gutter))` full-bleed hack. Keep BEM naming (`post-media`, `post-gallery`, `post-quote`) and tokens (`--baseline`, `--wada-blue`, etc.).

6. **Optional text-width media** — Support size default `wide`, optional `full`, and either omit a third class for text-column media or add an explicit `"text"` size that stays on `text-start / text-end` — matching the design’s three-width system. Prefer one explicit size arg over implicit special cases.

7. **Embed URL normalization** — In `_config.ts` helpers (or a small private function next to them), map share URLs → embed URLs before iframe `src`: YouTube → `/embed/{id}`; Spotify → `open.spotify.com/embed/...`; SoundCloud → official embed player URL form; Bandcamp → embed URL only when a usable embed src exists, otherwise external `<a>`. Keep detection by `includes()` / URL parsing; no new dependencies.

8. **i18n migration parity** — Add `templateEngine: [vento, md]` to `src/en/posts/_data.yml` (same pattern as `src/posts/_data.yml`). Migrate `src/en/posts/first-post.md`: remove `media`, add `thumbnail`, insert shortcodes inline (EN copy). Confirm both locales share `translationKey: welcome-post`.

9. **`postQuote`** — Keep `postQuote` only if it must emit `.post-quote` markup that plain markdown `>` cannot. Otherwise style `.post__content blockquote` in CSS and drop the shortcode from helpers + sample posts. Prefer one path for quotes, not two.

10. **OpenSpec alignment** — Update delta specs under `openspec/changes/post-layout-inline-media/specs/` so scenarios show the real shortcode syntax. Track/add `specs/blog/posts/spec.md`. Fix tasks that claim EN done when it is not. After implementation, leave archive/sync for a later `/opsx:archive` when verification passes.

11. **Verification** — Local serve: PT `/bem-vindo/`, EN `/en/welcome/`, home thumbnails, mobile no horizontal scroll, wide ≈72ch on large viewports, full edge-to-edge within `.main`/viewport per design, build clean (`deno task lume -s` / `deno task build`).

## Trade-offs

- **Chosen because:** Completes the already-approved OpenSpec change with the fewest new concepts — same shortcodes, same files, corrected gaps — instead of inventing MDX, a CMS, or a second media system.
- **Rejected alternative(s):**
  - Keep array/`|>` API as permanent — simpler for the current broken Lume call site, worse for authors and contradicts the design.
  - Temporary dual path (frontmatter `media` + shortcodes) — violates the change’s “migrate all posts in same PR” decision and prolongs two layouts/CSS systems.
  - Markdown-only HTML embeds — no validation, duplicated iframe markup, worse i18n consistency.
  - New libraries for embeds/images — forbidden by hard constraints unless registered in `deno.json` and context; unnecessary here.
- **Risks/limitations:** Lume tag multi-arg ergonomics may force a documented compromise on syntax; SoundCloud/Bandcamp embed URL shapes vary and may still need a fallback link; WebP pipeline must be validated with a real raster asset before relying on it in production posts.

## Constraints Applied

- Multilanguage ALWAYS: EN under `/en/`, shared `translationKey`, both locales must work without Accept-Language redirects
- Templates: Vento only — no Nunjucks; prefer partials/`{{ include }}` over novel template approaches
- CSS: custom properties + BEM; no CDN/framework CSS; respect reading measure and existing tokens
- Hard Constraints: no new npm/CDN dependencies; no `_site/` commits
- Structure: helpers stay in `_config.ts`; layouts/partials under `src/_includes/`; posts under `src/posts/` and `src/en/posts/`
- Note: `.ariadne/project-context.md` still lists Georgia/system-ui and `site.copy("assets")` — current code uses Novela/Isaac and `copy("assets/css"|"assets/fonts")`; this solution follows the live stack and does not reintroduce the stale copy rule
