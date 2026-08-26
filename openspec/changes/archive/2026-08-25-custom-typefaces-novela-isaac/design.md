## Context

El CSS actual declara `--font-body: Georgia, "Times New Roman", serif` y `--font-ui: system-ui, -apple-system, "Segoe UI", sans-serif`. Varios elementos usan `font-weight: 600` o `500` en contextos UI (logo, lang-switcher activo, botones). Ver `proposal.md` para la motivación.

Los archivos de fuente disponibles:
- Novela Regular: woff2 + woff en `/Users/xulio/Downloads/Novela-Regular/Webfont/Novela-Regular-webfontkit/`
- Isaac Regular: woff2 (del ak-theme) + woff (de IsaacSans/WebFont)
- Isaac Regular Italic: woff2 (del ak-theme) + woff (de IsaacSans/WebFont)

## Goals / Non-Goals

**Goals:**
- Servir Novela e Isaac desde `src/assets/fonts/` con `@font-face`
- Actualizar las dos variables `--font-body` y `--font-ui` en `:root`
- Eliminar todos los `font-weight` distintos de 400 del CSS

**Non-Goals:**
- Otros pesos de Isaac (SemiBold, Bold, etc.)
- Novela Italic (se evaluará tras la prueba visual)
- Dark mode
- Cambios en tamaños, espaciado o layout

## Decisions

### Archivos a copiar
Solo los cortes necesarios para la prueba:
- `novela-regular-webfont.woff2` y `novela-regular-webfont.woff`
- `IsaacRegular.woff2` y `IsaacRegular.woff`

Isaac Regular Italic no se copia todavía — los blockquotes usarán italic sintético sobre Novela provisionalmente. Si se confirma el par tipográfico, se compra Novela Italic y se añade Isaac Italic si hace falta.

**Alternativa descartada:** copiar toda la familia Isaac. Innecesario para la prueba y añade peso sin beneficio observable ahora.

### Declaraciones @font-face
Dos bloques, con `font-display: swap` para evitar texto invisible durante la carga. El `font-weight` declarado es siempre `normal` (400).

**Alternativa descartada:** `font-display: optional`. Correcto para fuentes de UI secundarias, pero aquí las fuentes son el elemento identitario principal — el flash de Georgia/system-ui es más disruptivo que el reflow de swap.

### Eliminación de font-weight no-400
Los elementos afectados:
- `.site-header__logo`: `font-weight: 600` → eliminar
- `.lang-switcher__item--active`: `font-weight: 600` → eliminar (el contraste de color y `cursor: default` ya lo distinguen)
- `.btn-primary`: `font-weight: 500` → eliminar
- `.btn-alt`: `font-weight: 600` → eliminar

**Alternativa descartada:** mantener pesos para botones. Contradice la decisión de sistema: si el sitio no usa pesos, los botones tampoco.

## Risks / Trade-offs

- [Novela sin italic nativo] → Los `<em>` inline y los blockquotes mostrarán italic sintético (oblique generado por el navegador). Aceptado provisionalmente. Si el resultado visual es inaceptable, se compra Novela Italic antes de archivar.
- [font-display: swap puede provocar reflow] → El texto se muestra en la fuente del sistema hasta que cargan Novela e Isaac, luego salta. En producción con fuentes en el mismo servidor el tiempo es mínimo; en local es imperceptible.
- [woff2 de Isaac Regular no viene del webfontkit oficial] → Se usa el woff2 del ak-theme (mismo archivo, misma fuente). El woff2 oficial está solo en formato OTF en `/Users/xulio/Library/Fonts/`. Para una prueba local es suficiente; si se va a producción habría que generar el woff2 desde el OTF oficial.
