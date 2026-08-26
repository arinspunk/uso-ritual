## Why

Durante la exploración de la nueva paleta basada en Sanzo Wada Classic #151, se generaron múltiples escalas de tintes y sombras con sus ratios de contraste. Se necesita una página estática interna donde visualizar estas combinaciones en contexto real — texto sobre fondo, con tipografía del sitio — antes de decidir los valores definitivos para el rediseño.

## What Changes

- Añadir una página estática `/paleta/` (solo en PT, sin versión EN) que muestra:
  - Escala de tintes del Sulphur Yellow `#f5ecc2` en pasos del 10% (0%–90%)
  - Escala de sombras del Vandar Poel's Blue `#064f6e` en pasos del 10% (0%–50%)
  - Cinco combinaciones nombradas (bg + text) con su ratio de contraste WCAG
  - El Yellow Orange `#f99d1b` como color de acción (muestra de botón)
  - Links como color de texto + subrayado (sin color de acento)
  - Texto de muestra real: párrafo, encabezado, cita, caption

## Capabilities

### New Capabilities
- `blog/color-palette-preview`: Página de previsualización interna de la paleta Sanzo Wada Classic #151 con escalas de color, combinaciones fondo/texto y ratios de contraste.

### Modified Capabilities

## Impact

- Nuevo archivo de contenido en `src/` (página Lume, solo PT)
- Sin cambios en CSS principal ni en componentes existentes — usa estilos inline o un bloque `<style>` en la página para aislar las muestras
- Sin efecto en navegación principal (página no listada en nav)
- Sin versión EN ni entradas de i18n nuevas
