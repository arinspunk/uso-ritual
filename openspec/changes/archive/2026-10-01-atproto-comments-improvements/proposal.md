## Why

El bloque de comentarios AT Protocol funciona correctamente pero la presentación de cada reply es básica: muestra nombre, handle y fecha absoluta sin imagen de perfil. Añadir el avatar y mostrar el tiempo relativo mejora la legibilidad y hace que el bloque se sienta más próximo a la experiencia nativa de Bluesky.

## What Changes

- El bloque de comentarios muestra la imagen de perfil (`author.avatar`) de cada autor como elemento visual junto a su nombre y handle. El dato ya llega en la respuesta de `getPostThread`; no se requiere ninguna llamada adicional.
- Cuando el autor no tiene avatar configurado, el bloque muestra un placeholder con iniciales (fondo `--color-accent`, texto `--color-text`) sin romper el layout.
- La fecha de cada reply pasa a mostrarse como tiempo relativo compacto (`5 m`, `3 h`, `12 d`, `4 me`) con la fecha absoluta accesible como tooltip (`title` del elemento `<time>`).
- El formato relativo es bilingüe (PT / EN) y cae a fecha absoluta `dd/mm/aaaa` para replies con más de un año de antigüedad.
- El marcado HTML generado pasa a ser semántico: `<ol>` / `<li>` para listas de replies, `<article>` por reply, `<header>` para los metadatos del autor. La indentación de replies anidados se elimina del atributo `style` y pasa a CSS puro.

## Capabilities

### New Capabilities

_(ninguna — no se introduce ninguna capacidad nueva)_

### Modified Capabilities

- `blog/atproto`: se amplían los requisitos del bloque de comentarios — el reply SHALL mostrar el avatar del autor y la fecha en formato relativo compacto bilingüe.

- El enlace "Comentar en Bluesky" se reemplaza por un botón "Comenta en" que abre un popover con enlaces a las apps conocidas (Bluesky, Mu, Deer) y un input para dominio personalizado. El enlace de cada app usa el patrón `https://<dominio>/profile/<DID>/post/<rkey>`, consistente entre los web clients AT Protocol principales.
- Cada reply incluye un botón "Responder" que abre el mismo tipo de popover apuntando al comentario específico (`/profile/<author-DID>/post/<reply-rkey>`).
- Ambos popovers comparten el mismo patrón de interacción (Popover API nativa). La preferencia de app del visitante se persiste en `localStorage` y se resalta en cada popover.

## Impact

- `src/assets/js/atproto-comments.js` — lógica de renderizado de replies y del selector de app
- `src/assets/css/_atproto-comments.css` — estilos del avatar, layout y selector de app
