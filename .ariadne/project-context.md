# Project Context
> Mode: discovery
> Update when stack or conventions change.

## Stack
- Runtime: Deno 2.9.5 (local) / 2.1.0 (Netlify, pinned in `netlify.toml`)
- Framework: Lume v2.3.3 (SSG) — plugins: `multilanguage`, `date`, `feed`
- DB/ORM: none
- Auth: none
- Styling: hand-written CSS — single file `src/assets/css/main.css`, no framework, no CDN
- Testing: none

## Structure
- `src/` → all source content and templates
- `src/_data.yml` → global data for PT (root language); sets `lang: pt`
- `src/en/_data.yml` → global data for EN subtree; sets `lang: en`
- `src/_data/i18n.yml` → PT UI strings (nav labels, URLs, feed title)
- `src/en/_data/i18n.yml` → EN UI strings
- `src/_includes/layouts/` → Vento (`.vto`) layout templates: `base`, `home`, `page`, `post`
- `src/_includes/partials/` → `header.vto`, `footer.vto` — included in `base.vto`
- `src/posts/` → PT posts; `_data.yml` sets `type: post` + `layout: layouts/post.vto`
- `src/en/posts/` → EN posts; same `_data.yml` pattern
- `src/assets/css/main.css` → served as static asset via `site.copy("assets")` in `_config.ts`
- `_config.ts` → Lume entry point; plugins, preprocess hook, custom `formatDate` filter, `site.copy`
- `deno.json` → task runner (`build`, `serve`, `lume`); import map for Lume
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
Optional field: `lang` (inherited from `_data.yml` — do not set manually unless overriding)
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

### CSS
- ALWAYS: use CSS custom properties defined in `:root` — never hardcode color or spacing values
- ALWAYS: BEM-like class naming — `block__element--modifier`
- NEVER: load any CSS from CDN at runtime — no `@import url(...)`, no Google Fonts remote
- NEVER: add Tailwind, Bootstrap, or any utility framework
- Max content width: `720px` (`--max-width`), gutter: `clamp(1rem, 5vw, 2.5rem)`
- Body font: `Georgia, serif` (`--font-body`); UI font: `system-ui, sans-serif` (`--font-ui`)

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

## Hard Constraints
- No new npm/CDN dependencies — this is a Deno/Lume project; add imports only via `deno.json` import map
- No new dependencies without registering the import in `deno.json` and noting it here
- `_site/` must never be committed — build artifact only
- No CSS loaded at runtime from external sources
- No auto language detection / redirect at the server level
