## Context

Ver `proposal.md — Why` para la motivación. Estado actual relevante para las decisiones técnicas:

- `_config.ts` usa `site.copy("assets/css")` — Lume copia la carpeta sin procesar.
- `src/assets/css/main.css` es el único archivo CSS, ~560 líneas, bien seccionado con comentarios pero monolítico.
- El proyecto usa Lume v2.3.3 (Deno), que incluye `lume/plugins/lightningcss.ts` sin dependencias adicionales.
- No hay preprocesador CSS activo.

## Goals / Non-Goals

**Goals:**
- Activar el plugin LightningCSS de Lume para bundlear `@import` en build time.
- Dividir `main.css` en archivos parciales temáticos, manteniendo la misma cascada y especificidad.
- El output (`_site/assets/css/main.css`) debe ser byte-compatible en comportamiento con el actual.

**Non-Goals:**
- No migrar a Sass/SCSS ni añadir preprocesado.
- No introducir cambios visuales ni de diseño.
- No minificar ni hacer tree-shaking agresivo (LightningCSS lo soporta pero no es el objetivo).
- No reorganizar la arquitectura de templates ni los nombres de clase BEM.

## Decisions

### 1. LightningCSS en vez de Sass

LightningCSS bundlea `@import` nativamente, es parte del ecosistema Lume (sin `deno.json` changes), y permite CSS nesting moderno. Sass añadiría un lenguaje extra y sus puntos fuertes (mixins, funciones) aportan poco cuando los tokens ya viven en custom properties de CSS.

**Alternativa descartada:** PostCSS con `postcss-import` — más configuración, más dependencias.

### 2. Estructura de archivos parciales

```
src/assets/css/
├── main.css          ← entrada: solo directivas @import en orden de cascada
├── tokens.css        ← @font-face + :root (custom properties)
├── reset.css         ← reset mínimo + base elements (html, body, img, a)
├── typography.css    ← h2, h3, p, blockquote, cite
├── layout.css        ← .main (shell global)
├── header.css        ← .site-header, .site-nav, .lang-switcher
├── footer.css        ← .site-footer
├── post-list.css     ← .post-list, .post-card (home listing)
├── post.css          ← .post__*, .post__content grid
├── post-media.css    ← shortcodes: .post-media, .media-embed, .post-gallery, .post-media--*
├── buttons.css       ← .btn-primary, .btn-alt
└── responsive.css    ← @media breakpoints (640px) que afectan múltiples componentes
```

Razón del corte: cada archivo cubre un ámbito coherente de componentes. Los media queries generales van en `responsive.css`; los que pertenecen a un solo componente irán co-localizados en ese archivo si los hay.

**Alternativa descartada:** un solo breakpoint file para todo — mejor que dispersar media queries, pero un archivo por componente (co-located) sería correcto solo si LightningCSS soporta nesting de `@media` dentro de reglas, lo cual sí hace. Sin embargo, el único bloque `@media (max-width: 640px)` actual toca varios componentes a la vez, así que `responsive.css` es más limpio.

### 3. CSS nesting habilitado donde simplifica

LightningCSS transpila CSS nesting a sintaxis compatible. Se aplicará oportunistamente en selectores compuestos donde reduzca repetición (p. ej. `.post-card__link:hover .post-card__title`), sin forzar refactors profundos.

## Risks / Trade-offs

- **Orden de @import crítico**: la cascada depende del orden. `main.css` debe declararlos en la secuencia correcta (tokens → reset → typography → layout → componentes → responsive). Riesgo bajo: la secuencia es la misma que la del archivo actual.
- **LightningCSS versión**: el plugin viene con Lume v2.3.3; si hubiera un bug en esa versión, el workaround es `site.copy("assets/css")` y volver a la hoja monolítica. El rollback es trivial.
- **Archivos ignorados por Lume**: con `site.use(lightningCss())` Lume procesa archivos `.css` como assets; los parciales no deben ser copiados directamente. LightningCSS solo emite el punto de entrada (`main.css`); los `@import` se incluyen en él. Si Lume copiara también los parciales habría que excluirlos con un patrón de nombre (prefijo `_`) o configuración de `ignore`.
