# Project Context
> Mode: discovery
> Update when stack or conventions change.

## Stack
- Runtime: Deno 2.9.5 (local) / 2.1.0 (Netlify, pinned in `netlify.toml`)
- Framework: Lume v2.3.3 (SSG) — plugins: `multilanguage`, `date`, `feed`, `lightningcss`, `transform_images`
- DB/ORM: none
- Auth: none
- Styling: hand-written CSS — `src/assets/css/main.css` imports 12 partial `_*.css` files; processed by LightningCSS <!-- updated -->
- Testing: none

## Structure
- `src/` → all source content and templates
- `src/_data.yml` → global data for PT (root language); sets `lang: pt`
- `src/en/_data.yml` → global data for EN subtree; sets `lang: en`
- `src/_data/i18n.yml` → PT UI strings (nav labels, URLs, feed title)
- `src/en/_data/i18n.yml` → EN UI strings
- `src/_includes/layouts/` → Vento (`.vto`) layout templates: `base`, `home`, `page`, `post`
- `src/_includes/partials/` → `header.vto`, `footer.vto`, `post-media.vto` — included in layout templates
- `src/posts/` → PT posts; `_data.yml` sets `type: post` + `layout: layouts/post.vto`
- `src/en/posts/` → EN posts; same `_data.yml` pattern
- `src/assets/css/main.css` → CSS entry point; `@import`s `_tokens`, `_reset`, `_typography`, `_layout`, `_page-body`, `_header`, `_footer`, `_post-list`, `_post`, `_post-media`, `_buttons`, `_responsive` <!-- updated -->
- `src/assets/css/_tokens.css` → all CSS custom properties: fonts (`@font-face`), color scale, semantic tokens, typography, spacing, layout <!-- updated -->
- `src/assets/fonts/` → self-hosted font files; copied to build via `site.copy("assets/fonts")` <!-- updated -->
- `src/assets/images/` → post media; `_data.yml` triggers `transform_images` (JPG/PNG → WebP) <!-- updated -->
- `media_shortcodes.ts` → shortcode render helpers imported by `_config.ts`; HTML output mirrors `post-media.vto` <!-- updated -->
- `_config.ts` → Lume entry point; plugins, preprocess hook, custom `formatDate` filter, shortcode filters, `site.copy`, `site.loadAssets`
- `deno.json` → task runner (`build`, `serve`, `lume`); import map for Lume + `napi-wasm`
- `netlify.toml` → build command `deno task build`, publish `_site`, Deno version pin
- `_site/` → build output — never edit manually, never commit

## Critical Rules

### Multilanguage
- ALWAYS: PT is the default language and lives at the root — no `/pt/` URL prefix for pages or posts
- ALWAYS: EN lives under `/en/`
- ALWAYS: link translations via `translationKey` frontmatter field (same value in PT and EN files); Lume's multilanguage plugin uses this to build `alternates`
- NEVER: add `id` manually to frontmatter — `_config.ts` preprocess copies `translationKey` → `id` automatically
- NEVER: add Accept-Language auto-redirect — design decision to leave language choice entirely to the user (documented in `netlify.toml`)
- ALWAYS: pages without a translation still work; the lang switcher only renders links for languages that actually have a counterpart

### URL / Routing
- ALWAYS: PT posts use a bare slug at root — `url: /slug/` set via preprocess in `_config.ts` from `slug` frontmatter
- ALWAYS: EN posts get `/en/slug/` automatically from the multilanguage plugin after preprocess sets `url: /slug/`
- ALWAYS: static pages (Sobre, Contacto, About, Contact) declare `slug` in frontmatter
- NEVER: use `url` frontmatter directly on posts — the preprocess hook in `_config.ts` owns that field

### Frontmatter — Posts
Required fields: `title`, `date` (ISO 8601), `slug`, `description`, `translationKey`
Optional fields: `lang` (inherited from `_data.yml`), `thumbnail` (filename under `src/assets/images/`, no path prefix)
- `type: post` is set by `src/posts/_data.yml` / `src/en/posts/_data.yml` — never repeat in individual files
- `layout: layouts/post.vto` is set by the same `_data.yml` — never repeat in individual files

### Frontmatter — Static Pages
Required fields: `title`, `layout` (explicit), `slug`, `translationKey`
- `lang` is inherited from `_data.yml`

### Templates
- Template engine: **Vento** (`.vto`), not Nunjucks
- Vento syntax: `{{ variable }}`, `{{ for x of list }}…{{ /for }}`, `{{ if cond }}…{{ /if }}`, `{{ set x = expr }}`
- Comments: `{{# … #}}`
- Pipe filters: `value |> filterName(args)` — e.g. `date |> date('yyyy-MM-dd')`, `date |> formatDate(lang)`
- NEVER use Nunjucks `{%` / `%}` syntax

