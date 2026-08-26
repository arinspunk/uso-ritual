## Context

El CSS declara `--line-height: 1.5` y `--font-size-base` que varía por breakpoint (1rem a 1.25rem). Los márgenes en `.post__content` y `.page__content` usan hoy `--space-md` (1rem) para párrafos y `--space-xl`/`--space-lg` para headings — valores que no guardan relación con el interlineado.

## Goals / Non-Goals

**Goals:**
- Añadir `--baseline` como token derivado en `:root`
- Unificar todos los márgenes verticales en `.post__content` y `.page__content` usando `--baseline`

**Non-Goals:**
- Cambiar el espaciado de layout (padding del header, gaps de grid, footer)
- Baseline grid visual (líneas guía en el fondo) — solo ritmo vertical mediante márgenes
- Modificar `--space-*` tokens

## Decisions

### Token `--baseline`

```css
--baseline: calc(var(--font-size-base) * var(--line-height));
```

Declarado en `:root`. Como `--font-size-base` se sobreescribe en cada breakpoint vía media query, `--baseline` hereda el valor correcto en cada contexto sin declaraciones adicionales.

A mobile (1rem × 1.5): `1.5rem`
A 768px (1.0625rem × 1.5): `~1.59rem`
A 1440px (1.25rem × 1.5): `1.875rem`

**Alternativa descartada:** valor fijo (`1.5rem`). No escala con la tipografía y pierde coherencia en viewports grandes.

### Regla de espaciado: 1 baseline en todas partes

Un único valor para todos los huecos en contenido editorial. No hay distinción de tamaño entre el espacio antes de un heading y el espacio entre párrafos.

El colapso de márgenes de CSS garantiza el resultado correcto:
- `p { margin-bottom: 1bl }` + `p { (sin margin-top) }` → 1 baseline ✓
- `p { margin-bottom: 1bl }` + `h2 { margin-top: 1bl }` → CSS colapsa → 1 baseline ✓
- `h2 { margin-bottom: 1bl }` + `p { (sin margin-top) }` → 1 baseline ✓

### Scope: solo contenido editorial

Solo `.post__content` y `.page__content`. El resto del CSS (layout, header, nav, footer, post-card, media column) usa los tokens `--space-*` existentes y no se toca.

## Risks / Trade-offs

- [Los blockquotes tienen `margin: var(--space-lg) 0` ahora] → Se actualiza a `var(--baseline)`. El cambio es pequeño (1.75rem → 1.5rem a mobile).
- [El `margin-bottom` de `h2` y `h3` pasa de `--space-sm` (0.5rem) a `--baseline` (1.5rem)] → Más espacio después del heading antes del primer párrafo. Es el comportamiento correcto pero puede sorprender visualmente — es una "línea vacía" explícita.
