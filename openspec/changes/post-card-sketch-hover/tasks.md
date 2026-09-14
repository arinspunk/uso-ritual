## 1. Paths SVG

- [x] 1.1 Recibir los SVG exportados por el autor; extraer el atributo `d` de cada `<path>` y el `viewBox` del SVG contenedor, y añadirlos como array de objetos `{ d, viewBox }` en `src/assets/js/post-card-sketch.js`

## 2. Módulo JavaScript

- [x] 2.1 Reescribir `src/assets/js/post-card-sketch.js`: eliminar la dependencia de Rough.js; implementar la selección aleatoria sin repetición consecutiva sobre el array de paths
- [x] 2.2 En cada `mouseenter`, renderizar el path seleccionado en el SVG con el `viewBox` correspondiente y `preserveAspectRatio="xMidYMid meet"`, aplicando `stroke` y `strokeWidth` leídos de las CSS custom properties
- [x] 2.3 Implementar la animación de dibujo: obtener `getTotalLength()` del path, asignar `strokeDasharray` y `strokeDashoffset` al total, y ejecutar `path.animate([{ strokeDashoffset: length }, { strokeDashoffset: 0 }], { duration: 500, easing: "ease-out", fill: "forwards" })`
- [x] 2.4 Añadir soporte a `prefers-reduced-motion`: si `matchMedia("(prefers-reduced-motion: reduce)").matches`, mostrar el path directamente con `strokeDashoffset: 0` sin animación
- [x] 2.5 Llamar a `initSketch(card)` para cada `.post-card` que contenga `.post-card__media` al ejecutarse `DOMContentLoaded`

## 3. CSS

- [x] 3.1 Añadir en `_post-list.css` los estilos del SVG: `.post-card__sketch { position: absolute; top: 0; left: 0; width: 100%; height: 100%; overflow: visible; pointer-events: none; opacity: 0; transition: opacity 0.1s; }`
- [x] 3.2 Añadir el estado hover: `.post-card:hover .post-card__sketch { opacity: 1; }`
- [x] 3.3 Definir las custom properties con valores por defecto en `.post-card`: `--sketch-color: currentColor; --sketch-stroke-width: 2;`
- [x] 3.4 Añadir la regla `prefers-reduced-motion` al bloque existente en `_post-list.css`: `.post-card__sketch { transition: none; }`

## 4. Template

- [x] 4.1 En `src/_includes/layouts/home.vto`, añadir `<script type="module" src="/assets/js/post-card-sketch.js"></script>`
- [x] 4.2 Confirmar que `_config.ts` copia `assets/js` al output: añadir `site.copy("assets/js")` si no existe

## 5. Verificación

- [ ] 5.1 Arrancar el servidor local y comprobar que al hacer hover sobre una card aparece el trazo animado
- [ ] 5.2 Verificar que el trazo es visualmente distinto en hovers consecutivos (sin repetición inmediata)
- [ ] 5.3 Verificar que el trazo desborda ligeramente el borde de la imagen sin ser recortado
- [ ] 5.4 Verificar que cards sin thumbnail no generan SVG ni errores en consola
- [ ] 5.5 Simular `prefers-reduced-motion` en DevTools y verificar que el trazo aparece sin animación
- [ ] 5.6 Verificar que el zoom de la thumbnail sigue funcionando sin regresión
