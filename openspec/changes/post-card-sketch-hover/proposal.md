## Why

Las post cards del listado principal carecen de feedback visual expresivo al hacer hover. Queremos añadir un efecto de garabato dibujado a mano que rodee la imagen de la card, coherente con la estética artesanal del sitio.

## What Changes

- Se añade un SVG superpuesto sobre la imagen de cada post card, invisible en reposo y visible al hacer hover.
- Al entrar el cursor, se genera dinámicamente un trazo irregular de aspecto manual (usando Rough.js) que rodea la imagen, pudiendo desbordar ligeramente sus bordes.
- El trazo tiene grosor uniforme (como un rotulador, no una pluma).
- Cada vez que se activa el hover, el trazo generado es distinto al anterior.
- El trazo se anima progresivamente (efecto de "se dibuja") al aparecer.
- El color y grosor del trazo se exponen como propiedades CSS configurables para facilitar las pruebas.

## Capabilities

### New Capabilities

- `blog/post-card-hover-sketch`: Efecto de trazo dibujado a mano que aparece sobre la thumbnail de la post card al hacer hover.

### Modified Capabilities

_(ninguna)_

## Impact

- **Templates**: `src/_includes/layouts/home.vto` — se añade un elemento `<svg>` como hermano de `.post-card__media`.
- **CSS**: `src/assets/css/_post-list.css` — estilos para el SVG superpuesto y la animación de trazo.
- **JavaScript**: nuevo módulo `src/assets/js/post-card-sketch.js` — lógica de generación de trazos con Rough.js y animación `stroke-dashoffset`.
- **Dependencia externa**: Rough.js (librería ligera, ~20 KB min+gz, importada desde npm o CDN/bundleada).
- No hay cambios en la estructura de datos de posts ni en el sistema de build.
