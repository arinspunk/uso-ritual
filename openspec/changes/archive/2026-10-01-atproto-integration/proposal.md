## Why

El blog ya distribuye contenido vía RSS pero carece de presencia en el ecosistema AT Protocol, una red descentralizada con tracción real y creciente. Integrar AT Protocol convierte el blog en un publicador de primera clase en ese ecosistema: los posts quedan disponibles como registros de publicación estándar (Standard.site) legibles por cualquier app compatible, la identidad del blog queda vinculada al dominio, y los lectores del ecosistema pueden comentar desde sus propias apps (Bluesky, Mu, etc.) sin salir de ellas.

## What Changes

- **Verificación de identidad y de publicación.** Se sirven dos ficheros estáticos: `/.well-known/atproto-did` (permite usar el dominio como handle de la cuenta `did:plc:t3q3ylsnsser3o74xz42sdqk`, hoy `@usoritual.eurosky.social`) y `/.well-known/site.standard.publication` (AT URI del registro de publicación). Cada página de post incluye una etiqueta `<link rel="site.standard.document">` con el AT URI de su documento.
- **Identificadores deterministas.** Cada par post-idioma tiene un `rkey` con formato TID, calculado de forma determinista a partir de `slug`, `lang` y `date`. El mismo `rkey` se usa en el documento y en el post ancla de Bluesky. No se guarda estado fuera del PDS ni se escribe nada en el frontmatter.
- **Manifiesto de sindicación.** Lume genera `/atproto/manifest.json` con los datos de todos los posts publicados (incluidos sus `rkey`), que es la única fuente que lee la función.
- **Sindicación en cada deploy de producción.** Una Netlify Function disparada por `deploySucceeded` mantiene en el PDS un registro `site.standard.publication`, un `site.standard.document` por post e idioma, y un `app.bsky.feed.post` (post ancla) por post e idioma. Solo escribe cuando algo cambia; el post ancla se crea una única vez y nunca se modifica.
- **Comentarios.** Las páginas de post muestran, cargados client-side desde la AppView pública de Bluesky, los replies al post ancla. Los visitantes leen sin cuenta; para comentar responden al post ancla desde cualquier app compatible.
- **Backfill controlado.** Solo los posts publicados a partir de una fecha configurable reciben post ancla, para no inundar el timeline con el archivo histórico.

## Capabilities

### New Capabilities

- `blog/atproto`: identidad y verificación AT Protocol del blog, sindicación de posts como documentos Standard.site con post ancla en Bluesky, y visualización de comentarios desde el thread del post ancla.

### Modified Capabilities

Ninguna. El frontmatter de `blog/posts` no cambia: todos los identificadores AT Protocol se derivan de `slug`, `lang` y `date`.

## Impact

- **Netlify**: nueva función `netlify/functions/atproto-syndicate.mts` (runtime Node, handler `deploySucceeded`, se ejecuta en background); dependencia de desarrollo `@netlify/functions` para tipos; un secreto `ATPROTO_APP_PASSWORD` con scope Functions; cabeceras en `netlify.toml` para los ficheros `.well-known`.
- **Lume**: nuevo fichero de datos `_data/atproto.yml`, módulo `src/_lib/atproto-tid.ts`, página del manifiesto, ficheros `.well-known` y etiquetas `<link>` en los layouts.
- **Frontend**: nuevo script `src/assets/js/atproto-comments.js` y bloque de comentarios en el layout de post.
- **Servicios externos**: PDS de Eurosky (`https://eurosky.social`) para escritura; AppView pública de Bluesky (`public.api.bsky.app`, configurable) para lectura de comentarios.
- **Sin breaking changes**: el HTML del blog, sus URLs y los feeds RSS no cambian.
