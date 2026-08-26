## 1. Shortcodes en _config.ts / media_shortcodes.ts

- [x] 1.1 Registrar filter `postImage`: `{{ "src" |> postImage("alt", "caption?", "size?") }}`, genera `<figure class="post-media post-media--{size}">`
- [x] 1.2 Registrar filter `postVideo`: detecta YouTube / Bandcamp embed, fallback `<a>`
- [x] 1.3 Registrar filter `postAudio`: SoundCloud / Spotify / Bandcamp embed, fallback `<a>`
- [x] 1.4 Registrar filter `postGallery`: `"src|alt|caption"` vía pipe + rest args
- [x] 1.5 Registrar filter `postQuote`: texto vía pipe + atribución opcional

## 2. CSS — breakout grid y estilos de media

- [x] 2.1 Refactorizar `.post__content` a CSS grid con líneas `[full-start]`, `[wide-start]`, `[text-start / text-end]`, `[wide-end]`, `[full-end]`
- [x] 2.2 Reglas `.post-media--wide` / `.post-media--full` / `.post-media--text`
- [x] 2.3 Estilos figure + `.media-embed` 16:9
- [x] 2.4 Estilos `.post-gallery` 2 columnas
- [x] 2.5 Estilos unificados `.post-quote` + `.post__content blockquote` (`--wada-blue`)
- [x] 2.6 Eliminar CSS de dos columnas lateral

## 3. Template post.vto y partial media-item.vto

- [x] 3.1 `post.vto` columna única `.post__content`
- [x] 3.2 Eliminar `media-item.vto`; markup canónico en `partials/post-media.vto`

## 4. Frontmatter — campo thumbnail

- [x] 4.1 Home cards leen `thumbnail` del frontmatter

## 5. Migración de posts

- [x] 5.1 Eliminar `media` de `primeiro-post.md`
- [x] 5.2 Añadir `thumbnail` en PT
- [x] 5.3 Shortcodes inline en PT
- [x] 5.4 `templateEngine: [vento, md]` en `src/en/posts/_data.yml`
- [x] 5.5 Migrar `src/en/posts/first-post.md` (sin `media`, con `thumbnail` + shortcodes EN)

## 6. Verificación

- [x] 6.1 Revisar `/bem-vindo/`: texto ~48ch, wide ~72ch, full en líneas nombradas
- [x] 6.2 Mobile (<768px): sin scroll horizontal
- [x] 6.3 Cards home PT/EN muestran thumbnail
- [x] 6.4 `deno task build` sin errores; rasters → WebP (vía `resolveImageSrc`)
