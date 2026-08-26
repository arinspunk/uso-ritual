## Why

El layout editorial de dos columnas (media lateral + texto) dificulta la integración narrativa de imágenes, vídeos y audios dentro del flujo de lectura. Pasar a un layout de columna única con media intercalada inline permite una experiencia de post más cercana a la escritura editorial contemporánea, donde el autor controla exactamente dónde aparece cada pieza de media en relación al texto.

## What Changes

- **BREAKING** El campo `media` del frontmatter desaparece como mecanismo principal de inserción de media. Los posts existentes deberán migrar su media al cuerpo del post usando shortcodes.
- Se introduce un sistema de shortcodes Vento para insertar media inline dentro del cuerpo markdown de los posts: `postImage`, `postVideo`, `postAudio`, `postGallery`, `postQuote`.
- El layout del post pasa de dos columnas a una sola columna centrada. El texto mantiene su ancho actual (48ch). La media se renderiza más ancha que el texto (~72ch por defecto, 100% como opción).
- Se introduce el campo `thumbnail` en el frontmatter para que el autor declare explícitamente qué imagen usar en la card de la home.
- El post `primeiro-post.md` se migra como ejemplo de referencia.
- El layout `post.vto` y su CSS se simplifican al eliminar la lógica de dos columnas.

## Capabilities

### New Capabilities

_(ninguna — todas las capacidades afectadas ya existen)_

### Modified Capabilities

- `blog/post-media`: El modelo de media cambia completamente — de array en frontmatter renderizado en bloque lateral, a shortcodes inline en el cuerpo del post con soporte para anchos `wide` y `full`. Se añaden shortcodes para audio multi-proveedor (SoundCloud, Bandcamp, Spotify).
- `blog/posts`: Se añade el campo `thumbnail` en el frontmatter y el campo `media` queda deprecado/eliminado. Se actualiza el requisito de thumbnail en la card de la home.
- `blog/design`: El layout del post pasa a columna única centrada con media en breakout. Se define el sistema de tres anchos: `text` (48ch), `wide` (~72ch), `full` (100%).

## Impact

- `src/_includes/layouts/post.vto` — se simplifica, elimina lógica de media aside
- `src/_includes/partials/media-item.vto` — se refactoriza o elimina (sustituido por shortcodes)
- `src/assets/css/main.css` — se elimina CSS de dos columnas, se añade CSS de breakout grid
- `_config.ts` — se registran los shortcodes `postImage`, `postVideo`, `postAudio`, `postGallery`, `postQuote`
- `src/posts/primeiro-post.md` — se migra como post de referencia
