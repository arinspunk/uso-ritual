## Context

Ver `proposal.md` para la motivación. El sistema actual tiene la media en un array `media` del frontmatter, renderizada en un `<aside class="post__media">` lateral. El CSS implementa un grid de dos columnas (32ch media + 48ch texto) a partir de 1100px. Los shortcodes se registran en `_config.ts` con `site.helper()` y Lume los procesa antes de convertir el markdown a HTML.

## Goals / Non-Goals

**Goals:**
- Columna única centrada, texto a 48ch, media intercalada con breakout CSS grid
- Cinco shortcodes (`postImage`, `postVideo`, `postAudio`, `postGallery`, `postQuote`) registrados en `_config.ts`
- Campo `thumbnail` en frontmatter para la card de la home
- Migración del post `primeiro-post.md` como referencia

**Non-Goals:**
- Soporte para proveedores de vídeo distintos de YouTube y Bandcamp (se puede extender después)
- Lazy loading de embeds (fuera del alcance de este cambio)
- Dark mode o variantes de tema para los bloques de media

## Decisions

### 1. CSS grid breakout para el sistema de anchos

**Decisión:** Implementar el breakout con CSS grid en `.post__content`, usando líneas nombradas `[text-start]`, `[text-end]`, `[wide-start]`, `[wide-end]`, `[full-start]`, `[full-end]`.

```css
.post__content {
  display: grid;
  grid-template-columns:
    [full-start] 1fr
    [wide-start] minmax(0, 12ch)
    [text-start] min(48ch, 100%)
    [text-end]   minmax(0, 12ch)
    [wide-end]   1fr
    [full-end];
}
.post__content > * { grid-column: text-start / text-end; }
.post-media--wide  { grid-column: wide-start / wide-end; }
.post-media--full  { grid-column: full-start / full-end; }
```

**Por qué no márgenes negativos:** Los márgenes negativos requieren `overflow: hidden` en el ancestro o producen scroll horizontal; el grid es más limpio y predecible en todos los breakpoints.

**Por qué `minmax(0, 12ch)` para los márgenes del wide:** Permite que el wide crezca hasta 72ch (48+12+12) en pantallas grandes, pero se colapsa a 0 en viewports estrechos sin overflow.

### 2. Shortcodes como `site.helper()` de Lume

**Decisión:** Registrar cada shortcode con `site.helper("postImage", fn, { type: "tag" })` en `_config.ts`. Lume procesa el Vento antes del markdown, por lo que los shortcodes son accesibles desde el cuerpo `.md`.

**Alternativa descartada — componentes Vento (`_components/`):** Requieren sintaxis `{{ comp.postImage() }}` en lugar de `{{ postImage }}`. Los helpers con `type: "tag"` son más ergonómicos para autores de posts.

**Alternativa descartada — HTML directo en markdown:** Válido para casos puntuales, pero sin tipado ni validación. El shortcode genera HTML correcto sin que el autor escriba iframes ni clases a mano.

### 3. Formato de args para postGallery

**Decisión:** String delimitado por pipe `"src|alt|caption"` por ítem, número variable de argumentos posicionales.

```
{{ postGallery "est-1.jpg|Estudio 1|Mañana" "est-2.jpg|Estudio 2|Tarde" }}
```

**Por qué pipe y no objetos JSON:** Los objetos JSON en markdown son verbosos y propensos a errores de escape. El pipe es legible y suficiente para tres campos.

**Por qué no array YAML en el shortcode:** Vento no soporta arrays literales como argumentos de helper de forma natural.

### 4. Detección de proveedor por URL en postAudio y postVideo

**Decisión:** Detección por `includes()` en la URL dentro de la función del helper en `_config.ts`. Sin dependencias externas.

| Proveedor | Pattern de URL | Tipo de embed |
|-----------|---------------|---------------|
| YouTube | `youtu.be/` o `youtube.com/watch` | iframe 16:9 |
| SoundCloud | `soundcloud.com` | iframe 166px height |
| Spotify | `open.spotify.com` | iframe 80px height |
| Bandcamp | `bandcamp.com` | iframe 16:9 |
| Otros | — | `<a>` externo |

### 5. Migración de `primeiro-post.md`

**Decisión:** Migrar el post existente como parte de este cambio para tener un ejemplo real de referencia. El array `media` del frontmatter se elimina y su contenido se coloca inline en el cuerpo del post usando los shortcodes correspondientes.

El campo `thumbnail` se añade al frontmatter apuntando a la primera imagen del post original.

## Risks / Trade-offs

- **Markdown wrapping** → Los shortcodes generan HTML block-level. Si Lume envuelve el output del shortcode en `<p>`, los `<figure>` anidados producirán HTML inválido. Mitigación: verificar en la implementación que Lume trate los helpers `type: "tag"` como block-level; si no, usar `site.helper` con `type: "filter"` y un wrapper `{% raw %}`.
- **CSS grid y hijos directos** → El breakout por CSS grid requiere que los elementos de media sean hijos directos de `.post__content`. El markdown puede envolver imágenes en `<p>`; los shortcodes evitan esto al generar `<figure>` directamente, pero hay que verificar en el build.
- **Migración manual de posts futuros** → El cambio no incluye un script de migración automática del frontmatter. Los posts existentes (más allá del `primeiro-post.md`) deberán migrarse a mano. Documentar la equivalencia de shortcodes en el README del proyecto.

## Open Questions

- ¿Se mantiene el partial `media-item.vto` como fallback para posts que no se hayan migrado, o se elimina completamente? Si se mantiene, el CSS de dos columnas también debería mantenerse temporalmente. **Decisión diferida**: eliminar completamente y migrar todos los posts en el mismo PR.
