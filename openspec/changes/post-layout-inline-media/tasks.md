## 1. Shortcodes en _config.ts

- [ ] 1.1 Registrar helper `postImage` en `_config.ts`: acepta `src`, `alt`, `caption?`, `size?` (`"wide"`|`"full"`), genera `<figure class="post-media post-media--{size}">` con `<img>` y `<figcaption>` opcional
- [ ] 1.2 Registrar helper `postVideo` en `_config.ts`: acepta `url`, `caption?`, `size?`, detecta YouTube y Bandcamp por URL, genera `<figure>` con `<div class="media-embed">` e `<iframe>` 16:9 (fallback: `<a>` externo)
- [ ] 1.3 Registrar helper `postAudio` en `_config.ts`: acepta `url`, `caption?`, detecta SoundCloud, Spotify y Bandcamp por URL, genera `<div class="post-media post-media--wide">` con iframe del proveedor (fallback: `<a>` externo)
- [ ] 1.4 Registrar helper `postGallery` en `_config.ts`: acepta args variables en formato `"src|alt|caption"`, genera `<div class="post-media post-media--wide post-gallery">` con `<figure>` por ítem
- [ ] 1.5 Registrar helper `postQuote` en `_config.ts`: acepta `text`, `attribution?`, genera `<blockquote class="post-quote">` con `<p>` y `<cite>` opcional

## 2. CSS — breakout grid y estilos de media

- [ ] 2.1 Refactorizar `.post__content` a CSS grid con líneas nombradas `[full-start]`, `[wide-start]`, `[text-start / text-end]`, `[wide-end]`, `[full-end]`; asignar `grid-column: text-start / text-end` a todos los hijos por defecto
- [ ] 2.2 Añadir regla `.post-media--wide { grid-column: wide-start / wide-end }` y `.post-media--full { grid-column: full-start / full-end }`
- [ ] 2.3 Añadir estilos para `.post-media--wide figure`, `.post-media--full figure`: `width: 100%`, `margin: 0`; y `.media-embed` con padding-bottom 56.25% para ratio 16:9
- [ ] 2.4 Añadir estilos para `.post-gallery`: `display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-sm)` dentro de `.post-media--wide`
- [ ] 2.5 Añadir estilos para `.post-quote`: hereda estilos actuales de `.media-item--quote` (borde izquierdo `--wada-blue`, padding, italic); asignar `grid-column: text-start / text-end`
- [ ] 2.6 Eliminar todo el CSS de dos columnas: `.post__body--with-media`, `.post__media`, `.media-item--*` y el bloque `@media (min-width: 1100px)` de grid lateral

## 3. Template post.vto y partial media-item.vto

- [ ] 3.1 Simplificar `src/_includes/layouts/post.vto`: eliminar la lógica condicional `post__body--with-media` y el bloque `<aside class="post__media">`, dejar solo `<div class="post__content">{{ content }}</div>`
- [ ] 3.2 Eliminar `src/_includes/partials/media-item.vto` (ya no se usa)

## 4. Frontmatter — campo thumbnail

- [ ] 4.1 Actualizar la lógica de la card de la home (template de listagem o partial) para leer `thumbnail` del frontmatter en lugar de derivarlo del array `media`

## 5. Migración de primeiro-post.md

- [ ] 5.1 Eliminar el campo `media` del frontmatter de `src/posts/primeiro-post.md`
- [ ] 5.2 Añadir `thumbnail: welcome-post/cover.svg` al frontmatter
- [ ] 5.3 Insertar los shortcodes equivalentes en el cuerpo del post (imagen, quote, vídeo, galería) en el orden editorial que tenga sentido dentro del texto

## 6. Verificación

- [ ] 6.1 Ejecutar `deno task serve` y revisar el post `bem-vindo` en el navegador: comprobar que texto (48ch centrado), media wide (~72ch) y media full (100%) se renderizan correctamente
- [ ] 6.2 Verificar el breakout en mobile (<768px): la media no debe producir scroll horizontal
- [ ] 6.3 Verificar que la card de la home muestra el thumbnail correcto del post migrado
- [ ] 6.4 Verificar que el build no tiene errores (`deno task build`) y que las imágenes se convierten a WebP
