## 1. CSS — Extraer el grid a `.page-body`

- [x] 1.1 Crear `src/assets/css/_page-body.css` con el bloque `display: grid` y `grid-template-columns` extraído de `.post__content` en `_post.css`, bajo el selector `.page-body`
- [x] 1.2 Añadir `> *` default a columna texto (`grid-column: text-start / text-end`) en `.page-body`
- [x] 1.3 Añadir `.col--wide` y `.col--full` y `.col--text` como selectores de breakout en `_page-body.css`
- [x] 1.4 Importar `_page-body.css` en `main.css`

## 2. CSS — Limpiar selectores obsoletos

- [x] 2.1 En `_post.css`: eliminar el bloque `display: grid` y `grid-template-columns` de `.post__content`; renombrar `.post__content` → `.page-body` en los selectores que queden (alineación, hyphens, `a { color }`)
- [x] 2.2 En `_layout.css`: eliminar el hack `&:has(.post) { max-width: none }` de `.main`
- [x] 2.3 En `_post-media.css`: renombrar `.post-media--wide` → `.col--wide`, `.post-media--full` → `.col--full`, `.post-media--text` → `.col--text` en todos los selectores

## 3. Templates — Layouts

- [x] 3.1 En `layouts/post.vto`: cambiar `<div class="post__content">` → `<div class="page-body">`
- [x] 3.2 En `layouts/home.vto`: envolver el contenido en `<div class="page-body">`; añadir `class="col col--wide"` a la `<ol class="post-list">`
- [x] 3.3 En `layouts/page.vto`: cambiar `<div class="page__content">` → `<div class="page-body">`; eliminar `max-width: 48ch` si estaba en CSS como regla de `.page__content`
- [x] 3.4 En `_post.css` (o `_layout.css`): limpiar/eliminar reglas de `.page__content` ya no necesarias

## 4. Templates y shortcodes — Clases de media

- [x] 4.1 En `partials/post-media.vto`: actualizar todas las clases emitidas — `post-media post-media--{size}` → `media col col--{size}`; para audio y gallery que fijaban `post-media--wide` directamente, emitir `media col col--wide`
- [x] 4.2 En `src/_plugins/media_shortcodes.ts` (o donde viva el shortcode): actualizar la generación de clases para que refleje exactamente el mismo naming que `post-media.vto`
- [x] 4.3 En `_post-media.css`: renombrar el bloque `.post-media` → `.media` (márgenes, caption, embed ratio, audio height, etc.)

## 5. Verificación

- [x] 5.1 Hacer build (`deno task build`) sin errores
- [x] 5.2 Revisar en el navegador: post con imagen wide, full y text — anchos correctos
- [x] 5.3 Revisar home: título a columna texto, lista de posts a wide — sin overflow
- [x] 5.4 Revisar página estática (Sobre o Contacto): texto a columna texto, sin layout roto
- [x] 5.5 Confirmar que no quedan referencias a `.post-media--wide`, `.post-media--full`, `.post__content` ni `.page__content` en el código fuente

## 6. Encabezados — Renombrar clases a `.page-header`

- [x] 6.1 En `_post.css`: renombrar `.post__header` → `.page-header`, `.post__header--center` → `.page-header--center`, `.post__title` → `.page-header__title`, `.post__subtitle` → `.page-header__subtitle`, `.post__date` → `.page-header__date`; eliminar `.page__title`
- [x] 6.2 En `layouts/post.vto`: actualizar clases del `<header>` a `.page-header`, `__title`, `__date`
- [x] 6.3 En `layouts/home.vto`: actualizar clases del bloque de título/subtítulo a `.page-header`, `--center`, `__title`, `__subtitle`
- [x] 6.4 En `layouts/page.vto`: envolver el `<h1>` en `<header class="page-header">` con `.page-header__title`
