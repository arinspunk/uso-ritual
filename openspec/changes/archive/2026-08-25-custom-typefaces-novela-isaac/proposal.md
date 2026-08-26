## Why

El sitio usa Georgia y system-ui — tipografías funcionales pero sin carácter propio. Sustituirlas por Novela (serif editorial con personalidad de libro impreso) e Isaac Sans (sans de autor gallega) da al sitio una voz tipográfica coherente con su identidad nocturna y ritual.

## What Changes

- Añadir archivos de fuente a `src/assets/fonts/`: Novela Regular (woff2 + woff) e Isaac Regular (woff2 + woff)
- Declarar `@font-face` para ambas fuentes en el CSS
- Actualizar `--font-body` de Georgia a Novela
- Actualizar `--font-ui` de system-ui a Isaac
- Eliminar todos los `font-weight` distintos de 400 en contextos `--font-ui` — el sitio establece contraste tipográfico solo mediante familia y tamaño, no mediante peso
- Los blockquotes usan `font-style: italic` heredado de Novela (italic sintético aceptado provisionalmente; se comprará Novela Italic si se confirma este par)

## Capabilities

### New Capabilities

### Modified Capabilities

- `blog/design`: los requisitos de tipografía cambian — fuentes propias servidas localmente, sin pesos distintos de regular en UI

## Impact

- `src/assets/fonts/`: directorio nuevo con 4 archivos (novela woff2+woff, isaac woff2+woff)
- `src/assets/css/main.css`: `@font-face`, `--font-body`, `--font-ui`, eliminación de `font-weight` no-400 en UI
- Sin cambios en templates ni contenido
- Sin nuevas dependencias de build
