## Context

El JS actual (`src/assets/js/atproto-comments.js`) es un IIFE de ~515 líneas que se autoiicializa buscando un selector fijo en el DOM. El CSS usa ~12 custom properties del site (`--font-ui`, `--color-text-muted`, `--wada-blue`, `--cy-80`…) sin valores de fallback — si esas variables no existen el componente queda sin estilos. Ver proposal.md para la motivación.

## Goals / Non-Goals

**Goals:**
- Publicar en JSR + npm un Web Component (`<atproto-comments>`) autosuficiente
- CSS funcional out-of-the-box con system fonts; theming vía `--atproto-*`
- Sin dependencias en runtime
- uso-ritual migra a consumir el paquete publicado

**Non-Goals:**
- Soporte a otros lexicons AT Protocol (solo `app.bsky.feed`)
- Soporte a Bluesky OAuth / escritura de posts
- Componentes para React/Svelte/Vue (el custom element ya es cross-framework)
- Retrocompatibilidad con IE11 o navegadores sin Custom Elements v1

## Decisions

### D1 — Web Component (custom element) en lugar de función init o componente de framework

Un custom element declarativo (`<atproto-comments thread-uri="...">`) es el único formato que funciona igual en HTML puro, Astro, Svelte, Next.js y Lume sin adapters. Una función `init(el)` obligaría al adopter a escribir JS extra para encontrar el contenedor. Componentes de framework fragmentan el mantenimiento.

*Alternativa descartada:* función `initComments(selector)` exportada — más simple de implementar pero requiere código de glue en el adopter.

### D2 — Light DOM (sin Shadow DOM)

El adopter puede sobreescribir cualquier clase `.atproto-*` con CSS normal, sin necesidad de `::part()` ni CSS custom properties para cada propiedad individual. Los estilos del paquete se cargan como hoja CSS separada, no inyectada en shadow root.

*Alternativa descartada:* Shadow DOM — encapsulación perfecta pero theming complejo. El adopter necesitaría `::part(avatar)`, `::part(handle)`… para cada elemento que quiera tocar. Demasiada fricción para el caso de uso principal.

### D3 — Contrato de theming con `--atproto-*`

En lugar de heredar variables del site (como hace hoy), el CSS base define defaults propios bajo el namespace `--atproto-*`. El adopter que quiera integración visual simplemente mapea sus tokens:

```css
atproto-comments {
  --atproto-color-muted: var(--color-text-muted);
  --atproto-font-family: var(--font-ui);
}
```

Esto es más explícito que herencia implícita y evita colisiones con las variables del site. Los defaults de oklch son neutros y legibles en modo claro y oscuro.

*Alternativa descartada:* heredar `color` y `font-family` del padre sin variables propias — funciona para color e fuente pero no para valores estructurales (tamaño de avatar, color del placeholder, borde del popover).

### D4 — esbuild como bundler

Produce ESM + UMD en una sola invocación, sin configuración de plugins. El source TypeScript se compila directamente. Tiempo de build < 100ms.

*Alternativa descartada:* Rollup — más config, sin ventaja real para un paquete de este tamaño y sin dependencias.

### D5 — Publicación dual JSR + npm

JSR acepta TypeScript source directamente (no necesita compilar para publicar). npm requiere el dist compilado. El `package.json` apunta al dist ESM; el `jsr.json` apunta al source TS. Versiones idénticas en ambos registros, publicadas por el mismo GitHub Actions workflow.

### D6 — Repo independiente (`github.com/xulio/atproto-comments`)

Versionado semántico propio, issues separados, README orientado a adopters externos. No es un workspace de uso-ritual porque su audiencia y ciclo de vida son distintos.

## Risks / Trade-offs

- **Custom Elements v1 en entornos SSR** → Frameworks como Next.js necesitan `'use client'` o wrapper SSR. Documentar en README. No hay polyfill automático porque añade peso al bundle.
- **Light DOM y especificidad CSS** → El CSS del site del adopter puede sobreescribir accidentalmente estilos del componente si usa selectores genéricos (`ol`, `article`). Mitigación: todas las clases llevan prefijo `atproto-`, no hay estilos sobre elementos sin clase.
- **CSS oklch en Safari < 15.4** → Los defaults de color no se renderizan. Fallback: los colores son solo decorativos (borde del popover, placeholder) y degradan aceptablemente a transparent/inherit. Safari < 15.4 tiene <1% de cuota.
- **Mantenimiento de dos registros** → Si JSR o npm deprecan APIs la publicación dual necesita actualización. Mitigación: el workflow de CI lo automatiza; es un paso de mantenimiento puntual.

## Migration Plan

1. Crear repo `atproto-comments`, implementar, publicar `v1.0.0` en JSR + npm
2. En uso-ritual: añadir `<link rel="stylesheet">` y `<script type="module">` apuntando al CDN del paquete (o importar como dependencia de Deno)
3. Sustituir el `<section class="post-comments">` del template `post.vto` por `<atproto-comments thread-uri="...">`
4. Mapear design tokens del site a variables `--atproto-*` en `_atproto-comments.css`
5. Eliminar `src/assets/js/atproto-comments.js` y actualizar `src/assets/css/_atproto-comments.css` (se convierte en el fichero de mapping de tokens)

Rollback: revertir los pasos 2-5 restaura el comportamiento anterior sin tocar el paquete publicado.

## Resolved Decisions

- **CDN recomendado en README**: jsDelivr — `https://cdn.jsdelivr.net/npm/atproto-comments`. Mejor uptime histórico que esm.sh.
- **Nombre npm**: `atproto-comments` — registrado en npm el 2026-10-04.
