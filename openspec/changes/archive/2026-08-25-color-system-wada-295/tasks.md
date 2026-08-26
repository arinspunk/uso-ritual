## 1. Escala primitiva en :root

- [x] 1.1 Reemplazar el bloque de variables de color existente en `src/assets/css/main.css` con la escala primitiva completa: `--cy-0` a `--cy-90` (tintes de Cream Yellow) y `--dvb-0` a `--dvb-50` (sombras de Dull Violet Black), más `--wada-yellow` y `--wada-blue`
- [x] 1.2 Añadir los tokens semánticos bajo la escala: `--color-bg: var(--cy-80)`, `--color-surface: var(--cy-60)`, `--color-border: var(--cy-70)`, `--color-text: var(--dvb-0)`, `--color-text-muted: #625270` (con comentario de derivación), `--color-accent: var(--wada-blue)`

## 2. Reglas de color en componentes

- [x] 2.1 Eliminar `color: var(--color-accent)` de la regla global `a` y de `.post__content a` y `.page__content a` — los links heredan el color del texto
- [x] 2.2 Actualizar `.post__content blockquote` y `.media-item--quote`: cambiar `border-left-color` a `var(--wada-blue)` (o `var(--color-accent)` si ya apunta al blue)
- [x] 2.3 Revisar todos los usos restantes de `--color-accent` en el CSS (hovers de logo, nav, post-card) y decidir caso a caso: mantener con el nuevo blue, cambiar a `--color-text`, o eliminar

## 3. Clases de botón

- [x] 3.1 Añadir al CSS las clases `.btn-primary` (bg `var(--dvb-0)`, color `var(--cy-80)`) y `.btn-alt` (bg `var(--wada-yellow)`, color `var(--dvb-0)`) con padding y font-family acordes al sistema tipográfico existente

## 4. Verificación

- [x] 4.1 Levantar el servidor local y recorrer home, un post y la página Sobre: verificar que fondo, texto, texto muted, bordes y separadores tienen los colores correctos
- [x] 4.2 Verificar que los blockquotes muestran borde azul (`#006eb8`)
- [x] 4.3 Verificar que los links inline en posts no tienen color de acento — solo subrayado
- [x] 4.4 Verificar que no quedan referencias al rojo `#c8102e` en el CSS ni en el HTML renderizado
