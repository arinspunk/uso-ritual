## 1. Copiar archivos de fuente

- [x] 1.1 Crear el directorio `src/assets/fonts/` si no existe
- [x] 1.2 Copiar `novela-regular-webfont.woff2` y `novela-regular-webfont.woff` desde `/Users/xulio/Downloads/Novela-Regular/Webfont/Novela-Regular-webfontkit/` a `src/assets/fonts/`
- [x] 1.3 Copiar `IsaacRegular.woff2` desde `/Users/xulio/Desktop/ak/wp-content/themes/ak-theme/assets/fonts/Isaac.woff2` a `src/assets/fonts/`
- [x] 1.4 Copiar `IsaacRegular.woff` desde `/Users/xulio/Sites/localhost/arinspunk/IsaacSans/WebFont/IsaacRegular.woff` a `src/assets/fonts/`

## 2. Configurar Lume para copiar las fuentes al build

- [x] 2.1 Verificar que `_config.ts` incluye `src/assets/fonts/` en los archivos copiados al output (o que el patrón de copia existente ya lo cubre)

## 3. Declarar @font-face en el CSS

- [x] 3.1 Añadir al inicio de `src/assets/css/main.css` los bloques `@font-face` para Novela Regular e Isaac Regular, con `font-display: swap` y rutas relativas a `/fonts/`

## 4. Actualizar variables tipográficas

- [x] 4.1 Cambiar `--font-body` de `Georgia, "Times New Roman", serif` a `'Novela', Georgia, serif`
- [x] 4.2 Cambiar `--font-ui` de `system-ui, -apple-system, "Segoe UI", sans-serif` a `'Isaac', system-ui, sans-serif`

## 5. Eliminar font-weight distintos de 400

- [x] 5.1 Eliminar `font-weight: 600` de `.site-header__logo`
- [x] 5.2 Eliminar `font-weight: 600` de `.lang-switcher__item--active`
- [x] 5.3 Eliminar `font-weight: 500` de `.btn-primary`
- [x] 5.4 Eliminar `font-weight: 600` de `.btn-alt`

## 6. Verificación

- [x] 6.1 Levantar el servidor local y verificar que Novela carga en el cuerpo de texto de un post
- [x] 6.2 Verificar que Isaac carga en el header, nav y títulos
- [x] 6.3 Verificar en DevTools (Network) que las fuentes se sirven desde el propio dominio sin peticiones externas
- [x] 6.4 Verificar que no hay diferencias de peso visible en ningún elemento del sitio
