## Why

El grid de columnas (texto / wide / full) existe hoy solo en `.post__content`, lo que obliga a que home y page dupliquen o imiten su lógica con soluciones ad-hoc (`:has(.post)`, `max-width: 48ch` hardcodeado). Unificar el container y las clases de breakout en un sistema agnóstico al tipo de contenido elimina esa duplicación y permite que cualquier layout futuro adopte el mismo ritmo sin trabajo extra.

## What Changes

- Se extrae el grid CSS de `.post__content` a una clase contenedora genérica `.page-body`; los anchos y la lógica del grid no cambian.
- Las clases de breakout pasan a BEM estricto: el bloque es `.col`, los modificadores son `.col--wide`, `.col--full`, `.col--text`. Todo elemento que lleve un modificador lleva también `.col`.
- Se elimina el hack `:has(.post) { max-width: none }` en `.main`; la contención pasa al grid de `.page-body`.
- El layout `home.vto` adopta `.page-body` como contenedor; título y subtítulo van a columna texto, la lista de posts va a `.col col--wide` o `.col col--full` según se decida.
- El layout `page.vto` adopta `.page-body` en lugar de `max-width: 48ch` directo.
- El layout `post.vto` renombra `.post__content` → `.page-body`; el resto del marcado de post no cambia.
- `post-media.vto` actualiza las clases emitidas: `post-media post-media--wide` → `media col col--wide`, etc. **BREAKING** para cualquier CSS o test que referencie `.post-media--*`.
- `media_shortcodes.ts` se sincroniza con el nuevo naming para mantener el invariante de paridad 1:1 con la plantilla Vento.
- Las clases de encabezado pasan también a naming agnóstico BEM: `.post__header`, `.post__title`, `.post__subtitle`, `.post__date` y `.page__title` se unifican bajo el bloque `.page-header` con elementos `__title`, `__subtitle`, `__date` y modificador `--center`.

## Capabilities

### New Capabilities

- `blog/layout-columns`: Sistema de grid de columnas compartido (`.page-body`, `.col`, `.col--wide`, `.col--full`, `.col--text`, `.page-header` y sus elementos BEM) aplicable a cualquier layout del sitio.

### Modified Capabilities

- `blog/design`: El requisito de medida de línea y layout de post cambia de clases ligadas a `.post__content` a `.page-body`; la clase `.col` pasa a ser el mecanismo de posicionamiento de breakout.
- `blog/post-media`: Las clases CSS de breakout de media cambian de `.post-media--wide / --full / --text` a `.col col--wide / col--full / col--text`.

## Impact

- **CSS**: `_layout.css`, `_post.css`, `_post-media.css` — reorganización de selectores; se añade o renombra `_page-body.css` o equivalente.
- **Templates**: `layouts/home.vto`, `layouts/page.vto`, `layouts/post.vto`, `partials/post-media.vto`.
- **TypeScript**: `media_shortcodes.ts` (generación de clases).
- **Markup existente en posts**: cualquier shortcode inline que genere clases `post-media--*` se actualiza automáticamente vía la plantilla y el shortcode; no requiere editar los ficheros Markdown de posts.
