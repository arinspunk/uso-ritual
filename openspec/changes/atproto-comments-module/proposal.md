## Why

El sistema de comentarios vía AT Protocol de uso-ritual está acoplado a los design tokens del site (CSS custom properties, fuentes, colores) y no puede reutilizarse tal cual en otros proyectos. Extraerlo como paquete independiente permite que cualquier site —independientemente del stack— lo adopte con mínima configuración.

## What Changes

- Nuevo repositorio GitHub independiente: `atproto-comments` (publicado como `@xulio/atproto-comments` en JSR y npm)
- El código JavaScript actual (`src/assets/js/atproto-comments.js`) se convierte a TypeScript y se refactoriza como Web Component (`<atproto-comments>`) con Light DOM
- CSS desacoplado del site: system fonts, valores estructurales hardcoded razonables, contrato de theming vía `--atproto-*` custom properties
- API de atributos HTML: `thread-uri`, `appview`, `lang`, `max-depth`
- Exportación ESM como módulo principal + bundle UMD para uso vía CDN (`<script src>`)
- Pipeline de publicación: GitHub Actions → JSR + npm + GitHub Releases

## Capabilities

### New Capabilities

- `atproto/comments-module`: Paquete distribuible que implementa un Web Component (`<atproto-comments>`) para mostrar comentarios de Bluesky/AT Protocol en cualquier sitio web. Define el contrato de API (atributos HTML, CSS custom properties de theming, exports JS) y los requisitos de comportamiento heredados del sistema actual.

### Modified Capabilities

- `blog/atproto`: El site usará el paquete publicado en lugar del archivo JS inlining, eliminando la copia local. El comportamiento del sistema de comentarios no cambia.

## Impact

- **Nuevo repo**: `github.com/xulio/atproto-comments` — TypeScript, esbuild como bundler, sin dependencias en runtime
- **uso-ritual**: `src/assets/js/atproto-comments.js` y `src/assets/css/_atproto-comments.css` se eliminan cuando el paquete esté publicado; el layout `post.vto` importa desde CDN o npm
- **CSS**: las clases `.atproto-*` se mantienen como contrato público para adopters; las CSS vars del site (`--font-ui`, `--wada-blue`, etc.) desaparecen del bundle; se introducen `--atproto-color-muted`, `--atproto-color-border`, `--atproto-avatar-size`, `--atproto-font-size` con defaults razonables
