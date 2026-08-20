## Context

El sistema tipográfico actual usa un único `--font-size-base: 1.0625rem` fijo, Georgia para todo el texto, y tamaños de heading definidos con `clamp()` o valores arbitrarios. La columna de texto tiene `max-width: 65ch` en layout normal pero ese valor se anula con `max-width: none` en el layout de dos columnas. Ver proposal.md para la motivación.

## Goals / Non-Goals

**Goals:**
- Escala ×1.2 implementada con variables CSS relativas al tamaño base
- Tamaño base variable por breakpoint vía media queries sobre `html`
- 65ch mantenido siempre como medida de lectura
- Jerarquía sans/serif expresada solo en CSS, sin cambios en HTML

**Non-Goals:**
- Carga de web fonts (se defer para un cambio posterior)
- Cambios en la paleta de colores o espaciado
- Modificaciones en templates o contenido

## Decisions

### `font-size` se aplica sobre `html`, no `body`

El `--font-size-base` se asigna al `font-size` del elemento `html` (no de `body`). Así `1rem` es siempre igual al tamaño base del breakpoint activo, y todos los valores en `rem` del sistema escalan automáticamente sin tocar nada más.

_Alternativa descartada_: aplicarlo en `body` y usar `em` en los hijos — funciona, pero obliga a mantener contextos de `em` anidados que se vuelven frágiles.

### Escala expresada como variables derivadas

```css
--font-size-h1:      calc(1rem * 1.2);   /* base × 1.2  */
--font-size-body:    1rem;               /* base        */
--font-size-caption: calc(1rem / 1.2);   /* base ÷ 1.2  */
```

Los valores de h2 y h3 usan `--font-size-body` directamente — su distinción es familia/estilo, no tamaño.

_Alternativa descartada_: valores hardcodeados por breakpoint — duplicación innecesaria, la escala relativa es más robusta.

### `ch` como unidad de medida de la columna

`max-width: 65ch` expresa directamente el principio tipográfico: 65 veces el ancho del carácter "0" en la fuente activa. Cuando cambie el `font-size` base o la familia tipográfica, la medida en píxeles se recalcula sola. Ver exploración en conversación para el razonamiento completo.

_Alternativa descartada_: `max-width` en `px` por breakpoint — requiere recalcular manualmente con cada cambio de fuente o tamaño.

### Eliminación del override `max-width: none` en dos columnas

El selector `.post__body--with-media .post__content` actualmente anula la medida con `max-width: none`. Se elimina. La columna de texto en layout de dos columnas también debe mantener 65ch — la columna de media convive a su derecha sin negociar la medida de lectura.

### Mobile: columna fluida, medida corta aceptada

En viewports < 768px, `65ch` (≈560px a 16px) supera el ancho disponible. La columna se hace fluida con `width: 100%`. La línea resultante es ~40ch — se acepta como límite físico del viewport. No se reduce el `font-size` por debajo de 16px para forzar 65ch.

### Line-heights por elemento

```
h1:             1.2   (sans, título, pocas líneas)
h2, h3:         1.4   (sans, sección, interlineado medio)
body/p:         1.7   (serif, lectura sostenida, ya existente)
caption/notas:  1.5   (serif, tamaño pequeño necesita más aire)
```

## Risks / Trade-offs

- **`system-ui` varía entre plataformas** → En macOS será SF Pro, en Windows Segoe UI, en Android Roboto. La jerarquía h1/h2/h3 puede verse diferente en cada OS. Mitigación: cuando se incorporen web fonts, la sans tendrá comportamiento homogéneo.
- **`calc(1rem / 1.2)` da valores no enteros** → Las captions pueden renderizar a 13.3px en mobile. Aceptable para texto secundario; si resulta ilegible se puede redondear a `0.875rem` (14px).
- **Eliminar `max-width: none` puede estrechar la columna en layouts con media** → En pantallas entre 768-900px, 65ch + columna de media + gap puede exceder el viewport. El grid de dos columnas ya colapsa a una columna en mobile (< 640px); si se detecta problema visual en tablet se puede ajustar el breakpoint de colapso.

## Open Questions

- ¿Cuál será la sans de los headings cuando se incorporen web fonts? La elección puede afectar el `ch` de la fuente body si se decide unificar familias. No bloquea esta implementación.
