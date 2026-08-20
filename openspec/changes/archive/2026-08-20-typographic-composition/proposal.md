## Why

La columna de texto del blog carece de una composición tipográfica sistemática: los tamaños de fuente no siguen una escala coherente, la jerarquía de titulares depende del tamaño cuando debería depender de la familia y el estilo, la medida de línea no está anclada a caracteres, y el tamaño base no varía con el tamaño de pantalla. El objetivo es que la belleza tipográfica sea consecuencia de una composición correcta para la lectura, siguiendo los principios de Bringhurst.

## What Changes

- El tamaño base (`--font-size-base`) varía por breakpoint: 16px mobile, 17px tablet, 18px laptop, 19px desktop, 20px large.
- Se introduce una escala tipográfica ×1.2 (minor third): h1 = base×1.2, cuerpo/h2/h3 = base, caption = base÷1.2.
- La jerarquía de titulares se basa en familia y estilo, no en tamaño: h1 y h2 en sans (system-ui, weight 400), h3 en sans italic, cuerpo y captions en Georgia.
- La medida de línea se fija en `65ch` siempre, incluyendo en layout de dos columnas (se elimina el override `max-width: none`).
- Se establece `text-align: left` y `hyphens: none` explícitamente en toda la columna de texto.
- En mobile (< 768px), la columna es fluida (`width: 100%`) y la línea resulta en ~40ch — se acepta como límite físico del viewport.

## Capabilities

### New Capabilities

_(ninguna — este cambio refina el sistema de diseño existente)_

### Modified Capabilities

- `blog/design`: nuevos requisitos sobre escala tipográfica, jerarquía de titulares, medida de línea, y comportamiento responsivo del tamaño base.

## Impact

- `src/assets/css/main.css`: único archivo modificado.
- Sin cambios en templates, contenido, ni lógica de build.
- Sin nuevas dependencias externas (se mantiene en system fonts por ahora).
