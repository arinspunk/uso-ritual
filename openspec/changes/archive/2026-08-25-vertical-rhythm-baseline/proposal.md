## Why

El espaciado vertical del contenido editorial usa tokens de espacio genéricos (`--space-md`, `--space-lg`, `--space-xl`) que no guardan relación entre sí ni con la tipografía. El resultado es un ritmo visual inconsistente. Unificar todos los espacios entre elementos de texto en un múltiplo del interlineado del cuerpo crea coherencia y percepción de cuadrícula implícita.

## What Changes

- Añadir el token `--baseline` a `:root`: valor calculado como `font-size-base × line-height`
- Aplicar `--baseline` como único valor de espaciado vertical en contenido editorial (`.post__content`, `.page__content`): párrafos, encabezados, listas, blockquotes
- Los tokens `--space-*` se mantienen sin cambios para uso en layout (padding, gaps de grid, chrome de UI)

## Capabilities

### New Capabilities

### Modified Capabilities

- `blog/design`: el requisito de espaciado vertical en contenido editorial cambia — todos los márgenes entre elementos de texto deben ser múltiplos de `--baseline`

## Impact

- `src/assets/css/main.css`: añadir `--baseline` en `:root`, actualizar márgenes en `.post__content` y `.page__content`
- Sin cambios en templates, contenido ni dependencias
