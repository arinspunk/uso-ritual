## Context

El grid de breakout existe hoy exclusivamente en `.post__content` (`_post.css`). Home usa `<div class="post">` para heredar ese grid de forma accidental; page usa `max-width: 48ch` sin grid. Hay un hack `:has(.post) { max-width: none }` en `.main` para desactivar el max-width del shell cuando hay un post. El partial `post-media.vto` y `media_shortcodes.ts` emiten clases `post-media post-media--{size}`. Los anchos actuales del grid son correctos y no cambian.

## Goals / Non-Goals

**Goals:**
- Extraer el grid a `.page-body` sin modificar sus propiedades (anchos, named lines, etc.)
- Renombrar clases de breakout a BEM estricto: `.col`, `.col--wide`, `.col--full`, `.col--text`
- Renombrar clases de encabezado a BEM agnóstico: `.page-header`, `__title`, `__subtitle`, `__date`, `--center`
- Aplicar `.page-body` en los tres layouts (home, page, post)
- Eliminar el hack `:has(.post)`
- Sincronizar `post-media.vto` y `media_shortcodes.ts` con el nuevo naming

**Non-Goals:**
- Cambiar los anchos del grid (texto, wide, full permanecen idénticos)
- Rediseñar el visual de ningún layout
- Tocar los ficheros Markdown de los posts

## Decisions

### D1: El grid vive en `.page-body`, no en `<main>`

`.page-body` es un div wrapper dentro de `<main>`. La alternativa sería poner el grid directamente en `.main`, pero Lume renderiza `{{ content }}` como un bloque HTML opaco — los hijos directos de `<main>` serían el div raíz del layout, no los elementos individuales. Un wrapper explícito es más predecible y no requiere tocar `base.vto`.

### D2: `.col` como bloque BEM, no como clase de utilidad standalone

La alternativa de `class="col--wide"` sin bloque viola BEM y hace los modificadores semánticamente huérfanos. `.col` actúa como bloque de posicionamiento: sin modificador, un hijo de `.page-body` va a columna texto por defecto vía el selector `> *`; con `.col--wide` o `.col--full` rompe el breakout. La clase `.col` no añade estilos propios más allá de pertenecer al sistema.

### D3: `media` como clase de bloque semántico, separada de `.col`

Los elementos de media (figura, div de audio, galería) llevan `class="media col col--wide"`. `media` porta los estilos de bloque (márgenes, embed ratio, caption). `col col--wide` porta únicamente el posicionamiento en el grid. Esta separación permite usar el sistema de columnas en elementos no-media (como la lista de posts en home) sin arrastrar estilos de media.

### D4: CSS reorganizado, no reescrito

`_post.css` pierde el bloque `display: grid` que pasa a un nuevo partial `_page-body.css` (o se añade a `_layout.css`). Las reglas de `.post__content` que no son grid (márgenes, alineación, hyphens) se mantienen bajo `.page-body` o bajo `.post` según corresponda. `_post-media.css` actualiza los selectores de `.post-media--*` a `.col--*`.

### D6: `.page-header` como bloque de encabezado agnóstico

Los tres layouts usaban clases distintas para el mismo concepto: `.post__header` en post y home, `.page__title` en páginas estáticas. Unificarlos bajo `.page-header` elimina la ambigüedad de qué clase usar en un layout nuevo y permite estilizar el encabezado de forma consistente sin selectores específicos por tipo. La alternativa de mantener `.post__header` habría perpetuado el acoplamiento semántico que este change pretende romper.

### D5: home — lista de posts a `.col.col--wide`

El grid de posts en home irá a `col col--wide` para mantener la anchura actual. El título y subtítulo van a columna texto (sin clase adicional, heredad del `> *` default).

## Risks / Trade-offs

- **Renombrado de clases es breaking** → no hay CSS de terceros ni temas que dependan de estas clases; el renombrado es seguro dentro del repo.
- **`media_shortcodes.ts` debe estar en sincronía 1:1 con `post-media.vto`** → el comentario de cabecera en la plantilla ya lo documenta; hay que actualizarlo junto con las clases.
- **Posts en producción** → los shortcodes generan las clases en build time; al actualizar la plantilla y el shortcode, todos los posts se regeneran automáticamente sin editar Markdown.

## Migration Plan

1. Crear `_page-body.css` con el grid (extraído de `_post.css`)
2. Actualizar `_post.css`: `.post__content` → `.page-body` en selectores dependientes; eliminar el bloque grid
3. Actualizar `_layout.css`: eliminar hack `:has(.post)`; `.main` vuelve a `max-width: var(--max-width)` y se elimina la excepción (el grid de `.page-body` controla la anchura internamente)
4. Actualizar `_post-media.css`: `.post-media--wide` → `.col--wide`, etc.
5. Actualizar `post-media.vto` y `media_shortcodes.ts`: nuevas clases
6. Actualizar `home.vto`: wrapper → `.page-body`; lista de posts → `col col--wide`
7. Actualizar `page.vto`: wrapper → `.page-body`; eliminar `max-width: 48ch` directo
8. Actualizar `post.vto`: `.post__content` → `.page-body`

9. Renombrar clases de encabezado en `_post.css`: `.post__header` → `.page-header`, `.post__title` → `.page-header__title`, `.post__subtitle` → `.page-header__subtitle`, `.post__date` → `.page-header__date`; eliminar `.page__title`
10. Actualizar `post.vto`, `home.vto` y `page.vto`: clases de encabezado → `.page-header` y elementos BEM

Sin rollback especial necesario — todo es CSS y templates estáticos.
