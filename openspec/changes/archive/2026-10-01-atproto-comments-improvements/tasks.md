## 1. Marcado semántico

- [x] 1.1 Cambiar la lista raíz de `<div class="atproto-comments__list">` a `<ol>` en `renderReply()` y en el punto de montaje en `load()`
- [x] 1.2 Envolver cada reply en `<li><article class="atproto-reply">` en lugar de `<div class="atproto-reply">`
- [x] 1.3 Cambiar `<div class="atproto-reply__header">` a `<header class="atproto-reply__header">`
- [x] 1.4 Cambiar `<span class="atproto-reply__author">` a `<b class="atproto-reply__author">`
- [x] 1.5 Renderizar los sub-replies dentro de `<ol class="atproto-reply__replies"><li>…</li></ol>` en lugar de añadirlos directamente al `article`
- [x] 1.6 Eliminar el `style="margin-left"` inline generado por JS

## 2. CSS — layout y línea de thread

- [x] 2.1 Añadir estilos para `ol.atproto-comments__list` y `ol.atproto-reply__replies` (list-style: none, padding: 0, margin-left: 0 — sin indentación)
- [x] 2.2 Ajustar `.atproto-reply` a layout flex-row (columnas: `.atproto-reply__avatar-wrap` | `.atproto-reply__content`)
- [x] 2.3 Añadir `.atproto-reply__content` como envoltura del header y el texto
- [x] 2.4 Estilar `.atproto-reply__avatar-wrap` con `position: relative` y añadir `::after` que dibuja la línea vertical de thread (`width: 2px`, `background: var(--color-border)`, `top: 100%`, `bottom: 0`, centrada en el avatar) solo cuando el reply contiene `.atproto-reply__replies` (selector `:has`)

## 3. Avatar

- [x] 3.1 Extraer `author.avatar` en `renderReply()` y crear `.atproto-reply__avatar-wrap` conteniendo el `<img>` con `loading="lazy"`, `width="32"`, `height="32"` y `alt=""`
- [x] 3.2 Implementar la función de iniciales: primera letra de cada palabra del `displayName` con `[...str]` (grafemas), máximo 2; fallback a primera letra del `handle`
- [x] 3.3 Crear el elemento placeholder `<div class="atproto-reply__avatar atproto-reply__avatar--placeholder">` dentro del wrap cuando `author.avatar` está ausente
- [x] 3.4 Añadir `onerror` al `<img>` para sustituirlo por el placeholder si la URL del CDN falla
- [x] 3.5 Estilar `.atproto-reply__avatar`: 32×32 px, border-radius 50%, object-fit cover
- [x] 3.6 Estilar `.atproto-reply__avatar--placeholder`: background `var(--color-accent)`, color `var(--color-text)`, font-family `var(--font-ui)`, texto centrado

## 4. Popover de app (patrón uniforme)

- [x] 4.1 Implementar `buildAppPopover(targetDid, targetRkey, popoverId)` que genera el elemento `<div popover>` con enlaces a Bluesky, Mu y Deer y el input de dominio libre; las URLs siguen el patrón `https://<dominio>/profile/<targetDid>/post/<targetRkey>`
- [x] 4.2 Implementar `buildAppButton(label, popoverId)` que genera el `<button popovertarget="…">` correspondiente
- [x] 4.3 Al hacer clic en un enlace de app conocida, guardar el dominio en `localStorage` (`atproto-preferred-app`) y abrir en pestaña nueva
- [x] 4.4 Al confirmar dominio libre (clic en "→" o Enter), guardar el dominio en `localStorage` y abrir en pestaña nueva
- [x] 4.5 Al montar cualquier popover, leer `localStorage` y resaltar la app preferida (o rellenar el input si es dominio personalizado)
- [x] 4.6 Sustituir `renderEmpty()` por `buildAppButton("Comenta en", …)` + `buildAppPopover(rootDid, rootRkey, …)` en los puntos de montaje (estado vacío y pie de lista)
- [x] 4.7 Añadir `buildAppButton("Responder", …)` + `buildAppPopover(authorDid, replyRkey, …)` al pie de cada `<article>` en `renderReply()`; extraer `authorDid` de `post.author.did` y `replyRkey` del último segmento de `post.uri`
- [x] 4.8 Estilar el botón, el popover y el input de dominio en `_atproto-comments.css`

## 5. Tiempo relativo

- [x] 5.1 Implementar `formatRelativeTime(iso, lang)` con los umbrales definidos en design.md (D3): `agora`/`now`, `{n} m`, `{n} h`, `{n} d`, `{n} me`/`{n} mo`, `dd/mm/aaaa`
- [x] 5.2 Añadir el atributo `title` al elemento `<time>` con la fecha absoluta formateada con `Intl.DateTimeFormat(lang, { dateStyle: 'short', timeStyle: 'short' })`
- [x] 5.3 Sustituir la llamada a `formatDate()` por `formatRelativeTime()` en `renderReply()`
- [x] 5.4 Eliminar la función `formatDate()` si ya no se usa en otro lugar
