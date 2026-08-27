## 1. CSS — Refactor do layout da card e da lista

- [x] 1.1 Substituír `flex-direction: column` en `.post-list` por `display: grid; grid-template-columns: repeat(2, 1fr)` con gap axeitado
- [x] 1.2 Engadir breakpoint móvil en `.post-list` para 1 columna en viewport < 640 px
- [x] 1.3 Eliminar o bloque `.post-card--with-thumb` e os seus estilos de grid lateral
- [x] 1.4 Actualizar `.post-card__thumbnail`: `width: 100%`, `aspect-ratio: 3 / 2`, `object-fit: cover`, sen posicionamento de grid manual

## 2. Contido — Posts de exemplo para probar o grid

- [x] 2.1 Crear `src/posts/post-exemplo-2.md` en galego, temática música galega, con `thumbnail: welcome-post/fillas.jpg`
- [x] 2.2 Crear `src/posts/post-exemplo-3.md` en galego, temática música galega, con `thumbnail: welcome-post/a-pedreira.jpg`
- [x] 2.3 Crear `src/posts/post-exemplo-4.md` en galego, temática música galega, con `thumbnail: welcome-post/lontreira.jpg`

## 3. Template — Simplificar home.vto

- [x] 3.1 Eliminar o condicional `post-card--with-thumb` no atributo `class` do `<article>`
- [x] 3.2 Verificar que a imaxen (`<img class="post-card__thumbnail">`) sempre se renderiza cando existe `thumbSrc` (sen cambios de lóxica, só limpeza do modificador)