### CSS <!-- updated -->
- ALWAYS: define all tokens in `src/assets/css/_tokens.css` `:root` block — never hardcode color, spacing, or font values elsewhere
- ALWAYS: BEM-like class naming — `block__element--modifier`
- NEVER: load any CSS from CDN at runtime — no `@import url(...)`, no Google Fonts remote
- NEVER: add Tailwind, Bootstrap, or any utility framework
- ALWAYS: add new CSS partials as `_name.css` files and register them with `@import` in `main.css`
- LightningCSS is active — CSS nesting and modern syntax are supported; no PostCSS needed
- Max content width: `720px` (`--max-width`), gutter: `clamp(1rem, 5vw, 2.5rem)` (`--gutter`)
- Body font: `'Novela', Georgia, serif` (`--font-body`); UI font: `'Isaac', system-ui, sans-serif` (`--font-ui`) <!-- updated -->
- Font files must be self-hosted in `src/assets/fonts/` and declared via `@font-face` in `_tokens.css` <!-- updated -->

### CSS — Token System <!-- updated -->
- Color scale: `--cy-{0–90}` (Cream Yellow tints) and `--dvb-{0–50}` (Dull Violet Black shades) — only change the base `--cy-0` / `--dvb-0` hex values, tints/shades are derived via `color-mix()`
- Fixed palette colors: `--wada-yellow` (#fff200), `--wada-blue` (#006eb8)
- Semantic tokens: `--color-bg`, `--color-surface`, `--color-border`, `--color-text`, `--color-text-muted`, `--color-accent` — ALWAYS use these in components, never the primitive scale directly
- Typography tokens: `--font-size-base` (responsive via media queries), `--font-size-h1`, `--font-size-caption`, `--font-size-small` — ALWAYS use these, never raw `px` or `rem` literals for font sizes
- Line-height tokens: `--line-height`, `--line-height-h1`, `--line-height-caption`, `--line-height-small` — paired with their font-size counterparts
- Baseline grid tokens (rem-based, fully responsive): `--baseline` (1 grid unit), `--baseline-half` (½), `--baseline-quarter` (¼) — NEVER use `em`-based spacing for block-level rhythm
- Spacing scale (rem, fixed): `--space-xs` (0.25), `--space-sm` (0.5), `--space-md` (1), `--space-lg` (1.75), `--space-xl` (3), `--space-2xl` (5) — use for inline/component spacing, use baseline grid for vertical rhythm between blocks

### Media Shortcodes <!-- updated -->
Locked author syntax (Vento pipe filters):
- `{{ "src" |> postImage("alt", "caption?", "wide|full|text?") }}`
- `{{ "url" |> postVideo("caption?", "wide|full|text?") }}`
- `{{ "url" |> postAudio("caption?") }}`
- `{{ "src|alt|cap" |> postGallery("src|alt|cap", ...) }}`
- `{{ "text" |> postQuote("attribution?") }}`
- ALWAYS: pass image `src` as filename only (no path) — `resolveImageSrc` prepends `/assets/images/` and converts JPG/PNG → `.webp`; SVG is unchanged
- ALWAYS: keep `media_shortcodes.ts` and `src/_includes/partials/post-media.vto` in sync — both are sources of truth for HTML structure
- Size values: `wide` (default, breakout past text column), `full` (full viewport), `text` (constrained to text column)
- NEVER call `resolveImageSrc` directly in post content — use `postImage` or `postGallery`

### Image Handling <!-- updated -->
- `transform_images` plugin is active — JPG, JPEG, PNG in `src/assets/images/` are converted to WebP at build time
- `src/assets/images/_data.yml` contains `transformImages: { format: webp }` — do not remove
- SVG files: loaded via `site.loadAssets([".svg"])` — not transformed, served as-is
- `resolveImageSrc(src)` helper: strips leading `/`, replaces `.jpg/.jpeg/.png` → `.webp`, prepends `/assets/images/`

### RSS Feeds
- PT feed: `/pt/feed.xml` — query `lang=pt type=post`
- EN feed: `/en/feed.xml` — query `lang=en type=post`
- Both configured in `_config.ts` via `feed()` plugin — never add separate feed pages

### Date Formatting
- ALWAYS: use the custom `formatDate(lang)` filter in templates — it uses `Intl.DateTimeFormat` with locale `pt-PT` for PT, `en-US` for EN
- NEVER: use the Lume `date` plugin for display formatting — it is only used for machine-readable ISO format in `datetime` attributes

### Deployment
- Platform: Netlify
- Build command: `deno task build`
- Publish directory: `_site`
- Deno version in Netlify: `2.1.0` (pinned — update `netlify.toml` if upgrading)
- `location` in `_config.ts` must match the production domain before first deploy
- `napi-wasm` npm dep is pinned in `deno.json` — required for LightningCSS to resolve on Netlify (Deno does not hoist nested deps) <!-- updated -->

## Hard Constraints
- No new npm/CDN dependencies — this is a Deno/Lume project; add imports only via `deno.json` import map
- No new dependencies without registering the import in `deno.json` and noting it here
- `_site/` must never be committed — build artifact only
- No CSS loaded at runtime from external sources
- No auto language detection / redirect at the server level
- Font files must live in `src/assets/fonts/` and be declared with `@font-face` in `_tokens.css` — never load from Google Fonts or any CDN <!-- updated -->
