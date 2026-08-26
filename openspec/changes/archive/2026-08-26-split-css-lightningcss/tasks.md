## 1. Activar LightningCSS en Lume

- [x] 1.1 En `_config.ts`, añadir `import lightningCss from "lume/plugins/lightningcss.ts"` y sustituir `site.copy("assets/css")` por `site.use(lightningCss())`
- [x] 1.2 Verificar que el build arranca sin errores y `_site/assets/css/main.css` se genera correctamente

## 2. Crear los archivos parciales

- [x] 2.1 Crear `src/assets/css/tokens.css` con los bloques `@font-face` y `:root` (custom properties + media queries de `--font-size-base`)
- [x] 2.2 Crear `src/assets/css/reset.css` con el reset mínimo y los estilos base de `html`, `body`, `img`, `video`, `a`
- [x] 2.3 Crear `src/assets/css/typography.css` con `h2`, `h3`, `p`, `blockquote`, `blockquote p`, `blockquote cite`
- [x] 2.4 Crear `src/assets/css/layout.css` con `.main` y `.main:has(.post)`
- [x] 2.5 Crear `src/assets/css/header.css` con `.site-header`, `.site-header__inner`, `.site-header__logo`, `.site-nav`, `.site-nav__link` y `.lang-switcher`
- [x] 2.6 Crear `src/assets/css/footer.css` con `.site-footer` y `.site-footer__inner`
- [x] 2.7 Crear `src/assets/css/post-list.css` con `.post-list`, `.post-card` y `.post-card--with-thumb`
- [x] 2.8 Crear `src/assets/css/post.css` con `.post__header`, `.post__title`, `.post__subtitle`, `.post__date`, `.post__content` (grid), `.post__translations`
- [x] 2.9 Crear `src/assets/css/post-media.css` con `.post-media`, `.media-embed`, `.post-gallery`, `.post-media--*` y `.post-media__caption`
- [x] 2.10 Crear `src/assets/css/buttons.css` con `.btn-primary` y `.btn-alt`
- [x] 2.11 Crear `src/assets/css/responsive.css` con el bloque `@media (max-width: 640px)`

## 3. Convertir main.css en punto de entrada

- [x] 3.1 Reemplazar el contenido de `src/assets/css/main.css` por las directivas `@import` en orden: tokens → reset → typography → layout → header → footer → post-list → post → post-media → buttons → responsive
- [x] 3.2 Comprobar que no queda ningún estilo residual en `main.css` (solo comentario de cabecera e imports)

## 4. Verificación

- [x] 4.1 Ejecutar `deno task build` y confirmar que `_site/assets/css/main.css` existe y no está vacío
- [x] 4.2 Levantar el servidor (`deno task serve`) y revisar visualmente home, post y página estática — sin regresiones
- [x] 4.3 Confirmar en devtools que no hay errores de carga de CSS y que los estilos se aplican correctamente
